import { apiClient } from '@/lib/apiClient';
import {
  mapInquiryFormDtoToForm,
  mapInquiryFormToPayload,
  mapPublicFormDtoToForm,
  type BackendInquiryFormDto,
  type BackendPublicFormDto,
  type BackendPublicFormSubmissionResponse,
} from '@/lib/mappers';
import { resolveDepartmentId } from '@/services/departmentService';
import type { InquiryForm } from '@/types';

type PublicFormSubmissionPayload = {
  fields: Record<string, string>;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerCompanyName?: string;
  message: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
};

async function withDepartmentId(form: InquiryForm) {
  const departmentId = form.departmentId ?? await resolveDepartmentId(form.department);
  if (!departmentId) {
    throw new Error(`Could not find department id for ${form.department}`);
  }

  return {
    ...mapInquiryFormToPayload({ ...form, departmentId }),
    departmentId,
  };
}

export async function getInquiryForms() {
  const response = await apiClient.get<BackendInquiryFormDto[]>('/inquiry-forms');
  return response.map(mapInquiryFormDtoToForm);
}

export async function createInquiryForm(payload: InquiryForm) {
  const response = await apiClient.post<BackendInquiryFormDto>('/inquiry-forms', await withDepartmentId(payload));
  return mapInquiryFormDtoToForm(response);
}

export async function updateInquiryForm(id: string, payload: InquiryForm) {
  const response = await apiClient.put<BackendInquiryFormDto>(`/inquiry-forms/${id}`, await withDepartmentId(payload));
  return mapInquiryFormDtoToForm(response);
}

export async function deleteInquiryForm(id: string) {
  await apiClient.delete<void>(`/inquiry-forms/${id}`);
}

export async function publishInquiryForm(id: string) {
  const response = await apiClient.patch<BackendInquiryFormDto>(`/inquiry-forms/${id}/publish`);
  return mapInquiryFormDtoToForm(response);
}

export async function unpublishInquiryForm(id: string) {
  const response = await apiClient.patch<BackendInquiryFormDto>(`/inquiry-forms/${id}/unpublish`);
  return mapInquiryFormDtoToForm(response);
}

export async function getPublicForm(slug: string) {
  const response = await apiClient.get<BackendPublicFormDto>(`/public/forms/${slug}`, { skipAuth: true });
  return mapPublicFormDtoToForm(response);
}

export async function submitPublicForm(slug: string, payload: PublicFormSubmissionPayload) {
  return apiClient.post<BackendPublicFormSubmissionResponse>(`/public/forms/${slug}/submit`, payload, { skipAuth: true });
}
