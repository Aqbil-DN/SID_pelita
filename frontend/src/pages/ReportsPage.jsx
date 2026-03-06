import React, { useState } from 'react'
import { BarChart3, Download, Calendar, TrendingUp } from 'lucide-react'
import { toast } from 'react-toastify'
import { DEMO_MENUS, DEMO_SCHOOLS, WORKFLOW_STAGES } from '../lib/constants'
import clsx from 'clsx'

// Build monthly report data from demo menus
const buildReportData = () => {
    return DEMO_MENUS.map((menu, idx) => ({
        id: idx + 1,
        menuName: menu.name,
        targetDate: new Date(menu.targetDate).toLocaleDateString('id-ID'),
        calories: menu.calories,
        stage: WORKFLOW_STAGES[menu.currentStage - 1]?.label || 'Selesai',
        estimatedCost: menu.estimatedCost,
        createdBy: menu.createdBy,
        totalVendorOrders: menu.vendorOrders?.length || 0,
        ingredientCount: menu.ingredients?.length || 0,
        status: menu.status,
        schoolDistributed: menu.currentStage >= 7
            ? DEMO_SCHOOLS.slice(0, 4).join(', ')
            : '-',
        portionsProduced: menu.currentStage >= 7 ? Math.floor(Math.random() * 300 + 200) : '-',
    }))
}

const SUMMARY_MENUS = [
    { month: 'Januari 2026', menus: 18, distributed: 15, totalCost: 'Rp 45.000.000', portions: 7500 },
    { month: 'Februari 2026', menus: 24, distributed: 22, totalCost: 'Rp 62.400.000', portions: 11000 },
    { month: 'Maret 2026 (Berjalan)', menus: 3, distributed: 0, totalCost: 'Rp 3.300.000', portions: 0 },
]

function exportToCSV(data, filename) {
    const headers = ['No', 'Nama Menu', 'Target Tanggal', 'Kalori', 'Tahap', 'Estimasi Biaya', 'Dibuat Oleh', 'Jumlah Vendor', 'Jumlah Bahan', 'Status']
    const rows = data.map((r) => [
        r.id,
        `"${r.menuName}"`,
        r.targetDate,
        r.calories,
        `"${r.stage}"`,
        r.estimatedCost,
        `"${r.createdBy}"`,
        r.totalVendorOrders,
        r.ingredientCount,
        r.status,
    ])
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}

export default function ReportsPage() {
    const [selectedMonth, setSelectedMonth] = useState('Maret 2026 (Berjalan)')
    const reportData = buildReportData()

    const handleExport = () => {
        exportToCSV(reportData, `laporan-mbg-${selectedMonth.replace(/\s/g, '-')}.csv`)
        toast.success('File CSV berhasil diunduh! 📥')
    }

    const totalCost = reportData.reduce((s, r) => s + r.estimatedCost, 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Reports</h2>
                    <p className="text-sm text-gray-400">Ringkasan bulanan produksi dan distribusi MBG</p>
                </div>
                <button onClick={handleExport} className="btn-primary">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {/* Month selector */}
            <div className="card">
                <label className="label">Pilih Bulan Laporan</label>
                <select
                    className="input-field max-w-xs"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                >
                    {SUMMARY_MENUS.map((s) => <option key={s.month} value={s.month}>{s.month}</option>)}
                </select>
            </div>

            {/* Monthly summaries */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Menu', value: DEMO_MENUS.length, color: 'bg-accent-light', textColor: 'text-primary', icon: '🍽️' },
                    { label: 'Sudah Terdistribusi', value: 2, color: 'bg-blue-50', textColor: 'text-blue-700', icon: '🚚' },
                    { label: 'Total Biaya', value: `Rp ${totalCost.toLocaleString('id-ID')}`, color: 'bg-indigo-50', textColor: 'text-indigo-700', icon: '💰' },
                    { label: 'Sekolah Terlayani', value: 8, color: 'bg-amber-50', textColor: 'text-amber-700', icon: '🏫' },
                ].map((stat) => (
                    <div key={stat.label} className={clsx('card', stat.color, 'border-0')}>
                        <p className="text-2xl mb-1">{stat.icon}</p>
                        <p className={clsx('text-2xl font-extrabold', stat.textColor)}>{stat.value}</p>
                        <p className="text-sm font-medium text-gray-600 mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Monthly history table */}
            <div className="card">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-base">
                    <TrendingUp size={18} className="text-secondary" /> Ringkasan Bulanan
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="table-header">Bulan</th>
                                <th className="table-header text-center">Menu Dibuat</th>
                                <th className="table-header text-center">Terdistribusi</th>
                                <th className="table-header text-right">Total Biaya</th>
                                <th className="table-header text-right">Total Porsi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {SUMMARY_MENUS.map((s) => (
                                <tr key={s.month} className={clsx('hover:bg-gray-50 transition-colors', s.month === selectedMonth && 'bg-accent-light/30')}>
                                    <td className="table-cell font-semibold text-gray-800">{s.month}</td>
                                    <td className="table-cell text-center"><span className="badge-info">{s.menus}</span></td>
                                    <td className="table-cell text-center"><span className="badge-success">{s.distributed}</span></td>
                                    <td className="table-cell text-right font-mono font-semibold text-blue-700">{s.totalCost}</td>
                                    <td className="table-cell text-right font-mono">{s.portions.toLocaleString('id-ID')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed report */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                        <BarChart3 size={18} className="text-blue-500" /> Detail Menu Bulan Ini
                    </h3>
                    <span className="badge-gray">{reportData.length} menu</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="table-header">#</th>
                                <th className="table-header">Nama Menu</th>
                                <th className="table-header">Target</th>
                                <th className="table-header text-center">Kalori</th>
                                <th className="table-header">Tahap</th>
                                <th className="table-header text-right">Estimasi Biaya</th>
                                <th className="table-header">Dibuat Oleh</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="table-cell text-gray-400 text-xs">{r.id}</td>
                                    <td className="table-cell font-semibold text-gray-800">{r.menuName}</td>
                                    <td className="table-cell text-gray-500 text-sm">{r.targetDate}</td>
                                    <td className="table-cell text-center">
                                        <span className="badge-warning">{r.calories} kkal</span>
                                    </td>
                                    <td className="table-cell">
                                        <span className="badge-info">{r.stage}</span>
                                    </td>
                                    <td className="table-cell text-right font-mono font-semibold text-blue-700">
                                        {r.estimatedCost > 0 ? `Rp ${r.estimatedCost.toLocaleString('id-ID')}` : '—'}
                                    </td>
                                    <td className="table-cell text-gray-500 text-xs">{r.createdBy}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
