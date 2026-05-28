import type { Department, FormField, FormFieldType, InquiryForm, InquiryFormStatus } from '@/types';

export const inquiryFormStatuses: InquiryFormStatus[] = ['Published', 'Draft', 'Inactive'];

export const formFieldTypes: FormFieldType[] = [
  'text',
  'email',
  'phone',
  'textarea',
  'select',
  'priority',
  'file',
];

export const managedDepartments: Department[] = [
  'Marketing',
  'HR',
  'Customer Support',
  'Sales',
  'Operations',
  'Accounts / Finance',
  'PR / Media',
  'IT Support',
  'Admin',
  'Legal / Compliance',
  'Business Development',
];

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

function getTimestamp() {
  return new Date().toISOString();
}

export function createField(input: Omit<FormField, 'id'>): FormField {
  return {
    ...input,
    id: `field-${crypto.randomUUID()}`,
  };
}

export function createIframeCode(publicUrl: string) {
  return `<iframe
  src="${publicUrl}"
  width="100%"
  height="650"
  style="border:0; border-radius:12px;"
></iframe>`;
}

export const defaultFormFields: FormField[] = [
  createField({
    label: 'Full Name',
    name: 'fullName',
    type: 'text',
    required: true,
  }),
  createField({
    label: 'Phone',
    name: 'phone',
    type: 'phone',
    required: false,
  }),
  createField({
    label: 'Email',
    name: 'email',
    type: 'email',
    required: true,
  }),
  createField({
    label: 'Company Name',
    name: 'companyName',
    type: 'text',
    required: false,
  }),
  createField({
    label: 'Message',
    name: 'message',
    type: 'textarea',
    required: true,
  }),
  createField({
    label: 'Priority',
    name: 'priority',
    type: 'priority',
    required: false,
  }),
];

function cloneDefaultFields() {
  return defaultFormFields.map((field) => ({
    ...field,
    id: `field-${crypto.randomUUID()}`,
    options: field.options ? [...field.options] : undefined,
  }));
}

function makeDefaultForm(
  id: string,
  title: string,
  slug: string,
  department: Department,
  inquiryType: string,
  description: string,
): InquiryForm {
  const timestamp = getTimestamp();

  return {
    id,
    title,
    slug,
    description,
    department,
    inquiryType,
    status: 'Published',
    fields: cloneDefaultFields(),
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: 'ReplyRoute Demo',
  };
}

export const defaultInquiryForms: InquiryForm[] = [
  makeDefaultForm(
    'form-hr-career',
    'HR Career Inquiry',
    'hr-career',
    'HR',
    'Vacancy / Career',
    'For job applications, vacancy questions, CV submissions, internships, and career follow-ups.',
  ),
  makeDefaultForm(
    'form-marketing-collaboration',
    'Marketing Collaboration',
    'marketing-collaboration',
    'Marketing',
    'Marketing Offer / Collaboration',
    'For campaign offers, promotions, sponsorships, collaborations, and advertising requests.',
  ),
  makeDefaultForm(
    'form-customer-complaint',
    'Customer Complaint',
    'customer-complaint',
    'Customer Support',
    'Complaint',
    'For complaints, delayed service, no-response issues, and customer dissatisfaction reports.',
  ),
  makeDefaultForm(
    'form-payment-refund',
    'Payment / Refund Issue',
    'payment-refund',
    'Accounts / Finance',
    'Payment / Refund',
    'For payment deductions, refund requests, bills, invoices, and transaction issues.',
  ),
  makeDefaultForm(
    'form-vendor-proposal',
    'Vendor Proposal',
    'vendor-proposal',
    'Business Development',
    'Partnership / Vendor Proposal',
    'For vendor submissions, partnership requests, proposals, business deals, and contracts.',
  ),
  makeDefaultForm(
    'form-technical-issue',
    'Technical Issue',
    'technical-issue',
    'IT Support',
    'Technical Issue',
    'For website errors, app issues, login problems, technical errors, and system-not-working reports.',
  ),
  makeDefaultForm(
    'form-general-inquiry',
    'General Inquiry',
    'general-inquiry',
    'Admin',
    'General Inquiry',
    'For general questions. ReplyRoute routes by message keywords, or sends to Admin if no rule matches.',
  ),
];

export function createBlankInquiryForm(department: Department, createdBy: string): InquiryForm {
  const timestamp = getTimestamp();

  return {
    id: `form-${crypto.randomUUID()}`,
    title: '',
    slug: '',
    description: '',
    department,
    inquiryType: '',
    status: 'Draft',
    fields: cloneDefaultFields(),
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy,
  };
}
