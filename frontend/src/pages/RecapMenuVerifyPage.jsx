import React, { useState, useMemo } from 'react'
import { ClipboardList, Eye, X, Flame, User, Clock, ChefHat, AlertCircle, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import useWorkflowStore from '../store/workflowStore'
import { WORKFLOW_STAGES } from '../lib/constants'

// ─── Helper ──────────────────────────────────────────────────────────────────

function fmtDate(dateStr) {
    if (!dateStr) return '—'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
}

function fmtTs(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
}

/**
 * Derive the most meaningful status label from a menu's stages.
 * Returns `{ label, color, bg }`.
 */
function deriveStatus(menu) {
    const stages = menu.stages || {}
    const stageKeys = WORKFLOW_STAGES.map(s => s.id)
    // Walk stage keys in reverse — find the last 'done' stage
    let lastDone = null
    for (const k of stageKeys) {
        if (stages[k]?.status === 'done') lastDone = k
    }
    const stageInfo = WORKFLOW_STAGES.find(s => s.id === lastDone)

    if (!lastDone) return { label: 'Pending', color: '#9ca3af', bg: '#f3f4f6' }
    const label = stageInfo?.label || lastDone
    const colorMap = {
        nutritionist_review: { color: '#327169', bg: '#c8e0e0' },
        ingredient_mapping:  { color: '#7c3aed', bg: '#f5f3ff' },
        accountant_review:   { color: '#ca8a04', bg: '#fefce8' },
        procurement:         { color: '#2563eb', bg: '#eff6ff' },
        receiving:           { color: '#16a34a', bg: '#dcfce7' },
        production:          { color: '#dc2626', bg: '#fef2f2' },
        distributed:         { color: '#327169', bg: '#e0f2f2' },
    }
    return { label: `✓ ${label}`, ...(colorMap[lastDone] || { color: '#438c81', bg: '#f0fafa' }) }
}

// ─── MenuDetailModal ─────────────────────────────────────────────────────────

function MenuDetailModal({ menu, onClose }) {
    const ingredients = menu.ingredients || []
    const totalCalories = ingredients.reduce((sum, ing) => sum + (ing.calories || 0), 0)
    const hcStage = menu.stages?.ingredient_mapping
    const nutritionistStage = menu.stages?.nutritionist_review

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-stretch justify-end"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
        >
            {/* Slide-over panel */}
            <div
                className="relative flex flex-col h-full overflow-hidden shadow-2xl"
                style={{ width: 'min(640px, 100vw)', backgroundColor: 'rgba(163,199,199,0.08)', backdropFilter: 'blur(0px)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Inner white surface */}
                <div className="flex flex-col h-full bg-white">

                    {/* Header */}
                    <div className="flex-shrink-0 px-6 py-5 border-b" style={{ borderColor: '#e5e7eb', background: 'linear-gradient(135deg, rgba(50,113,105,0.06) 0%, rgba(163,199,199,0.10) 100%)' }}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#438c81' }}>Detail Menu</span>
                                </div>
                                <h2 className="text-xl font-extrabold leading-tight truncate" style={{ color: '#327169' }}>{menu.name}</h2>
                                {menu.description && (
                                    <p className="text-sm mt-1 line-clamp-2" style={{ color: '#4d4d4d', opacity: 0.7 }}>{menu.description}</p>
                                )}
                                <p className="text-xs mt-2 font-semibold" style={{ color: '#9ca3af' }}>
                                    📅 {fmtDate(menu.targetDate)}
                                </p>
                            </div>
                            <button onClick={onClose} className="flex-shrink-0 p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-400 transition-colors mt-0.5">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Audit trail */}
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(50,113,105,0.07)' }}>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <ChefHat size={12} style={{ color: '#327169' }} />
                                    <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#327169' }}>Head Chef Mapper</p>
                                </div>
                                <p className="text-sm font-bold" style={{ color: '#4d4d4d' }}>{hcStage?.processedBy || '—'}</p>
                                <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>{fmtTs(hcStage?.completedAt)}</p>
                            </div>
                            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(67,140,129,0.07)' }}>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <User size={12} style={{ color: '#438c81' }} />
                                    <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#438c81' }}>Nutritionist Verifier</p>
                                </div>
                                <p className="text-sm font-bold" style={{ color: '#4d4d4d' }}>{nutritionistStage?.processedBy || '—'}</p>
                                <p className="text-[10px] mt-0.5" style={{ color: '#9ca3af' }}>{fmtTs(nutritionistStage?.completedAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Ingredient table */}
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'rgba(77,77,77,0.5)' }}>
                                Ingredient Breakdown
                            </h3>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                                {ingredients.length} item
                            </span>
                        </div>

                        {ingredients.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <AlertCircle size={36} className="mb-3" style={{ color: '#a3c7c7' }} />
                                <p className="text-sm font-semibold" style={{ color: '#9ca3af' }}>Belum ada bahan yang di-mapping</p>
                                <p className="text-xs mt-1" style={{ color: '#c4c4c4' }}>Head Chef perlu melakukan Ingredient Mapping terlebih dahulu</p>
                            </div>
                        ) : (
                            <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#e5e7eb' }}>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                            <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(77,77,77,0.55)', width: '40%' }}>Bahan</th>
                                            <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(77,77,77,0.55)', width: '15%' }}>Qty</th>
                                            <th className="text-center px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(77,77,77,0.55)', width: '15%' }}>Unit</th>
                                            <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(77,77,77,0.55)', width: '30%' }}>
                                                <span className="inline-flex items-center gap-1"><Flame size={10} /> Kalori</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ingredients.map((ing, i) => (
                                            <tr
                                                key={i}
                                                style={{
                                                    borderBottom: i < ingredients.length - 1 ? '1px solid #f3f4f6' : 'none',
                                                    backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa',
                                                }}
                                            >
                                                <td className="px-4 py-3 font-semibold" style={{ color: '#4d4d4d' }}>{ing.name}</td>
                                                <td className="px-3 py-3 text-center font-bold" style={{ color: '#327169', fontVariantNumeric: 'tabular-nums' }}>{ing.quantity}</td>
                                                <td className="px-3 py-3 text-center text-xs" style={{ color: '#9ca3af' }}>{ing.unit}</td>
                                                <td className="px-4 py-3 text-right">
                                                    {ing.calories != null ? (
                                                        <span className="inline-flex items-center justify-end gap-1 font-bold text-sm" style={{ color: '#dc2626' }}>
                                                            <Flame size={12} />
                                                            {Number(ing.calories).toLocaleString('id-ID')} kcal
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs italic" style={{ color: '#d1d5db' }}>tidak diisi</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Summary footer */}
                    <div className="flex-shrink-0 px-6 py-5 border-t" style={{ borderColor: '#e5e7eb', background: 'linear-gradient(180deg, #fff 0%, rgba(163,199,199,0.08) 100%)' }}>
                        {/* Read-only notice */}
                        <div className="flex items-start gap-2 mb-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(163,199,199,0.15)', border: '1px solid rgba(163,199,199,0.5)' }}>
                            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#438c81' }} />
                            <p className="text-xs leading-relaxed" style={{ color: '#438c81' }}>
                                <strong>Read-only.</strong> Untuk mengubah kalori, gunakan tombol <em>Ignore</em> di halaman aktif workflow agar dikembalikan ke Head Chef.
                            </p>
                        </div>

                        {/* Total calories */}
                        <div className="flex items-center justify-between p-4 rounded-2xl" style={{
                            background: 'linear-gradient(135deg, #327169, #438c81)',
                            boxShadow: '0 4px 16px rgba(50,113,105,0.25)',
                        }}>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-white/70">Total Kalori Menu</p>
                                <p className="text-[10px] text-white/50 mt-0.5">{ingredients.filter(i => i.calories != null).length} dari {ingredients.length} bahan memiliki data kalori</p>
                            </div>
                            <div className="text-right">
                                {totalCalories > 0 ? (
                                    <>
                                        <p className="text-3xl font-black text-white leading-none">
                                            {totalCalories.toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-xs font-bold text-white/70 mt-0.5">kcal / porsi</p>
                                    </>
                                ) : (
                                    <p className="text-white/60 text-sm font-semibold">Belum ada data kalori</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── RecapList ───────────────────────────────────────────────────────────────

/**
 * Groups menus by targetDate and counts variations per day.
 * Returns an Array of `{ date, menus[] }` sorted by date desc.
 */
function groupByDate(menus) {
    const map = {}
    menus.forEach(m => {
        const d = m.targetDate || 'unknown'
        if (!map[d]) map[d] = []
        map[d].push(m)
    })
    return Object.entries(map)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([date, menus]) => ({ date, menus }))
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function RecapMenuVerifyPage() {
    const { menus } = useWorkflowStore()
    const [selectedMenu, setSelectedMenu] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    // All menus that have passed nutritionist review
    const verified = useMemo(
        () => menus.filter(m => m.stages?.nutritionist_review?.status === 'done'),
        [menus]
    )

    const filtered = useMemo(() => {
        if (!searchTerm.trim()) return verified
        const q = searchTerm.toLowerCase()
        return verified.filter(m =>
            m.name.toLowerCase().includes(q) ||
            m.targetDate?.includes(q) ||
            (m.stages?.nutritionist_review?.processedBy || '').toLowerCase().includes(q)
        )
    }, [verified, searchTerm])

    const grouped = useMemo(() => groupByDate(filtered), [filtered])

    // Stats
    const totalCalories = verified.reduce((s, m) =>
        s + (m.ingredients || []).reduce((a, i) => a + (i.calories || 0), 0), 0)
    const totalIngredients = verified.reduce((s, m) => s + (m.ingredients?.length || 0), 0)

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Page header */}
            <div>
                <h2 className="text-2xl font-extrabold flex items-center gap-2" style={{ color: '#327169' }}>
                    <ClipboardList size={24} /> Recap Menu Verify
                </h2>
                <p className="text-sm mt-1" style={{ color: 'rgba(77,77,77,0.5)' }}>
                    Riwayat lengkap menu yang telah diverifikasi — beserta analisis kalori dan bahan
                </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Menu Terverifikasi', value: verified.length, icon: CheckCircle2, color: '#327169' },
                    { label: 'Total Variasi Hari', value: groupByDate(verified).length, icon: ClipboardList, color: '#438c81' },
                    { label: 'Total Bahan Seluruh Menu', value: totalIngredients, icon: ChefHat, color: '#7c3aed' },
                    {
                        label: 'Akumulasi Kalori',
                        value: totalCalories > 0 ? `${totalCalories.toLocaleString('id-ID')} kcal` : '—',
                        icon: Flame,
                        color: '#dc2626',
                    },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '18' }}>
                            <Icon size={20} style={{ color }} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xl font-extrabold truncate" style={{ color }}>{value}</p>
                            <p className="text-[11px] font-semibold leading-tight" style={{ color: 'rgba(77,77,77,0.45)' }}>{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(77,77,77,0.3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Cari nama menu, tanggal, atau nama verifikator..."
                    className="input-field pl-9"
                />
            </div>

            {/* Empty state */}
            {grouped.length === 0 && (
                <div className="card text-center py-16">
                    <XCircle size={40} className="mx-auto mb-3" style={{ color: '#a3c7c7' }} />
                    <p className="text-sm font-semibold" style={{ color: '#9ca3af' }}>
                        {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada menu yang terverifikasi oleh Nutritionist'}
                    </p>
                </div>
            )}

            {/* Grouped table */}
            {grouped.map(({ date, menus: dayMenus }) => (
                <div key={date} className="card p-0 overflow-hidden">
                    {/* Date group header */}
                    <div
                        className="px-5 py-3 flex items-center justify-between"
                        style={{ background: 'linear-gradient(90deg, rgba(50,113,105,0.07) 0%, transparent 100%)', borderBottom: '1px solid #f3f4f6' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: '#327169' }} />
                            <div>
                                <p className="font-extrabold text-sm" style={{ color: '#327169' }}>
                                    {fmtDate(date)}
                                </p>
                                <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'rgba(77,77,77,0.4)' }}>
                                    {dayMenus.length} variasi menu
                                </p>
                            </div>
                        </div>
                        <span
                            className="text-xs font-extrabold px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: '#c8e0e0', color: '#327169' }}
                        >
                            {dayMenus.length} Menu
                        </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[680px]">
                            <thead>
                                <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                                    <th className="table-header" style={{ width: '35%' }}>Nama Menu</th>
                                    <th className="table-header text-center" style={{ width: '10%' }}>Bahan</th>
                                    <th className="table-header text-right" style={{ width: '18%' }}>Total Kalori</th>
                                    <th className="table-header" style={{ width: '22%' }}>Status Terakhir</th>
                                    <th className="table-header text-center" style={{ width: '15%' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dayMenus.map((menu, idx) => {
                                    const status = deriveStatus(menu)
                                    const ingredients = menu.ingredients || []
                                    const menuCalories = ingredients.reduce((s, i) => s + (i.calories || 0), 0)
                                    const hasCalories = ingredients.some(i => i.calories != null && i.calories > 0)
                                    const nutrients = menu.stages?.nutritionist_review

                                    return (
                                        <tr
                                            key={menu.id}
                                            style={{
                                                borderBottom: idx < dayMenus.length - 1 ? '1px solid #f3f4f6' : 'none',
                                                backgroundColor: '#fff',
                                                transition: 'background-color 0.15s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafefe'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                                        >
                                            {/* Name */}
                                            <td className="table-cell">
                                                <p className="font-extrabold leading-tight" style={{ color: '#327169' }}>{menu.name}</p>
                                                {menu.description && (
                                                    <p className="text-[11px] mt-0.5 line-clamp-1" style={{ color: 'rgba(77,77,77,0.45)' }}>{menu.description}</p>
                                                )}
                                                {nutrients?.processedBy && (
                                                    <div className="flex items-center gap-1 mt-1.5">
                                                        <User size={9} style={{ color: '#a3c7c7' }} />
                                                        <span className="text-[10px]" style={{ color: '#a3c7c7' }}>{nutrients.processedBy}</span>
                                                        <Clock size={9} className="ml-1" style={{ color: '#a3c7c7' }} />
                                                        <span className="text-[10px]" style={{ color: '#a3c7c7' }}>{fmtTs(nutrients.completedAt)}</span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Ingredients count */}
                                            <td className="table-cell text-center">
                                                <span className="inline-block font-bold text-sm" style={{ color: '#327169' }}>{ingredients.length}</span>
                                                <p className="text-[9px]" style={{ color: '#9ca3af' }}>item</p>
                                            </td>

                                            {/* Calories */}
                                            <td className="table-cell text-right">
                                                {hasCalories ? (
                                                    <div>
                                                        <span className="font-extrabold text-base inline-flex items-center gap-1" style={{ color: '#327169' }}>
                                                            <Flame size={13} style={{ color: '#dc2626' }} />
                                                            {menuCalories.toLocaleString('id-ID')}
                                                        </span>
                                                        <p className="text-[10px]" style={{ color: '#9ca3af' }}>kcal total</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs italic" style={{ color: '#d1d5db' }}>—</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="table-cell">
                                                <span
                                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
                                                    style={{ backgroundColor: status.bg, color: status.color }}
                                                >
                                                    {status.label}
                                                </span>
                                            </td>

                                            {/* Action */}
                                            <td className="table-cell text-center">
                                                <button
                                                    onClick={() => setSelectedMenu(menu)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-80 hover:shadow-md"
                                                    style={{ backgroundColor: '#438c81' }}
                                                >
                                                    <Eye size={13} /> Detail
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {/* Detail Slide-over */}
            {selectedMenu && (
                <MenuDetailModal menu={selectedMenu} onClose={() => setSelectedMenu(null)} />
            )}
        </div>
    )
}
