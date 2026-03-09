import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PackagePlus, Send, Clock, AlertTriangle, PackageCheck } from 'lucide-react'
import { toast } from 'react-toastify'
import { DEMO_STOCK } from '../lib/constants'

export default function SpvWarehouseRequestPage() {
    const { register, handleSubmit, reset, formState: { errors } } = useForm()
    const [requests, setRequests] = useState([])

    const confirmArrival = (id) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, arrivedConfirmed: true } : r))
        toast.success('Barang dikonfirmasi telah tiba!')
    }

    const onSubmit = (data) => {
        const stockItem = DEMO_STOCK.find(s => s.id === parseInt(data.stockId))
        if (!stockItem) { toast.error('Pilih item dari stok!'); return }
        if (parseFloat(data.qty) > stockItem.qty) {
            toast.error(`Qty melebihi stok! (Stok: ${stockItem.qty} ${stockItem.unit})`)
            return
        }
        setRequests(prev => [{
            id: Date.now(),
            item: stockItem.name,
            qty: parseFloat(data.qty),
            unit: stockItem.unit,
            description: data.description,
            status: 'pending',
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        }, ...prev])
        toast.success('Request berhasil dikirim!')
        reset()
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2"><PackagePlus size={24} /> SPV Request Gudang</h2>
                <p className="text-sm text-tertiary/60 mt-1">Request item tambahan — hanya dari stok warehouse yang tersedia</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="font-bold text-primary text-sm mb-4">Buat Request</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="label">Pilih dari Stok Warehouse</label>
                            <select {...register('stockId', { required: 'Pilih item' })} className="input-field">
                                <option value="">— Pilih Item —</option>
                                {DEMO_STOCK.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} — stok: {s.qty} {s.unit}</option>
                                ))}
                            </select>
                            {errors.stockId && <p className="text-xs text-red-500 mt-1">{errors.stockId.message}</p>}
                        </div>
                        <div>
                            <label className="label">Qty</label>
                            <input {...register('qty', { required: 'Wajib' })} type="number" className="input-field" placeholder="Jumlah" />
                        </div>
                        <div>
                            <label className="label">Keterangan</label>
                            <textarea {...register('description')} rows={2} className="input-field" placeholder="Alasan request..." />
                        </div>
                        <button type="submit" className="btn-primary w-full justify-center"><Send size={16} /> Kirim</button>
                    </form>

                    <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
                        <p className="text-xs text-amber-700 flex items-center gap-1"><AlertTriangle size={12} /> Hanya item yang tersedia di stok warehouse yang bisa di-request.</p>
                    </div>
                </div>

                <div className="card">
                    <h3 className="font-bold text-primary text-sm mb-4">Riwayat Request</h3>
                    {requests.length === 0 ? (
                        <p className="text-sm text-gray-400 italic text-center py-6">Belum ada request</p>
                    ) : (
                        <div className="space-y-3">
                            {requests.map(r => (
                                <div key={r.id} className="p-3 rounded-xl border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-sm text-primary">{r.item}</p>
                                        <span className="badge-warning">Pending</span>
                                    </div>
                                    <p className="text-xs text-secondary font-semibold mt-1">{r.qty} {r.unit}</p>
                                    {r.description && <p className="text-xs text-tertiary/60 mt-1">{r.description}</p>}
                                    <p className="text-[10px] text-tertiary/40 mt-1 flex items-center gap-1"><Clock size={10} /> {r.time}</p>
                                    {r.status === 'fulfilled' && (
                                        r.arrivedConfirmed ? (
                                            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                                                <PackageCheck size={11} /> Barang Diterima
                                            </span>
                                        ) : (
                                            <button onClick={() => confirmArrival(r.id)} className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-80" style={{ backgroundColor: '#327169' }}>
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
