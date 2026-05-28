import { mockInquiries } from '@/data/mockData';
import type { Inquiry } from '@/types';

const STORAGE_KEY = 'replyroute.inquiries';

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function dedupeInquiries(inquiries: Inquiry[]) {
  const seen = new Set<string>();

  return inquiries.filter((inquiry) => {
    if (seen.has(inquiry.id)) return false;
    seen.add(inquiry.id);
    return true;
  });
}

export function getInquiries() {
  if (!canUseStorage()) return mockInquiries;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return mockInquiries;

  try {
    const parsed = JSON.parse(stored) as Inquiry[];
    if (!Array.isArray(parsed)) return mockInquiries;
    return dedupeInquiries([...parsed, ...mockInquiries]);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return mockInquiries;
  }
}

export function saveInquiries(inquiries: Inquiry[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dedupeInquiries(inquiries)));
}

export function saveInquiry(inquiry: Inquiry) {
  const current = getInquiries();
  const exists = current.some((item) => item.id === inquiry.id);
  const next = exists
    ? current.map((item) => (item.id === inquiry.id ? inquiry : item))
    : [inquiry, ...current];

  saveInquiries(next);
}

export function addInquiry(inquiry: Inquiry) {
  const current = getInquiries().filter((item) => item.id !== inquiry.id);
  saveInquiries([inquiry, ...current]);
}
