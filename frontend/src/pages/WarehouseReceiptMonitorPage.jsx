import React, { useState, useMemo } from 'react'
import { PackageSearch, ChevronLeft, ChevronRight, X, Truck } from 'lucide-react'
import useWorkflowStore from '../store/workflowStore'
import { QUALITY_LEGEND } from '../lib/constants'

function getMonthData(year, month) {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
}

function fmtDate(d) {
    return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function QualityBadge({ quality }) {
    const q = QUALITY_LEGEND.find(l => l.key === quality) || QUALITY_LEGEND[0]
    return (
        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: q.bg, color: q.color }}>{q.label}</span>
    )
}

function DayDetailModal({ dateStr, records, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
            <div className="relative flex flex-col h-full bg-white shadow-2xl" style={{ width: 'min(700px, 100vw)' }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex-shrink-0 px-6 py-5 border-b" style={{ borderColor: '#e5e7eb', background: 'linear-gradient(135deg, rgba(50,113,105,0.06) 0%, rgba(163,199,199,0.10) 100%)' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#438c81' }}>Receipt Monitor</p>
                            <h2 className="text-lg font-extrabold" style={{ color: '#327169' }}>{fmtDate(dateStr)}</h2>
                            <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>{records.length} material diterima</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-400"><X size={20} /></button>
                    </div>
                </div>
                {/* Table */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {records.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-12 italic">Tidak ada penerimaan barang pada tanggal ini</p>
                    ) : (
                        <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                        <th className="table-header">Material</th>
                                        <th className="table-header">Status</th>
                                        <th className="table-header">Qty Order</th>
                                        <th className="table-header">Qty Diterima</th>
                                        <th className="table-header">Kualitas</th>
                                        <th className="table-header">Vendor</th>
                                        <th className="table-header">Receiver</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((r, i) => (
                                        <tr key={i} style={{ borderBottom: i < records.length - 1 ? '1px solid #f3f4f6' : 'none', backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                            <td className="table-cell font-semibold" style={{ color: '#327169' }}>{r.item}</td>
                                            <td className="table-cell">
                                                <span className={r.vendorStatus === 'arrived' ? 'badge-success' : 'badge-info'}>
                                                    <Truck size={10} /> {r.vendorStatus === 'arrived' ? 'Arrived' : 'In Transit'}
                                                </span>
                                            </td>
                                            <td className="table-cell font-bold" style={{ color: '#327169' }}>{r.qtyOrder} {r.unit}</td>
                                            <td className="table-cell font-bold">{r.qtyReceived != null ? `${r.qtyReceived} ${r.unit}` : '—'}</td>
                                            <td className="table-cell"><QualityBadge quality={r.quality || 'prima'} /></td>
                                            <td className="table-cell text-xs" style={{ color: 'rgba(77,77,77,0.5)' }}>{r.vendor}</td>
                                            <td className="table-cell text-xs" style={{ color: 'rgba(77,77,77,0.5)' }}>{r.receiver || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function WarehouseReceiptMonitorPage() {
    const { menus } = useWorkflowStore()
    const today = new Date()
    const [year, setYear] = useState(today.getFullYear())
    const [month, setMonth] = useState(today.getMonth())
    const [selectedDate, setSelectedDate] = useState(null)

    // Build flat records with date keys
    const recordsByDate = useMemo(() => {
        const map = {}
        menus.forEach(m => {
            const vendors = m.vendors || []
            const receipts = m.receiving || []
            vendors.forEach(v => {
                const dateKey = v.arrivalDate || m.targetDate
                if (!dateKey) return
                const receipt = receipts.find(r => r.item === v.item)
                if (!map[dateKey]) map[dateKey] = []
                map[dateKey].push({
                    item: v.item,
                    vendor: v.vendor,
                    vendorStatus: v.status,
                    qtyOrder: v.qty,
                    unit: v.unit,
                    qtyReceived: receipt?.qtyReceived ?? null,
                    quality: receipt?.quality || null,
                    receiver: receipt?.receiver || null,
                })
            })
        })
        return map
    }, [menus])

    const { firstDay, daysInMonth } = getMonthData(year, month)
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)

    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

    const dateKey = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <PackageSearch size={24} /> Warehouse Receipt Monitor
                </h2>
                <p className="text-sm text-tertiary/60 mt-1">Kalender penerimaan barang — klik tanggal untuk melihat detail</p>
            </div>

            {/* Calendar nav */}
            <div className="card">
                <div className="flex items-center justify-between mb-5">
                    <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><ChevronLeft size={20} style={{ color: '#327169' }} /></button>
                    <h3 className="text-lg font-extrabold" style={{ color: '#327169' }}>{MONTH_NAMES[month]} {year}</h3>
                    <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><ChevronRight size={20} style={{ color: '#327169' }} /></button>
                </div>

                {/* Day labels */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                    {DAY_NAMES.map(d => (
                        <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wide py-1" style={{ color: 'rgba(77,77,77,0.4)' }}>{d}</div>
                    ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-1">
                    {cells.map((day, idx) => {
                        if (day === null) return <div key={`empty-${idx}`} />
                        const dk = dateKey(day)
                        const count = (recordsByDate[dk] || []).length
                        const isToday = dk === todayStr
                        return (
                            <button
                                key={day}
                                onClick={() => count > 0 ? setSelectedDate(dk) : null}
                                className="relative flex flex-col items-center p-2 rounded-xl transition-all text-sm"
                                style={{
                                    cursor: count > 0 ? 'pointer' : 'default',
                                    backgroundColor: isToday ? 'rgba(50,113,105,0.08)' : count > 0 ? '#f9fafb' : 'transparent',
                                    border: isToday ? '2px solid #327169' : '2px solid transparent',
                                    minHeight: '56px',
                                }}
                            >
                                <span className="font-bold" style={{ color: isToday ? '#327169' : count > 0 ? '#4d4d4d' : '#d1d5db' }}>{day}</span>
                                {count > 0 && (
                                    <span className="mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#327169', color: '#fff' }}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Legend */}
                <div className="mt-5 pt-4 border-t flex flex-wrap gap-3" style={{ borderColor: '#f3f4f6' }}>
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'rgba(77,77,77,0.35)' }}>Kualitas:</span>
                    {QUALITY_LEGEND.map(q => (
                        <span key={q.key} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: q.bg, color: q.color }}>
                            {q.label}
                        </span>
                    ))}
                </div>
            </div>

            {selectedDate && (
                <DayDetailModal dateStr={selectedDate} records={recordsByDate[selectedDate] || []} onClose={() => setSelectedDate(null)} />
            )}
        </div>
    )
}
