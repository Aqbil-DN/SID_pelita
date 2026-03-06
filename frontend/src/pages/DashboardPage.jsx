import React from 'react'
import { LayoutDashboard, TrendingUp, Clock, Users, ChefHat, Truck, UtensilsCrossed } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useWorkflowStore from '../store/workflowStore'
import { WORKFLOW_STAGES, DEMO_SCHOOLS, DEMO_BENEFICIARIES, DEMO_STOCK, PRODUCTION_STAGES } from '../lib/constants'

const stageIcons = {
    planning: UtensilsCrossed,
    ingredient_mapping: ChefHat,
    production: LayoutDashboard,
    distributed: Truck,
}

export default function DashboardPage() {
    const { user } = useAuthStore()
    const { menus } = useWorkflowStore()

    const activeMenus = menus.filter(m => m.status === 'in_progress')
    const totalPortions = DEMO_BENEFICIARIES.reduce((s, b) => s + b.portionCount, 0)
    const totalStock = DEMO_STOCK.reduce((s, i) => s + i.qty, 0)

    const stats = [
        { label: 'Menu Aktif', value: activeMenus.length, icon: UtensilsCrossed, color: '#327169' },
        { label: 'Total Porsi', value: totalPortions.toLocaleString('id-ID'), icon: Users, color: '#438c81' },
        { label: 'Sekolah', value: DEMO_SCHOOLS.length, icon: TrendingUp, color: '#b45309' },
        { label: 'Item Warehouse', value: `${DEMO_STOCK.length} (${totalStock})`, icon: Truck, color: '#6b21a8' },
    ]

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <LayoutDashboard size={24} /> Dashboard
                </h2>
                <p className="text-sm text-tertiary/60 mt-1">Selamat datang, <span className="font-bold text-primary">{user?.name}</span> — {user?.role}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s, i) => {
                    const Icon = s.icon
                    return (
                        <div key={i} className="card flex items-center gap-4 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.color + '20' }}>
                                <Icon size={22} style={{ color: s.color }} />
                            </div>
                            <div>
                                <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                                <p className="text-xs text-tertiary/50 font-semibold">{s.label}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Workflow pipeline */}
            <div className="card">
                <h3 className="font-bold text-primary text-sm mb-4">Workflow Pipeline</h3>
                <div className="flex gap-1">
                    {WORKFLOW_STAGES.map((stage, idx) => {
                        const count = menus.filter(m => {
                            const stageKeys = Object.keys(m.stages)
                            const stageKey = stageKeys[idx]
                            return m.stages[stageKey]?.status === 'active'
                        }).length
                        return (
                            <div key={stage.id} className="flex-1 text-center">
                                <div
                                    className="h-10 rounded-lg flex items-center justify-center mb-1.5"
                                    style={{ backgroundColor: count > 0 ? '#327169' : '#e5e7eb' }}
                                >
                                    <span className="text-xs font-bold" style={{ color: count > 0 ? '#fff' : '#9ca3af' }}>{count}</span>
                                </div>
                                <p className="text-[9px] font-semibold" style={{ color: count > 0 ? '#327169' : '#9ca3af' }}>{stage.label}</p>
                                {stage.role && <p className="text-[8px] text-tertiary/40">{stage.role}</p>}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Active menus */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeMenus.map(menu => {
                    const prod = PRODUCTION_STAGES.find(s => s.key === menu.productionStage)
                    return (
                        <div key={menu.id} className="card hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-bold text-primary">{menu.name}</p>
                                    <p className="text-xs text-tertiary/50">{menu.targetDate}</p>
                                </div>
                                <span className="badge-primary text-[10px]">Stage {menu.currentStage}</span>
                            </div>
                            {menu.description && <p className="text-xs text-tertiary/60 mb-3">{menu.description}</p>}
                            <div className="flex gap-0.5 mb-2">
                                {WORKFLOW_STAGES.map((_, i) => (
                                    <div key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: i < menu.currentStage ? '#327169' : '#e5e7eb' }} />
                                ))}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-[10px] text-tertiary/50">{menu.ingredients.length} bahan</span>
                                {prod && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: prod.color }}>{prod.label}</span>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
