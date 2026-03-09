import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Store, Plus, Pencil, Trash2, Save, X, Phone, MapPin, User } from 'lucide-react'
import { toast } from 'react-toastify'
import useVendorStore from '../store/vendorStore'

function ConfirmDeleteModal({ vendor, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#fef2f2' }}>
                        <Trash2 size={18} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Hapus Vendor?</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Aksi ini tidak dapat dibatalkan.</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mb-5">Anda akan menghapus <span className="font-bold text-primary">"{vendor.name}"</span> dari daftar vendor.</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="btn-secondary flex-1 justify-center">Batal</button>
                    <button onClick={onConfirm} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors">
                        <Trash2 size={14} /> Hapus
                    </button>
                </div>
            </div>
        </div>
    )
}

function VendorFormModal({ vendor, onClose, onSave }) {
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: vendor || { name: '', location: '', pic: '', phone: '' }
    })
    const isEdit = !!vendor

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h3 className="text-lg font-extrabold" style={{ color: '#327169' }}>
                            {isEdit ? 'Edit Vendor' : 'Tambah Vendor Baru'}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(77,77,77,0.5)' }}>Data supplier resmi yang terdaftar</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-400"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                    <div>
                        <label className="label">Nama Vendor <span className="text-red-400">*</span></label>
                        <input className="input-field" placeholder="cth. CV Sembako Jaya" {...register('name', { required: 'Wajib diisi' })} />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="label">Lokasi <span className="text-red-400">*</span></label>
                        <input className="input-field" placeholder="cth. Pasar Induk Kramatjati, Jakarta Timur" {...register('location', { required: 'Wajib diisi' })} />
                        {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Nama PIC <span className="text-red-400">*</span></label>
                            <input className="input-field" placeholder="cth. Pak Hendra" {...register('pic', { required: 'Wajib diisi' })} />
                            {errors.pic && <p className="text-xs text-red-500 mt-1">{errors.pic.message}</p>}
                        </div>
                        <div>
                            <label className="label">No. Telepon <span className="text-red-400">*</span></label>
                            <input className="input-field" placeholder="cth. 0812-1111-2222" {...register('phone', { required: 'Wajib diisi' })} />
                            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2 border-t" style={{ borderColor: '#f3f4f6' }}>
                        <button type="submit" className="btn-primary flex-1 justify-center">
                            <Save size={16} /> {isEdit ? 'Update Vendor' : 'Simpan Vendor'}
                        </button>
                        <button type="button" onClick={onClose} className="btn-secondary w-28 justify-center">Batal</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function VendorManagementPage() {
    const { vendors, addVendor, updateVendor, deleteVendor } = useVendorStore()
    const [editVendor, setEditVendor] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const handleSave = (data) => {
        if (editVendor) {
            updateVendor(editVendor.id, data)
            toast.success(`Vendor "${data.name}" berhasil diperbarui!`)
            setEditVendor(null)
        } else {
            addVendor(data)
            toast.success(`Vendor "${data.name}" berhasil ditambahkan!`)
            setShowAddForm(false)
        }
    }

    const handleDelete = () => {
        deleteVendor(deleteTarget.id)
        toast.success(`Vendor "${deleteTarget.name}" dihapus.`)
        setDeleteTarget(null)
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                        <Store size={24} /> Kelola Vendor
                    </h2>
                    <p className="text-sm text-tertiary/60 mt-1">Database supplier resmi untuk pengadaan bahan</p>
                </div>
                <button onClick={() => { setShowAddForm(true); setEditVendor(null) }} className="btn-primary">
                    <Plus size={16} /> Tambah Vendor
                </button>
            </div>

            {/* Vendor cards grid */}
            {vendors.length === 0 ? (
                <div className="card text-center py-12">
                    <Store size={40} className="mx-auto text-accent mb-3" />
                    <p className="font-bold text-gray-700 mb-1">Belum ada vendor terdaftar</p>
                    <p className="text-sm text-gray-400">Tambahkan vendor untuk mengisi dropdown Procurement</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vendors.map(v => (
                        <div key={v.id} className="card border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: '#327169' }}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(50,113,105,0.1)' }}>
                                        <Store size={18} style={{ color: '#327169' }} />
                                    </div>
                                    <div>
                                        <p className="font-bold" style={{ color: '#327169' }}>{v.name}</p>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(163,199,199,0.3)', color: '#438c81' }}>ID: {v.id}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    <button onClick={() => { setEditVendor(v); setShowAddForm(false) }}
                                        className="p-2 rounded-lg transition-colors hover:opacity-80 text-white"
                                        style={{ backgroundColor: '#438c81' }}>
                                        <Pencil size={13} />
                                    </button>
                                    <button onClick={() => setDeleteTarget(v)}
                                        className="p-2 rounded-lg transition-colors text-red-400 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1.5">
                                <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(77,77,77,0.6)' }}>
                                    <MapPin size={12} style={{ color: '#438c81' }} />
                                    <span>{v.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(77,77,77,0.6)' }}>
                                    <User size={12} style={{ color: '#438c81' }} />
                                    <span>PIC: {v.pic}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(77,77,77,0.6)' }}>
                                    <Phone size={12} style={{ color: '#438c81' }} />
                                    <span>{v.phone}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Vendor count badge */}
            {vendors.length > 0 && (
                <p className="text-xs text-tertiary/40 text-center">{vendors.length} vendor terdaftar • siap digunakan di Procurement</p>
            )}

            {/* Add/Edit Modal */}
            {(showAddForm || editVendor) && (
                <VendorFormModal
                    vendor={editVendor}
                    onClose={() => { setShowAddForm(false); setEditVendor(null) }}
                    onSave={handleSave}
                />
            )}

            {/* Delete Confirm Modal */}
            {deleteTarget && (
                <ConfirmDeleteModal
                    vendor={deleteTarget}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    )
}
