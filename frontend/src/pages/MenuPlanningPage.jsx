import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Save, UtensilsCrossed, Calendar, Flame, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../store/authStore'
import useWorkflowStore from '../store/workflowStore'
import { DEMO_BENEFICIARIES, DEMO_SCHOOLS } from '../lib/constants'
import clsx from 'clsx'

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function getMonthData(year, month) {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
}

function formatDate(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function MenuPlanningPage() {
    const { user } = useAuthStore()
    const { menus, addMenu } = useWorkflowStore()
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [selectedDate, setSelectedDate] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const { register, handleSubmit, reset, formState: { errors } } = useForm()

    const { firstDay, daysInMonth } = getMonthData(currentYear, currentMonth)

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
        else setCurrentMonth(m => m - 1)
    }
    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
        else setCurrentMonth(m => m + 1)
    }

    const menusForDate = selectedDate ? menus.filter(m => m.targetDate === selectedDate) : []
    const beneficiariesForDate = selectedDate
        ? DEMO_BENEFICIARIES.filter(b => b.deliveryDate === selectedDate).map(b => ({
            ...b,
            school: DEMO_SCHOOLS.find(s => s.id === b.schoolId),
        }))
        : []

    const onSubmit = (data) => {
        const newMenu = {
            name: data.name,
            description: data.description,
            targetDate: selectedDate,
            calories: parseInt(data.calories) || 0,
            currentStage: 1,
            status: 'in_progress',
            createdBy: user.name,
            createdAt: new Date().toISOString(),
            stages: {
                planning: { completedAt: new Date().toISOString(), processedBy: user.name, status: 'done' },
                ingredient_mapping: { completedAt: null, processedBy: null, status: 'active' },
                nutritionist_review: { completedAt: null, processedBy: null, status: 'pending' },
                accountant_review: { completedAt: null, processedBy: null, status: 'pending' },
                procurement: { completedAt: null, processedBy: null, status: 'pending' },
                receiving: { completedAt: null, processedBy: null, status: 'pending' },
                production: { completedAt: null, processedBy: null, status: 'pending' },
                distributed: { completedAt: null, processedBy: null, status: 'pending' },
            },
            ingredients: [],
            vendors: [],
            receiving: [],
            productionStage: null,
            estimatedCost: 0,
        }
        addMenu(newMenu)
        toast.success('Menu berhasil ditambahkan!')
        reset()
        setShowForm(false)
    }

    const getMenuCountForDay = (day) => {
        const dateStr = formatDate(currentYear, currentMonth, day)
        return menus.filter(m => m.targetDate === dateStr).length
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                        <UtensilsCrossed size={24} /> Menu Planning
                    </h2>
                    <p className="text-sm text-tertiary/60 mt-1">Klik tanggal untuk melihat / menambah menu</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2 card">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={prevMonth} className="btn-secondary p-2"><ChevronLeft size={18} /></button>
                        <h3 className="text-lg font-bold text-primary">
                            {new Date(currentYear, currentMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button onClick={nextMonth} className="btn-secondary p-2"><ChevronRight size={18} /></button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map(d => (
                            <div key={d} className="text-center text-xs font-bold uppercase tracking-wide text-tertiary/50 py-2">{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1
                            const dateStr = formatDate(currentYear, currentMonth, day)
                            const count = getMenuCountForDay(day)
                            const isSelected = selectedDate === dateStr
                            const hasBeneficiary = DEMO_BENEFICIARIES.some(b => b.deliveryDate === dateStr)
                            return (
                                <button
                                    key={day}
                                    onClick={() => { setSelectedDate(dateStr); setShowForm(false) }}
                                    className={clsx(
                                        'relative p-3 rounded-xl text-sm font-semibold transition-all border',
                                        isSelected
                                            ? 'bg-primary text-white border-primary shadow-lg'
                                            : count > 0
                                                ? 'bg-accent-light/50 text-primary border-accent hover:bg-accent-light'
                                                : 'bg-white text-tertiary border-gray-100 hover:border-accent hover:bg-gray-50'
                                    )}
                                >
                                    {day}
                                    {count > 0 && (
                                        <span className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full bg-primary text-white">
                                            {count}
                                        </span>
                                    )}
                                    {hasBeneficiary && (
                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Right panel: date details */}
                <div className="space-y-4">
                    {selectedDate ? (
                        <>
                            <div className="card">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-primary text-sm flex items-center gap-2">
                                        <Calendar size={16} />
                                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </h3>
                                </div>

                                {/* Beneficiary info */}
                                {beneficiariesForDate.length > 0 && (
                                    <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(163,199,199,0.15)' }}>
                                        <p className="text-xs font-bold uppercase tracking-wide text-primary mb-2">Data Sekolah & Porsi</p>
                                        {beneficiariesForDate.map(b => (
                                            <div key={b.id} className="flex items-center justify-between text-xs py-1.5 border-b border-accent/20 last:border-0">
                                                <div>
                                                    <p className="font-semibold text-tertiary">{b.school?.name}</p>
                                                    <p className="text-tertiary/50">{b.school?.type}</p>
                                                </div>
                                                <span className="font-bold text-primary">{b.portionCount} porsi</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Menus for this date */}
                                <p className="text-xs font-bold uppercase tracking-wide text-tertiary/50 mb-2">Menu ({menusForDate.length})</p>
                                {menusForDate.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic py-4 text-center">Belum ada menu untuk tanggal ini</p>
                                ) : (
                                    <div className="space-y-2">
                                        {menusForDate.map(m => (
                                            <div key={m.id} className="p-3 rounded-xl border border-gray-100 hover:border-accent transition-colors">
                                                <p className="font-bold text-sm text-primary">{m.name}</p>
                                                {m.description && <p className="text-xs text-tertiary/60 mt-1">{m.description}</p>}
                                                <div className="flex items-center gap-3 mt-2">
                                                    {m.calories > 0 && (
                                                        <span className="badge-primary"><Flame size={10} /> {m.calories} kcal</span>
                                                    )}
                                                    <span className="badge-gray text-[10px]">Stage {m.currentStage}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={() => setShowForm(!showForm)}
                                    className="btn-primary w-full mt-4 justify-center"
                                >
                                    <Plus size={16} /> Tambah Menu
                                </button>
                            </div>

                            {/* Add menu form */}
                            {showForm && (
                                <div className="card">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-primary text-sm">Menu Baru</h4>
                                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-red-400"><X size={16} /></button>
                                    </div>
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        <div>
                                            <label className="label">Nama Menu</label>
                                            <input {...register('name', { required: 'Wajib diisi' })} className="input-field" placeholder="Contoh: Nasi Ayam Bakar" />
                                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                                        </div>
                                        <div>
                                            <label className="label">Kalori (kcal)</label>
                                            <input {...register('calories')} type="number" className="input-field" placeholder="650" />
                                        </div>
                                        <div>
                                            <label className="label">Deskripsi / Catatan Nutrisi</label>
                                            <textarea {...register('description')} rows={3} className="input-field" placeholder="Keterangan menu dan informasi nutrisi..." />
                                        </div>
                                        <button type="submit" className="btn-primary w-full justify-center">
                                            <Save size={16} /> Simpan Menu
                                        </button>
                                    </form>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="card text-center py-12">
                            <Calendar size={40} className="mx-auto text-accent mb-3" />
                            <p className="text-sm text-tertiary/60">Pilih tanggal di kalender untuk mulai</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
