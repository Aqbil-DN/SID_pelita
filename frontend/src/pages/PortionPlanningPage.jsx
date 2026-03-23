import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
    ChevronLeft, ChevronRight, Plus, X, Edit2, Trash2,
    Save, Clock, Users, Calculator, CheckCircle,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { DEMO_SCHOOLS } from '../lib/constants'
import { usePortionPlanningStore } from '../store/portionPlanningStore'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function toDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseKey(key) {
    const [y, m, d] = key.split('-').map(Number)
    return { year: y, month: m - 1, day: d }
}

function formatMonthYear(date) {
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

function formatDateLabel(dateKey) {
    const { year, month, day } = parseKey(dateKey)
    return new Date(year, month, day).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
}

// ─── Pill / tag component inside calendar cells ───────────────────────────────

function PlanTag({ name }) {
    // Short abbreviation (up to first 10 chars)
    const short = name.length > 12 ? name.slice(0, 10) + '…' : name
    return (
        <span
            style={{ backgroundColor: '#327169', color: '#fff' }}
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full leading-tight inline-block max-w-full truncate"
            title={name}
        >
            {short}
        </span>
    )
}

// ─── Calendar Cell ────────────────────────────────────────────────────────────

function CalendarCell({ day, dateKey, isToday, isCurrentMonth, plansOnDate, onClick }) {
    const totalPortions = plansOnDate.reduce((s, p) => s + Number(p.portionCount), 0)
    const schoolCount = plansOnDate.length

    return (
        <div
            onClick={isCurrentMonth ? onClick : undefined}
            className={[
                'relative flex flex-col gap-0.5 rounded-xl p-1.5 min-h-[90px] transition-all duration-150 select-none border',
                isCurrentMonth
                    ? 'cursor-pointer hover:shadow-md hover:border-[#438c81]'
                    : 'opacity-30 cursor-default',
                isToday
                    ? 'border-[#a3c7c7] bg-[#a3c7c7]/20 ring-2 ring-[#a3c7c7]/50'
                    : 'border-transparent bg-white hover:bg-[#f0fafa]',
                plansOnDate.length > 0 && isCurrentMonth && !isToday
                    ? 'bg-[#f7fdfd]'
                    : '',
            ].join(' ')}
        >
            {/* Day number */}
            <span
                className={[
                    'text-xs font-bold self-end leading-none w-6 h-6 flex items-center justify-center rounded-full',
                    isToday
                        ? 'bg-[#a3c7c7] text-white'
                        : isCurrentMonth ? 'text-[#4d4d4d]' : 'text-gray-300',
                ].join(' ')}
            >
                {day}
            </span>

            {/* Plan tags */}
            <div className="flex flex-col gap-0.5 mt-0.5 overflow-hidden">
                {plansOnDate.slice(0, 3).map(p => {
                    const school = DEMO_SCHOOLS.find(s => s.id === p.schoolId)
                    return (
                        <PlanTag key={p.id} name={school?.name ?? `PM #${p.schoolId}`} />
                    )
                })}
                {plansOnDate.length > 3 && (
                    <span className="text-[9px] text-[#327169] font-semibold pl-1">
                        +{plansOnDate.length - 3} lainnya
                    </span>
                )}
            </div>

            {/* Summary footer */}
            {schoolCount > 0 && (
                <div className="mt-auto pt-0.5">
                    <p className="text-[9px] font-semibold text-[#327169] leading-tight truncate">
                        {schoolCount} PM · {totalPortions.toLocaleString('id-ID')} porsi
                    </p>
                </div>
            )}
        </div>
    )
}

// ─── Modal — Entry Form (Add / Edit) ─────────────────────────────────────────

const EMPTY_FORM = { schoolId: '', portionCount: '', arrivalTime: '' }

function EntryForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState(initial ?? EMPTY_FORM)
    const [schools, setSchools] = useState(DEMO_SCHOOLS)

    // Try to load schools that may have been added in BeneficiaryManagementPage
    // (they live in local component state there, so we fall back to DEMO_SCHOOLS)

    const isValid = form.schoolId !== '' && Number(form.portionCount) > 0

    const handleSave = () => {
        if (!isValid) return
        onSave({
            schoolId: Number(form.schoolId),
            portionCount: Number(form.portionCount),
            arrivalTime: form.arrivalTime,
        })
    }

    return (
        <div className="bg-[#f7fdfd] rounded-xl border border-[#a3c7c7]/40 p-4 space-y-3 mt-2">
            {/* Select PM */}
            <div>
                <label className="label text-xs">Pilih PM (Penerima Manfaat) <span className="text-red-500">*</span></label>
                <select
                    value={form.schoolId}
                    onChange={e => setForm(f => ({ ...f, schoolId: e.target.value }))}
                    className="input-field text-sm"
                >
                    <option value="">— Pilih Penerima Manfaat —</option>
                    {schools.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Portion Count */}
                <div>
                    <label className="label text-xs">Total Portions Needed <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        min="1"
                        value={form.portionCount}
                        onChange={e => setForm(f => ({ ...f, portionCount: e.target.value }))}
                        className="input-field text-sm"
                        placeholder="e.g. 350"
                    />
                </div>

                {/* Arrival Time */}
                <div>
                    <label className="label text-xs">Expected Arrival at Location</label>
                    <input
                        type="time"
                        value={form.arrivalTime}
                        onChange={e => setForm(f => ({ ...f, arrivalTime: e.target.value }))}
                        className="input-field text-sm"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                <button
                    onClick={handleSave}
                    disabled={!isValid}
                    style={{ backgroundColor: isValid ? '#438c81' : undefined }}
                    className={`btn-primary text-xs py-1.5 px-4 ${!isValid ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                    <Save size={13} /> Simpan
                </button>
                <button
                    onClick={onCancel}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-[#4d4d4d]/40 text-[#4d4d4d] text-xs font-semibold hover:bg-gray-100 transition-colors"
                >
                    <X size={13} /> Batal
                </button>
            </div>
        </div>
    )
}

// ─── Modal — Date Detail ──────────────────────────────────────────────────────

function DateModal({ dateKey, plans, onClose }) {
    const { addPlan, updatePlan, deletePlan } = usePortionPlanningStore()
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState(null)
    const backdropRef = useRef(null)

    // Close on backdrop click
    const handleBackdrop = (e) => {
        if (e.target === backdropRef.current) onClose()
    }

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    const handleAdd = (data) => {
        addPlan({ ...data, deliveryDate: dateKey })
        toast.success('Rencana porsi berhasil ditambahkan!')
        setShowForm(false)
    }

    const handleEdit = (data) => {
        updatePlan(editId, data)
        toast.success('Rencana porsi diperbarui!')
        setEditId(null)
    }

    const handleDelete = (id) => {
        deletePlan(id)
        toast.success('Rencana porsi dihapus.')
    }

    const plansForDate = plans.filter(p => p.deliveryDate === dateKey)

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdrop}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col"
                style={{ maxHeight: '90vh' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div
                    style={{ backgroundColor: '#327169' }}
                    className="flex items-center justify-between px-5 py-4"
                >
                    <div className="flex items-center gap-2.5 text-white">
                        <Calculator size={18} />
                        <div>
                            <p className="font-bold text-sm leading-tight">Rencana Porsi</p>
                            <p className="text-white/75 text-xs leading-tight mt-0.5">{formatDateLabel(dateKey)}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors rounded-lg p-1 hover:bg-white/10"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body — scrollable */}
                <div className="overflow-y-auto flex-1 p-5 space-y-4">

                    {/* Summary Banner */}
                    {plansForDate.length > 0 && (
                        <div
                            className="flex items-center gap-3 rounded-xl px-4 py-3"
                            style={{ backgroundColor: '#a3c7c7', color: '#1a5a52' }}
                        >
                            <CheckCircle size={16} />
                            <p className="text-xs font-semibold">
                                {plansForDate.length} PM terdaftar ·{' '}
                                {plansForDate.reduce((s, p) => s + Number(p.portionCount), 0).toLocaleString('id-ID')} total porsi
                            </p>
                        </div>
                    )}

                    {/* Entry list */}
                    {plansForDate.length === 0 && !showForm && (
                        <div className="text-center py-8 text-[#4d4d4d]/50">
                            <Users size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Belum ada rencana untuk tanggal ini.</p>
                        </div>
                    )}

                    {plansForDate.length > 0 && (
                        <div className="space-y-2">
                            {plansForDate.map(p => {
                                const school = DEMO_SCHOOLS.find(s => s.id === p.schoolId)
                                const isEditing = editId === p.id

                                if (isEditing) {
                                    return (
                                        <EntryForm
                                            key={p.id}
                                            initial={{
                                                schoolId: String(p.schoolId),
                                                portionCount: String(p.portionCount),
                                                arrivalTime: p.arrivalTime ?? '',
                                            }}
                                            onSave={handleEdit}
                                            onCancel={() => setEditId(null)}
                                        />
                                    )
                                }

                                return (
                                    <div
                                        key={p.id}
                                        className="flex items-start justify-between gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm hover:border-[#a3c7c7] transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-[#327169] truncate">{school?.name ?? `PM #${p.schoolId}`}</p>
                                            <p className="text-xs text-[#4d4d4d]/60 mt-0.5 truncate">{school?.type}</p>
                                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#f0fafa] text-[#327169] px-2 py-0.5 rounded-full">
                                                    <Users size={10} /> {Number(p.portionCount).toLocaleString('id-ID')} porsi
                                                </span>
                                                {p.arrivalTime && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-[#4d4d4d]/60">
                                                        <Clock size={10} /> {p.arrivalTime}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <button
                                                onClick={() => { setEditId(p.id); setShowForm(false) }}
                                                className="p-1.5 rounded-lg text-[#438c81] hover:bg-[#438c81]/10 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Add New Entry form */}
                    {showForm && (
                        <EntryForm
                            onSave={handleAdd}
                            onCancel={() => setShowForm(false)}
                        />
                    )}

                    {/* Add New Entry button */}
                    {!showForm && editId === null && (
                        <button
                            onClick={() => setShowForm(true)}
                            style={{ borderColor: '#438c81', color: '#438c81' }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed text-sm font-semibold hover:bg-[#438c81]/5 transition-colors"
                        >
                            <Plus size={15} /> Tambah Entri Baru
                        </button>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg border border-[#4d4d4d]/30 text-[#4d4d4d] text-sm font-semibold hover:bg-gray-100 transition-colors"
                    >
                        <X size={14} /> Tutup
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PortionPlanningPage() {
    const plans = usePortionPlanningStore(s => s.plans)
    const today = new Date()

    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
    const [selectedDateKey, setSelectedDateKey] = useState(null)

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
    const goToday   = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))

    // Build calendar grid
    const calendarCells = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay() // 0=Sun
        // Convert Sun=0 to Mon-based: Mon=0 … Sun=6
        const startOffset = (firstDay + 6) % 7
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const daysInPrevMonth = new Date(year, month, 0).getDate()

        const cells = []

        // Previous month trailing days
        for (let i = startOffset - 1; i >= 0; i--) {
            const d = daysInPrevMonth - i
            cells.push({ day: d, dateKey: toDateKey(year, month - 1, d), isCurrentMonth: false })
        }

        // Current month
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push({ day: d, dateKey: toDateKey(year, month, d), isCurrentMonth: true })
        }

        // Next month leading days
        const remainder = cells.length % 7
        if (remainder !== 0) {
            let d = 1
            while (cells.length % 7 !== 0) {
                cells.push({ day: d++, dateKey: toDateKey(year, month + 1, d - 1), isCurrentMonth: false })
            }
        }

        return cells
    }, [year, month])

    // Group plans by date key for O(1) lookup
    const plansByDate = useMemo(() => {
        const map = {}
        for (const plan of plans) {
            if (!map[plan.deliveryDate]) map[plan.deliveryDate] = []
            map[plan.deliveryDate].push(plan)
        }
        return map
    }, [plans])

    const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate())

    // Monthly summary stats
    const monthlyPlans = plans.filter(p => {
        const [py, pm] = p.deliveryDate.split('-').map(Number)
        return py === year && pm === month + 1
    })
    const totalMonthlyPortions = monthlyPlans.reduce((s, p) => s + Number(p.portionCount), 0)
    const activeDays = new Set(monthlyPlans.map(p => p.deliveryDate)).size

    return (
        <div className="flex flex-col gap-5 h-full">

            {/* ─── Page Header ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-extrabold text-[#327169] flex items-center gap-2">
                        <Calculator size={24} /> Portion Planning
                    </h2>
                    <p className="text-sm text-[#4d4d4d]/60 mt-0.5">
                        Klik tanggal pada kalender untuk menambah atau mengelola rencana porsi
                    </p>
                </div>

                {/* Stats chips */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-[#327169]/10 text-[#327169] px-3 py-1.5 rounded-full text-xs font-bold">
                        <Users size={12} /> {monthlyPlans.length} Entri Bulan Ini
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#a3c7c7]/30 text-[#327169] px-3 py-1.5 rounded-full text-xs font-bold">
                        <Calculator size={12} /> {totalMonthlyPortions.toLocaleString('id-ID')} Porsi
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#438c81]/10 text-[#438c81] px-3 py-1.5 rounded-full text-xs font-bold">
                        <Clock size={12} /> {activeDays} Hari Aktif
                    </div>
                </div>
            </div>

            {/* ─── Calendar Card ────────────────────────────────────────────── */}
            <div className="card flex-1 p-0 overflow-hidden flex flex-col" style={{ minHeight: 0 }}>

                {/* Calendar Header */}
                <div
                    style={{ backgroundColor: '#327169' }}
                    className="flex items-center justify-between px-5 py-3.5 rounded-t-2xl"
                >
                    <button
                        onClick={prevMonth}
                        className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-3">
                        <h3 className="text-white font-bold text-base capitalize">
                            {formatMonthYear(currentDate)}
                        </h3>
                        <button
                            onClick={goToday}
                            className="text-white/70 hover:text-white text-xs font-semibold border border-white/30 px-2.5 py-0.5 rounded-full hover:bg-white/10 transition-colors"
                        >
                            Hari Ini
                        </button>
                    </div>

                    <button
                        onClick={nextMonth}
                        className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Weekday labels */}
                <div className="grid grid-cols-7 bg-[#327169]/8 border-b border-gray-100">
                    {WEEKDAYS.map(d => (
                        <div
                            key={d}
                            className="text-center text-[10px] font-bold uppercase tracking-wider py-2 text-[#327169]"
                        >
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1.5 p-3 flex-1 auto-rows-fr" style={{ overflowY: 'auto' }}>
                    {calendarCells.map(({ day, dateKey, isCurrentMonth }) => (
                        <CalendarCell
                            key={dateKey}
                            day={day}
                            dateKey={dateKey}
                            isToday={dateKey === todayKey}
                            isCurrentMonth={isCurrentMonth}
                            plansOnDate={plansByDate[dateKey] ?? []}
                            onClick={() => setSelectedDateKey(dateKey)}
                        />
                    ))}
                </div>

                {/* Legend */}
                <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#4d4d4d]/60">
                        <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#a3c7c7' }} />
                        Hari Ini
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#4d4d4d]/60">
                        <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: '#327169' }} />
                        Ada Rencana Porsi
                    </div>
                    <p className="text-[10px] text-[#4d4d4d]/40 ml-auto">
                        Klik sel tanggal untuk menambah / mengedit rencana
                    </p>
                </div>
            </div>

            {/* ─── Date Modal ───────────────────────────────────────────────── */}
            {selectedDateKey && (
                <DateModal
                    dateKey={selectedDateKey}
                    plans={plans}
                    onClose={() => setSelectedDateKey(null)}
                />
            )}
        </div>
    )
}
