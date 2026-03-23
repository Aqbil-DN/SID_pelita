import React, { useState } from 'react'
import { BadgeDollarSign, Save, Check, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../store/authStore'
import useWorkflowStore from '../store/workflowStore'
import clsx from 'clsx'
import ConfirmationModal from '../components/ConfirmationModal'
import { formatRp, parseRpInput, formatOnBlur } from '../lib/formatCurrency'

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
function formatDate(y, m, d) { return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` }

// ─── Rp-formatted input cell ──────────────────────────────────────────────────
function RpTableInput({ value, onChange }) {
    const [display, setDisplay] = useState(value ? formatRp(value) : '')

    const handleChange = e => setDisplay(e.target.value.replace(/[^0-9,]/g, ''))
    const handleBlur = () => {
        const { display: fmt, value: val } = formatOnBlur(display)
        setDisplay(fmt)
        onChange(val)
    }

    return (
        <div className="flex items-center gap-1">
            <span className="text-xs text-tertiary/50 shrink-0">Rp</span>
            <input
                type="text"
                inputMode="numeric"
                value={display}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0"
                className="input-field w-32 text-sm py-1.5 font-mono"
            />
        </div>
    )
}

// ─── Vetting Modal ─────────────────────────────────────────────────────────────
function VettingModal({ menu, onClose, onSave }) {
    const [prices, setPrices] = useState(() => {
        const p = {}
        menu.ingredients.forEach((ing, i) => { p[i] = ing.maxPrice || 0 })
        return p
    })
    const [showConfirm, setShowConfirm] = useState(false)

    const handleSaveClick = () => {
        const allSet = menu.ingredients.every((_, i) => prices[i] && parseFloat(prices[i]) > 0)
        if (!allSet) { toast.error('Semua harga max harus diisi!'); return }
        setShowConfirm(true)
    }

    const handleConfirmedSave = () => {
        setShowConfirm(false)
        onSave(menu.id, prices)
    }

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="shrink-0 px-6 py-4" style={{ backgroundColor: 'rgba(163,199,199,0.12)', borderBottom: '1px solid #e5e7eb' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#438c81]">Financial Vetting</p>
                                <h3 className="text-lg font-extrabold text-[#327169]">{menu.name}</h3>
                                <p className="text-xs text-[#4d4d4d]/50 mt-0.5">{menu.targetDate} • {menu.ingredients.length} bahan • Est. {formatRp(menu.estimatedCost || 0)}</p>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-400"><X size={20} /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <p className="text-xs text-[#4d4d4d]/50 mb-3">Tetapkan batas harga maksimum per unit untuk setiap bahan di menu ini.</p>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="table-header">Bahan</th>
                                    <th className="table-header text-center">Qty</th>
                                    <th className="table-header">Unit</th>
                                    <th className="table-header">Max Harga/Unit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {menu.ingredients.map((ing, i) => (
                                    <tr key={i} className="border-b border-gray-50">
                                        <td className="table-cell font-semibold">{ing.name}</td>
                                        <td className="table-cell text-primary font-bold text-center">{ing.quantity}</td>
                                        <td className="table-cell text-tertiary/60">{ing.unit}</td>
                                        <td className="table-cell">
                                            <RpTableInput
                                                value={prices[i]}
                                                onChange={val => setPrices(p => ({ ...p, [i]: val }))}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="shrink-0 px-6 py-4 border-t border-gray-100">
                        <button onClick={handleSaveClick} className="btn-primary w-full justify-center">
                            <Save size={16} /> Simpan & Kirim ke SCD
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showConfirm}
                message="Apakah Anda yakin ingin menetapkan harga max ini dan mengirim menu ke SCD?"
                confirmLabel="Ya, Kirim ke SCD"
                onConfirm={handleConfirmedSave}
                onCancel={() => setShowConfirm(false)}
            />
        </>
    )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function FinancialVettingPage() {
    const { user } = useAuthStore()
    const { menus, setMaxPrice, verifyStage } = useWorkflowStore()
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [selectedMenu, setSelectedMenu] = useState(null)

    const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else setCurrentMonth(m => m - 1) }
    const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else setCurrentMonth(m => m + 1) }

    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    const pendingMenus = menus.filter(m => m.stages.accountant_review?.status === 'active')
    const doneMenus = menus.filter(m => m.stages.accountant_review?.status === 'done')

    const getMenusForDate = (dateStr) => menus.filter(m =>
        m.targetDate === dateStr && (m.stages.accountant_review?.status === 'active' || m.stages.accountant_review?.status === 'done')
    )

    const getDayStatus = (dateStr) => {
        const active = menus.filter(m => m.targetDate === dateStr && m.stages.accountant_review?.status === 'active')
        const done = menus.filter(m => m.targetDate === dateStr && m.stages.accountant_review?.status === 'done')
        if (active.length === 0 && done.length === 0) return null
        if (active.length === 0) return 'final'
        return 'untouched'
    }

    const handleSave = (menuId, prices) => {
        const menu = menus.find(m => m.id === menuId)
        menu.ingredients.forEach((_, i) => {
            setMaxPrice(menuId, i, parseFloat(prices[i]))
        })
        verifyStage(menuId, 'accountant_review', user.name)
        toast.success('Harga max disimpan! Diteruskan ke SCD.')
        setSelectedMenu(null)
    }

    const today = new Date().toISOString().split('T')[0]

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <BadgeDollarSign size={24} /> Financial Vetting
                </h2>
                <p className="text-sm text-tertiary/60 mt-1">Klik tanggal dengan menu untuk menetapkan harga maksimum bahan</p>
            </div>

            {/* Summary chips */}
            <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 flex items-center gap-1.5">
                    <AlertCircle size={11} /> {pendingMenus.length} Menunggu Vetting
                </span>
                <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200 flex items-center gap-1.5">
                    <CheckCircle2 size={11} /> {doneMenus.length} Selesai
                </span>
            </div>

            {/* Calendar */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={prevMonth} className="btn-secondary p-2"><ChevronLeft size={18} /></button>
                    <h3 className="text-lg font-bold text-primary">{new Date(currentYear, currentMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={nextMonth} className="btn-secondary p-2"><ChevronRight size={18} /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS.map(d => <div key={d} className="text-center text-xs font-bold uppercase tracking-wide text-tertiary/50 py-2">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const dateStr = formatDate(currentYear, currentMonth, day)
                        const dayMenus = getMenusForDate(dateStr)
                        const status = getDayStatus(dateStr)
                        const isToday = dateStr === today

                        const cellStyle = !status ? 'bg-white text-tertiary/30 border-gray-100 cursor-default'
                            : status === 'final' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 cursor-pointer'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 cursor-pointer'

                        return (
                            <button key={day}
                                onClick={() => {
                                    if (!status) return
                                    const first = dayMenus.find(m => m.stages.accountant_review?.status === 'active')
                                    if (first) setSelectedMenu(first)
                                }}
                                className={clsx('relative p-2 rounded-xl text-sm font-semibold transition-all border min-h-[64px] flex flex-col items-start justify-between gap-1',
                                    cellStyle, isToday && 'ring-2 ring-[#327169]/40')}>
                                <span className={clsx('font-bold text-xs', isToday && 'underline')}>{day}</span>
                                <div className="flex items-center justify-between w-full">
                                    {status && <span className="text-[9px] font-bold">{dayMenus.length} menu</span>}
                                    {status === 'final' && <CheckCircle2 size={12} className="ml-auto" />}
                                    {status === 'untouched' && <AlertCircle size={12} className="ml-auto" />}
                                </div>
                            </button>
                        )
                    })}
                </div>
                <div className="mt-5 pt-4 border-t flex items-center gap-3 text-xs" style={{ borderColor: '#f3f4f6' }}>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold"><AlertCircle size={10} /> Belum Divetting</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-semibold"><CheckCircle2 size={10} /> Selesai</span>
                    <p className="ml-auto text-tertiary/40">Klik tanggal berwarna untuk vetting</p>
                </div>
            </div>

            {/* Also show pending list below calendar for easy access */}
            {pendingMenus.length > 0 && (
                <div className="card">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-tertiary/50 mb-3">Antrian Vetting ({pendingMenus.length})</h3>
                    <div className="space-y-2">
                        {pendingMenus.map(menu => (
                            <button key={menu.id} onClick={() => setSelectedMenu(menu)}
                                className="w-full p-3 rounded-xl border-2 text-left transition-all hover:border-[#327169] hover:bg-[#f0fafa] border-gray-100 group">
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <p className="font-bold text-sm text-[#327169]">{menu.name}</p>
                                        <p className="text-xs text-tertiary/60 mt-0.5">{menu.targetDate} • {menu.ingredients.length} bahan • Est. {formatRp(menu.estimatedCost || 0)}</p>
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1 shrink-0">
                                        <AlertCircle size={9} /> Klik →
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Vetting Modal */}
            {selectedMenu && (
                <VettingModal
                    menu={selectedMenu}
                    onClose={() => setSelectedMenu(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    )
}
