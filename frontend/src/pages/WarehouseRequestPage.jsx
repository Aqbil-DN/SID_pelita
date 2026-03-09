import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PackagePlus, Send, Clock, PackageCheck } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../store/authStore'
import { DEMO_STOCK, UNITS } from '../lib/constants'

export default function WarehouseRequestPage() {
    const { user } = useAuthStore()
    const { register, handleSubmit, reset, formState: { errors } } = useForm()
    const [requests, setRequests] = useState([
        { id: 1, item: 'Bawang Putih', qty: 5, unit: 'kg', description: 'Habis, butuh sebelum jam 10:00', status: 'pending', time: '06:30', arrivedConfirmed: false },
        { id: 2, item: 'Santan Kelapa', qty: 10, unit: 'liter', description: 'Untuk produksi siang', status: 'fulfilled', time: '07:00', arrivedConfirmed: false },
    ])

    const confirmArrival = (id) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, arrivedConfirmed: true } : r))
        toast.success('Barang dikonfirmasi telah tiba!')
    }

    const onSubmit = (data) => {
        setRequests(prev => [{
            id: Date.now(),
            item: data.item,
            qty: parseFloat(data.qty),
            unit: data.unit,
            description: data.description,
            status: 'pending',
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        }, ...prev])
        toast.success('Request berhasil dikirim ke Warehouse!')
        reset()
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <PackagePlus size={24} /> Request Gudang
                </h2>
                <p className="text-sm text-tertiary/60 mt-1">Request bahan ke warehouse untuk kebutuhan produksi</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <div className="card">
                    <h3 className="font-bold text-primary text-sm mb-4">Buat Request Baru</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="label">Nama Material</label>
                            <input {...register('item', { required: 'Wajib diisi' })} className="input-field" placeholder="Contoh: Bawang Putih" />
                            {errors.item && <p className="text-xs text-red-500 mt-1">{errors.item.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="label">Qty</label>
                                <input {...register('qty', { required: 'Wajib' })} type="number" className="input-field" placeholder="5" />
                            </div>
                            <div>
                                <label className="label">Unit</label>
                                <select {...register('unit')} className="input-field" defaultValue="kg">
                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="label">Keterangan</label>
                            <textarea {...register('description')} rows={2} className="input-field" placeholder="Contoh: Dibutuhkan sebelum jam 08:00 AM" />
                        </div>
                        <button type="submit" className="btn-primary w-full justify-center"><Send size={16} /> Kirim Request</button>
                    </form>
                </div>

                {/* Request history */}
                <div className="card">
                    <h3 className="font-bold text-primary text-sm mb-4">Riwayat Request</h3>
                    {requests.length === 0 ? (
                        <p className="text-sm text-gray-400 italic text-center py-6">Belum ada request</p>
                    ) : (
                        <div className="space-y-3">
                            {requests.map(req => (
                                <div key={req.id} className="p-3 rounded-xl border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-sm text-primary">{req.item}</p>
                                        <span className={req.status === 'fulfilled' ? 'badge-success' : 'badge-warning'}>
                                            {req.status === 'fulfilled' ? 'Terpenuhi' : 'Pending'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-secondary font-semibold mt-1">{req.qty} {req.unit}</p>
                                    {req.description && <p className="text-xs text-tertiary/60 mt-1">{req.description}</p>}
                                    <p className="text-[10px] text-tertiary/40 mt-1 flex items-center gap-1"><Clock size={10} /> {req.time}</p>
                                    {req.status === 'fulfilled' && (
                                        req.arrivedConfirmed ? (
                                            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                                                <PackageCheck size={11} /> Barang Diterima
                                            </span>
                                        ) : (
                                            <button onClick={() => confirmArrival(req.id)} className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-80" style={{ backgroundColor: '#327169' }}>
                                                <PackageCheck size={13} /> Item Arrived
                                            </button>
                                        )
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
