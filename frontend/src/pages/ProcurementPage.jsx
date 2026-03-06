import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ShoppingCart, Save, AlertTriangle, Check, Truck } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../store/authStore'
import useWorkflowStore from '../store/workflowStore'
import clsx from 'clsx'

export default function ProcurementPage() {
    const { user } = useAuthStore()
    const { menus, addVendor, verifyStage } = useWorkflowStore()
    const [selectedMenu, setSelectedMenu] = useState(null)
    const { register, handleSubmit, reset, formState: { errors }, watch } = useForm()

    const pendingMenus = menus.filter(m => m.stages.procurement?.status === 'active')

    const onSubmit = (data) => {
        const ingredient = selectedMenu.ingredients.find(ig => ig.name === data.item)
        const maxPrice = ingredient?.maxPrice || Infinity

        if (parseFloat(data.price) > maxPrice) {
            toast.error(`Harga melebihi batas max dari Accountant! (Max: Rp ${maxPrice.toLocaleString('id-ID')})`)
            return
        }

        addVendor(selectedMenu.id, {
            vendor: data.vendor,
            location: data.location,
            item: data.item,
            price: parseFloat(data.price),
            qty: parseFloat(data.qty),
            unit: data.unit,
            arrivalDate: data.arrivalDate,
            arrivalTime: data.arrivalTime,
            status: 'in_transit',
        })
        toast.success('Vendor berhasil ditambahkan!')
        reset()
    }

    const handleComplete = (menuId) => {
        verifyStage(menuId, 'procurement', user.name)
        toast.success('Procurement selesai! Diteruskan ke Warehouse.')
        setSelectedMenu(null)
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <ShoppingCart size={24} /> Procurement
                </h2>
                <p className="text-sm text-tertiary/60 mt-1">Assign vendor dan harga untuk setiap bahan</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Menu list */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-tertiary/50">
                        Menu untuk Procurement ({pendingMenus.length})
                    </h3>
                    {pendingMenus.length === 0 ? (
                        <div className="card text-center py-8"><Check size={32} className="mx-auto text-accent mb-2" /><p className="text-sm text-gray-400">Semua sudah diproses</p></div>
                    ) : (
                        pendingMenus.map(menu => (
                            <div
                                key={menu.id}
                                onClick={() => setSelectedMenu(menu)}
                                className={clsx('card cursor-pointer transition-all border-2', selectedMenu?.id === menu.id ? 'border-primary shadow-lg' : 'border-transparent hover:border-accent')}
                            >
                                <p className="font-bold text-primary">{menu.name}</p>
                                <p className="text-xs text-tertiary/60 mt-0.5">{menu.targetDate}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {menu.ingredients.map((ig, i) => (
                                        <span key={i} className="badge-gray text-[10px]">{ig.name} ({ig.quantity} {ig.unit})</span>
                                    ))}
                                </div>
                                {(menu.vendors || []).length > 0 && (
                                    <p className="text-xs text-secondary mt-2">✓ {menu.vendors.length} vendor sudah di-assign</p>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Right: Vendor form */}
                <div>
                    {selectedMenu ? (
                        <div className="card sticky top-24 space-y-4">
                            <h3 className="font-bold text-primary text-sm">Assign Vendor: {selectedMenu.name}</h3>

                            {/* Price limits */}
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                                <p className="text-xs font-bold text-amber-700 flex items-center gap-1 mb-2"><AlertTriangle size={12} /> Batas Harga Accountant</p>
                                {selectedMenu.ingredients.map((ig, i) => (
                                    <div key={i} className="flex justify-between text-xs py-0.5">
                                        <span className="text-tertiary">{ig.name}</span>
                                        <span className="font-bold text-amber-700">Max Rp {(ig.maxPrice || 0).toLocaleString('id-ID')}/{ig.unit}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Existing vendors */}
                            {(selectedMenu.vendors || []).length > 0 && (
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wide text-tertiary/50 mb-2">Vendor Ter-assign</p>
                                    {selectedMenu.vendors.map((v, i) => (
                                        <div key={i} className="p-2.5 rounded-lg bg-gray-50 mb-1.5 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-primary">{v.vendor}</p>
                                                <p className="text-[10px] text-tertiary/60">{v.item} • Rp {v.price?.toLocaleString('id-ID')}/{v.unit}</p>
                                            </div>
                                            <span className={v.status === 'arrived' ? 'badge-success text-[10px]' : 'badge-info text-[10px]'}>
                                                <Truck size={10} /> {v.status === 'arrived' ? 'Arrived' : 'In Transit'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add vendor form */}
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 border-t pt-4" style={{ borderColor: '#f3f4f6' }}>
                                <p className="text-xs font-bold uppercase tracking-wide text-tertiary/50">Tambah Vendor</p>
                                <input {...register('vendor', { required: 'Wajib' })} className="input-field text-sm" placeholder="Nama Vendor" />
                                <input {...register('location')} className="input-field text-sm" placeholder="Lokasi Vendor" />
                                <select {...register('item', { required: true })} className="input-field text-sm">
                                    <option value="">Pilih Item</option>
                                    {selectedMenu.ingredients.map((ig, i) => (
                                        <option key={i} value={ig.name}>{ig.name} ({ig.quantity} {ig.unit})</option>
                                    ))}
                                </select>
                                <div className="grid grid-cols-3 gap-2">
                                    <input {...register('price', { required: true })} type="number" className="input-field text-sm" placeholder="Harga/unit" />
                                    <input {...register('qty', { required: true })} type="number" className="input-field text-sm" placeholder="Qty" />
                                    <input {...register('unit')} className="input-field text-sm" placeholder="Unit" defaultValue="kg" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input {...register('arrivalDate', { required: true })} type="date" className="input-field text-sm" />
                                    <input {...register('arrivalTime')} type="time" className="input-field text-sm" />
                                </div>
                                <button type="submit" className="btn-primary w-full justify-center text-sm"><Save size={14} /> Tambah Vendor</button>
                            </form>

                            <button onClick={() => handleComplete(selectedMenu.id)} className="btn-primary w-full justify-center" style={{ background: '#16a34a' }}>
                                <Check size={16} /> Selesai — Kirim ke Warehouse
                            </button>
                        </div>
                    ) : (
                        <div className="card text-center py-12">
                            <ShoppingCart size={40} className="mx-auto text-accent mb-3" />
                            <p className="text-sm text-tertiary/60">Pilih menu untuk assign vendor</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
