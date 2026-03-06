import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Package } from 'lucide-react'
import { PRODUCTION_STAGES, DEMO_SCHOOLS, DEMO_BENEFICIARIES } from '../lib/constants'
import useWorkflowStore from '../store/workflowStore'

function VerticalMarquee({ items, renderItem, speed = 30 }) {
    if (!items || items.length === 0) return null
    return (
        <div className="relative flex-1 min-h-0 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-5 z-10 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #fff, transparent)' }} />
            <div style={{ animationName: 'marqueeVertical', animationDuration: `${speed}s`, animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}>
                {items.map((item, i) => renderItem(item, i))}
                {items.map((item, i) => renderItem(item, items.length + i))}
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

export default function PackagingDisplayPage() {
    const navigate = useNavigate()
    const [showExit, setShowExit] = useState(false)
    const { menus } = useWorkflowStore()

    const productionMenus = menus.filter(m => m.stages.production?.status === 'active')
    const beneficiaries = DEMO_BENEFICIARIES.map(b => ({ ...b, school: DEMO_SCHOOLS.find(s => s.id === b.schoolId) }))

    return (
        <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#eef2f2', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            onMouseMove={() => setShowExit(true)} onMouseLeave={() => setShowExit(false)}>

            <div className="flex items-center justify-between px-6 py-2.5 flex-shrink-0" style={{ backgroundColor: '#327169' }}>
                <div className="flex items-center gap-3">
                    <Package size={18} className="text-white opacity-80" />
                    <p className="text-white font-extrabold text-sm tracking-wide">Sistem Informasi Dapur — Packaging Room</p>
                </div>
                <div className="flex items-center gap-4">
                    <LiveClock />
                    <span className="text-xs font-bold px-3 py-1 rounded-full animate-pulse" style={{ backgroundColor: '#438c81', color: '#fff' }}>● LIVE</span>
                </div>
            </div>

            <div className="flex-1 min-h-0 grid gap-3 p-3" style={{ gridTemplateColumns: '1fr 2fr' }}>
                {/* LEFT: School List */}
                <div className="bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden min-h-0" style={{ borderColor: '#a3c7c7' }}>
                    <div className="flex-shrink-0 px-4 py-2 rounded-t-2xl" style={{ backgroundColor: '#327169' }}>
                        <p className="text-white font-bold text-sm">Sekolah & Qty Kirim</p>
                    </div>
                    <VerticalMarquee items={beneficiaries} speed={20} renderItem={(b, idx) => (
                        <div key={idx} className="px-4 py-3" style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f0f8f8', borderBottom: '1px solid #f3f4f6' }}>
                            <p className="font-bold text-sm" style={{ color: '#327169' }}>{b.school?.name}</p>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#c8e0e0', color: '#327169' }}>{b.school?.type}</span>
                                <span className="font-extrabold text-lg" style={{ color: '#327169' }}>{b.portionCount}</span>
                            </div>
                        </div>
                    )} />
                </div>

                {/* RIGHT: Production Progress (5 stages) */}
                <div className="bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden" style={{ borderColor: '#a3c7c7' }}>
                    <div className="flex-shrink-0 px-4 py-2 rounded-t-2xl" style={{ backgroundColor: '#438c81' }}>
                        <p className="text-white font-bold text-sm">Production Progress — 5 Stages</p>
                    </div>
                    <div className="flex-1 p-4 overflow-auto">
                        {productionMenus.length === 0 ? (
                            <p className="text-sm text-gray-400 italic text-center py-8">Tidak ada produksi aktif</p>
                        ) : (
                            productionMenus.map(menu => {
                                const stageIdx = PRODUCTION_STAGES.findIndex(s => s.key === menu.productionStage)
                                return (
                                    <div key={menu.id} className="mb-6 last:mb-0">
                                        <p className="font-bold text-lg mb-3" style={{ color: '#327169' }}>{menu.name}</p>
                                        <div className="flex gap-2">
                                            {PRODUCTION_STAGES.map((stage, idx) => {
                                                const isDone = idx <= stageIdx
                                                return (
                                                    <div key={stage.key} className="flex-1 text-center">
                                                        <div className="h-10 rounded-xl flex items-center justify-center transition-all"
                                                            style={{ backgroundColor: isDone ? stage.color : '#e5e7eb' }}>
                                                            <span className="text-[10px] font-bold" style={{ color: isDone ? '#fff' : '#9ca3af' }}>
                                                                {idx + 1}
                                                            </span>
                                                        </div>
                                                        <p className="text-[9px] font-semibold mt-1.5" style={{ color: isDone ? stage.color : '#9ca3af' }}>
                                                            {stage.label}
                                                        </p>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        {/* Connect bar */}
                                        <div className="flex gap-2 -mt-6 px-4 mb-4">
                                            {PRODUCTION_STAGES.slice(0, -1).map((_, idx) => (
                                                <div key={idx} className="flex-1 h-0.5 mt-5" style={{ backgroundColor: idx < stageIdx ? PRODUCTION_STAGES[idx].color : '#e5e7eb' }} />
                                            ))}
                                        </div>
                                    </div>
                                )
                            })
                        )}
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
