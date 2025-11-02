import { apiService } from './apiService';

export interface BenefitsStructure {
  label: string;
  features: string[];
  max_sessions: number | null;
  discount_rate: number;
  charging_speed: string;
  priority_support: boolean;
}

export interface ServicePackage {
  package_id: number;
  name: string;
  description?: string;
  price: number;
  duration_days?: number;
  benefits: BenefitsStructure;
  status: 'Active' | 'Inactive';
  created_at?: string;
  updated_at?: string;
}

export const getPackages = async (): Promise<ServicePackage[]> => {
  return apiService.get<ServicePackage[]>('/packages');
};

export const createPackage = async (data: Partial<ServicePackage>): Promise<ServicePackage> => {
  return apiService.post<ServicePackage>('/packages', data);
};

export const updatePackage = async (id: number, data: Partial<ServicePackage>): Promise<ServicePackage> => {
  return apiService.put<ServicePackage>(`/packages/${id}`, data);
};

export const deletePackage = async (id: number): Promise<void> => {
  return apiService.delete(`/packages/${id}`);
};