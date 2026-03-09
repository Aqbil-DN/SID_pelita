import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ShoppingCart, Save, AlertTriangle, Check, Truck, Printer, X, Calendar, FileText, ChevronLeft, ChevronRight, Store } from 'lucide-react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useWorkflowStore from '../store/workflowStore'
import useVendorStore from '../store/vendorStore'
import clsx from 'clsx'

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
function getMonthData(year, month) { return { firstDay: new Date(year, month, 1).getDay(), daysInMonth: new Date(year, month + 1, 0).getDate() } }
function formatDate(y, m, d) { return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` }

function groupVendorsBySupplier(menus, filterFn) {
    const relevant = menus.filter(filterFn)
    const map = {}
    relevant.forEach(menu => {
        ;(menu.vendors || []).forEach(v => {
            const key = v.vendor || 'Unknown Supplier'
            if (!map[key]) map[key] = { vendor: key, location: v.location || '', items: [] }
            map[key].items.push({ ...v, menuName: menu.name, menuDate: menu.targetDate })
        })
    })
    return Object.values(map)
}

function PODocument({ supplierGroups, dateLabel, generatedAt }) {
    return (
        <div className="po-document">
            {supplierGroups.map((group, gi) => (
                <div key={gi} className={gi < supplierGroups.length - 1 ? 'po-page-break' : ''} style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #327169', paddingBottom: '12px', marginBottom: '16px' }}>
                        <div>
                            <h1 style={{ fontSize: '18pt', fontWeight: 900, color: '#327169', margin: 0 }}>PURCHASE ORDER</h1>
                            <p style={{ fontSize: '9pt', color: '#6b7280', margin: '4px 0 0' }}>Sistem Informasi Dapur &mdash; Pengadaan Bahan</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 700, fontSize: '10pt', margin: 0 }}>No. PO: {`PO-${Date.now().toString().slice(-6)}-${gi + 1}`}</p>
                            <p style={{ fontSize: '9pt', color: '#6b7280', margin: '2px 0 0' }}>Tanggal: {new Date(generatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            <p style={{ fontSize: '9pt', color: '#6b7280', margin: '2px 0 0' }}>Periode: {dateLabel}</p>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
                            <p style={{ fontWeight: 700, fontSize: '9pt', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 4px' }}>Kepada Yth.</p>
                            <p style={{ fontWeight: 800, fontSize: '12pt', color: '#327169', margin: '0 0 2px' }}>{group.vendor}</p>
                            <p style={{ fontSize: '9pt', color: '#4d4d4d', margin: 0 }}>{group.location || '—'}</p>
                        </div>
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
                            <p style={{ fontWeight: 700, fontSize: '9pt', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', margin: '0 0 4px' }}>Dari (Pembeli)</p>
                            <p style={{ fontWeight: 800, fontSize: '12pt', color: '#327169', margin: '0 0 2px' }}>Unit Pengadaan — Sistem Informasi Dapur</p>
                            <p style={{ fontSize: '9pt', color: '#4d4d4d', margin: 0 }}>Dept. Supply Chain (SCD)</p>
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '10pt' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#327169', color: '#fff' }}>
                                {['No.', 'Nama Item', 'Untuk Menu', 'Qty', 'Satuan', 'Harga/Unit', 'Subtotal'].map((h, i) => (
                                    <th key={i} style={{ padding: '8px 10px', textAlign: i === 0 || i >= 3 ? (i >= 5 ? 'right' : 'center') : 'left', fontWeight: 700 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {group.items.map((item, ii) => (
                                <tr key={ii} style={{ backgroundColor: ii % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '8px 10px', color: '#6b7280' }}>{ii + 1}</td>
                                    <td style={{ padding: '8px 10px', fontWeight: 700 }}>{item.item}</td>
                                    <td style={{ padding: '8px 10px', color: '#6b7280', fontSize: '9pt' }}>{item.menuName}</td>
                                    <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>{item.qty}</td>
                                    <td style={{ padding: '8px 10px', textAlign: 'center', color: '#6b7280' }}>{item.unit}</td>
                                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>Rp {(item.price || 0).toLocaleString('id-ID')}</td>
                                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#327169' }}>Rp {((item.price || 0) * (item.qty || 0)).toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ backgroundColor: '#e0f2f2', borderTop: '2px solid #327169' }}>
                                <td colSpan={6} style={{ padding: '10px', fontWeight: 800, color: '#327169', textAlign: 'right' }}>Total Nilai PO</td>
                                <td style={{ padding: '10px', fontWeight: 800, color: '#327169', textAlign: 'right' }}>Rp {group.items.reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0).toLocaleString('id-ID')}</td>
                            </tr>
                        </tfoot>
                    </table>
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', marginBottom: '24px', fontSize: '9pt', color: '#6b7280' }}>
                        <p style={{ margin: 0 }}>Catatan: Mohon konfirmasi kesanggupan pengiriman paling lambat 1x24 jam setelah penerimaan PO ini. Pembayaran dilakukan setelah barang diterima dan diverifikasi oleh tim Warehouse.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '40px' }}>
                        {['Disetujui Oleh', 'Diperiksa Oleh', 'Dibuat Oleh'].map((label, i) => (
                            <div key={i} style={{ textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                                <div style={{ height: '40px' }} />
                                <p style={{ fontWeight: 700, fontSize: '9pt', margin: 0 }}>________________</p>
                                <p style={{ fontSize: '8pt', color: '#6b7280', margin: '4px 0 0' }}>{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

// ─── Procurement Input Modal ─────────────────────────────────────────────────
function ProcurementModal({ date, menu, vendors, onClose, onSubmitVendor, onComplete }) {
    const { register, handleSubmit, reset, watch } = useForm()
    const selectedVendorId = watch('vendorId')
    const selectedVendor = vendors.find(v => v.id === parseInt(selectedVendorId))

    const onSubmit = (data) => {
        const ingredient = menu.ingredients.find(ig => ig.name === data.item)
        const maxPrice = ingredient?.maxPrice || Infinity
        if (parseFloat(data.price) > maxPrice) {
            toast.error(`Harga Rp ${parseFloat(data.price).toLocaleString('id-ID')} melebihi batas max Rp ${maxPrice.toLocaleString('id-ID')}`)
            return
        }
        onSubmitVendor(menu.id, {
            vendor: selectedVendor?.name || 'Unknown',
            location: selectedVendor?.location || '',
            item: data.item, price: parseFloat(data.price),
            qty: parseFloat(data.qty), unit: data.unit,
            arrivalDate: data.arrivalDate, arrivalTime: data.arrivalTime, status: 'in_transit',
        })
        reset()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-4 flex-shrink-0 sticky top-0 bg-white z-10" style={{ borderBottom: '1px solid #e5e7eb', background: 'linear-gradient(135deg,rgba(50,113,105,0.06) 0%,rgba(163,199,199,0.10) 100%)' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#438c81' }}>Procurement</p>
                            <h3 className="font-extrabold" style={{ color: '#327169' }}>{menu.name}</h3>
                            <p className="text-xs mt-0.5" style={{ color: 'rgba(77,77,77,0.5)' }}>{new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-400"><X size={20} /></button>
                    </div>
                </div>
                <div className="px-6 py-5 space-y-5">
                    {/* Max price warning */}
                    {menu.ingredients.some(ig => ig.maxPrice) && (
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                            <p className="text-xs font-bold text-amber-700 flex items-center gap-1 mb-2"><AlertTriangle size={12} /> Batas Harga Accountant</p>
                            {menu.ingredients.map((ig, i) => (
                                <div key={i} className="flex justify-between text-xs py-0.5">
                                    <span className="text-tertiary">{ig.name}</span>
                                    <span className="font-bold text-amber-700">Max Rp {(ig.maxPrice || 0).toLocaleString('id-ID')}/{ig.unit}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Already assigned vendors */}
                    {(menu.vendors || []).length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-tertiary/50 mb-2">Vendor Ter-assign ({menu.vendors.length})</p>
                            {menu.vendors.map((v, i) => (
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

                    {/* Procurement form */}
                    {vendors.length === 0 ? (
                        <div className="p-4 rounded-xl text-center border-2 border-dashed" style={{ borderColor: '#e5e7eb' }}>
                            <Store size={24} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm font-semibold text-gray-500 mb-1">Belum ada vendor terdaftar</p>
                            <p className="text-xs text-gray-400">Tambahkan vendor di halaman "Kelola Vendor" terlebih dahulu</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 border-t pt-4" style={{ borderColor: '#f3f4f6' }}>
                            <p className="text-xs font-bold uppercase tracking-wide text-tertiary/50">Tambah Vendor</p>
                            {/* Vendor dropdown */}
                            <div>
                                <label className="label">Vendor <span className="text-red-400">*</span></label>
                                <select {...register('vendorId', { required: true })} className="input-field text-sm">
                                    <option value="">— Pilih Vendor —</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.name} — {v.location.split(',')[0]}</option>
                                    ))}
                                </select>
                                {selectedVendor && (
                                    <p className="text-[10px] mt-1" style={{ color: '#438c81' }}>📍 {selectedVendor.location} • PIC: {selectedVendor.pic} • {selectedVendor.phone}</p>
                                )}
                            </div>
                            <div>
                                <label className="label">Item Bahan <span className="text-red-400">*</span></label>
                                <select {...register('item', { required: true })} className="input-field text-sm">
                                    <option value="">Pilih Item</option>
                                    {menu.ingredients.map((ig, i) => (
                                        <option key={i} value={ig.name}>{ig.name} ({ig.quantity} {ig.unit})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div><label className="label text-[10px]">Harga/unit *</label><input {...register('price', { required: true })} type="number" className="input-field text-sm" placeholder="0" /></div>
                                <div><label className="label text-[10px]">Qty *</label><input {...register('qty', { required: true })} type="number" className="input-field text-sm" placeholder="0" /></div>
                                <div><label className="label text-[10px]">Unit</label><input {...register('unit')} className="input-field text-sm" defaultValue="kg" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="label text-[10px]">Tgl Tiba *</label><input {...register('arrivalDate', { required: true })} type="date" className="input-field text-sm" /></div>
                                <div><label className="label text-[10px]">Jam Tiba</label><input {...register('arrivalTime')} type="time" className="input-field text-sm" /></div>
                            </div>
                            <button type="submit" className="btn-primary w-full justify-center text-sm"><Save size={14} /> Tambah Vendor ke Menu Ini</button>
                        </form>
                    )}

                    <button onClick={() => onComplete(menu.id)} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white transition-colors" style={{ backgroundColor: '#16a34a' }}>
                        <Check size={16} /> Selesai — Kirim ke Warehouse
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Procurement Page ────────────────────────────────────────────────────
export default function ProcurementPage() {
    const { user } = useAuthStore()
    const { menus, addVendor, verifyStage } = useWorkflowStore()
    const { vendors } = useVendorStore()
    const navigate = useNavigate()

    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [modalDate, setModalDate] = useState(null)
    const [selectedMenu, setSelectedMenu] = useState(null)

    const [showPOModal, setShowPOModal] = useState(false)
    const [poFilter, setPOFilter] = useState({ mode: 'date', date: new Date().toISOString().split('T')[0], weekStart: '', weekEnd: '' })
    const [poGroups, setPOGroups] = useState(null)
    const [poDateLabel, setPODateLabel] = useState('')
    const [generatedAt, setGeneratedAt] = useState('')

    const { firstDay, daysInMonth } = getMonthData(currentYear, currentMonth)

    const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else setCurrentMonth(m => m - 1) }
    const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else setCurrentMonth(m => m + 1) }

    const pendingMenus = menus.filter(m => m.stages.procurement?.status === 'active')
    const getMenusForDay = (day) => {
        const dateStr = formatDate(currentYear, currentMonth, day)
        return pendingMenus.filter(m => m.targetDate === dateStr)
    }

    const handleDateClick = (day) => {
        const dateStr = formatDate(currentYear, currentMonth, day)
        const menus = getMenusForDay(day)
        if (menus.length === 0) return
        setModalDate(dateStr)
        setSelectedMenu(menus[0])
    }

    const handleSubmitVendor = (menuId, vendorData) => {
        addVendor(menuId, vendorData)
        toast.success('Vendor berhasil ditambahkan!')
    }

    const handleComplete = (menuId) => {
        verifyStage(menuId, 'procurement', user.name)
        toast.success('Procurement selesai! Diteruskan ke Warehouse.')
        setSelectedMenu(null); setModalDate(null)
    }

    const generatePO = () => {
        let filterFn, label
        if (poFilter.mode === 'date') { filterFn = m => m.targetDate === poFilter.date; label = new Date(poFilter.date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }
        else { filterFn = m => m.targetDate >= poFilter.weekStart && m.targetDate <= poFilter.weekEnd; label = `${poFilter.weekStart} s/d ${poFilter.weekEnd}` }
        const groups = groupVendorsBySupplier(menus, filterFn)
        if (groups.length === 0) { toast.warning('Tidak ada data vendor untuk periode ini!'); return }
        setPOGroups(groups); setPODateLabel(label); setGeneratedAt(new Date().toISOString()); setShowPOModal(true)
    }

    const menusForModalDate = modalDate ? pendingMenus.filter(m => m.targetDate === modalDate) : []

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2"><ShoppingCart size={24} /> Procurement</h2>
                    <p className="text-sm text-tertiary/60 mt-1">Klik tanggal untuk input vendor & harga bahan</p>
                </div>
                <div className="flex items-center gap-3">
                    {vendors.length === 0 && (
                        <button onClick={() => navigate('/vendor')}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 border-dashed hover:border-primary"
                            style={{ borderColor: '#a3c7c7', color: '#438c81' }}>
                            <Store size={14} /> Tambah Vendor Dulu
                        </button>
                    )}
                    <button onClick={() => setShowPOModal(true)} className="no-print flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: '#327169' }}>
                        <Printer size={16} /> Print PDF / PO
                    </button>
                </div>
            </div>

            {/* Vendor count info */}
            <div className="p-3.5 rounded-xl border flex items-center gap-3" style={{ borderColor: '#e5e7eb', backgroundColor: vendors.length > 0 ? 'rgba(50,113,105,0.04)' : '#fffbeb' }}>
                <Store size={16} style={{ color: vendors.length > 0 ? '#438c81' : '#ca8a04' }} />
                <p className="text-sm">
                    {vendors.length > 0
                        ? <><span className="font-bold" style={{ color: '#438c81' }}>{vendors.length} vendor terdaftar</span> <span className="text-tertiary/50">— siap dipilih di form procurement</span></>
                        : <><span className="font-bold text-amber-600">Tidak ada vendor terdaftar.</span> <button onClick={() => navigate('/vendor')} className="ml-1 font-bold underline text-amber-600 hover:text-amber-700">Kelola Vendor →</button></>}
                </p>
            </div>

            {/* Calendar */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="btn-secondary p-2"><ChevronLeft size={18} /></button>
                    <h3 className="text-lg font-bold text-primary">
                        {new Date(currentYear, currentMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={nextMonth} className="btn-secondary p-2"><ChevronRight size={18} /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS.map(d => <div key={d} className="text-center text-xs font-bold uppercase tracking-wide text-tertiary/50 py-2">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const dayMenus = getMenusForDay(day)
                        const count = dayMenus.length
                        const dateStr = formatDate(currentYear, currentMonth, day)
                        return (
                            <button key={day} onClick={() => count > 0 ? handleDateClick(day) : null}
                                className={clsx('relative p-3 rounded-xl text-sm font-semibold transition-all border',
                                    count > 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 cursor-pointer' : 'bg-white text-tertiary/30 border-gray-100 cursor-default')}>
                                {day}
                                {count > 0 && (
                                    <span className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full bg-indigo-600 text-white">{count}</span>
                                )}
                            </button>
                        )
                    })}
                </div>
                <div className="mt-5 pt-4 border-t flex items-center gap-3 text-xs" style={{ borderColor: '#f3f4f6' }}>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span> Menu Pending Procurement
                    </span>
                    <span className="text-tertiary/40">Klik tanggal untuk assign vendor</span>
                    {pendingMenus.length === 0 && <span className="ml-auto text-green-600 font-bold">✓ Semua sudah diproses</span>}
                </div>
            </div>

            {/* Procurement Modal */}
            {modalDate && selectedMenu && (
                <>
                    {/* Date's menu selector if multiple menus */}
                    {menusForModalDate.length > 1 && (
                        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex gap-2 flex-wrap justify-center">
                            {menusForModalDate.map(m => (
                                <button key={m.id} onClick={() => setSelectedMenu(m)}
                                    className={clsx('px-3 py-2 rounded-xl text-xs font-bold border-2 shadow-lg transition-all',
                                        selectedMenu.id === m.id ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary hover:bg-accent-light/20')}>
                                    {m.name}
                                </button>
                            ))}
                        </div>
                    )}
                    <ProcurementModal
                        date={modalDate}
                        menu={selectedMenu}
                        vendors={vendors}
                        onClose={() => { setModalDate(null); setSelectedMenu(null) }}
                        onSubmitVendor={handleSubmitVendor}
                        onComplete={handleComplete}
                    />
                </>
            )}

            {/* PO Print Modal */}
            {showPOModal && !poGroups && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm no-print" onClick={() => setShowPOModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-extrabold text-primary flex items-center gap-2"><FileText size={18} /> Generate PO</h3>
                            <button onClick={() => setShowPOModal(false)} className="text-gray-400 hover:text-red-400"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="label">Mode Filter</label>
                                <div className="flex gap-3">
                                    {['date', 'week'].map(m => (
                                        <button key={m} onClick={() => setPOFilter(f => ({ ...f, mode: m }))}
                                            className={clsx('flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all', poFilter.mode === m ? 'border-primary text-primary bg-accent/20' : 'border-gray-200 text-tertiary/60 hover:border-accent')}>
                                            {m === 'date' ? '📅 Per Hari' : '📆 Per Minggu'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {poFilter.mode === 'date' ? (
                                <div><label className="label">Pilih Tanggal</label><input type="date" value={poFilter.date} onChange={e => setPOFilter(f => ({ ...f, date: e.target.value }))} className="input-field" /></div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="label">Dari</label><input type="date" value={poFilter.weekStart} onChange={e => setPOFilter(f => ({ ...f, weekStart: e.target.value }))} className="input-field" /></div>
                                    <div><label className="label">Sampai</label><input type="date" value={poFilter.weekEnd} onChange={e => setPOFilter(f => ({ ...f, weekEnd: e.target.value }))} className="input-field" /></div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowPOModal(false)} className="btn-secondary flex-1 justify-center">Batal</button>
                            <button onClick={generatePO} className="btn-primary flex-1 justify-center"><FileText size={15} /> Preview PO</button>
                        </div>
                    </div>
                </div>
            )}

            {showPOModal && poGroups && (
                <div className="fixed inset-0 z-50 overflow-auto bg-gray-100 no-print" style={{ padding: '20px' }}>
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-extrabold text-primary flex items-center gap-2"><FileText size={18} /> Preview PO — {poDateLabel}</h3>
                            <div className="flex gap-3">
                                <button onClick={() => { setShowPOModal(false); setPOGroups(null) }} className="btn-secondary"><X size={15} /> Tutup</button>
                                <button onClick={() => { setShowPOModal(false); setTimeout(() => window.print(), 100) }} className="btn-primary"><Printer size={15} /> Cetak / PDF</button>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                            <p className="text-xs text-tertiary/50 mb-4">{poGroups.length} supplier • {poGroups.reduce((s, g) => s + g.items.length, 0)} item</p>
                            {poGroups.map((group, gi) => (
                                <div key={gi} className="border rounded-xl p-5 mb-4 border-gray-200">
                                    <p className="text-xs font-bold uppercase tracking-wide text-tertiary/40 mb-1">Halaman {gi + 1}</p>
                                    <p className="font-bold text-primary text-base">{group.vendor}</p>
                                    <p className="text-xs text-tertiary/60">{group.location}</p>
                                    <p className="text-xs text-secondary mt-1">{group.items.length} item • Total: Rp {group.items.reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0).toLocaleString('id-ID')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {poGroups && <PODocument supplierGroups={poGroups} dateLabel={poDateLabel} generatedAt={generatedAt} />}
        </div>
    )
}
