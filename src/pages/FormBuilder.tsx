import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Code,
  Copy,
  CopyPlus,
  ExternalLink,
  FileText,
  Info,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import {
  createBlankInquiryForm,
  createField,
  createIframeCode,
  formFieldTypes,
  inquiryFormStatuses,
  managedDepartments,
  slugify,
} from '@/lib/inquiryForms';
import {
  addForm,
  deleteForm,
  duplicateForm,
  getForms,
  getVisibleForms,
  updateForm,
} from '@/lib/formStore';
import {
  canCreateInquiryForm,
  canDeleteInquiryForm,
  canEditInquiryForm,
  canPublishInquiryForm,
  canShareInquiryForm,
} from '@/lib/permissions';
import type { Department, FormField, InquiryForm, InquiryFormStatus } from '@/types';

type DepartmentFilter = Department | 'All';
type StatusFilter = InquiryFormStatus | 'All';
type ModalMode = 'create' | 'edit';

const statusClassNames: Record<InquiryFormStatus, string> = {
  Published: 'bg-green-50 text-green-700 border-green-200',
  Draft: 'bg-gray-50 text-gray-600 border-gray-200',
  Inactive: 'bg-amber-50 text-amber-700 border-amber-200',
};

function getOrigin() {
  if (typeof window === 'undefined') return 'https://replyroute.app';
  return window.location.origin;
}

