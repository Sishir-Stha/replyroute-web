import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, MessageSquare, Paperclip } from 'lucide-react';
import { useInquiries } from '@/context/InquiryContext';
import { getFormBySlug, getForms } from '@/lib/formStore';
import type { FormField, InquiryForm, Priority } from '@/types';

const priorities: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];

function getInitialResponses(form: InquiryForm | undefined) {
  if (!form) return {};

  return form.fields.reduce<Record<string, string>>((responses, field) => {
    responses[field.name] = field.type === 'priority' ? 'Medium' : '';
    return responses;
  }, {});
}

function getResponseValue(responses: Record<string, string>, names: string[]) {
  const match = names.find((name) => responses[name]?.trim());
  return match ? responses[match].trim() : '';
}

function getFallbackMessage(form: InquiryForm, responses: Record<string, string>) {
  const filledValues = form.fields
    .filter((field) => field.type !== 'file')
    .map((field) => {
      const value = responses[field.name]?.trim();
      return value ? `${field.label}: ${value}` : '';
    })
    .filter(Boolean);

  return filledValues.join('\n') || form.inquiryType;
}

function PublicFormShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-teal-500 text-white shadow-sm">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">ReplyRoute</p>
            <p className="text-sm font-semibold text-gray-700">Yeti Airlines Demo</p>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function renderField(
  field: FormField,
  value: string,
  updateValue: (fieldName: string, nextValue: string) => void,
) {
  const baseClassName = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500';
  const label = (
    <label className="text-xs font-medium text-gray-600">
      {field.label}{field.required ? ' *' : ''}
    </label>
  );

  if (field.type === 'textarea') {
    return (
      <div key={field.id} className="space-y-1 md:col-span-2">
        {label}
        <textarea
          rows={5}
          value={value}
          onChange={(event) => updateValue(field.name, event.target.value)}
          className={`${baseClassName} resize-none`}
          placeholder="Describe your inquiry..."
        />
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div key={field.id} className="space-y-1">
        {label}
        <select
          value={value}
          onChange={(event) => updateValue(field.name, event.target.value)}
          className={`${baseClassName} text-gray-700`}
        >
          <option value="">Select</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === 'priority') {
    return (
      <div key={field.id} className="space-y-1">
        {label}
        <select
          value={value || 'Medium'}
          onChange={(event) => updateValue(field.name, event.target.value)}
          className={`${baseClassName} text-gray-700`}
        >
          {priorities.map((priority) => (
            <option key={priority} value={priority}>{priority}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === 'file') {
    return (
      <div key={field.id} className="space-y-1 md:col-span-2">
        {label}
        <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-400">
          <Paperclip size={16} />
          Attachment upload placeholder only
        </div>
      </div>
    );
  }

  const inputType = field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text';

  return (
    <div key={field.id} className="space-y-1">
      {label}
      <input
        type={inputType}
        value={value}
        onChange={(event) => updateValue(field.name, event.target.value)}
        className={baseClassName}
      />
    </div>
  );
}

export default function PublicInquiryForm() {
  const { formSlug } = useParams();
  const formDefinition = useMemo(() => getFormBySlug(formSlug), [formSlug]);
  const availableForms = useMemo(() => getForms().filter((form) => form.status === 'Published'), []);
  const { addInquiry } = useInquiries();
  const [responses, setResponses] = useState<Record<string, string>>(() => getInitialResponses(formDefinition));
  const [error, setError] = useState('');
  const [routedDepartment, setRoutedDepartment] = useState('');

  if (!formDefinition) {
    return (
      <PublicFormShell title="Form not found" description="Choose one of the available public inquiry forms.">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-500 to-teal-500 text-white">
            <MessageSquare size={24} />
          </div>
          <div className="mt-5 grid gap-2">
            {availableForms.map((item) => (
              <Link
                key={item.slug}
                to={`/f/${item.slug}`}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-ocean-700 hover:bg-ocean-50"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </PublicFormShell>
    );
  }

  if (formDefinition.status !== 'Published') {
    return (
      <PublicFormShell title={formDefinition.title} description={formDefinition.description}>
        <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">This form is not currently accepting responses</h2>
          <p className="mt-2 text-sm text-gray-500">Please contact the company or try another inquiry form.</p>
        </div>
      </PublicFormShell>
    );
  }

  const updateResponse = (fieldName: string, value: string) => {
    setResponses((current) => ({ ...current, [fieldName]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const missingField = formDefinition.fields.find((field) => (
      field.required && field.type !== 'file' && !responses[field.name]?.trim()
    ));

    if (missingField) {
      setError(`${missingField.label} is required.`);
      return;
    }

    const message = getResponseValue(responses, ['message', 'inquiryMessage', 'details'])
      || getFallbackMessage(formDefinition, responses);
    const inquiry = addInquiry({
      customerName: getResponseValue(responses, ['fullName', 'name', 'customerName']) || 'Public Form Visitor',
      customerEmail: getResponseValue(responses, ['email', 'customerEmail']) || 'public-form@example.com',
      customerPhone: getResponseValue(responses, ['phone', 'customerPhone', 'mobile']) || '',
      companyName: getResponseValue(responses, ['companyName', 'company']) || undefined,
      message,
      channel: 'website',
      category: formDefinition.inquiryType,
      sourcePage: formDefinition.title,
      leadSource: `/f/${formDefinition.slug}`,
      status: 'New',
    });

    setRoutedDepartment(inquiry.routedDepartment);
    setError('');
  };

  if (routedDepartment) {
    return (
      <PublicFormShell title="Inquiry submitted">
        <div className="rounded-2xl border border-green-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
            <CheckCircle2 size={26} />
          </div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Inquiry submitted</h1>
          <p className="mt-3 text-sm text-gray-600">
            Your inquiry has been submitted and routed to <span className="font-semibold text-gray-900">{routedDepartment}</span>.
          </p>
          <button
            type="button"
            onClick={() => {
              setResponses(getInitialResponses(formDefinition));
              setRoutedDepartment('');
            }}
            className="mt-6 rounded-lg bg-gradient-to-r from-ocean-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Submit another inquiry
          </button>
        </div>
      </PublicFormShell>
    );
  }

  return (
    <PublicFormShell title={formDefinition.title} description={formDefinition.description}>
      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Inquiry type</p>
          <p className="mt-1 text-sm font-medium text-gray-800">{formDefinition.inquiryType}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {formDefinition.fields.map((field) => renderField(field, responses[field.name] ?? '', updateResponse))}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="mt-5 w-full rounded-lg bg-gradient-to-r from-ocean-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95"
        >
          Submit Inquiry
        </button>
      </form>
    </PublicFormShell>
  );
}
