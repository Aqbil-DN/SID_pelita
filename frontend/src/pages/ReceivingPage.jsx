import React, { useState } from 'react'
import { PackageCheck, Calendar, ChevronLeft, ChevronRight, Save, Check } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../store/authStore'
import useWorkflowStore from '../store/workflowStore'
import { QUALITY_LEGEND } from '../lib/constants'
import clsx from 'clsx'

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function getMonthData(year, month) {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
}
function formatDate(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function ReceivingPage() {
    const { user } = useAuthStore()
    const { menus, addReceiving, verifyStage } = useWorkflowStore()
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [selectedDate, setSelectedDate] = useState(null)
    const [checkInData, setCheckInData] = useState({})

    const { firstDay, daysInMonth } = getMonthData(currentYear, currentMonth)
    const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else setCurrentMonth(m => m - 1) }
    const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else setCurrentMonth(m => m + 1) }

    const pendingMenus = menus.filter(m => m.stages.receiving?.status === 'active')
    const menusForDate = selectedDate
        ? pendingMenus.filter(m => (m.vendors || []).some(v => v.arrivalDate === selectedDate))
        : []

    const getDeliveryDates = () => {
        const dates = new Set()
        pendingMenus.forEach(m => (m.vendors || []).forEach(v => dates.add(v.arrivalDate)))
        return dates
    }
    const deliveryDates = getDeliveryDates()

    const handleCheckIn = (menuId, vendor) => {
        const key = `${menuId}-${vendor.item}`
        const data = checkInData[key]
        if (!data?.qtyReceived || !data?.quality) {
            toast.error('Qty diterima dan kualitas wajib diisi!')
            return
        }
        addReceiving(menuId, {
            item: vendor.item,
            qtyOrdered: vendor.qty,
            qtyReceived: parseFloat(data.qtyReceived),
            quality: data.quality,
            receiver: user.name,
            arrivalTime: data.arrivalTime || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        })

        const q = QUALITY_LEGEND.find(q => q.key === data.quality)
        if (q?.alert) toast.warning(`⚠️ RED ALERT: ${vendor.item} — ${q.label}! SCD telah diberitahu.`)
        else toast.success(`${vendor.item} berhasil di-check-in!`)
    }

    const handleComplete = (menuId) => {
        verifyStage(menuId, 'receiving', user.name)
        toast.success('Receiving selesai! Diteruskan ke Production.')
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <PackageCheck size={24} /> Receiving Goods
                </h2>
                <p className="text-sm text-tertiary/60 mt-1">Terima dan cek kualitas barang masuk</p>
            </div>

            {/* Quality legend */}
            <div className="card">
                <p className="text-xs font-bold uppercase tracking-wide text-tertiary/50 mb-3">Legenda Kualitas</p>
                <div className="flex flex-wrap gap-2">
                    {QUALITY_LEGEND.map(q => (
                        <div key={q.key} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: q.bg }}>
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: q.color }} />
                            <div>
                                <p className="text-xs font-bold" style={{ color: q.color }}>{q.label}</p>
                                <p className="text-[10px] text-tertiary/60">{q.desc}</p>
                            </div>
                            {q.alert && <span className="text-[9px] font-bold text-red-500 bg-red-100 px-1.5 py-0.5 rounded-full">RED ALERT</span>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2 card">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={prevMonth} className="btn-secondary p-2"><ChevronLeft size={18} /></button>
                        <h3 className="text-lg font-bold text-primary">{new Date(currentYear, currentMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                        <button onClick={nextMonth} className="btn-secondary p-2"><ChevronRight size={18} /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map(d => <div key={d} className="text-center text-xs font-bold uppercase tracking-wide text-tertiary/50 py-2">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1
                            const dateStr = formatDate(currentYear, currentMonth, day)
                            const hasDelivery = deliveryDates.has(dateStr)
                            const isSelected = selectedDate === dateStr
                            return (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDate(dateStr)}
                                    className={clsx(
                                        'relative p-3 rounded-xl text-sm font-semibold transition-all border',
                                        isSelected ? 'bg-primary text-white border-primary shadow-lg'
                                            : hasDelivery ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                                                : 'bg-white text-tertiary border-gray-100 hover:bg-gray-50'
                                    )}
                                >
                                    {day}
                                    {hasDelivery && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-yellow-400" />}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Check-in panel */}
                <div className="space-y-4">
                    {selectedDate ? (
                        menusForDate.length === 0 ? (
                            <div className="card text-center py-8"><p className="text-sm text-gray-400 italic">Tidak ada delivery pada tanggal ini</p></div>
                        ) : (
                            menusForDate.map(menu => (
                                <div key={menu.id} className="card">
                                    <p className="font-bold text-primary text-sm mb-3">{menu.name}</p>
                                    {(menu.vendors || []).filter(v => v.arrivalDate === selectedDate).map((v, vi) => {
                                        const key = `${menu.id}-${v.item}`
                                        const alreadyReceived = (menu.receiving || []).some(r => r.item === v.item)
                                        return (
                                            <div key={vi} className="mb-3 p-3 rounded-xl border border-gray-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="font-semibold text-sm text-tertiary">{v.item} — {v.vendor}</p>
                                                    {alreadyReceived && <span className="badge-success text-[10px]"><Check size={10} /> Done</span>}
                                                </div>
                                                <p className="text-xs text-tertiary/50 mb-2">Order: {v.qty} {v.unit} • ETA: {v.arrivalTime}</p>
                                                {!alreadyReceived && (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="time"
                                                            className="input-field text-sm"
                                                            placeholder="Actual Arrival"
                                                            onChange={e => setCheckInData({ ...checkInData, [key]: { ...checkInData[key], arrivalTime: e.target.value } })}
                                                        />
                                                        <input
                                                            type="number"
                                                            className="input-field text-sm"
                                                            placeholder={`Qty diterima (order: ${v.qty})`}
                                                            onChange={e => setCheckInData({ ...checkInData, [key]: { ...checkInData[key], qtyReceived: e.target.value } })}
                                                        />
                                                        <select
                                                            className="input-field text-sm"
                                                            onChange={e => setCheckInData({ ...checkInData, [key]: { ...checkInData[key], quality: e.target.value } })}
                                                            defaultValue=""
                                                        >
                                                            <option value="" disabled>Pilih Kualitas</option>
                                                            {QUALITY_LEGEND.map(q => (
                                                                <option key={q.key} value={q.key}>{q.label} — {q.desc}</option>
                                                            ))}
                                                        </select>
                                                        <button onClick={() => handleCheckIn(menu.id, v)} className="btn-primary w-full justify-center text-xs">
                                                            <Save size={14} /> Check-in
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                    <button onClick={() => handleComplete(menu.id)} className="btn-primary w-full justify-center mt-2 text-xs" style={{ background: '#16a34a' }}>
                                        Selesai Receiving
                                    </button>
                                </div>
                            ))
                        )
                    ) : (
                        <div className="card text-center py-12">
                            <Calendar size={40} className="mx-auto text-accent mb-3" />
                            <p className="text-sm text-tertiary/60">Pilih tanggal delivery di kalender</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
