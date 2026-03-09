import React, { useState, useRef } from 'react'
import { Wallet, Save, Upload, FileText, Plus, Check, X } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../store/authStore'
import usePettyCashStore from '../store/pettyCashStore'

import { UNITS } from '../lib/constants'

export default function PettyCashPage() {
    const { user } = useAuthStore()
    const { addEntry, entries } = usePettyCashStore()
    const [form, setForm] = useState({ item: '', qty: '', unit: 'pcs', total: '', invoice: '', description: '' })
    const [photoFile, setPhotoFile] = useState(null)
    const [photoPreview, setPhotoPreview] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const fileRef = useRef()

    const myEntries = entries.filter(e => e.submittedBy === user?.name).slice().reverse()

    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        setPhotoFile(file)
        setPhotoPreview(URL.createObjectURL(file))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.item.trim()) { toast.error('Nama item wajib diisi!'); return }
        if (!form.qty || isNaN(parseFloat(form.qty))) { toast.error('Qty tidak valid!'); return }
        if (!form.total || isNaN(parseFloat(form.total))) { toast.error('Total amount tidak valid!'); return }

        const formData = new FormData()
        if (photoFile) formData.append('invoice_photo', photoFile)

        addEntry({
            item: form.item.trim(),
            qty: parseFloat(form.qty),
            unit: form.unit,
            total: parseFloat(form.total),
            invoice: form.invoice.trim(),
            description: form.description.trim(),
            photoName: photoFile?.name || null,
            photoUrl: photoPreview,
            submittedBy: user?.name,
        })

        toast.success('Petty Cash berhasil dicatat!')
        setForm({ item: '', qty: '', unit: 'pcs', total: '', invoice: '', description: '' })
        setPhotoFile(null)
        setPhotoPreview(null)
        if (fileRef.current) fileRef.current.value = ''
    }

    const formatRp = (num) => `Rp ${Number(num).toLocaleString('id-ID')}`

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <Wallet size={24} /> Petty Cash
                </h2>
                <p className="text-sm text-tertiary/60 mt-1">Catat pengeluaran petty cash untuk kebutuhan dapur</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Form */}
                <div className="lg:col-span-2">
                    <div className="card sticky top-24">
                        <h3 className="font-bold text-primary text-sm mb-4 flex items-center gap-2"><Plus size={16} /> Input Pengeluaran</h3>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="label">Nama Item</label>
                                <input value={form.item} onChange={e => setForm(f => ({ ...f, item: e.target.value }))} className="input-field" placeholder="Contoh: Sabun Cuci Piring" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="label">Qty</label>
                                    <input type="number" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} className="input-field" placeholder="0" min="0" />
                                </div>
                                <div>
                                    <label className="label">Unit</label>
                                    <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="input-field">
                                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Total (Rp)</label>
                                    <input type="number" value={form.total} onChange={e => setForm(f => ({ ...f, total: e.target.value }))} className="input-field" placeholder="0" min="0" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Invoice / No. Referensi</label>
                                <input value={form.invoice} onChange={e => setForm(f => ({ ...f, invoice: e.target.value }))} className="input-field" placeholder="INV-2026-001" />
                            </div>
                            <div>
                                <label className="label">Foto Invoice</label>
                                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
                                <label htmlFor="photo-upload" className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-primary"
                                    style={{ borderColor: photoFile ? '#327169' : '#e5e7eb', backgroundColor: photoFile ? 'rgba(50,113,105,0.05)' : 'transparent' }}>
                                    <Upload size={15} className="text-tertiary/50" />
                                    <span className="text-sm text-tertiary/60 truncate">{photoFile ? photoFile.name : 'Pilih foto invoice...'}</span>
                                    {photoFile && <Check size={14} className="ml-auto text-green-500" />}
                                </label>
                                {photoPreview && (
                                    <div className="mt-2 relative">
                                        <img src={photoPreview} alt="Preview" className="w-full h-28 object-cover rounded-xl border border-gray-200" />
                                        <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); if (fileRef.current) fileRef.current.value = '' }}
                                            className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow text-red-400 hover:text-red-600">
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="label">Deskripsi / Keperluan</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-field" placeholder="Untuk keperluan dapur / kegiatan apa?" />
                            </div>
                            <button type="submit" className="btn-primary w-full justify-center">
                                <Save size={15} /> Simpan Petty Cash
                            </button>
                        </form>
                    </div>
                </div>

                {/* My submissions */}
                <div className="lg:col-span-3">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-tertiary/50 mb-3">Riwayat Saya ({myEntries.length})</h3>
                    {myEntries.length === 0 ? (
                        <div className="card text-center py-12">
                            <FileText size={36} className="mx-auto text-accent mb-3" />
                            <p className="text-sm text-tertiary/60">Belum ada catatan petty cash</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {myEntries.map(entry => (
                                <div key={entry.id} className="card hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-primary truncate">{entry.item}</p>
                                            <p className="text-xs text-tertiary/60 mt-0.5">{entry.description || '—'}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="badge-gray text-[10px]">Qty: {entry.qty} {entry.unit || ''}</span>
                                                {entry.invoice && <span className="badge-gray text-[10px]">INV: {entry.invoice}</span>}
                                                <span className="text-xs font-bold" style={{ color: '#327169' }}>{formatRp(entry.total)}</span>
                                            </div>
                                        </div>
                                        {entry.photoUrl && (
                                            <img src={entry.photoUrl} alt="Invoice" className="w-14 h-14 object-cover rounded-xl border border-gray-200 flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-tertiary/40 mt-2">
                                        {new Date(entry.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
