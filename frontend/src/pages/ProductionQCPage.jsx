import React, { useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
import useWorkflowStore from '../store/workflowStore'
import { PRODUCTION_STAGES, DEMO_SCHOOLS, DEMO_BENEFICIARIES } from '../lib/constants'
import clsx from 'clsx'

export default function ProductionQCPage() {
    const { menus } = useWorkflowStore()
    const productionMenus = menus.filter(m => m.stages.production?.status === 'active' || m.stages.production?.status === 'done')

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <ClipboardCheck size={24} /> Production & QC Overview
                </h2>
                <p className="text-sm text-tertiary/60 mt-1">Pantau status produksi semua menu</p>
            </div>

            {productionMenus.length === 0 ? (
                <div className="card text-center py-12">
                    <ClipboardCheck size={40} className="mx-auto text-accent mb-3" />
                    <p className="text-sm text-gray-400">Belum ada menu dalam tahap produksi</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {productionMenus.map(menu => {
                        const stage = PRODUCTION_STAGES.find(s => s.key === menu.productionStage)
                        const stageIdx = PRODUCTION_STAGES.findIndex(s => s.key === menu.productionStage)
                        const beneficiaries = DEMO_BENEFICIARIES
                            .filter(b => b.deliveryDate === menu.targetDate)
                            .map(b => ({ ...b, school: DEMO_SCHOOLS.find(s => s.id === b.schoolId) }))

                        return (
                            <div key={menu.id} className="card">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="font-bold text-primary text-lg">{menu.name}</p>
                                        <p className="text-xs text-tertiary/60">{menu.targetDate} • {menu.calories} kcal</p>
                                    </div>
                                    <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: stage?.color || '#6b7280' }}>
                                        {stage?.label || 'Belum dimulai'}
                                    </span>
                                </div>

                                {/* Progress */}
                                <div className="flex gap-1 mb-4">
                                    {PRODUCTION_STAGES.map((s, idx) => (
                                        <div key={s.key} className="flex-1">
                                            <div className="h-2 rounded-full" style={{ backgroundColor: idx <= stageIdx ? s.color : '#e5e7eb' }} />
                                            <p className="text-[9px] font-semibold mt-1 text-center" style={{ color: idx <= stageIdx ? s.color : '#9ca3af' }}>{s.label.split(' ').slice(0, 2).join(' ')}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Ingredients */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-tertiary/50 mb-2">Bahan</p>
                                        {menu.ingredients.map((ig, i) =>
                                            <p key={i} className="text-xs text-tertiary py-0.5">{ig.name} — {ig.quantity} {ig.unit}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-tertiary/50 mb-2">Sekolah Tujuan</p>
                                        {beneficiaries.length === 0
                                            ? <p className="text-xs text-gray-400 italic">—</p>
                                            : beneficiaries.map(b =>
                                                <p key={b.id} className="text-xs text-tertiary py-0.5">{b.school?.name} — {b.portionCount} porsi</p>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
