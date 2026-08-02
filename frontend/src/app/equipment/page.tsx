'use client';

import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
}

interface Equipment {
  id: string;
  name: string;
  description?: string;
  rentalPrice?: number;
  deposit?: number;
  stockQuantity?: number;
  available?: boolean;
  categoryId?: string;
  category?: { id?: string; name?: string };
  images?: string[];
  specifications?: Record<string, any>;
  createdAt?: string;
}

// ─── Availability Badge ───────────────────────────────────────────────
function AvailBadge({ available, qty }: { available?: boolean; qty?: number }) {
  const ok = available !== false && (qty ?? 1) > 0;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${ok ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}`}>
      {ok ? 'Available' : 'Unavailable'}
    </span>
  );
}

// ─── Add/Edit Equipment Modal ─────────────────────────────────────────
function EquipmentModal({
  categories,
  initial,
  onClose,
  onSaved,
}: {
  categories: Category[];
  initial?: Equipment;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    rentalPrice: String(initial?.rentalPrice ?? ''),
    deposit: String(initial?.deposit ?? ''),
    stockQuantity: String(initial?.stockQuantity ?? ''),
    categoryId: initial?.categoryId ?? initial?.category?.id ?? '',
  });

  // Uploaded image URLs (start with any existing images when editing)
  const [imageUrls, setImageUrls] = useState<string[]>(initial?.images ?? []);
  // Per-file upload state: null = idle, 'uploading' | 'done' | 'error'
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; state: 'uploading' | 'done' | 'error' }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // ── Upload handler ─────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    // Reset file input so the same file can be re-selected
    e.target.value = '';

    // Add pending entries to state
    const pending = files.map((f) => ({ name: f.name, state: 'uploading' as const }));
    setUploadingFiles((prev) => [...prev, ...pending]);

    // Upload each file sequentially
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'EQUIPMENT_IMAGE');

      try {
        const res = await api.post('/uploads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const url: string = res.data?.url;
        if (url) {
          setImageUrls((prev) => [...prev, url]);
          setUploadingFiles((prev) =>
            prev.map((u) => (u.name === file.name && u.state === 'uploading' ? { ...u, state: 'done' } : u)),
          );
        }
      } catch {
        setUploadingFiles((prev) =>
          prev.map((u) => (u.name === file.name && u.state === 'uploading' ? { ...u, state: 'error' } : u)),
        );
      }
    }

    // Clear done/error entries after 3 s
    setTimeout(() => setUploadingFiles((prev) => prev.filter((u) => u.state === 'uploading')), 3000);
  };

  const removeImage = (url: string) => setImageUrls((prev) => prev.filter((u) => u !== url));

  // ── Submit ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload: any = {
        name: form.name.trim(),
        description: form.description.trim(),
        rentalPrice: parseFloat(form.rentalPrice),
        deposit: parseFloat(form.deposit),
        stockQuantity: parseInt(form.stockQuantity, 10),
        categoryId: form.categoryId,
      };
      if (imageUrls.length) payload.images = imageUrls;

      if (isEdit) {
        await api.patch(`/equipment/${initial!.id}`, payload);
      } else {
        await api.post('/equipment', payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join('. ') : (msg || 'Failed to save. Check your permissions.'));
    } finally {
      setLoading(false);
    }
  };

  const isUploading = uploadingFiles.some((u) => u.state === 'uploading');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full sm:w-[500px] md:w-[600px] max-w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8FAFC] shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F97316] text-xl">{isEdit ? 'edit' : 'add_box'}</span>
            <h3 className="font-extrabold text-base text-[#0F172A]">{isEdit ? 'Edit Equipment' : 'Add New Equipment'}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-[#0F172A] hover:bg-slate-200 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg shrink-0">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="overflow-hidden flex flex-col min-h-0 flex-1">
          <div className="p-6 space-y-4 overflow-y-auto">
            {/* Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Equipment Name *</label>
              <input
                required
                value={form.name}
                onChange={set('name')}
                placeholder="e.g. Canon EOS R5 Camera"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-[#F97316] focus:ring-1 focus:ring-orange-200 outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={set('description')}
                placeholder="Brief description of the equipment..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-[#F97316] focus:ring-1 focus:ring-orange-200 outline-none transition-all resize-none"
              />
            </div>

            {/* Price + Deposit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Rental Price / Day *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.rentalPrice}
                  onChange={set('rentalPrice')}
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-[#F97316] focus:ring-1 focus:ring-orange-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Deposit *</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.deposit}
                  onChange={set('deposit')}
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-[#F97316] focus:ring-1 focus:ring-orange-200 outline-none transition-all"
                />
              </div>
            </div>

            {/* Stock + Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Stock Quantity *</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={set('stockQuantity')}
                  placeholder="0"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-[#F97316] focus:ring-1 focus:ring-orange-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category *</label>
                <select
                  required
                  value={form.categoryId}
                  onChange={set('categoryId')}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-[#F97316] focus:ring-1 focus:ring-orange-200 outline-none transition-all bg-white"
                >
                  <option value="">Select category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ── Images ──────────────────────────────────────────────── */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Equipment Images
              </label>

              {/* Drop-zone / pick button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full border-2 border-dashed border-slate-200 hover:border-[#F97316] rounded-xl py-5 flex flex-col items-center gap-2 text-slate-400 hover:text-[#F97316] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                <span className="text-xs font-semibold">
                  {isUploading ? 'Uploading…' : 'Click to select images'}
                </span>
                <span className="text-[10px] text-slate-300">JPG, PNG, WEBP – multiple files allowed</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Upload progress chips */}
              {uploadingFiles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {uploadingFiles.map((u, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold border ${
                        u.state === 'uploading'
                          ? 'border-orange-200 bg-orange-50 text-orange-600'
                          : u.state === 'done'
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : 'border-red-200 bg-red-50 text-red-600'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-sm ${u.state === 'uploading' ? 'animate-spin' : ''}`}>
                        {u.state === 'uploading' ? 'progress_activity' : u.state === 'done' ? 'check_circle' : 'error'}
                      </span>
                      {u.name.length > 20 ? u.name.slice(0, 18) + '…' : u.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Thumbnail previews */}
              {imageUrls.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                      <img
                        src={url}
                        alt={`Image ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        title="Remove image"
                      >
                        <span className="material-symbols-outlined text-[12px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* ── /Images ──────────────────────────────────────────────── */}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-[#F8FAFC] flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isUploading}
              className="px-5 py-2 bg-[#F97316] text-white hover:bg-orange-600 rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">{isEdit ? 'save' : 'add'}</span>
              {isUploading ? 'Uploading images…' : loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ─── Add Category Modal ───────────────────────────────────────────────
function CategoryModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/categories', { name: name.trim() });
      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join('. ') : (msg || 'Failed to create category.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full sm:w-[400px] max-w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F97316] text-xl">category</span>
            <h3 className="font-extrabold text-base text-[#0F172A]">Add Category</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-[#0F172A] hover:bg-slate-200 rounded-lg">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        {error && <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="p-5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Heavy Machinery"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-[#F97316] focus:ring-1 focus:ring-orange-200 outline-none transition-all"
            />
          </div>
          <div className="px-5 py-4 border-t border-slate-100 bg-[#F8FAFC] flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 bg-[#F97316] text-white hover:bg-orange-600 rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Action Dropdown ──────────────────────────────────────────────────
function ActionMenu({
  item,
  onEdit,
  onDelete,
}: {
  item: Equipment;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#F97316] border border-slate-200 hover:border-[#F97316] rounded-lg px-2.5 py-1.5 transition-all bg-white"
      >
        Action
        <span className="material-symbols-outlined text-sm">{open ? 'expand_less' : 'expand_more'}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden py-1">
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-[#F97316] transition-colors"
            onClick={() => { onEdit(); setOpen(false); }}
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit
          </button>
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => { onDelete(); setOpen(false); }}
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────
const PAGE_SIZE = 15;

export default function EquipmentPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showAddEquip, setShowAddEquip] = useState(false);
  const [showAddCat, setShowAddCat] = useState(false);
  const [editItem, setEditItem] = useState<Equipment | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Any');

  // Sort
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [catRes, eqRes] = await Promise.all([
        api.get('/categories'),
        api.get('/equipment?limit=200'),
      ]);
      setCategories(catRes.data || []);
      const items = eqRes.data?.items || (Array.isArray(eqRes.data) ? eqRes.data : []);
      setEquipment(items);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load equipment.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this equipment item? This cannot be undone.')) return;
    try {
      await api.delete(`/equipment/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  // ── Derived data ──────────────────────────────────────────────────
  const filtered = equipment.filter((item) => {
    const available = item.available !== false && (item.stockQuantity ?? 1) > 0;
    const matchSearch = !search
      || item.name.toLowerCase().includes(search.toLowerCase())
      || (item.description ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All'
      || item.category?.name === catFilter
      || item.categoryId === catFilter;
    const matchStatus = statusFilter === 'Any'
      || (statusFilter === 'Available' && available)
      || (statusFilter === 'Unavailable' && !available);
    return matchSearch && matchCat && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let av: any = a[sortField as keyof Equipment] ?? '';
    let bv: any = b[sortField as keyof Equipment] ?? '';
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => (
    <span className={`material-symbols-outlined text-[13px] ml-0.5 ${sortField === field ? 'text-[#F97316]' : 'text-slate-300'}`}>
      {sortField === field ? (sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
    </span>
  );

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F1F5F9] flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
          <Header title="Equipment" onOpenSidebar={() => setSidebarOpen(true)} />

          <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 space-y-4">

            

            {/* ── Table Card ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

              {/* Toolbar */}
              <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-2 focus-within:border-[#F97316] focus-within:ring-1 focus-within:ring-orange-200 transition-all flex-1 min-w-[180px] max-w-xs bg-white">
                  <span className="material-symbols-outlined text-slate-400 text-lg shrink-0">search</span>
                  <input
                    type="text"
                    placeholder="Search equipment..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full text-xs text-slate-700 bg-transparent border-none outline-none placeholder:text-slate-400"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  )}
                </div>

                {/* Category filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">Category:</span>
                  <select
                    value={catFilter}
                    onChange={(e) => { setCatFilter(e.target.value); setPage(1); }}
                    className="border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 bg-white focus:outline-none focus:border-[#F97316] cursor-pointer"
                  >
                    <option value="All">All</option>
                    {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-700 bg-white focus:outline-none focus:border-[#F97316] cursor-pointer"
                  >
                    <option value="Any">Any</option>
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>

                <div className="flex-1" />

                {/* Refresh */}
                <button
                  onClick={fetchData}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#F97316] border border-slate-200 hover:border-[#F97316] rounded-lg px-2.5 py-2 transition-all bg-white"
                  title="Refresh"
                >
                  <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                {/* Admin buttons */}
                {isAdmin && (
                  <>
                    {user?.role === 'ADMIN' && (
                      <button
                        onClick={() => setShowAddCat(true)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-700 border border-slate-200 hover:border-[#F97316] hover:text-[#F97316] rounded-lg px-3 py-2 transition-all bg-white"
                      >
                        <span className="material-symbols-outlined text-sm">category</span>
                        <span className="hidden sm:inline">Add Category</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowAddEquip(true)}
                      className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#F97316] hover:bg-orange-600 rounded-lg px-3 py-2 transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Add Equipment
                    </button>
                  </>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mx-4 my-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="w-10 px-4 py-3">
                        <input type="checkbox" className="rounded border-slate-300 cursor-pointer" />
                      </th>
                      {[
                        { label: 'Name',           field: 'name' },
                        { label: 'Category',       field: 'category' },
                        { label: 'Rental / Day',   field: 'rentalPrice' },
                        { label: 'Deposit',        field: 'deposit' },
                        { label: 'Stock',          field: 'stockQuantity' },
                        { label: 'Status',         field: 'available' },
                      ].map(({ label, field }) => (
                        <th
                          key={label}
                          onClick={() => field && handleSort(field)}
                          className={`px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap ${field ? 'cursor-pointer hover:text-[#F97316] select-none' : ''}`}
                        >
                          <span className="flex items-center gap-0.5">
                            {label}
                            {field && <SortIcon field={field} />}
                          </span>
                        </th>
                      ))}
                      {isAdmin && (
                        <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest">Action</th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                            <span className="material-symbols-outlined animate-spin text-3xl text-[#F97316]">progress_activity</span>
                            <span className="text-sm">Loading equipment…</span>
                          </div>
                        </td>
                      </tr>
                    ) : paginated.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                            <span className="material-symbols-outlined text-4xl">construction</span>
                            <span className="text-sm font-medium">No equipment found</span>
                            <button
                              onClick={() => { setSearch(''); setCatFilter('All'); setStatusFilter('Any'); }}
                              className="text-xs text-[#F97316] hover:underline"
                            >
                              Clear filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginated.map((item) => {
                        const img = item.images?.[0] || 'https://pub-ec99c8a8fe684a6a931dd2f902e53e4b.r2.dev/Application%20images/tools%20(1).png';
                        const catName = item.category?.name || categories.find((c) => c.id === item.categoryId)?.name || '—';

                        return (
                          <tr key={item.id} className="hover:bg-orange-50/30 transition-colors">
                            <td className="px-4 py-3">
                              <input type="checkbox" className="rounded border-slate-300 cursor-pointer" />
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-xs font-bold text-[#0F172A] truncate max-w-[180px]">{item.name}</p>
                              {item.description && (
                                <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{item.description}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                              <span className="px-2 py-0.5 bg-slate-100 rounded-full text-slate-600 font-medium">{catName}</span>
                            </td>
                            <td className="px-4 py-3 text-sm font-extrabold text-[#0F172A] whitespace-nowrap">
                              ${Number(item.rentalPrice ?? 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                              ${Number(item.deposit ?? 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-xs font-bold text-[#0F172A] whitespace-nowrap text-center">
                              {item.stockQuantity ?? 0}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <AvailBadge available={item.available} qty={item.stockQuantity} />
                            </td>
                            {isAdmin && (
                              <td className="px-4 py-3 whitespace-nowrap">
                                <ActionMenu
                                  item={item}
                                  onEdit={() => setEditItem(item)}
                                  onDelete={() => handleDelete(item.id)}
                                />
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-slate-500">
                  Showing{' '}
                  <span className="font-bold text-[#0F172A]">
                    {sorted.length === 0 ? 0 : Math.min((page - 1) * PAGE_SIZE + 1, sorted.length)}–{Math.min(page * PAGE_SIZE, sorted.length)}
                  </span>{' '}
                  of <span className="font-bold text-[#0F172A]">{sorted.length}</span> items
                </p>

                <div className="flex items-center gap-1">
                  {[
                    { icon: 'first_page',    onClick: () => setPage(1),                     disabled: page === 1 },
                    { icon: 'chevron_left',  onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: page === 1 },
                  ].map((b, i) => (
                    <button
                      key={i}
                      onClick={b.onClick}
                      disabled={b.disabled}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-[#F97316] hover:text-[#F97316] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">{b.icon}</span>
                    </button>
                  ))}

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p = i + 1;
                    if (totalPages > 5) {
                      if (page <= 3) p = i + 1;
                      else if (page >= totalPages - 2) p = totalPages - 4 + i;
                      else p = page - 2 + i;
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${page === p ? 'bg-[#F97316] border-[#F97316] text-white shadow-sm' : 'border-slate-200 text-slate-600 hover:border-[#F97316] hover:text-[#F97316]'}`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  {[
                    { icon: 'chevron_right', onClick: () => setPage((p) => Math.min(totalPages, p + 1)), disabled: page === totalPages },
                    { icon: 'last_page',     onClick: () => setPage(totalPages),                          disabled: page === totalPages },
                  ].map((b, i) => (
                    <button
                      key={i}
                      onClick={b.onClick}
                      disabled={b.disabled}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-[#F97316] hover:text-[#F97316] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">{b.icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Modals ── */}
        {showAddEquip && (
          <EquipmentModal
            categories={categories}
            onClose={() => setShowAddEquip(false)}
            onSaved={fetchData}
          />
        )}
        {editItem && (
          <EquipmentModal
            categories={categories}
            initial={editItem}
            onClose={() => setEditItem(null)}
            onSaved={fetchData}
          />
        )}
        {showAddCat && (
          <CategoryModal
            onClose={() => setShowAddCat(false)}
            onSaved={fetchData}
          />
        )}

      </div>
    </ProtectedRoute>
  );
}