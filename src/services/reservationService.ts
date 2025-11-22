// Reservation Service - Quản lý đặt chỗ và giữ chỗ
import { Station } from '../data/mockDatabase';
import * as reservationApi from '../api/reservationApi';

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
  backendReservationId?: number; // Backend reservation ID for API calls
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
  
  private readonly RESERVATION_DURATION = 15 * 60;
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
  async createReservation(
    userId: string,
    station: Station,
    chargingPointId?: string
  ): Promise<ReservationResult> {
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

    // Nếu không có chargingPointId, tự động chọn một điểm available
    if (!chargingPointId) {
      console.log('⚠️ No charging point ID provided, auto-selecting available point');
      
      // Fetch available charging points for this station
      try {
        const { getStationChargingPoints } = await import('../api/chargingPointsApi');
        const points = await getStationChargingPoints(station.id);
        const availablePoint = points.find(p => p.status === 'available');
        
        if (!availablePoint) {
          console.log('❌ No available charging points at this station');
          return {
            success: false,
            error: 'Trạm này hiện không có điểm sạc nào khả dụng. Vui lòng thử trạm khác.'
          };
        }
        
        // Use the first available point
        chargingPointId = availablePoint.point_id.toString();
        console.log('✅ Auto-selected charging point:', chargingPointId);
      } catch (error) {
        console.error('❌ Failed to fetch charging points:', error);
        return {
          success: false,
          error: 'Không thể kiểm tra điểm sạc khả dụng. Vui lòng thử lại.'
        };
      }
    }

    // Call backend API to create reservation
    try {
      const apiResult = await reservationApi.createReservation({
        userId: parseInt(userId),
        pointId: parseInt(chargingPointId),
        durationMinutes: 15 // 15 minutes
      });

      if (!apiResult.success || !apiResult.data) {
        console.log('❌ Backend API failed:', apiResult.error);
        return {
          success: false,
          error: apiResult.error || 'Không thể tạo đặt chỗ. Vui lòng thử lại.'
        };
      }

      // Create local reservation object from backend response
      const backendRes = apiResult.data;
      const now = new Date();
      
      // Fix: Ensure timezone is preserved
      // Backend returns '2025-11-06T22:16:25.832' (no Z)
      // JavaScript interprets this as local time, causing timezone shift
      // Solution: If no 'Z' at end, add it to parse as UTC
      let expireTimeStr = backendRes.expire_time;
      if (!expireTimeStr.endsWith('Z') && !expireTimeStr.includes('+') && !expireTimeStr.includes('-', 10)) {
        expireTimeStr += 'Z'; // Force UTC parsing
      }
      
      const expiresAt = new Date(expireTimeStr);
      const remainingSeconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);

      console.log('🕐 Time calculation:', {
        now: now.toISOString(),
        expire_time_from_backend: backendRes.expire_time,
        expire_time_fixed: expireTimeStr,
        expiresAt: expiresAt.toISOString(),
        remainingSeconds,
        remainingMinutes: Math.floor(remainingSeconds / 60)
      });

      const reservation: Reservation = {
        id: this.generateReservationId(),
        userId,
        stationId: station.id,
        stationName: station.name,
        chargingPointId,
        status: 'active',
        createdAt: new Date(backendRes.start_time),
        expiresAt,
        remainingTime: remainingSeconds,
        notificationSent: false,
        backendReservationId: backendRes.booking_id
      };

      console.log('📊 Created reservation object:', {
        id: reservation.id,
        backendReservationId: reservation.backendReservationId,
        expiresAt: reservation.expiresAt.toISOString(),
        remainingTime: reservation.remainingTime
      });

      this.reservations.set(reservation.id, reservation);
      
      // Tăng số chỗ đã reserved cho station này
      const reservedSlots = this.stationReservedSlots.get(station.id) || 0;
      this.stationReservedSlots.set(station.id, reservedSlots + 1);
      console.log(`🔒 Reserved slot for station ${station.id}: ${reservedSlots + 1} slots now reserved`);
      
      // Mark charging point as reserved
      const pointKey = `${station.id}_${chargingPointId}`;
      this.reservedChargingPoints.set(pointKey, userId);
      console.log(`🔒 Reserved charging point ${chargingPointId} for user ${userId}`);
      
      // Save to storage
      this.saveToStorage();
      
      this.startTimer(reservation);

      console.log(`✅ Reservation created: ${reservation.id} for station ${station.name}`);
      console.log(`📡 Backend reservation ID: ${backendRes.booking_id}`);
      
      return {
        success: true,
        reservation
      };
    } catch (error) {
      console.error('❌ Error creating reservation:', error);
      return {
        success: false,
        error: 'Lỗi kết nối. Vui lòng thử lại.'
      };
    }
  }

  /**
   * Bắt đầu timer cho reservation
   */
  private startTimer(reservation: Reservation) {
    console.log(`🚀 Starting timer for reservation ${reservation.id}`);
    console.log(`⏰ Initial timer setup:`, {
      id: reservation.id,
      expiresAt: reservation.expiresAt.toISOString(),
      expiresAtLocal: reservation.expiresAt.toString(),
      remainingTime: reservation.remainingTime
    });
    
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
      
      console.log(`⏰ Timer update: ${reservation.id} - ${remaining}s remaining`, {
        nowMs: now.getTime(),
        expiresAtMs: res.expiresAt.getTime(),
        diff: res.expiresAt.getTime() - now.getTime()
      });

      // Thông báo khi còn 5 phút
      if (remaining <= 5 * 60 && !res.notificationSent) {
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
  async cancelReservation(reservationId: string): Promise<boolean> {
    const reservation = this.reservations.get(reservationId);
    if (!reservation || reservation.status !== 'active') {
      return false;
    }

    // Call backend API to cancel reservation
    if (reservation.backendReservationId) {
      try {
        const userId = parseInt(reservation.userId);
        const apiResult = await reservationApi.cancelReservation(
          reservation.backendReservationId,
          userId
        );

        if (!apiResult.success) {
          console.error('❌ Failed to cancel reservation via API:', apiResult.error);
          // Still cancel locally even if API fails
        } else {
          console.log('✅ Reservation cancelled via backend API');
        }
      } catch (error) {
        console.error('❌ Error calling cancel API:', error);
      }
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
   */
  isNearExpiration(reservation: Reservation): boolean {
    return reservation.remainingTime <= 5 * 60 && reservation.remainingTime > 0;
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
