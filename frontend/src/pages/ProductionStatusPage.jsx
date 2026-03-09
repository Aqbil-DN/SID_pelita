import React, { useState, useMemo } from 'react'
import { Activity, ChevronDown, ChevronUp, School } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../store/authStore'
import useWorkflowStore from '../store/workflowStore'
import { PRODUCTION_STAGES, DEMO_BENEFICIARIES, DEMO_SCHOOLS } from '../lib/constants'
import clsx from 'clsx'

export default function ProductionStatusPage() {
    const { user } = useAuthStore()
    const { menus, setProductionStage } = useWorkflowStore()
    const [expandedPM, setExpandedPM] = useState(null)

    // Menus in production stage
    const productionMenus = menus.filter(m => m.stages.production?.status === 'active')

    // Group by beneficiary
    const pmGroups = useMemo(() => {
        const map = {}
        productionMenus.forEach(menu => {
            const bid = menu.beneficiaryId || 'unassigned'
            if (!map[bid]) map[bid] = []
            map[bid].push(menu)
        })

        return Object.entries(map).map(([bid, menuList]) => {
            const benef = DEMO_BENEFICIARIES.find(b => b.id === parseInt(bid))
            const school = benef ? DEMO_SCHOOLS.find(s => s.id === benef.schoolId) : null

            // Aggregate progress: average of all menus' highest completed stage
            const avgProgress = menuList.reduce((sum, m) => {
                const idx = PRODUCTION_STAGES.findIndex(s => s.key === m.productionStage)
                return sum + (idx >= 0 ? idx : 0)
            }, 0) / menuList.length

            const highestStage = PRODUCTION_STAGES[Math.round(avgProgress)]

            return {
                bid: parseInt(bid) || bid,
                school,
                benef,
                menus: menuList,
                avgProgress,
                overallStage: highestStage,
                portionCount: benef?.portionCount || 0,
            }
        })
    }, [productionMenus])

    const handleStageChange = (menuId, stage) => {
        setProductionStage(menuId, stage)
        const label = PRODUCTION_STAGES.find(s => s.key === stage)?.label || stage
        toast.success(`Status diubah: ${label}`)
    }

    const togglePM = (bid) => setExpandedPM(prev => prev === bid ? null : bid)

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <Activity size={24} /> Status Produksi
                </h2>
                <p className="text-sm text-tertiary/60 mt-1">Status produksi dikelompokkan berdasarkan Penerima Manfaat (PM)</p>
            </div>

            {pmGroups.length === 0 ? (
                <div className="card text-center py-12">
                    <Activity size={40} className="mx-auto text-accent mb-3" />
                    <p className="text-sm text-gray-400">Tidak ada menu dalam tahap produksi saat ini</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {pmGroups.map(pm => (
                        <div key={pm.bid} className="card overflow-hidden">
                            {/* PM Header — clickable */}
                            <button onClick={() => togglePM(pm.bid)} className="w-full flex items-center justify-between p-0 text-left">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(50,113,105,0.1)' }}>
                                        <School size={22} style={{ color: '#327169' }} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-primary text-lg truncate">{pm.school?.name || 'PM Belum Terdata'}</p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-xs text-tertiary/60">{pm.school?.type || '—'}</span>
                                            {pm.portionCount > 0 && <span className="badge-primary text-[10px]">{pm.portionCount} porsi</span>}
                                            <span className="text-xs text-tertiary/40">{pm.menus.length} menu</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {pm.overallStage && (
                                        <span
                                            className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                                            style={{ backgroundColor: pm.overallStage.color }}
                                        >{pm.overallStage.label}</span>
                                    )}
                                    {expandedPM === pm.bid ? <ChevronUp size={20} className="text-tertiary/40" /> : <ChevronDown size={20} className="text-tertiary/40" />}
                                </div>
                            </button>

                            {/* Aggregate progress bar */}
                            <div className="flex gap-1 mt-4">
                                {PRODUCTION_STAGES.map((stage, idx) => (
                                    <div
                                        key={stage.key}
                                        className="flex-1 h-2 rounded-full transition-colors"
                                        style={{ backgroundColor: idx <= Math.round(pm.avgProgress) ? stage.color : '#e5e7eb' }}
                                    />
                                ))}
                            </div>

                            {/* Expanded: individual menus */}
                            {expandedPM === pm.bid && (
                                <div className="mt-5 pt-4 border-t space-y-4" style={{ borderColor: '#f3f4f6' }}>
                                    {pm.menus.map(menu => (
                                        <div key={menu.id} className="p-4 rounded-2xl" style={{ backgroundColor: '#fafbfc', border: '1px solid #e5e7eb' }}>
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="font-bold text-primary">{menu.name}</p>
                                                    <p className="text-xs text-tertiary/60 mt-0.5">Target: {menu.targetDate} • {menu.calories} kcal</p>
                                                </div>
                                                <span
                                                    className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white flex-shrink-0"
                                                    style={{ backgroundColor: PRODUCTION_STAGES.find(s => s.key === menu.productionStage)?.color || '#6b7280' }}
                                                >{PRODUCTION_STAGES.find(s => s.key === menu.productionStage)?.label || 'Belum dimulai'}</span>
                                            </div>

                                            {/* Stage selector */}
                                            <div className="flex flex-wrap gap-2">
                                                {PRODUCTION_STAGES.map((stage, idx) => {
                                                    const currentIdx = PRODUCTION_STAGES.findIndex(s => s.key === menu.productionStage)
                                                    const isActive = stage.key === menu.productionStage
                                                    const isDone = idx < currentIdx
                                                    return (
                                                        <button
                                                            key={stage.key}
                                                            onClick={() => handleStageChange(menu.id, stage.key)}
                                                            className={clsx(
                                                                'px-3 py-2 rounded-xl text-xs font-bold transition-all border-2',
                                                                isActive
                                                                    ? 'text-white shadow-lg'
                                                                    : isDone
                                                                        ? 'bg-gray-50 text-gray-500 border-gray-200 opacity-60'
                                                                        : 'bg-white text-tertiary border-gray-200 hover:border-primary hover:text-primary'
                                                            )}
                                                            style={isActive ? { backgroundColor: stage.color, borderColor: stage.color } : {}}
                                                        >{stage.label}</button>
                                                    )
                                                })}
                                            </div>

                                            {/* Per-menu progress */}
                                            <div className="mt-3 flex gap-1">
                                                {PRODUCTION_STAGES.map((stage, idx) => {
                                                    const currentIdx = PRODUCTION_STAGES.findIndex(s => s.key === menu.productionStage)
                                                    return (
                                                        <div key={stage.key} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: idx <= currentIdx ? stage.color : '#e5e7eb' }} />
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
