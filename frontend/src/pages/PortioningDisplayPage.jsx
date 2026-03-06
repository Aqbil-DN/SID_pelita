import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Package } from 'lucide-react'
import { PRODUCTION_STAGES, DEMO_SCHOOLS, DEMO_BENEFICIARIES } from '../lib/constants'
import useWorkflowStore from '../store/workflowStore'

function LiveClock() {
    const [now, setNow] = useState(new Date())
    useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t) }, [])
    return (
        <p className="text-xs font-semibold" style={{ color: '#a3c7c7', fontVariantNumeric: 'tabular-nums' }}>
            {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} — {now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
    )
}

export default function PortioningDisplayPage() {
    const navigate = useNavigate()
    const [showExit, setShowExit] = useState(false)
    const { menus } = useWorkflowStore()

    const productionMenus = menus.filter(m => m.stages.production?.status === 'active')
    const beneficiaries = DEMO_BENEFICIARIES.map(b => ({ ...b, school: DEMO_SCHOOLS.find(s => s.id === b.schoolId) }))

    // Simulate portioning progress
    const [progress, setProgress] = useState(() => {
        const p = {}
        beneficiaries.forEach(b => { p[b.id] = Math.floor(Math.random() * 80) + 10 })
        return p
    })

    return (
        <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: '#eef2f2', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            onMouseMove={() => setShowExit(true)} onMouseLeave={() => setShowExit(false)}>

            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-2.5 flex-shrink-0" style={{ backgroundColor: '#327169' }}>
                <div className="flex items-center gap-3">
                    <Package size={18} className="text-white opacity-80" />
                    <p className="text-white font-extrabold text-sm tracking-wide">Sistem Informasi Dapur — Portioning Room</p>
                </div>
                <div className="flex items-center gap-4">
                    <LiveClock />
                    <span className="text-xs font-bold px-3 py-1 rounded-full animate-pulse" style={{ backgroundColor: '#438c81', color: '#fff' }}>● LIVE</span>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col gap-3 p-3">
                {/* TOP: Production Progress (4 stages) */}
                <div className="flex-shrink-0 bg-white rounded-2xl shadow-sm border p-4" style={{ borderColor: '#a3c7c7' }}>
                    <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#327169' }}>Production Progress</p>
                    {productionMenus.length === 0 ? (
                        <p className="text-sm text-gray-400 italic text-center py-2">Tidak ada produksi aktif</p>
                    ) : (
                        productionMenus.map(menu => {
                            const stageIdx = PRODUCTION_STAGES.findIndex(s => s.key === menu.productionStage)
                            return (
                                <div key={menu.id} className="mb-3 last:mb-0">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <p className="font-bold text-sm" style={{ color: '#327169' }}>{menu.name}</p>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: PRODUCTION_STAGES[stageIdx]?.color || '#6b7280' }}>
                                            {PRODUCTION_STAGES[stageIdx]?.label || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        {PRODUCTION_STAGES.slice(0, 4).map((stage, idx) => (
                                            <div key={stage.key} className="flex-1">
                                                <div className="h-3 rounded-full" style={{ backgroundColor: idx <= stageIdx ? stage.color : '#e5e7eb' }} />
                                                <p className="text-[8px] font-semibold mt-0.5 text-center" style={{ color: idx <= stageIdx ? stage.color : '#9ca3af' }}>
                                                    {stage.label.replace('Process', '').trim()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* BOTTOM: School & PM List with Progress Bars */}
                <div className="flex-1 min-h-0 bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden" style={{ borderColor: '#a3c7c7' }}>
                    <div className="flex-shrink-0 px-4 py-2" style={{ backgroundColor: '#438c81' }}>
                        <p className="text-white font-bold text-sm">Portioning per Sekolah</p>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        <div className="absolute inset-x-0 top-0 h-5 z-10 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #fff, transparent)' }} />
                        <div style={{ animationName: 'marqueeVertical', animationDuration: '25s', animationTimingFunction: 'linear', animationIterationCount: 'infinite' }}>
                            {[...beneficiaries, ...beneficiaries].map((b, i) => {
                                const pct = progress[b.id] || 0
                                return (
                                    <div key={i} className="flex items-center gap-4 px-4 py-3" style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <div className="w-48 flex-shrink-0">
                                            <p className="font-bold text-sm" style={{ color: '#327169' }}>{b.school?.name}</p>
                                            <p className="text-[10px] text-gray-400">{b.school?.type} • {b.portionCount} porsi</p>
                                        </div>
                                        <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                                            <div className="h-4 rounded-full transition-all flex items-center justify-end pr-2"
                                                style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#16a34a' : '#327169' }}>
                                                <span className="text-[9px] font-bold text-white">{pct}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-5 z-10 pointer-events-none" style={{ background: 'linear-gradient(to top, #fff, transparent)' }} />
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
