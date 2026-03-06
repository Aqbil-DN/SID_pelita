import React from 'react'
import { CheckCircle2, Clock, AlertCircle, ChevronRight } from 'lucide-react'
import { DEMO_MENUS, WORKFLOW_STAGES } from '../lib/constants'
import clsx from 'clsx'

const STAGE_STATUS_CONFIG = {
    done: { color: 'bg-primary', textColor: 'text-primary', bgColor: 'bg-accent-light', label: 'Selesai', icon: CheckCircle2 },
    active: { color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50', label: 'Berlangsung', icon: Clock },
    pending: { color: 'bg-gray-200', textColor: 'text-gray-400', bgColor: 'bg-gray-50', label: 'Menunggu', icon: null },
}

function WorkflowCard({ menu }) {
    return (
        <div className="card">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
                <div>
                    <h3 className="font-bold text-gray-900 text-base">{menu.name}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Target: {new Date(menu.targetDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{menu.calories} kkal · Dibuat oleh {menu.createdBy}</p>
                    {menu.estimatedCost > 0 && (
                        <p className="text-xs text-blue-600 font-semibold mt-1">
                            Estimasi Biaya: Rp {menu.estimatedCost.toLocaleString('id-ID')}
                        </p>
                    )}
                </div>
                <span className={clsx(
                    'text-xs font-semibold px-3 py-1.5 rounded-full',
                    menu.currentStage >= 7 ? 'bg-accent-light text-primary' : 'bg-blue-100 text-blue-700'
                )}>
                    Tahap {menu.currentStage}/7
                </span>
            </div>

            {/* Stages timeline */}
            <div className="mt-5 space-y-0">
                {WORKFLOW_STAGES.map((stage, idx) => {
                    const stageData = menu.stages[stage.key]
                    const cfg = STAGE_STATUS_CONFIG[stageData?.status] || STAGE_STATUS_CONFIG.pending
                    const Icon = cfg.icon

                    return (
                        <div key={stage.key} className="flex gap-3">
                            {/* Timeline line and dot */}
                            <div className="flex flex-col items-center">
                                <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2', {
                                    'border-primary bg-primary': stageData?.status === 'done',
                                    'border-blue-400 bg-blue-500 ring-4 ring-blue-100': stageData?.status === 'active',
                                    'border-gray-200 bg-gray-100': stageData?.status === 'pending',
                                })}>
                                    {stageData?.status === 'done' ? (
                                        <CheckCircle2 size={14} className="text-white" />
                                    ) : stageData?.status === 'active' ? (
                                        <Clock size={14} className="text-white animate-pulse" />
                                    ) : (
                                        <span className="text-gray-400 text-xs font-bold">{idx + 1}</span>
                                    )}
                                </div>
                                {idx < WORKFLOW_STAGES.length - 1 && (
                                    <div className={clsx('w-0.5 flex-1 min-h-[1.25rem]', stageData?.status === 'done' ? 'bg-secondary' : 'bg-gray-200')} />
                                )}
                            </div>

                            {/* Stage content */}
                            <div className={clsx('flex-1 pb-4 rounded-xl px-3 py-2 mb-1', stageData?.status === 'active' ? 'bg-blue-50/60' : '')}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={clsx('text-sm font-semibold', {
                                            'text-primary': stageData?.status === 'done',
                                            'text-blue-700': stageData?.status === 'active',
                                            'text-gray-400': stageData?.status === 'pending',
                                        })}>
                                            {stage.label}
                                        </p>
                                        {stage.role && (
                                            <p className="text-xs text-gray-400 font-medium">{stage.role}</p>
                                        )}
                                    </div>
                                    <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full', cfg.bgColor, cfg.textColor)}>
                                        {cfg.label}
                                    </span>
                                </div>
                                {stageData?.completedAt && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        ✓ {new Date(stageData.completedAt).toLocaleString('id-ID')} · oleh {stageData.processedBy}
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default function WorkflowTrackerPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Workflow Tracker</h2>
                    <p className="text-sm text-gray-400">Pantau progres setiap menu melalui 7 tahap alur kerja</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <div className="w-2.5 h-2.5 rounded-full bg-secondary" /> Selesai
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Berlangsung
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300" /> Menunggu
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {DEMO_MENUS.map((menu) => (
                    <WorkflowCard key={menu.id} menu={menu} />
                ))}
            </div>
        </div>
    )
}
