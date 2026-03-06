import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Package, AlertTriangle } from 'lucide-react'
import { DEMO_STOCK, DEMO_PERSONNEL, DEMO_BENEFICIARIES, DEMO_SCHOOLS, COOKING_TIMER_SLOTS } from '../lib/constants'
import useWorkflowStore from '../store/workflowStore'

// ─── Vertical Marquee ────────────────────────────────────────────────────────
function VerticalMarquee({ items, renderItem, speed = 30 }) {
    if (!items || items.length === 0) return null
    return (
        <div className="relative flex-1 min-h-0 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-6 z-10 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #ffffff, transparent)' }} />
            <div style={{ animationName: 'marqueeVertical', animationDuration: `${speed}s`, animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}>
                {items.map((item, i) => renderItem(item, i))}
                {items.map((item, i) => renderItem(item, items.length + i))}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-6 z-10 pointer-events-none" style={{ background: 'linear-gradient(to top, #ffffff, transparent)' }} />
        </div>
    )
}

// ─── Live Clock ──────────────────────────────────────────────────────────────
function LiveClock() {
    const [now, setNow] = useState(new Date())
    useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
    return (
        <div className="text-center">
            <p className="font-extrabold leading-none" style={{ fontSize: '2rem', color: '#327169', fontVariantNumeric: 'tabular-nums' }}>
                {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-xs font-semibold mt-1" style={{ color: '#438c81' }}>
                {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
        </div>
    )
}

// ─── Timer Display ───────────────────────────────────────────────────────────
function parseTime(str) { const [h, m] = str.split(':').map(Number); return h * 3600 + m * 60 }
function CookingCountdown() {
    const [timers, setTimers] = useState(
        COOKING_TIMER_SLOTS.map(s => ({ ...s, remaining: parseTime(s.defaultEnd) - parseTime(s.defaultStart) }))
    )
    useEffect(() => {
        const t = setInterval(() => {
            setTimers(p => p.map(tt => ({ ...tt, remaining: Math.max(0, tt.remaining - 1) })))
        }, 1000)
        return () => clearInterval(t)
    }, [])
    return (
        <div className="flex flex-col gap-2 p-3">
            {timers.map(t => {
                const h = Math.floor(t.remaining / 3600)
                const m = Math.floor((t.remaining % 3600) / 60)
                const s = t.remaining % 60
                const pct = t.remaining > 0 ? ((parseTime(t.defaultEnd) - parseTime(t.defaultStart) - t.remaining) / (parseTime(t.defaultEnd) - parseTime(t.defaultStart))) * 100 : 100
                return (
                    <div key={t.key} className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                        <span className="text-xs font-bold w-20" style={{ color: t.color }}>{t.label}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2"><div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: t.color }} /></div>
                        <span className="text-xs font-bold w-16 text-right" style={{ color: t.remaining === 0 ? '#16a34a' : '#4d4d4d', fontVariantNumeric: 'tabular-nums' }}>
                            {t.remaining === 0 ? '✓' : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function KitchenDisplayPage() {
    const navigate = useNavigate()
    const [showExit, setShowExit] = useState(false)
    const { menus } = useWorkflowStore()

    const todayMenus = menus.filter(m => m.stages.production?.status === 'active')
    const todayBeneficiaries = DEMO_BENEFICIARIES.map(b => ({ ...b, school: DEMO_SCHOOLS.find(s => s.id === b.schoolId) }))
    const dutyPersonnel = DEMO_PERSONNEL.filter(p => p.division === 'Kitchen')

    return (
        <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#eef2f2', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            onMouseMove={() => setShowExit(true)} onMouseLeave={() => setShowExit(false)}>

            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-2.5 flex-shrink-0" style={{ backgroundColor: '#327169' }}>
                <div className="flex items-center gap-3">
                    <Package size={18} className="text-white opacity-80" />
                    <p className="text-white font-extrabold text-sm tracking-wide">Sistem Informasi Dapur — Kitchen Display</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full animate-pulse" style={{ backgroundColor: '#438c81', color: '#fff' }}>● LIVE</span>
            </div>

            {/* Main Grid: 1/3 left + 2/3 right */}
            <div className="flex-1 min-h-0 grid gap-3 p-3" style={{ gridTemplateColumns: '1fr 2fr' }}>

                {/* LEFT: Warehouse Stock */}
                <div className="bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden min-h-0" style={{ borderColor: '#a3c7c7' }}>
                    <div className="flex-shrink-0 px-4 py-2 rounded-t-2xl" style={{ backgroundColor: '#327169' }}>
                        <p className="text-white font-bold text-sm">Warehouse Stock</p>
                        <p className="text-white/70 text-[11px]">{DEMO_STOCK.length} item</p>
                    </div>
                    <VerticalMarquee items={DEMO_STOCK} speed={40} renderItem={(item, idx) => (
                        <div key={idx} className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f0f8f8' }}>
                            <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm truncate" style={{ color: '#4d4d4d' }}>{item.name}</p>
                                <p className="text-[10px] text-gray-400 truncate">{item.supplier}</p>
                            </div>
                            <p className="font-bold text-sm flex-shrink-0" style={{ color: '#327169' }}>{item.qty} <span className="text-xs font-normal text-gray-400">{item.unit}</span></p>
                        </div>
                    )} />
                </div>

                {/* RIGHT: 3 rows */}
                <div className="flex flex-col gap-3 min-h-0">
                    {/* Row 1: Today Menu + Clock */}
                    <div className="flex-shrink-0 grid gap-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
                        <div className="bg-white rounded-2xl shadow-sm border p-4 overflow-hidden" style={{ borderColor: '#a3c7c7' }}>
                            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#327169' }}>Menu Hari Ini</p>
                            {todayMenus.length === 0
                                ? <p className="text-sm text-gray-400 italic">Tidak ada menu produksi hari ini</p>
                                : todayMenus.map(m => (
                                    <div key={m.id} className="mb-2 p-2 rounded-lg bg-accent-light/30">
                                        <p className="font-bold text-sm" style={{ color: '#327169' }}>{m.name}</p>
                                        <p className="text-[11px] text-gray-500">{m.description}</p>
                                    </div>
                                ))
                            }
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border flex items-center justify-center" style={{ borderColor: '#a3c7c7' }}>
                            <LiveClock />
                        </div>
                    </div>

                    {/* Row 2: Beneficiary Count */}
                    <div className="flex-shrink-0 bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#a3c7c7' }}>
                        <div className="px-4 py-2" style={{ backgroundColor: '#438c81' }}>
                            <p className="text-white font-bold text-sm">Penerima Manfaat</p>
                        </div>
                        <div className="grid grid-cols-4 gap-0 divide-x" style={{ divideColor: '#f0f8f8' }}>
                            {todayBeneficiaries.slice(0, 4).map(b => (
                                <div key={b.id} className="p-3 text-center">
                                    <p className="font-bold text-xs" style={{ color: '#327169' }}>{b.school?.name}</p>
                                    <p className="text-[10px] text-gray-400">{b.school?.type}</p>
                                    <p className="font-extrabold text-xl mt-1" style={{ color: '#327169' }}>{b.portionCount}</p>
                                    <p className="text-[10px] text-gray-400">porsi</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Row 3: Duty Personnel + Cooking Countdown */}
                    <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">
                        {/* Personnel */}
                        <div className="bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden" style={{ borderColor: '#a3c7c7' }}>
                            <div className="flex-shrink-0 px-4 py-2" style={{ backgroundColor: '#7aacac' }}>
                                <p className="text-white font-bold text-sm">Petugas Hari Ini</p>
                            </div>
                            <div className="flex-1 overflow-hidden p-3">
                                {dutyPersonnel.map(p => (
                                    <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: '#f0f8f8' }}>
                                        <div>
                                            <p className="font-semibold text-sm" style={{ color: '#4d4d4d' }}>{p.name}</p>
                                            <p className="text-[10px] text-gray-400">{p.role}</p>
                                        </div>
                                        <p className="text-xs" style={{ color: '#438c81' }}>{p.phone}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cooking Countdown */}
                        <div className="bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden" style={{ borderColor: '#a3c7c7' }}>
                            <div className="flex-shrink-0 px-4 py-2" style={{ backgroundColor: '#b45309' }}>
                                <p className="text-white font-bold text-sm">Cooking Countdown</p>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <CookingCountdown />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exit */}
            <button onClick={() => navigate('/dashboard')} className="fixed bottom-6 right-6 flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-full shadow-xl transition-all duration-300"
                style={{ backgroundColor: '#327169', color: '#fff', opacity: showExit ? 1 : 0, pointerEvents: showExit ? 'auto' : 'none', transform: showExit ? 'scale(1)' : 'scale(0.85)', zIndex: 50 }}>
                <LogOut size={15} /> Keluar Display
            </button>
        </div>
    )
}
