import { apiFetch } from './api';
import { AuthService } from '../services/authService';

export interface StartSessionPayload {
  userId: string;
  vehicleId: string;
  stationId: string;
  pointId?: string;
  meter_start?: number;
}

export interface StopSessionPayload {
  sessionId: string;
  meter_end?: number;
}

export async function staffStartSession(payload: StartSessionPayload) {
  try {
    console.debug('[staffApi] startSession payload:', payload);
    console.debug('[staffApi] token:', AuthService.getAuthToken());
    const res = await apiFetch('/staff/sessions/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    } as any);
    console.debug('[staffApi] startSession response:', res);
    return res.data;
  } catch (err: any) {
    console.error('[staffApi] startSession error:', err);
    throw err;
  }
}

export async function staffStopSession(payload: StopSessionPayload) {
  try {
    console.debug('[staffApi] stopSession payload:', payload);
    console.debug('[staffApi] token:', AuthService.getAuthToken());
    const res = await apiFetch('/staff/sessions/stop', {
      method: 'POST',
      body: JSON.stringify(payload),
    } as any);
    console.debug('[staffApi] stopSession response:', res);
    return res.data;
  } catch (err: any) {
    console.error('[staffApi] stopSession error:', err);
    throw err;
  }
}

export async function getUnpaidInvoices(userId: string) {
  const res = await apiFetch(`/staff/invoices/unpaid/${userId}`, { method: 'GET' } as any);
  return res.data;
}

export default {
  staffStartSession,
  staffStopSession,
  getUnpaidInvoices,
};
