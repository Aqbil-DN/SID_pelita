import React from 'react'
import { LayoutDashboard, TrendingUp, Clock, Users, ChefHat, Truck, UtensilsCrossed, Calendar, MapPin } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useWorkflowStore from '../store/workflowStore'
import { WORKFLOW_STAGES, DEMO_SCHOOLS, DEMO_BENEFICIARIES, DEMO_STOCK, DEMO_PROCESS_PM } from '../lib/constants'

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

            {/* Process per Beneficiary (PM) Table */}
            <div className="card p-0 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2" style={{ backgroundColor: 'rgba(50,113,105,0.05)' }}>
                    <MapPin size={16} className="text-primary" />
                    <h3 className="font-bold text-primary text-sm">Process per Beneficiary (PM)</h3>
                    <span className="ml-auto badge-primary text-[10px]">{DEMO_PROCESS_PM.length} PM</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="table-header">Nama PM</th>
                                <th className="table-header flex items-center gap-1"><Calendar size={12} />Tanggal</th>
                                <th className="table-header text-center">
                                    <Clock size={12} className="inline mr-1" />Est. Kedatangan
                                </th>
                                <th className="table-header">Deskripsi</th>
                                <th className="table-header text-center">Jumlah Porsi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {DEMO_PROCESS_PM.map((pm, i) => (
                                <tr key={pm.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="table-cell">
                                        <p className="font-bold text-primary">{pm.name}</p>
                                    </td>
                                    <td className="table-cell text-tertiary/70">
                                        {new Date(pm.date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="table-cell text-center">
                                        <span className="font-bold text-sm" style={{ color: '#438c81', fontVariantNumeric: 'tabular-nums' }}>{pm.estimatedArrival}</span>
                                    </td>
                                    <td className="table-cell text-xs text-tertiary/60 max-w-[220px]">
                                        <span className="line-clamp-2">{pm.description}</span>
                                    </td>
                                    <td className="table-cell text-center">
                                        <span className="font-extrabold text-base" style={{ color: '#327169' }}>
                                            {pm.portionCount.toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-[10px] text-tertiary/40 ml-1">porsi</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-50 border-t border-gray-200">
                                <td className="table-cell font-bold text-primary" colSpan={4}>Total Porsi</td>
                                <td className="table-cell text-center font-extrabold text-lg" style={{ color: '#327169' }}>
                                    {DEMO_PROCESS_PM.reduce((s, p) => s + p.portionCount, 0).toLocaleString('id-ID')}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    )
}