function getDefaultDepartment(userDepartment: Department | 'All' | undefined): Department {
  if (userDepartment && userDepartment !== 'All') return userDepartment;
  return 'HR';
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function createNamedField(index: number): FormField {
  return createField({
    label: 'New Field',
    name: `customField${index}`,
    type: 'text',
    required: false,
  });
}

export default function FormBuilder() {
  const { user } = useAuth();
  const [forms, setForms] = useState<InquiryForm[]>(() => getForms());
  const [copiedValue, setCopiedValue] = useState('');
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [draftForm, setDraftForm] = useState<InquiryForm | null>(null);
  const [formError, setFormError] = useState('');
  const [formToDelete, setFormToDelete] = useState<InquiryForm | null>(null);
  const origin = getOrigin();
  const departmentLocked = user?.role === 'DEPARTMENT_HEAD' && user.department !== 'All';
  const activeDepartmentFilter = departmentLocked ? user.department : departmentFilter;

  const visibleForms = useMemo(() => getVisibleForms(user, forms), [forms, user]);

  const filteredForms = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return visibleForms.filter((form) => {
      const matchesSearch = !normalizedSearch || [
        form.title,
        form.description,
        form.department,
        form.inquiryType,
        form.slug,
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesDepartment = activeDepartmentFilter === 'All' || form.department === activeDepartmentFilter;
      const matchesStatus = statusFilter === 'All' || form.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [activeDepartmentFilter, search, statusFilter, visibleForms]);

  const refreshForms = () => setForms(getForms());

  const copyText = (value: string) => {
    void navigator.clipboard.writeText(value);
    setCopiedValue(value);
    window.setTimeout(() => setCopiedValue(''), 1800);
  };

  const openCreateModal = () => {
    if (!canCreateInquiryForm(user)) return;

    const form = createBlankInquiryForm(getDefaultDepartment(user?.department), user?.name ?? 'ReplyRoute User');
    setDraftForm(form);
    setModalMode('create');
    setFormError('');
  };

  const openEditModal = (form: InquiryForm) => {
    if (!canEditInquiryForm(user, form)) return;

    setDraftForm({
      ...form,
      fields: form.fields.map((field) => ({
        ...field,
        options: field.options ? [...field.options] : undefined,
      })),
    });
    setModalMode('edit');
    setFormError('');
  };

  const closeModal = () => {
    setDraftForm(null);
    setModalMode(null);
    setFormError('');
  };

  const updateDraft = (updates: Partial<InquiryForm>) => {
    setDraftForm((current) => (current ? { ...current, ...updates } : current));
  };

  const updateDraftTitle = (title: string) => {
    setDraftForm((current) => {
      if (!current) return current;

      const currentAutoSlug = slugify(current.title);
      const nextSlug = !current.slug || current.slug === currentAutoSlug ? slugify(title) : current.slug;
      return { ...current, title, slug: nextSlug };
    });
  };

  const updateDraftField = (fieldId: string, updates: Partial<FormField>) => {
    setDraftForm((current) => {
      if (!current) return current;

      return {
        ...current,
        fields: current.fields.map((field) => (
          field.id === fieldId ? { ...field, ...updates } : field
        )),
      };
    });
  };

  const addDraftField = () => {
    setDraftForm((current) => {
      if (!current) return current;

      return {
        ...current,
        fields: [...current.fields, createNamedField(current.fields.length + 1)],
      };
    });
  };

  const removeDraftField = (fieldId: string) => {
    setDraftForm((current) => {
      if (!current) return current;

      return {
        ...current,
        fields: current.fields.filter((field) => field.id !== fieldId),
      };
    });
  };

  const saveDraftForm = () => {
    if (!draftForm || !modalMode) return;

    const ownedDepartment = user?.department !== 'All' ? user?.department : draftForm.department;
    const department = user?.role === 'DEPARTMENT_HEAD' && ownedDepartment ? ownedDepartment : draftForm.department;
    const normalizedSlug = slugify(draftForm.slug || draftForm.title);
    const normalizedFields = draftForm.fields.map((field) => ({
      ...field,
      label: field.label.trim(),
      name: field.name.trim() || slugify(field.label).replace(/-/g, ''),
      options: field.options?.map((option) => option.trim()).filter(Boolean),
    }));

    if (!draftForm.title.trim()) {
      setFormError('Form title is required.');
      return;
    }

    if (!normalizedSlug) {
      setFormError('Slug is required.');
      return;
    }

    if (!draftForm.inquiryType.trim()) {
      setFormError('Inquiry type is required.');
      return;
    }

    if (normalizedFields.length === 0 || normalizedFields.some((field) => !field.label || !field.name)) {
      setFormError('Every field needs a label and field name.');
      return;
    }

    const payload: InquiryForm = {
      ...draftForm,
      title: draftForm.title.trim(),
      slug: normalizedSlug,
      description: draftForm.description.trim(),
      department,
      inquiryType: draftForm.inquiryType.trim(),
      fields: normalizedFields,
    };

    if (modalMode === 'create') {
      addForm(payload);
    } else if (canEditInquiryForm(user, draftForm)) {
      updateForm(draftForm.id, payload);
    }

    refreshForms();
    closeModal();
  };

  const togglePublishStatus = (form: InquiryForm) => {
    if (!canPublishInquiryForm(user, form)) return;

    updateForm(form.id, {
      status: form.status === 'Published' ? 'Inactive' : 'Published',
    });
    refreshForms();
  };

  const duplicateExistingForm = (form: InquiryForm) => {
    if (!canCreateInquiryForm(user) || !canEditInquiryForm(user, form)) return;

    duplicateForm(form.id);
    refreshForms();
  };

  const deleteExistingForm = (form: InquiryForm) => {
    if (!canDeleteInquiryForm(user, form)) return;

    setFormToDelete(form);
  };

  const confirmDeleteForm = () => {
    if (!formToDelete) return;

    deleteForm(formToDelete.id);
    setFormToDelete(null);
    refreshForms();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiry Forms</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Manage department inquiry forms, publish public links, and copy iframe embeds for the MVP.
          </p>
        </div>
        {canCreateInquiryForm(user) && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-ocean-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
          >
            <Plus size={16} />
            Create New Form
          </button>
        )}
      </div>

      <div className="rounded-xl border border-ocean-200 bg-ocean-50 p-4">
        <div className="flex items-start gap-2">
          <Info size={17} className="mt-0.5 shrink-0 text-ocean-600" />
          <p className="text-sm text-ocean-800">
            JavaScript widget embed will be added later after backend deployment. For MVP, use public links or iframe embed.
          </p>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_220px_180px]">
        <label className="relative block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search forms..."
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-ocean-500"
          />
        </label>

        {departmentLocked ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
            Department: <span className="font-semibold text-gray-900">{user?.department}</span>
          </div>
        ) : (
          <select
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value as DepartmentFilter)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-ocean-500"
          >
            <option value="All">All departments</option>
            {managedDepartments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        )}

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-ocean-500"
        >
          <option value="All">All statuses</option>
          {inquiryFormStatuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {filteredForms.map((form) => {
          const publicPath = `/f/${form.slug}`;
          const publicUrl = `${origin}${publicPath}`;
          const iframeCode = createIframeCode(publicUrl);
          const copiedLink = copiedValue === publicUrl;
          const copiedIframe = copiedValue === iframeCode;
          const canShare = canShareInquiryForm(user, form);

          return (
            <div key={form.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-ocean-500 to-teal-500 text-white">
                    <FileText size={18} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900">{form.title}</h3>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusClassNames[form.status]}`}>
                      {form.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{form.description || 'No description added.'}</p>
                </div>
                <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                  {form.department}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Inquiry type</p>
                  <p className="mt-1 text-sm font-medium text-gray-800">{form.inquiryType}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Last updated</p>
                  <p className="mt-1 text-sm font-medium text-gray-800">{formatDate(form.updatedAt)}</p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Public URL</p>
                <p className="mt-1 break-all text-sm font-medium text-gray-800">{publicUrl}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={publicPath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-ocean-500 to-teal-500 px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <ExternalLink size={14} /> Preview
                </a>
                {canEditInquiryForm(user, form) && (
                  <button
                    type="button"
                    onClick={() => openEditModal(form)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                )}
                {canCreateInquiryForm(user) && canEditInquiryForm(user, form) && (
                  <button
                    type="button"
                    onClick={() => duplicateExistingForm(form)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <CopyPlus size={14} /> Duplicate
                  </button>
                )}
                {canPublishInquiryForm(user, form) && (
                  <button
                    type="button"
                    onClick={() => togglePublishStatus(form)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <Power size={14} /> {form.status === 'Published' ? 'Unpublish' : 'Publish'}
                  </button>
                )}
                {canShare && (
                  <>
                    <button
                      type="button"
                      onClick={() => copyText(publicUrl)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      {copiedLink ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}
                      {copiedLink ? 'Copied' : 'Copy link'}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyText(iframeCode)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      {copiedIframe ? <CheckCircle2 size={14} className="text-green-600" /> : <Code size={14} />}
                      {copiedIframe ? 'Copied' : 'Copy iframe'}
                    </button>
                  </>
                )}
                {canDeleteInquiryForm(user, form) && (
                  <button
                    type="button"
                    onClick={() => deleteExistingForm(form)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>

              <div className="mt-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <Code size={13} /> Iframe embed code
                </p>
                <pre className="max-h-40 overflow-auto rounded-lg bg-gray-900 p-3 text-xs text-green-400">
                  <code>{iframeCode}</code>
                </pre>
              </div>
            </div>
          );
        })}
      </div>

      {filteredForms.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No inquiry forms match this view.
        </div>
      )}

      {draftForm && modalMode && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/45 px-4 py-8">
          <div className="w-full max-w-4xl rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {modalMode === 'create' ? 'Create Inquiry Form' : 'Edit Inquiry Form'}
                </h2>
                <p className="text-sm text-gray-500">
                  Configure form details, fields, and public publishing status.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Form title</label>
                  <input
                    value={draftForm.title}
                    onChange={(event) => updateDraftTitle(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                    placeholder="HR Career Inquiry"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Slug</label>
                  <input
                    value={draftForm.slug}
                    onChange={(event) => updateDraft({ slug: slugify(event.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                    placeholder="hr-career"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Department</label>
                  <select
                    value={draftForm.department}
                    disabled={departmentLocked}
                    onChange={(event) => updateDraft({ department: event.target.value as Department })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-ocean-500 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    {managedDepartments.map((department) => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Inquiry type</label>
                  <input
                    value={draftForm.inquiryType}
                    onChange={(event) => updateDraft({ inquiryType: event.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                    placeholder="Vacancy / Career"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium text-gray-600">Description</label>
                  <textarea
                    rows={3}
                    value={draftForm.description}
                    onChange={(event) => updateDraft({ description: event.target.value })}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                    placeholder="Describe what this form is used for."
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Status</label>
                  <select
                    value={draftForm.status}
                    onChange={(event) => updateDraft({ status: event.target.value as InquiryFormStatus })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-ocean-500"
                  >
                    {(modalMode === 'create' ? inquiryFormStatuses.filter((status) => status !== 'Inactive') : inquiryFormStatuses).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Form fields</h3>
                    <p className="text-xs text-gray-500">Add, remove, and mark fields as required.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addDraftField}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <Plus size={14} /> Add field
                  </button>
                </div>
                <div className="divide-y divide-gray-100">
                  {draftForm.fields.map((field) => (
                    <div key={field.id} className="grid gap-3 px-4 py-4 lg:grid-cols-[1.1fr_1fr_150px_110px_40px]">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Label</label>
                        <input
                          value={field.label}
                          onChange={(event) => updateDraftField(field.id, { label: event.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Name</label>
                        <input
                          value={field.name}
                          onChange={(event) => updateDraftField(field.id, { name: slugify(event.target.value).replace(/-/g, '') })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Type</label>
                        <select
                          value={field.type}
                          onChange={(event) => updateDraftField(field.id, { type: event.target.value as FormField['type'] })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-ocean-500"
                        >
                          {formFieldTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <label className="flex items-end gap-2 pb-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(event) => updateDraftField(field.id, { required: event.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-ocean-600"
                        />
                        Required
                      </label>
                      <button
                        type="button"
                        onClick={() => removeDraftField(field.id)}
                        className="mt-5 flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                      {field.type === 'select' && (
                        <div className="space-y-1 lg:col-span-5">
                          <label className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Options</label>
                          <input
                            value={field.options?.join(', ') ?? ''}
                            onChange={(event) => updateDraftField(field.id, {
                              options: event.target.value.split(',').map((option) => option.trim()).filter(Boolean),
                            })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-ocean-500"
                            placeholder="Option one, Option two"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveDraftForm}
                className="rounded-lg bg-gradient-to-r from-ocean-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
              >
                Save Form
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(formToDelete)}
        title="Delete inquiry form?"
        description={(
          <span>
            This will remove <span className="font-semibold text-gray-900">{formToDelete?.title}</span> from the managed form list.
          </span>
        )}
        confirmLabel="Delete Form"
        variant="danger"
        onCancel={() => setFormToDelete(null)}
        onConfirm={confirmDeleteForm}
      />
    </div>
  );
}
