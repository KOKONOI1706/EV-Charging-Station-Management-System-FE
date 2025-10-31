// Reservation Service - Quản lý đặt chỗ và giữ chỗ
import { Station } from '../data/mockDatabase';

export interface Reservation {
  id: string;
  userId: string;
  stationId: string;
  stationName: string;
  chargingPointId?: string;
  status: 'active' | 'expired' | 'completed' | 'cancelled';
  createdAt: Date;
  expiresAt: Date;
  remainingTime: number; // in seconds
  notificationSent?: boolean; // Đã gửi thông báo 5 phút không
}

export interface ReservationResult {
  success: boolean;
  reservation?: Reservation;
  error?: string;
}

class ReservationService {
  private reservations: Map<string, Reservation> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private notificationCallbacks: ((reservation: Reservation) => void)[] = [];
  private expirationCallbacks: ((reservation: Reservation) => void)[] = [];
  // Track số chỗ đã được reserved cho mỗi station
  private stationReservedSlots: Map<string, number> = new Map();
  // Track charging points đã được reserved (stationId_pointId => userId)
  private reservedChargingPoints: Map<string, string> = new Map();
  
  private readonly RESERVATION_DURATION = 15;
  private readonly STORAGE_KEY_RESERVATIONS = 'ev-reservations';
  private readonly STORAGE_KEY_RESERVED_SLOTS = 'ev-reserved-slots';
  private readonly STORAGE_KEY_RESERVED_POINTS = 'ev-reserved-points';

