import React, { useState } from 'react'
import { Wallet, Search, Edit2, Save, X, Image } from 'lucide-react'
import { toast } from 'react-toastify'
import usePettyCashStore from '../store/pettyCashStore'

export default function PettyCashHistoryPage() {
    const { entries, updateEntry } = usePettyCashStore()
    const [search, setSearch] = useState('')
    const [editId, setEditId] = useState(null)
    const [editForm, setEditForm] = useState({})

    const sorted = [...entries].reverse()
    const filtered = sorted.filter(e =>
        e.item?.toLowerCase().includes(search.toLowerCase()) ||
        e.invoice?.toLowerCase().includes(search.toLowerCase()) ||
        e.submittedBy?.toLowerCase().includes(search.toLowerCase())
    )

    const totalAmount = filtered.reduce((s, e) => s + (Number(e.total) || 0), 0)

    const startEdit = (entry) => {
        setEditId(entry.id)
        setEditForm({ item: entry.item, qty: entry.qty, total: entry.total, invoice: entry.invoice, description: entry.description })
    }

    const cancelEdit = () => { setEditId(null); setEditForm({}) }

    const saveEdit = (id) => {
        if (!editForm.item?.trim()) { toast.error('Nama item wajib diisi!'); return }
        updateEntry(id, { ...editForm, qty: parseFloat(editForm.qty) || 0, total: parseFloat(editForm.total) || 0 })
        toast.success('Data petty cash berhasil diperbarui!')
        setEditId(null)
        setEditForm({})
    }

    const formatRp = (num) => `Rp ${Number(num).toLocaleString('id-ID')}`

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <Wallet size={24} /> Petty Cash — Rekap
                </h2>
                <p className="text-sm text-tertiary/60 mt-1">Seluruh catatan pengeluaran petty cash — dapat diedit oleh Accountant</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Transaksi', value: entries.length, color: '#327169' },
                    { label: 'Total Pengeluaran (filter)', value: formatRp(totalAmount), color: '#dc2626' },
                    { label: 'Berkas Foto', value: entries.filter(e => e.photoUrl).length, color: '#438c81' },
                ].map((s, i) => (
                    <div key={i} className="card">
                        <p className="text-xl font-extrabold truncate" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-xs text-tertiary/50 font-semibold mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary/40" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cari berdasarkan nama item, invoice, atau nama SPV..."
                    className="input-field pl-9"
                />
            </div>

            {/* Table */}
            <div className="card overflow-x-auto p-0">
                <table className="w-full text-sm min-w-[900px]">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="table-header">Item</th>
                            <th className="table-header text-center">Qty</th>
                            <th className="table-header text-right">Total</th>
                            <th className="table-header">Invoice</th>
                            <th className="table-header">Foto</th>
                            <th className="table-header">Deskripsi</th>
                            <th className="table-header">Diinput Oleh</th>
                            <th className="table-header">Tanggal</th>
                            <th className="table-header text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="text-center py-12 text-sm text-gray-400 italic">
                                    {search ? 'Tidak ada hasil pencarian' : 'Belum ada data petty cash'}
                                </td>
                            </tr>
                        ) : filtered.map(entry => (
                            <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors align-top">
                                {editId === entry.id ? (
                                    <>
                                        <td className="table-cell">
                                            <input value={editForm.item} onChange={e => setEditForm(f => ({ ...f, item: e.target.value }))} className="input-field text-xs py-1.5 px-2" />
                                        </td>
                                        <td className="table-cell">
                                            <input type="number" value={editForm.qty} onChange={e => setEditForm(f => ({ ...f, qty: e.target.value }))} className="input-field text-xs py-1.5 px-2 w-16 text-center" />
                                        </td>
                                        <td className="table-cell">
                                            <input type="number" value={editForm.total} onChange={e => setEditForm(f => ({ ...f, total: e.target.value }))} className="input-field text-xs py-1.5 px-2 w-28" />
                                        </td>
                                        <td className="table-cell">
                                            <input value={editForm.invoice} onChange={e => setEditForm(f => ({ ...f, invoice: e.target.value }))} className="input-field text-xs py-1.5 px-2" />
                                        </td>
                                        <td className="table-cell text-center">
                                            {entry.photoUrl
                                                ? <img src={entry.photoUrl} alt="inv" className="w-8 h-8 rounded-lg object-cover mx-auto" />
                                                : <span className="text-gray-300"><Image size={16} className="mx-auto" /></span>}
                                        </td>
                                        <td className="table-cell">
                                            <input value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} className="input-field text-xs py-1.5 px-2" />
                                        </td>
                                        <td className="table-cell">
                                            <span className="badge-primary text-[10px]">{entry.submittedBy}</span>
                                        </td>
                                        <td className="table-cell text-xs text-tertiary/60 whitespace-nowrap">
                                            {new Date(entry.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="table-cell text-center">
                                            <div className="flex items-center gap-1 justify-center">
                                                <button onClick={() => saveEdit(entry.id)} className="p-1.5 rounded-lg text-white hover:opacity-80 transition-opacity" style={{ backgroundColor: '#327169' }}>
                                                    <Save size={13} />
                                                </button>
                                                <button onClick={cancelEdit} className="p-1.5 rounded-lg text-red-400 border border-red-200 hover:bg-red-50 transition-colors">
                                                    <X size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="table-cell font-bold text-primary">{entry.item}</td>
                                        <td className="table-cell text-center">{entry.qty} {entry.unit || ''}</td>
                                        <td className="table-cell text-right font-bold" style={{ color: '#327169' }}>{formatRp(entry.total)}</td>
                                        <td className="table-cell text-tertiary/70 text-xs">{entry.invoice || '—'}</td>
                                        <td className="table-cell text-center">
                                            {entry.photoUrl
                                                ? <a href={entry.photoUrl} target="_blank" rel="noopener noreferrer">
                                                    <img src={entry.photoUrl} alt="inv" className="w-8 h-8 rounded-lg object-cover mx-auto hover:opacity-80 transition-opacity" title="Lihat foto" />
                                                  </a>
                                                : <span className="text-gray-300"><Image size={16} className="mx-auto" /></span>}
                                        </td>
                                        <td className="table-cell text-tertiary/60 text-xs max-w-[160px] truncate">{entry.description || '—'}</td>
                                        <td className="table-cell">
                                            <span className="badge-primary text-[10px]">{entry.submittedBy}</span>
                                        </td>
                                        <td className="table-cell text-xs text-tertiary/60 whitespace-nowrap">
                                            {new Date(entry.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="table-cell text-center">
                                            <button onClick={() => startEdit(entry)} className="p-1.5 rounded-lg text-white hover:opacity-80 transition-opacity" style={{ backgroundColor: '#438c81' }}>
                                                <Edit2 size={13} />
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                    {filtered.length > 0 && (
                        <tfoot>
                            <tr className="bg-gray-50 border-t border-gray-200">
                                <td className="table-cell font-bold text-primary" colSpan={2}>Total ({filtered.length} item)</td>
                                <td className="table-cell text-right font-extrabold" style={{ color: '#dc2626' }}>{formatRp(totalAmount)}</td>
                                <td colSpan={6} />
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    )
}
