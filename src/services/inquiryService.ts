import { apiClient } from '@/lib/apiClient';
import {
  mapInquiryDtoToInquiry,
  mapInquiryToCreatePayload,
  toBackendChannel,
  toBackendStatus,
  type BackendChannel,
  type BackendInquiryDto,
  type BackendPriority,
  type BackendStatus,
} from '@/lib/mappers';
import type { Channel, InquiryStatus, Priority } from '@/types';

type InquiryFilters = {
  status?: InquiryStatus;
  priority?: Priority;
  channel?: Channel;
  departmentId?: string;
  assignedOwnerId?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
};

type CreateInquiryPayload = {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  companyName?: string;
  message: string;
  channel: Channel;
  category?: string;
  sourcePage?: string;
  leadSource?: string;
};

function buildQuery(filters?: InquiryFilters) {
  const params = new URLSearchParams();
  if (!filters) return '';
  if (filters.status) params.set('status', toBackendStatus(filters.status) as BackendStatus);
  if (filters.priority) params.set('priority', filters.priority.toUpperCase() as BackendPriority);
  if (filters.channel) params.set('channel', toBackendChannel(filters.channel) as BackendChannel);
  if (filters.departmentId) params.set('departmentId', filters.departmentId);
  if (filters.assignedOwnerId) params.set('assignedOwnerId', filters.assignedOwnerId);
  if (filters.search) params.set('search', filters.search);
  if (filters.fromDate) params.set('fromDate', filters.fromDate);
  if (filters.toDate) params.set('toDate', filters.toDate);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function getInquiries(filters?: InquiryFilters) {
  const response = await apiClient.get<BackendInquiryDto[]>(`/inquiries${buildQuery(filters)}`);
  return response.map(mapInquiryDtoToInquiry);
}

export async function getInquiryById(id: string) {
  const response = await apiClient.get<BackendInquiryDto>(`/inquiries/${id}`);
  return mapInquiryDtoToInquiry(response);
}

export async function createInquiry(payload: CreateInquiryPayload) {
  const response = await apiClient.post<BackendInquiryDto>('/inquiries', mapInquiryToCreatePayload(payload));
  return mapInquiryDtoToInquiry(response);
}

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  const response = await apiClient.patch<BackendInquiryDto>(`/inquiries/${id}/status`, { status: toBackendStatus(status) });
  return mapInquiryDtoToInquiry(response);
}

export async function addInquiryNote(id: string, note: string, internal = true) {
  const response = await apiClient.post<BackendInquiryDto>(`/inquiries/${id}/notes`, { note, internal });
  return mapInquiryDtoToInquiry(response);
}

export async function assignOwner(id: string, ownerId: string) {
  const response = await apiClient.patch<BackendInquiryDto>(`/inquiries/${id}/assign-owner`, { assignedOwnerId: ownerId });
  return mapInquiryDtoToInquiry(response);
}

export async function overrideDepartment(id: string, departmentId: string) {
  const response = await apiClient.patch<BackendInquiryDto>(`/inquiries/${id}/override-department`, { assignedDepartmentId: departmentId });
  return mapInquiryDtoToInquiry(response);
}

export async function replyToInquiry(id: string, message: string) {
  const response = await apiClient.post<BackendInquiryDto>(`/inquiries/${id}/reply`, { message });
  return mapInquiryDtoToInquiry(response);
}
