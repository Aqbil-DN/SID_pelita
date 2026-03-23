import React, { useState, useMemo } from 'react'
import {
    Package2, ChevronLeft, ChevronRight, FlaskConical,
    ShoppingCart, ChevronDown, ChevronUp, Info, Calendar, AlertTriangle,
} from 'lucide-react'
import useWorkflowStore from '../store/workflowStore'
import { usePortionPlanningStore } from '../store/portionPlanningStore'
import { DEMO_SCHOOLS } from '../lib/constants'

// ─── Helpers ───────────────────────────────────────────────────────────────────

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

function toDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatDateLabel(dateKey) {
    const [y, m, d] = dateKey.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
}

function formatQty(qty) {
    // Convert to appropriate unit with smart formatting
    if (typeof qty !== 'number') return `${qty}`
    if (qty >= 1000) return `${(qty / 1000).toLocaleString('id-ID', { maximumFractionDigits: 2 })} kg`
    return `${qty.toLocaleString('id-ID', { maximumFractionDigits: 2 })}`
}

// ─── Compact Mini Calendar for date selection ──────────────────────────────────

const WEEKDAYS_SHORT = ['S', 'S', 'R', 'K', 'J', 'S', 'M']

function MiniCalendar({ value, onChange, highlightedDates }) {
    const today = new Date()
    const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

    const year = current.getFullYear()
    const month = current.getMonth()

    const cells = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay()
        const startOffset = (firstDay + 6) % 7
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const daysInPrev = new Date(year, month, 0).getDate()
        const list = []
        for (let i = startOffset - 1; i >= 0; i--) {
            list.push({ day: daysInPrev - i, key: toDateKey(year, month - 1, daysInPrev - i), cur: false })
        }
        for (let d = 1; d <= daysInMonth; d++) {
            list.push({ day: d, key: toDateKey(year, month, d), cur: true })
        }
        while (list.length % 7 !== 0) {
            list.push({ day: list.length - startOffset - daysInMonth + 1, key: '', cur: false })
        }
        return list
    }, [year, month])

    const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate())

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <button onClick={() => setCurrent(new Date(year, month - 1, 1))}
                    className="p-1 rounded-lg hover:bg-gray-100 text-[#4d4d4d] transition-colors">
                    <ChevronLeft size={14} />
                </button>
                <p className="text-xs font-bold text-[#327169]">
                    {MONTHS_ID[month]} {year}
                </p>
                <button onClick={() => setCurrent(new Date(year, month + 1, 1))}
                    className="p-1 rounded-lg hover:bg-gray-100 text-[#4d4d4d] transition-colors">
                    <ChevronRight size={14} />
                </button>
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS_SHORT.map((d, i) => (
                    <div key={i} className="text-center text-[9px] font-bold text-[#4d4d4d]/40 py-0.5">{d}</div>
                ))}
            </div>
            {/* Days */}
            <div className="grid grid-cols-7 gap-0.5">
                {cells.map((cell, i) => {
                    const isSelected = value === cell.key
                    const isToday = cell.key === todayKey
                    const hasData = highlightedDates.includes(cell.key)
                    return (
                        <button
                            key={i}
                            onClick={() => cell.cur && cell.key && onChange(cell.key)}
                            disabled={!cell.cur || !cell.key}
                            className={[
                                'relative w-8 h-8 mx-auto flex items-center justify-center rounded-lg text-xs font-semibold transition-all',
                                !cell.cur ? 'opacity-20 cursor-default' : 'cursor-pointer',
                                isSelected ? 'bg-[#327169] text-white shadow' : isToday ? 'bg-[#a3c7c7]/40 text-[#327169]' : 'hover:bg-[#f0fafa] text-[#4d4d4d]',
                                hasData && !isSelected ? 'ring-2 ring-[#438c81]/40' : '',
                            ].join(' ')}
                        >
                            {cell.day}
                            {hasData && !isSelected && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#438c81]" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// ─── Nutrition Summary Card ────────────────────────────────────────────────────

function NutritionSummaryCard({ menu }) {
    const [expanded, setExpanded] = useState(false)
    const facts = menu.nutritionFacts

    if (!facts) return null

    const k = facts.komponen || {}
    const highlights = [
        { label: 'Kalori', value: k.kalori, unit: 'kcal' },
        { label: 'Protein', value: k.protein, unit: 'g' },
        { label: 'Total Lemak', value: k.total_lemak, unit: 'g' },
        { label: 'Total Karbohidrat', value: k.total_karbohidrat, unit: 'g' },
        { label: 'Natrium', value: k.natrium, unit: 'mg' },
        { label: 'Serat Pangan', value: k.serat_pangan, unit: 'g' },
    ].filter(h => h.value !== '' && h.value !== undefined && h.value !== null)

    return (
        <div className="rounded-xl border border-[#a3c7c7]/50 bg-[#f7fdfd] overflow-hidden">
            <button
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                onClick={() => setExpanded(v => !v)}
            >
                <div className="flex items-center gap-2">
                    <FlaskConical size={14} className="text-[#327169]" />
                    <p className="text-xs font-bold text-[#327169]">Fakta Nutrisi — {menu.name}</p>
                </div>
                {expanded ? <ChevronUp size={14} className="text-[#4d4d4d]/40" /> : <ChevronDown size={14} className="text-[#4d4d4d]/40" />}
            </button>
            {expanded && (
                <div className="px-4 pb-4">
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                        {highlights.length > 0 ? highlights.map((h, i) => (
                            <div key={i} className="bg-white rounded-lg border border-[#a3c7c7]/30 p-2 text-center">
                                <p className="text-[10px] text-[#4d4d4d]/50 leading-tight mb-0.5">{h.label}</p>
                                <p className="text-sm font-extrabold text-[#327169]">{h.value}</p>
                                <p className="text-[9px] text-[#4d4d4d]/40">{h.unit}</p>
                            </div>
                        )) : (
                            <p className="text-xs text-gray-400 italic col-span-6">Tidak ada data nutrisi tersimpan.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ProductionRequirementPage() {
    const { menus } = useWorkflowStore()
    const { plans } = usePortionPlanningStore()

    const today = new Date()
    const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate())
    const [selectedDate, setSelectedDate] = useState(todayKey)

    // Find all dates that have menus with ingredients from Head Chef
    const dateDatesWithMenus = useMemo(() => {
        return [...new Set(menus
            .filter(m => m.ingredients?.length > 0 && m.stages.ingredient_mapping?.status === 'done')
            .map(m => m.targetDate)
        )]
    }, [menus])

    // Menus on selected date that have been mapped by Head Chef
    const menusOnDate = useMemo(() =>
        menus.filter(m =>
            m.targetDate === selectedDate &&
            m.stages.ingredient_mapping?.status === 'done' &&
            m.ingredients?.length > 0
        ),
        [menus, selectedDate]
    )

    // Total portions planned by SPV for that date (sum all plans for the delivery date)
    const totalPortions = useMemo(() => {
        return plans
            .filter(p => p.deliveryDate === selectedDate)
            .reduce((sum, p) => sum + Number(p.portionCount), 0)
    }, [plans, selectedDate])

    // Get involved schools for this date
    const schoolsOnDate = useMemo(() => {
        return plans
            .filter(p => p.deliveryDate === selectedDate)
            .map(p => {
                const school = DEMO_SCHOOLS.find(s => s.id === p.schoolId)
                return { ...p, schoolName: school?.name ?? `PM #${p.schoolId}` }
            })
    }, [plans, selectedDate])

    // Build consolidated ingredient table rows
    const ingredientRows = useMemo(() => {
        const rows = []
        for (const menu of menusOnDate) {
            for (const ing of menu.ingredients) {
                const qtyPerPortion = Number(ing.quantity)
                const totalQty = qtyPerPortion * totalPortions
                rows.push({
                    name: ing.name,
                    qtyPerPortion,
                    totalQty,
                    unit: ing.unit,
                    menuName: menu.name,
                    menuId: menu.id,
                })
            }
        }
        return rows
    }, [menusOnDate, totalPortions])

    // Group rows by ingredient name (consolidate same ingredients across menus)
    const consolidatedRows = useMemo(() => {
        const map = {}
        for (const row of ingredientRows) {
            const existing = map[row.name]
            if (existing) {
                existing.totalQty += row.totalQty
                existing.sourceMenus.push(row.menuName)
            } else {
                map[row.name] = { ...row, sourceMenus: [row.menuName] }
            }
        }
        return Object.values(map)
    }, [ingredientRows])

    // Formatted unit for display  
    function getDisplayQty(row) {
        // Try natural unit conversion (e.g. gram → kg if total >= 1000g)
        if (row.unit === 'gram' && row.totalQty >= 1000) {
            return { qty: (row.totalQty / 1000).toLocaleString('id-ID', { maximumFractionDigits: 2 }), unit: 'kg' }
        }
        if (row.unit === 'ml' && row.totalQty >= 1000) {
            return { qty: (row.totalQty / 1000).toLocaleString('id-ID', { maximumFractionDigits: 2 }), unit: 'liter' }
        }
        return { qty: row.totalQty.toLocaleString('id-ID', { maximumFractionDigits: 2 }), unit: row.unit }
    }

    const menusWithNutrition = menusOnDate.filter(m => m.nutritionFacts)

    return (
        <div className="flex flex-col gap-5 max-w-7xl mx-auto">
            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-extrabold text-[#327169] flex items-center gap-2">
                    <Package2 size={24} /> Rancang Kebutuhan Bahan Baku
                </h2>
                <p className="text-sm text-[#4d4d4d]/60 mt-0.5">
                    Kalkulasi otomatis total bahan baku berdasarkan rencana porsi dari Supervisor
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                {/* Left — Date selector */}
                <div className="space-y-4">
                    <MiniCalendar
                        value={selectedDate}
                        onChange={setSelectedDate}
                        highlightedDates={dateDatesWithMenus}
                    />

                    {/* Selected date info */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-[#327169]" />
                            <p className="text-xs font-bold text-[#327169]">Tanggal Dipilih</p>
                        </div>
                        <p className="text-sm font-extrabold text-[#4d4d4d]">{formatDateLabel(selectedDate)}</p>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-[#327169]/8 rounded-xl p-3 text-center">
                                <p className="text-[10px] text-[#4d4d4d]/55 mb-0.5">Total Porsi (SPV)</p>
                                <p className="text-lg font-extrabold text-[#327169]">
                                    {totalPortions > 0 ? totalPortions.toLocaleString('id-ID') : '—'}
                                </p>
                            </div>
                            <div className="bg-[#438c81]/10 rounded-xl p-3 text-center">
                                <p className="text-[10px] text-[#4d4d4d]/55 mb-0.5">Jumlah Menu</p>
                                <p className="text-lg font-extrabold text-[#438c81]">{menusOnDate.length}</p>
                            </div>
                        </div>

                        {/* Schools */}
                        {schoolsOnDate.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#4d4d4d]/40 mb-1.5">Penerima Manfaat</p>
                                <div className="space-y-1">
                                    {schoolsOnDate.map(s => (
                                        <div key={s.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-2.5 py-1.5">
                                            <span className="font-semibold text-[#4d4d4d] truncate">{s.schoolName}</span>
                                            <span className="font-bold text-[#327169] shrink-0 ml-2">{Number(s.portionCount).toLocaleString('id-ID')} porsi</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {schoolsOnDate.length === 0 && menusOnDate.length > 0 && (
                            <div className="flex items-start gap-2 bg-amber-50 rounded-xl px-3 py-2">
                                <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700">
                                    Belum ada rencana porsi dari Supervisor untuk tanggal ini. Total kebutuhan produksi tidak dapat dihitung.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right — Main content */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Info banner */}
                    <div className="flex items-start gap-2.5 bg-[#327169]/8 border border-[#a3c7c7]/40 rounded-xl px-4 py-3">
                        <Info size={14} className="text-[#327169] shrink-0 mt-0.5" />
                        <p className="text-xs text-[#327169]">
                            <span className="font-bold">Rumus kalkulasi: </span>
                            (Qty Bahan per Porsi) × (Total Porsi direncanakan SPV) = Total Kebutuhan Produksi
                        </p>
                    </div>

                    {/* Ingredient table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
                            <ShoppingCart size={16} className="text-[#327169]" />
                            <h3 className="font-bold text-[#327169] text-sm">Kebutuhan Bahan Baku — {formatDateLabel(selectedDate)}</h3>
                        </div>

                        {menusOnDate.length === 0 ? (
                            <div className="text-center py-12 text-[#4d4d4d]/40">
                                <Package2 size={36} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Tidak ada menu dengan bahan yang sudah dipetakan Head Chef</p>
                                <p className="text-xs mt-1">Pilih tanggal lain atau tunggu Head Chef menyelesaikan Ingredient Mapping</p>
                            </div>
                        ) : totalPortions === 0 ? (
                            <div className="text-center py-12 text-amber-600">
                                <AlertTriangle size={36} className="mx-auto mb-2 opacity-60" />
                                <p className="text-sm font-semibold">Supervisor belum merencanakan porsi untuk tanggal ini</p>
                                <p className="text-xs mt-1 text-[#4d4d4d]/50">Total kebutuhan produksi tidak dapat dihitung tanpa data porsi</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-[#4d4d4d]/50">Nama Bahan</th>
                                            <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#4d4d4d]/50">Qty / Porsi</th>
                                            <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#4d4d4d]/50">Total Produksi</th>
                                            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#4d4d4d]/50">Satuan Asli</th>
                                            <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-[#4d4d4d]/50">Menu Sumber</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {consolidatedRows.map((row, i) => {
                                            const disp = getDisplayQty(row)
                                            return (
                                                <tr key={i} className="hover:bg-[#f7fdfd] transition-colors">
                                                    <td className="px-5 py-3 font-bold text-[#4d4d4d]">{row.name}</td>
                                                    <td className="px-4 py-3 text-right text-[#4d4d4d]/70">
                                                        {row.qtyPerPortion.toLocaleString('id-ID')}
                                                        <span className="text-xs text-[#4d4d4d]/40 ml-1">{row.unit}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="font-extrabold text-[#327169] text-base">{disp.qty}</span>
                                                        <span className="text-xs font-bold text-[#438c81] ml-1">{disp.unit}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-[#4d4d4d]/55 text-xs">{row.unit}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-wrap gap-1">
                                                            {row.sourceMenus.map((mn, j) => (
                                                                <span key={j} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#a3c7c7]/30 text-[#327169]">
                                                                    {mn.length > 20 ? mn.slice(0, 18) + '…' : mn}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                    {/* Summary footer */}
                                    <tfoot>
                                        <tr className="bg-gray-50 border-t border-gray-200">
                                            <td className="px-5 py-3 text-xs font-bold text-[#4d4d4d]/60" colSpan={2}>
                                                {consolidatedRows.length} jenis bahan
                                            </td>
                                            <td className="px-4 py-3 text-right" colSpan={3}>
                                                <span className="text-xs font-semibold text-[#4d4d4d]/60">
                                                    Untuk {totalPortions.toLocaleString('id-ID')} porsi dari {schoolsOnDate.length} PM
                                                </span>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Nutrition Summary Section */}
                    {menusWithNutrition.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <FlaskConical size={15} className="text-[#327169]" />
                                <h3 className="font-bold text-[#327169] text-sm">Ringkasan Fakta Nutrisi</h3>
                                <span className="text-[10px] text-[#4d4d4d]/40 font-semibold">(klik untuk expand)</span>
                            </div>
                            {menusWithNutrition.map(menu => (
                                <NutritionSummaryCard key={menu.id} menu={menu} />
                            ))}
                        </div>
                    )}

                    {menusOnDate.length > 0 && menusWithNutrition.length < menusOnDate.length && (
                        <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-4 py-3">
                            <Info size={13} className="text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700">
                                {menusOnDate.length - menusWithNutrition.length} dari {menusOnDate.length} menu belum memiliki data fakta nutrisi.
                                Input melalui halaman <strong>Input Fakta Nutrisi</strong>.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
