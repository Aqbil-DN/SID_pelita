import React, { useState } from 'react'
import { ListChecks, Plus, Save, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../store/authStore'
import useWorkflowStore from '../store/workflowStore'
import { UNITS } from '../lib/constants'
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

export default function IngredientMappingPage() {
    const { user } = useAuthStore()
    const { menus, setIngredients, verifyStage } = useWorkflowStore()
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedMenu, setSelectedMenu] = useState(null)
    const [rows, setRows] = useState([])

    const { firstDay, daysInMonth } = getMonthData(currentYear, currentMonth)

    const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else setCurrentMonth(m => m - 1) }
    const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else setCurrentMonth(m => m + 1) }

    // Menus available for ingredient mapping
    const menusForDate = selectedDate
        ? menus.filter(m => m.targetDate === selectedDate && m.stages.ingredient_mapping?.status === 'active')
        : []

    const selectMenu = (menu) => {
        setSelectedMenu(menu)
        setRows(menu.ingredients.length > 0
            ? menu.ingredients.map(ing => ({ name: ing.name, quantity: ing.quantity, unit: ing.unit }))
            : [{ name: '', quantity: '', unit: 'kg' }]
        )
    }

    const addRow = () => setRows([...rows, { name: '', quantity: '', unit: 'kg' }])
    const removeRow = (idx) => setRows(rows.filter((_, i) => i !== idx))
    const updateRow = (idx, field, val) => setRows(rows.map((r, i) => i === idx ? { ...r, [field]: val } : r))

    const handleSubmit = (e) => {
        e.preventDefault()
        const valid = rows.filter(r => r.name.trim() && r.quantity)
        if (valid.length === 0) { toast.error('Minimal 1 bahan harus diisi!'); return }

        const ingredients = valid.map(r => ({
            name: r.name.trim(),
            quantity: parseFloat(r.quantity),
            unit: r.unit,
            maxPrice: null,
        }))

        setIngredients(selectedMenu.id, ingredients)
        verifyStage(selectedMenu.id, 'ingredient_mapping', user.name)
        toast.success('Bahan berhasil disimpan! Diteruskan ke Nutritionist untuk review.')
        setSelectedMenu(null)
        setRows([])
    }

    const getMenuCountForDay = (day) => {
        const dateStr = formatDate(currentYear, currentMonth, day)
        return menus.filter(m => m.targetDate === dateStr && m.stages.ingredient_mapping?.status === 'active').length
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <ListChecks size={24} /> Ingredient Mapping
                </h2>
                <p className="text-sm text-tertiary/60 mt-1">Pilih tanggal lalu input bahan untuk setiap menu</p>
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
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map(d => <div key={d} className="text-center text-xs font-bold uppercase tracking-wide text-tertiary/50 py-2">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1
                            const dateStr = formatDate(currentYear, currentMonth, day)
                            const count = getMenuCountForDay(day)
                            const isSelected = selectedDate === dateStr
                            return (
                                <button
                                    key={day}
                                    onClick={() => { setSelectedDate(dateStr); setSelectedMenu(null) }}
                                    className={clsx(
                                        'relative p-3 rounded-xl text-sm font-semibold transition-all border',
                                        isSelected ? 'bg-primary text-white border-primary shadow-lg'
                                            : count > 0 ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                                                : 'bg-white text-tertiary border-gray-100 hover:border-accent hover:bg-gray-50'
                                    )}
                                >
                                    {day}
                                    {count > 0 && <span className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full bg-orange-500 text-white">{count}</span>}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Right panel */}
                <div className="space-y-4">
                    {selectedDate && !selectedMenu && (
                        <div className="card">
                            <h3 className="font-bold text-primary text-sm mb-3 flex items-center gap-2">
                                <Calendar size={16} />
                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </h3>
                            {menusForDate.length === 0 ? (
                                <p className="text-sm text-gray-400 italic py-6 text-center">Tidak ada menu yang perlu di-mapping pada tanggal ini</p>
                            ) : (
                                <div className="space-y-2">
                                    {menusForDate.map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => selectMenu(m)}
                                            className="w-full p-3 rounded-xl border border-gray-100 hover:border-primary hover:bg-accent-light/20 transition-all text-left"
                                        >
                                            <p className="font-bold text-sm text-primary">{m.name}</p>
                                            <p className="text-xs text-tertiary/60 mt-0.5">{m.description}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedMenu && (
                        <div className="card">
                            <h4 className="font-bold text-primary text-sm mb-1">{selectedMenu.name}</h4>
                            <p className="text-xs text-tertiary/60 mb-4">Input bahan — 1 Process per Tanggal</p>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                {rows.map((row, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <input value={row.name} onChange={e => updateRow(idx, 'name', e.target.value)} placeholder="Nama bahan" className="input-field flex-1 text-sm" />
                                        <input value={row.quantity} onChange={e => updateRow(idx, 'quantity', e.target.value)} type="number" placeholder="Qty" className="input-field w-20 text-sm" />
                                        <select value={row.unit} onChange={e => updateRow(idx, 'unit', e.target.value)} className="input-field w-24 text-sm">
                                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                        {rows.length > 1 && <button type="button" onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>}
                                    </div>
                                ))}
                                <button type="button" onClick={addRow} className="btn-secondary w-full justify-center text-xs"><Plus size={14} /> Tambah Bahan</button>
                                <button type="submit" className="btn-primary w-full justify-center"><Save size={16} /> Simpan & Kirim</button>
                            </form>
                        </div>
                    )}

                    {!selectedDate && (
                        <div className="card text-center py-12">
                            <Calendar size={40} className="mx-auto text-accent mb-3" />
                            <p className="text-sm text-tertiary/60">Pilih tanggal di kalender</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
