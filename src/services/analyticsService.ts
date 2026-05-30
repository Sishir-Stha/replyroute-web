import { apiClient } from '@/lib/apiClient';
import type {
  BackendChartPointDto,
  BackendDashboardSummaryDto,
  BackendTeamPerformanceDto,
} from '@/lib/mappers';

export function getDashboardSummary() {
  return apiClient.get<BackendDashboardSummaryDto>('/analytics/dashboard');
}

export function getInquiriesByChannel() {
  return apiClient.get<BackendChartPointDto[]>('/analytics/inquiries-by-channel');
}

export function getInquiriesByDepartment() {
  return apiClient.get<BackendChartPointDto[]>('/analytics/inquiries-by-department');
}

export function getWeeklyVolume() {
  return apiClient.get<BackendChartPointDto[]>('/analytics/weekly-volume');
}

export function getResponseStatus() {
  return apiClient.get<BackendChartPointDto[]>('/analytics/response-status');
}

export function getTeamPerformance() {
  return apiClient.get<BackendTeamPerformanceDto[]>('/analytics/team-performance');
}