  constructor() {
    // Load from localStorage when initializing
    this.loadFromStorage();
    
    // Listen for storage changes from other tabs
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange);
    }
  }

  /**
   * Load reservations from localStorage
   */
  private loadFromStorage() {
    try {
      // Load reservations
      const reservationsData = localStorage.getItem(this.STORAGE_KEY_RESERVATIONS);
      if (reservationsData) {
        const parsed = JSON.parse(reservationsData);
        Object.entries(parsed).forEach(([id, res]: [string, any]) => {
          // Restore Date objects
          res.createdAt = new Date(res.createdAt);
          res.expiresAt = new Date(res.expiresAt);
          this.reservations.set(id, res as Reservation);
          
          // Restart timer if still active
          if (res.status === 'active') {
            this.startTimer(res as Reservation);
          }
        });
        console.log(`📥 Loaded ${this.reservations.size} reservations from storage`);
      }
      
      // Load reserved slots
      const slotsData = localStorage.getItem(this.STORAGE_KEY_RESERVED_SLOTS);
      if (slotsData) {
        const parsed = JSON.parse(slotsData);
        this.stationReservedSlots = new Map(Object.entries(parsed));
        console.log(`📥 Loaded reserved slots for ${this.stationReservedSlots.size} stations`);
      }
      
      // Load reserved charging points
      const pointsData = localStorage.getItem(this.STORAGE_KEY_RESERVED_POINTS);
      if (pointsData) {
        const parsed = JSON.parse(pointsData);
        this.reservedChargingPoints = new Map(Object.entries(parsed));
        console.log(`📥 Loaded ${this.reservedChargingPoints.size} reserved charging points`);
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  }

  /**
   * Save reservations to localStorage
   */
  private saveToStorage() {
    try {
      // Save reservations
      const reservationsObj: any = {};
      this.reservations.forEach((res, id) => {
        reservationsObj[id] = res;
      });
      localStorage.setItem(this.STORAGE_KEY_RESERVATIONS, JSON.stringify(reservationsObj));
      
      // Save reserved slots
      const slotsObj: any = {};
      this.stationReservedSlots.forEach((count, stationId) => {
        slotsObj[stationId] = count;
      });
      localStorage.setItem(this.STORAGE_KEY_RESERVED_SLOTS, JSON.stringify(slotsObj));
      
      // Save reserved charging points
      const pointsObj: any = {};
      this.reservedChargingPoints.forEach((userId, pointKey) => {
        pointsObj[pointKey] = userId;
      });
      localStorage.setItem(this.STORAGE_KEY_RESERVED_POINTS, JSON.stringify(pointsObj));
      
      console.log(`💾 Saved to storage: ${this.reservations.size} reservations, ${this.reservedChargingPoints.size} points`);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  /**
   * Handle storage changes from other tabs
   */
  private handleStorageChange = (event: StorageEvent) => {
    if (event.key === this.STORAGE_KEY_RESERVATIONS || event.key === this.STORAGE_KEY_RESERVED_SLOTS) {
      console.log('🔄 Storage changed in another tab, reloading...');
      this.loadFromStorage();
    }
  };

  /**
   * Đăng ký callback khi có thông báo 5 phút cuối
   */
  onNotification(callback: (reservation: Reservation) => void) {
    this.notificationCallbacks.push(callback);
  }

  /**
   * Đăng ký callback khi reservation hết hạn
   */
  onExpiration(callback: (reservation: Reservation) => void) {
    this.expirationCallbacks.push(callback);
  }

  /**
   * Tạo reservation mới
   */
  createReservation(
    userId: string,
    station: Station,
    chargingPointId?: string
  ): ReservationResult {
    console.log('🎯 createReservation called for user:', userId, 'station:', station.name, 'chargingPointId:', chargingPointId);
    
    // Kiểm tra xem user đã có reservation active chưa
    const existingReservation = this.getActiveReservationByUser(userId);
    if (existingReservation) {
      console.log('⚠️ User already has active reservation:', existingReservation.id);
      return {
        success: false,
        error: 'Bạn đã có một chỗ đang được giữ. Vui lòng hoàn thành hoặc hủy reservation hiện tại trước.'
      };
    }

    // Nếu đặt charging point cụ thể, kiểm tra xem point đó đã được đặt chưa
    if (chargingPointId) {
      const pointKey = `${station.id}_${chargingPointId}`;
      const reservedBy = this.reservedChargingPoints.get(pointKey);
      
      if (reservedBy) {
        console.log(`🔒 Charging point ${chargingPointId} already reserved by user ${reservedBy}`);
        return {
          success: false,
          error: `Điểm sạc #${chargingPointId} đã được đặt bởi người khác. Vui lòng chọn điểm khác.`
        };
      }
    }

    // Tính số chỗ thực sự còn available (trừ đi số đã reserved)
    const reservedSlots = this.stationReservedSlots.get(station.id) || 0;
    const actualAvailable = station.available - reservedSlots;
    
    console.log(`📊 Station ${station.name}:`);
    console.log(`   - Total: ${station.total}`);
    console.log(`   - Available (from DB): ${station.available}`);
    console.log(`   - Reserved slots: ${reservedSlots}`);
    console.log(`   - Actual available: ${actualAvailable}`);
    console.log(`   - Charging point: ${chargingPointId || 'any'}`);
    console.log(`   - Reserved points:`, Array.from(this.reservedChargingPoints.entries()));

    // Kiểm tra station còn chỗ không (sau khi trừ reserved)
    if (actualAvailable <= 0) {
      console.log('❌ No slots available!');
      return {
        success: false,
        error: 'Trạm sạc này hiện đã hết chỗ hoặc tất cả đã được đặt trước.'
      };
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.RESERVATION_DURATION * 1000);

    const reservation: Reservation = {
      id: this.generateReservationId(),
      userId,
      stationId: station.id,
      stationName: station.name,
      chargingPointId,
      status: 'active',
      createdAt: now,
      expiresAt,
      remainingTime: this.RESERVATION_DURATION,
      notificationSent: false
    };

    this.reservations.set(reservation.id, reservation);
    
    // Tăng số chỗ đã reserved cho station này
    this.stationReservedSlots.set(station.id, reservedSlots + 1);
    console.log(`🔒 Reserved slot for station ${station.id}: ${reservedSlots + 1} slots now reserved`);
    
    // Nếu đặt charging point cụ thể, mark nó là reserved
    if (chargingPointId) {
      const pointKey = `${station.id}_${chargingPointId}`;
      this.reservedChargingPoints.set(pointKey, userId);
      console.log(`🔒 Reserved charging point ${chargingPointId} for user ${userId}`);
    }
    
    // Save to storage
    this.saveToStorage();
    
    this.startTimer(reservation);

    console.log(`✅ Reservation created: ${reservation.id} for station ${station.name}`);
    
    return {
      success: true,
      reservation
    };
  }

  /**
   * Bắt đầu timer cho reservation
   */
  private startTimer(reservation: Reservation) {
    console.log(`🚀 Starting timer for reservation ${reservation.id}`);
    
    // Timer cập nhật mỗi giây
    const updateTimer = setInterval(() => {
      const res = this.reservations.get(reservation.id);
      if (!res || res.status !== 'active') {
        console.log(`⏹️ Stopping timer for ${reservation.id} - status: ${res?.status || 'not found'}`);
        clearInterval(updateTimer);
        return;
      }

      const now = new Date();
      const remaining = Math.max(0, Math.floor((res.expiresAt.getTime() - now.getTime()) / 1000));
      res.remainingTime = remaining;
      
      console.log(`⏰ Timer update: ${reservation.id} - ${remaining}s remaining`);

      // TEST MODE: Thông báo khi còn 5 giây (thay vì 5 phút)
      // Đổi lại thành 5 * 60 khi deploy production
      if (remaining <= 5 && !res.notificationSent) {
        console.log(`📢 Triggering 5-minute notification for ${reservation.id}`);
        res.notificationSent = true;
        this.triggerNotification(res);
      }

      // Hết hạn
      if (remaining <= 0) {
        console.log(`⏰ Expiring reservation ${reservation.id}`);
        this.expireReservation(res.id);
        clearInterval(updateTimer);
      }
    }, 1000);

    this.timers.set(reservation.id, updateTimer);
    console.log(`✅ Timer started successfully for ${reservation.id}`);
  }

  /**
   * Kích hoạt thông báo 5 phút cuối
   */
  private triggerNotification(reservation: Reservation) {
    console.log(`⚠️ Notification: Reservation ${reservation.id} has 5 minutes remaining`);
    this.notificationCallbacks.forEach(callback => callback(reservation));
  }

  /**
   * Release reserved slot khi cancel/complete/expire
   */
  private releaseReservedSlot(reservationId: string) {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) return;
    
    const stationId = reservation.stationId;
    
    // Release station slot
    const currentReserved = this.stationReservedSlots.get(stationId) || 0;
    if (currentReserved > 0) {
      this.stationReservedSlots.set(stationId, currentReserved - 1);
      console.log(`🔓 Released slot for station ${stationId}: ${currentReserved - 1} slots now reserved`);
    }
    
    // Release charging point nếu có
    if (reservation.chargingPointId) {
      const pointKey = `${stationId}_${reservation.chargingPointId}`;
      const removed = this.reservedChargingPoints.delete(pointKey);
      if (removed) {
        console.log(`🔓 Released charging point ${reservation.chargingPointId} at station ${stationId}`);
      }
    }
    
    // Save to storage after releasing
    this.saveToStorage();
  }

  /**
   * Hết hạn reservation
   */
  private expireReservation(reservationId: string) {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) return;

    reservation.status = 'expired';
    reservation.remainingTime = 0;

    // Release reserved slot and charging point
    this.releaseReservedSlot(reservationId);

    console.log(`⏰ Reservation ${reservationId} expired`);
    this.expirationCallbacks.forEach(callback => callback(reservation));

    // Cleanup timer
    const timer = this.timers.get(reservationId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(reservationId);
    }
  }

  /**
   * Hủy reservation
   */
  cancelReservation(reservationId: string): boolean {
    const reservation = this.reservations.get(reservationId);
    if (!reservation || reservation.status !== 'active') {
      return false;
    }

    reservation.status = 'cancelled';
    
    // Release reserved slot and charging point
    this.releaseReservedSlot(reservationId);
    
    // Clear timer
    const timer = this.timers.get(reservationId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(reservationId);
    }

    console.log(`❌ Reservation ${reservationId} cancelled`);
    return true;
  }

  /**
   * Hoàn thành reservation (check-in)
   */
  completeReservation(reservationId: string): boolean {
    console.log(`🎯 completeReservation called for: ${reservationId}`);
    const reservation = this.reservations.get(reservationId);
    
    if (!reservation) {
      console.log(`❌ Reservation not found: ${reservationId}`);
      return false;
    }
    
    console.log(`📊 Current reservation status: ${reservation.status}`);
    
    if (reservation.status !== 'active') {
      console.log(`⚠️ Reservation is not active (status: ${reservation.status}), cannot complete`);
      return false;
    }

    reservation.status = 'completed';
    
    // Release reserved slot and charging point
    this.releaseReservedSlot(reservationId);
    
    // Clear timer
    const timer = this.timers.get(reservationId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(reservationId);
    }

    console.log(`✅ Reservation ${reservationId} completed (checked in)`);
    return true;
  }

  /**
   * Lấy reservation theo ID
   */
  getReservation(reservationId: string): Reservation | undefined {
    return this.reservations.get(reservationId);
  }

  /**
   * Lấy tất cả reservations của user
   */
  getUserReservations(userId: string): Reservation[] {
    return Array.from(this.reservations.values())
      .filter(res => res.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Lấy reservation active của user
   */
  getActiveReservationByUser(userId: string): Reservation | undefined {
    return Array.from(this.reservations.values())
      .find(res => res.userId === userId && res.status === 'active');
  }

  /**
   * Lấy tất cả reservations active của một station
   */
  getStationReservations(stationId: string): Reservation[] {
    return Array.from(this.reservations.values())
      .filter(res => res.stationId === stationId && res.status === 'active');
  }

  /**
   * Lấy số chỗ thực sự còn available (sau khi trừ reserved)
   */
  getActualAvailableSlots(station: Station): number {
    const reservedSlots = this.stationReservedSlots.get(station.id) || 0;
    return Math.max(0, station.available - reservedSlots);
  }

  /**
   * Lấy số chỗ đã được reserved của station
   */
  getReservedSlotsCount(stationId: string): number {
    return this.stationReservedSlots.get(stationId) || 0;
  }

  /**
   * Format thời gian còn lại thành string
   */
  formatRemainingTime(seconds: number): string {
    if (seconds <= 0) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Kiểm tra xem thời gian còn lại có dưới 5 phút không
   * TEST MODE: Kiểm tra còn 5 giây thay vì 5 phút
   */
  isNearExpiration(reservation: Reservation): boolean {
    // TEST MODE: 5 giây thay vì 5 * 60 giây
    return reservation.remainingTime <= 5 && reservation.remainingTime > 0;
  }

  /**
   * Generate reservation ID
   */
  private generateReservationId(): string {
    return `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup - Dọn dẹp tất cả timers
   */
  cleanup() {
    this.timers.forEach(timer => clearInterval(timer));
    this.timers.clear();
    this.reservations.clear();
  }
}

// Export singleton instance
export const reservationService = new ReservationService();

// Cleanup khi window đóng
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    reservationService.cleanup();
  });
}
