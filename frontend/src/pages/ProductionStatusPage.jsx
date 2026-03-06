import React, { useState } from 'react'
import { Activity } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../store/authStore'
import useWorkflowStore from '../store/workflowStore'
import { PRODUCTION_STAGES } from '../lib/constants'
import clsx from 'clsx'

export default function ProductionStatusPage() {
    const { user } = useAuthStore()
    const { menus, setProductionStage } = useWorkflowStore()

    const productionMenus = menus.filter(m => m.stages.production?.status === 'active')

    const handleStageChange = (menuId, stage) => {
        setProductionStage(menuId, stage)
        const label = PRODUCTION_STAGES.find(s => s.key === stage)?.label || stage
        toast.success(`Status diubah: ${label}`)
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <Activity size={24} /> Status Produksi
                </h2>
                <p className="text-sm text-tertiary/60 mt-1">Update status produksi untuk setiap menu</p>
            </div>

            {productionMenus.length === 0 ? (
                <div className="card text-center py-12">
                    <Activity size={40} className="mx-auto text-accent mb-3" />
                    <p className="text-sm text-gray-400">Tidak ada menu dalam tahap produksi saat ini</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {productionMenus.map(menu => (
                        <div key={menu.id} className="card">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="font-bold text-primary text-lg">{menu.name}</p>
                                    <p className="text-xs text-tertiary/60 mt-0.5">Target: {menu.targetDate} • {menu.calories} kcal</p>
                                </div>
                                <span
                                    className="text-xs font-bold px-3 py-1.5 rounded-full text-white"
                                    style={{ backgroundColor: PRODUCTION_STAGES.find(s => s.key === menu.productionStage)?.color || '#6b7280' }}
                                >
                                    {PRODUCTION_STAGES.find(s => s.key === menu.productionStage)?.label || 'Belum dimulai'}
                                </span>
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
                                                'px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2',
                                                isActive
                                                    ? 'text-white shadow-lg'
                                                    : isDone
                                                        ? 'bg-gray-50 text-gray-500 border-gray-200 opacity-60'
                                                        : 'bg-white text-tertiary border-gray-200 hover:border-primary hover:text-primary'
                                            )}
                                            style={isActive ? { backgroundColor: stage.color, borderColor: stage.color } : {}}
                                        >
                                            {stage.label}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Progress bar */}
                            <div className="mt-4 flex gap-1">
                                {PRODUCTION_STAGES.map((stage, idx) => {
                                    const currentIdx = PRODUCTION_STAGES.findIndex(s => s.key === menu.productionStage)
                                    return (
                                        <div
                                            key={stage.key}
                                            className="flex-1 h-2 rounded-full transition-colors"
                                            style={{ backgroundColor: idx <= currentIdx ? stage.color : '#e5e7eb' }}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
