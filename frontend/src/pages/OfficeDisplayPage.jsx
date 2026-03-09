import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Package } from 'lucide-react'
import { DEMO_STOCK, DEMO_PERSONNEL, DELIVERY_STATUSES } from '../lib/constants'
import useBroadcastStore from '../store/broadcastStore'
import useDeliveryStore from '../store/deliveryStore'

function VerticalMarquee({ items, renderItem, speed = 30 }) {
    if (!items || items.length === 0) return null
    return (
        <div className="relative flex-1 min-h-0 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-5 z-10 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #fff, transparent)' }} />
            <div style={{ animationName: 'marqueeVertical', animationDuration: `${speed}s`, animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}>
                {items.map((it, i) => renderItem(it, i))}
                {items.map((it, i) => renderItem(it, items.length + i))}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-5 z-10 pointer-events-none" style={{ background: 'linear-gradient(to top, #fff, transparent)' }} />
        </div>
    )
}

function LiveClock() {
    const [now, setNow] = useState(new Date())
    useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
    return (
        <p className="text-xs font-semibold" style={{ color: '#a3c7c7', fontVariantNumeric: 'tabular-nums' }}>
            {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} — {now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
    )
}

export default function OfficeDisplayPage() {
    const navigate = useNavigate()
    const [showExit, setShowExit] = useState(false)
    const { getActiveMessages } = useBroadcastStore()
    const { deliveries } = useDeliveryStore()

    const broadcasts = getActiveMessages()

    // Group personnel by division
    const divisionCounts = {}
    DEMO_PERSONNEL.forEach(p => { divisionCounts[p.division] = (divisionCounts[p.division] || 0) + 1 })

    return (
        <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#eef2f2', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            onMouseMove={() => setShowExit(true)} onMouseLeave={() => setShowExit(false)}>

            <div className="flex items-center justify-between px-6 py-2.5 flex-shrink-0" style={{ backgroundColor: '#327169' }}>
                <div className="flex items-center gap-3">
                    <Package size={18} className="text-white opacity-80" />
                    <p className="text-white font-extrabold text-sm tracking-wide">Sistem Informasi Dapur — Office Dashboard</p>
                </div>
                <div className="flex items-center gap-4">
                    <LiveClock />
                    <span className="text-xs font-bold px-3 py-1 rounded-full animate-pulse" style={{ backgroundColor: '#438c81', color: '#fff' }}>● LIVE</span>
                </div>
            </div>

            <div className="flex-1 min-h-0 grid gap-3 p-3" style={{ gridTemplateColumns: '1fr 2fr' }}>
                {/* LEFT: Warehouse Live Stock */}
                <div className="bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden min-h-0" style={{ borderColor: '#a3c7c7' }}>
                    <div className="flex-shrink-0 px-4 py-2 rounded-t-2xl" style={{ backgroundColor: '#327169' }}>
                        <p className="text-white font-bold text-sm">Warehouse Live Stock</p>
                    </div>
                    <VerticalMarquee items={DEMO_STOCK} speed={40} renderItem={(item, idx) => (
                        <div key={idx} className="flex items-center justify-between px-3 py-2.5" style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f0f8f8' }}>
                            <div className="min-w-0 flex-1"><p className="font-semibold text-sm truncate" style={{ color: '#4d4d4d' }}>{item.name}</p><p className="text-[10px] text-gray-400 truncate">{item.supplier}</p></div>
                            <p className="font-bold text-sm flex-shrink-0" style={{ color: '#327169' }}>{item.qty} <span className="text-[10px] text-gray-400">{item.unit}</span></p>
                        </div>
                    )} />
                </div>

                {/* RIGHT */}
                <div className="flex flex-col gap-3 min-h-0">
                    {/* Row 1: Broadcast + Personnel */}
                    <div className="flex-shrink-0 grid grid-cols-2 gap-3" style={{ maxHeight: '40%' }}>
                        {/* Broadcast */}
                        <div className="bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden" style={{ borderColor: '#a3c7c7' }}>
                            <div className="flex-shrink-0 px-4 py-2" style={{ backgroundColor: '#438c81' }}>
                                <p className="text-white font-bold text-sm">Broadcast Info</p>
                            </div>
                            <div className="flex-1 overflow-auto p-3 space-y-2">
                                {broadcasts.length === 0
                                    ? <p className="text-sm text-gray-400 italic text-center py-4">Tidak ada broadcast aktif</p>
                                    : broadcasts.map(b => (
                                        <div key={b.id} className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(163,199,199,0.15)' }}>
                                            <p className="font-bold text-xs" style={{ color: '#327169' }}>{b.title || 'Info'}</p>
                                            <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{b.message}</p>
                                            <p className="text-[9px] text-gray-400 mt-1">{b.createdBy} • {new Date(b.createdAt).toLocaleString('id-ID')}</p>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        {/* Personnel On-Duty */}
                        <div className="bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden" style={{ borderColor: '#a3c7c7' }}>
                            <div className="flex-shrink-0 px-4 py-2" style={{ backgroundColor: '#7aacac' }}>
                                <p className="text-white font-bold text-sm">Petugas On-Duty</p>
                            </div>
                            <div className="flex-1 overflow-auto p-3">
                                {/* Division summary */}
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {Object.entries(divisionCounts).map(([div, count]) => (
                                        <span key={div} className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#c8e0e0', color: '#327169' }}>
                                            {div}: {count}
                                        </span>
                                    ))}
                                </div>
                                {DEMO_PERSONNEL.map(p => (
                                    <div key={p.id} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: '#f3f4f6' }}>
                                        <div><p className="font-semibold text-xs" style={{ color: '#4d4d4d' }}>{p.name}</p><p className="text-[9px] text-gray-400">{p.role} • {p.division}</p></div>
                                        <p className="text-[10px]" style={{ color: '#438c81' }}>{p.phone}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Delivery Status */}
                    <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden" style={{ borderColor: '#a3c7c7' }}>
                        <div className="flex-shrink-0 px-4 py-2" style={{ backgroundColor: '#b45309' }}>
                            <p className="text-white font-bold text-sm">Delivery Status per Sekolah</p>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            {deliveries.map(d => {
                                const statusIdx = DELIVERY_STATUSES.findIndex(s => s.key === d.status)
                                const currentStatus = DELIVERY_STATUSES[statusIdx] || DELIVERY_STATUSES[0]
                                return (
                                <div key={d.id} className="mb-4 last:mb-0">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <p className="font-bold text-sm" style={{ color: '#327169' }}>{d.school?.name}</p>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: currentStatus.bg, color: currentStatus.color }}>
                                            {currentStatus.label}
                                        </span>
                                    </div>
                                    {/* 4-step delivery status */}
                                    <div className="flex gap-1">
                                        {DELIVERY_STATUSES.map((s, idx) => (
                                            <div key={s.key} className="flex-1">
                                                <div className="h-3 rounded-full" style={{ backgroundColor: idx <= statusIdx ? s.color : '#e5e7eb' }} />
                                                <p className="text-[8px] font-semibold mt-0.5 text-center" style={{ color: idx <= statusIdx ? s.color : '#9ca3af' }}>{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={() => navigate('/dashboard')} className="fixed bottom-6 right-6 flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-full shadow-xl transition-all duration-300"
                style={{ backgroundColor: '#327169', color: '#fff', opacity: showExit ? 1 : 0, pointerEvents: showExit ? 'auto' : 'none', transform: showExit ? 'scale(1)' : 'scale(0.85)', zIndex: 50 }}>
                <LogOut size={15} /> Keluar Display
            </button>
        </div>
    )
}
