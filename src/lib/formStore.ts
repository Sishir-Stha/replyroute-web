import { defaultInquiryForms, slugify } from '@/lib/inquiryForms';
import type { DemoUser, InquiryForm } from '@/types';

const STORAGE_KEY = 'replyroute_inquiry_forms';

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function cloneForms(forms: InquiryForm[]) {
  return forms.map((form) => ({
    ...form,
    fields: form.fields.map((field) => ({
      ...field,
      options: field.options ? [...field.options] : undefined,
    })),
  }));
}

function isInquiryForm(value: unknown): value is InquiryForm {
  if (!value || typeof value !== 'object') return false;

  const form = value as Partial<InquiryForm>;
  return Boolean(
    form.id
    && form.title
    && form.slug
    && form.department
    && form.inquiryType
    && form.status
    && Array.isArray(form.fields),
  );
}

function getUniqueSlug(baseSlug: string, forms: InquiryForm[], ignoreFormId?: string) {
  const base = slugify(baseSlug) || 'inquiry-form';
  let candidate = base;
  let index = 2;

  while (forms.some((form) => form.id !== ignoreFormId && form.slug === candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }

  return candidate;
}

export function getForms() {
  if (!canUseStorage()) return cloneForms(defaultInquiryForms);

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const defaults = cloneForms(defaultInquiryForms);
    saveForms(defaults);
    return defaults;
  }

  try {
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed) || !parsed.every(isInquiryForm)) {
      const defaults = cloneForms(defaultInquiryForms);
      saveForms(defaults);
      return defaults;
    }

    return cloneForms(parsed);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return cloneForms(defaultInquiryForms);
  }
}

export function saveForms(forms: InquiryForm[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cloneForms(forms)));
}

export function addForm(form: InquiryForm) {
  const forms = getForms();
  const newForm = {
    ...form,
    slug: getUniqueSlug(form.slug || form.title, forms),
    updatedAt: new Date().toISOString(),
  };

  saveForms([newForm, ...forms]);
  return newForm;
}

export function updateForm(formId: string, updates: Partial<InquiryForm>) {
  const forms = getForms();
  let updatedForm: InquiryForm | undefined;
  const next = forms.map((form) => {
    if (form.id !== formId) return form;

    updatedForm = {
      ...form,
      ...updates,
      slug: updates.slug ? getUniqueSlug(updates.slug, forms, formId) : form.slug,
      updatedAt: new Date().toISOString(),
    };

    return updatedForm;
  });

  saveForms(next);
  return updatedForm;
}

export function deleteForm(formId: string) {
  const next = getForms().filter((form) => form.id !== formId);
  saveForms(next);
}

export function duplicateForm(formId: string) {
  const forms = getForms();
  const source = forms.find((form) => form.id === formId);
  if (!source) return undefined;

  const timestamp = new Date().toISOString();
  const duplicate: InquiryForm = {
    ...source,
    id: `form-${crypto.randomUUID()}`,
    title: `${source.title} Copy`,
    slug: getUniqueSlug(`${source.slug}-copy`, forms),
    status: 'Draft',
    createdAt: timestamp,
    updatedAt: timestamp,
    fields: source.fields.map((field) => ({
      ...field,
      id: `field-${crypto.randomUUID()}`,
      options: field.options ? [...field.options] : undefined,
    })),
  };

  saveForms([duplicate, ...forms]);
  return duplicate;
}

export function getFormBySlug(slug: string | undefined) {
  if (!slug) return undefined;
  return getForms().find((form) => form.slug === slug);
}

export function getVisibleForms(user: DemoUser | null, forms: InquiryForm[]) {
  if (!user) return [];
  if (user.role === 'SUPER_ADMIN') return forms;
  if (user.role === 'DEPARTMENT_HEAD' && user.department !== 'All') {
    return forms.filter((form) => form.department === user.department);
  }

  return [];
}
