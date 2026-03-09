import React, { useState } from 'react'
import { ListChecks, Plus, Save, Trash2, Calendar, ChevronLeft, ChevronRight, X, Check } from 'lucide-react'
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

// ─── Centered ingredient mapping modal ─────────────────────────────────────
function IngredientModal({ date, menus, onClose, onSave, user }) {
    const [selectedMenu, setSelectedMenu] = useState(null)
    const [rows, setRows] = useState([])

    const selectMenu = (menu) => {
        setSelectedMenu(menu)
        setRows(menu.ingredients.length > 0
            ? menu.ingredients.map(ing => ({ name: ing.name, quantity: ing.quantity, unit: ing.unit, calories: ing.calories || '' }))
            : [{ name: '', quantity: '', unit: 'kg', calories: '' }]
        )
    }

    const addRow = () => setRows(r => [...r, { name: '', quantity: '', unit: 'kg', calories: '' }])
    const removeRow = (idx) => setRows(r => r.filter((_, i) => i !== idx))
    const updateRow = (idx, field, val) => setRows(r => r.map((row, i) => i === idx ? { ...row, [field]: val } : row))

    const handleSubmit = (e) => {
        e.preventDefault()
        const valid = rows.filter(r => r.name.trim() && r.quantity)
        if (valid.length === 0) { toast.error('Minimal 1 bahan harus diisi!'); return }
        const ingredients = valid.map(r => ({
            name: r.name.trim(), quantity: parseFloat(r.quantity),
            unit: r.unit, calories: r.calories ? parseFloat(r.calories) : null, maxPrice: null,
        }))
        onSave(selectedMenu.id, ingredients, user.name)
        setSelectedMenu(null)
        setRows([])
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex-shrink-0 px-6 py-4" style={{ backgroundColor: 'rgba(163,199,199,0.12)', borderBottom: '1px solid #e5e7eb' }}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#438c81' }}>Ingredient Mapping</p>
                            <h3 className="text-lg font-extrabold" style={{ color: '#327169' }}>
                                {new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </h3>
                            <p className="text-xs mt-0.5" style={{ color: 'rgba(77,77,77,0.5)' }}>{menus.length} menu tersedia</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-400">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {/* Step 1: Pick menu */}
                    {!selectedMenu && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'rgba(77,77,77,0.45)' }}>Pilih Menu</p>
                            {menus.length === 0 ? (
                                <p className="text-sm text-gray-400 italic text-center py-6">Tidak ada menu yang perlu di-mapping pada tanggal ini</p>
                            ) : (
                                <div className="space-y-2">
                                    {menus.map(m => (
                                        <button key={m.id} onClick={() => selectMenu(m)}
                                            className="w-full p-3.5 rounded-xl border-2 text-left transition-all hover:border-primary hover:bg-accent-light/20"
                                            style={{ borderColor: '#e5e7eb' }}>
                                            <p className="font-bold text-sm" style={{ color: '#327169' }}>{m.name}</p>
                                            {m.description && <p className="text-xs mt-0.5" style={{ color: 'rgba(77,77,77,0.5)' }}>{m.description}</p>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Input ingredients */}
                    {selectedMenu && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(77,77,77,0.45)' }}>Input Bahan</p>
                                    <p className="font-bold text-sm" style={{ color: '#327169' }}>{selectedMenu.name}</p>
                                </div>
                                <button onClick={() => { setSelectedMenu(null); setRows([]) }}
                                    className="text-xs font-bold px-3 py-1.5 rounded-lg border" style={{ borderColor: '#e5e7eb', color: '#4d4d4d' }}>
                                    ← Ganti Menu
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                {/* Column headers */}
                                <div className="grid gap-2 text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: 'rgba(77,77,77,0.35)', gridTemplateColumns: '1fr 5rem 6rem 5rem auto' }}>
                                    <span>Nama Bahan</span><span>Qty</span><span>Satuan</span><span>kcal</span><span></span>
                                </div>
                                {rows.map((row, idx) => (
                                    <div key={idx} className="grid items-center gap-2" style={{ gridTemplateColumns: '1fr 5rem 6rem 5rem auto' }}>
                                        <input value={row.name} onChange={e => updateRow(idx, 'name', e.target.value)}
                                            placeholder="Nama bahan" className="input-field text-sm" />
                                        <input value={row.quantity} onChange={e => updateRow(idx, 'quantity', e.target.value)}
                                            type="number" placeholder="0" className="input-field text-sm" />
                                        <select value={row.unit} onChange={e => updateRow(idx, 'unit', e.target.value)} className="input-field text-sm">
                                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                        <input value={row.calories} onChange={e => updateRow(idx, 'calories', e.target.value)}
                                            type="number" placeholder="kcal" className="input-field text-sm" />
                                        {rows.length > 1 && (
                                            <button type="button" onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-600 p-1">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={addRow} className="btn-secondary w-full justify-center text-xs">
                                    <Plus size={14} /> Tambah Bahan
                                </button>
                                <button type="submit" className="btn-primary w-full justify-center">
                                    <Save size={16} /> Simpan & Kirim ke Nutritionist
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function IngredientMappingPage() {
    const { user } = useAuthStore()
    const { menus, setIngredients, verifyStage } = useWorkflowStore()
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [modalDate, setModalDate] = useState(null)

    const { firstDay, daysInMonth } = getMonthData(currentYear, currentMonth)

    const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else setCurrentMonth(m => m - 1) }
    const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else setCurrentMonth(m => m + 1) }

    const getMenusForDate = (dateStr) =>
        menus.filter(m => m.targetDate === dateStr && m.stages.ingredient_mapping?.status === 'active')

    const getMenuCountForDay = (day) =>
        getMenusForDate(formatDate(currentYear, currentMonth, day)).length

    const handleSave = (menuId, ingredients, processedBy) => {
        setIngredients(menuId, ingredients)
        verifyStage(menuId, 'ingredient_mapping', processedBy)
        toast.success('Bahan disimpan! Diteruskan ke Nutritionist.')
    }

    const menusForModal = modalDate ? getMenusForDate(modalDate) : []

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <ListChecks size={24} /> Ingredient Mapping
                </h2>
                <p className="text-sm text-tertiary/60 mt-1">Klik tanggal untuk input bahan setiap menu</p>
            </div>

            <div className="card">
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
                        return (
                            <button key={day}
                                onClick={() => count > 0 ? setModalDate(dateStr) : null}
                                className={clsx(
                                    'relative p-3 rounded-xl text-sm font-semibold transition-all border',
                                    count > 0
                                        ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 cursor-pointer'
                                        : 'bg-white text-tertiary/30 border-gray-100 cursor-default'
                                )}>
                                {day}
                                {count > 0 && (
                                    <span className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full bg-orange-500 text-white">{count}</span>
                                )}
                            </button>
                        )
                    })}
                </div>

                <div className="mt-5 pt-4 border-t flex items-center gap-3 text-xs" style={{ borderColor: '#f3f4f6' }}>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span> Ada Menu Pending
                    </span>
                    <span className="text-tertiary/40">Klik tanggal berwarna untuk input bahan</span>
                </div>
            </div>

            {/* Modal */}
            {modalDate && (
                <IngredientModal
                    date={modalDate}
                    menus={menusForModal}
                    onClose={() => setModalDate(null)}
                    onSave={handleSave}
                    user={user}
                />
            )}
        </div>
    )
}
