import React, { useState } from 'react'
import { ListChecks, Plus, Save, Trash2, ChevronLeft, ChevronRight, X, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../store/authStore'
import useWorkflowStore from '../store/workflowStore'
import { UNITS } from '../lib/constants'
import clsx from 'clsx'
import ConfirmationModal from '../components/ConfirmationModal'

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

function getMonthData(year, month) {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
}
function formatDate(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function getDayStatus(menus, dateStr, draftDates) {
    const active = menus.filter(m => m.targetDate === dateStr && m.stages.ingredient_mapping?.status === 'active')
    const done = menus.filter(m => m.targetDate === dateStr && m.stages.ingredient_mapping?.status === 'done')
    if (active.length === 0 && done.length === 0) return null
    if (active.length === 0 && done.length > 0) return 'final'
    if (draftDates.has(dateStr)) return 'draft'
    return 'untouched'
}

function IngredientModal({ date, menus, onClose, onSave, user, onMarkDraft }) {
    const [selectedMenu, setSelectedMenu] = useState(null)
    const [rows, setRows] = useState([])
    const [showConfirm, setShowConfirm] = useState(false)

    const selectMenu = (menu) => {
        setSelectedMenu(menu)
        setRows(menu.ingredients.length > 0
            ? menu.ingredients.map(ing => ({ name: ing.name, quantity: ing.quantity, unit: ing.unit, calories: ing.calories || '' }))
            : [{ name: '', quantity: '', unit: 'kg', calories: '' }]
        )
        onMarkDraft(date)
    }

    const addRow = () => setRows(r => [...r, { name: '', quantity: '', unit: 'kg', calories: '' }])
    const removeRow = (idx) => setRows(r => r.filter((_, i) => i !== idx))
    const updateRow = (idx, field, val) => setRows(r => r.map((row, i) => i === idx ? { ...row, [field]: val } : row))

    const handleSubmitClick = (e) => {
        e.preventDefault()
        const valid = rows.filter(r => r.name.trim() && r.quantity)
        if (valid.length === 0) { toast.error('Minimal 1 bahan harus diisi!'); return }
        setShowConfirm(true)
    }

    const handleConfirmedSave = () => {
        const valid = rows.filter(r => r.name.trim() && r.quantity)
        const ingredients = valid.map(r => ({
            name: r.name.trim(), quantity: parseFloat(r.quantity),
            unit: r.unit, calories: r.calories ? parseFloat(r.calories) : null, maxPrice: null,
        }))
        onSave(selectedMenu.id, ingredients, user.name)
        setShowConfirm(false)
        setSelectedMenu(null)
        setRows([])
    }

    const pendingMenus = menus.filter(m => m.stages.ingredient_mapping?.status === 'active')
    const doneMenus = menus.filter(m => m.stages.ingredient_mapping?.status === 'done')

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="flex-shrink-0 px-6 py-4" style={{ backgroundColor: 'rgba(163,199,199,0.12)', borderBottom: '1px solid #e5e7eb' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#438c81' }}>Ingredient Mapping</p>
                                <h3 className="text-lg font-extrabold" style={{ color: '#327169' }}>
                                    {new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </h3>
                                <p className="text-xs mt-0.5" style={{ color: 'rgba(77,77,77,0.5)' }}>{menus.length} menu total</p>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-400"><X size={20} /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                        {doneMenus.length > 0 && !selectedMenu && (
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sudah Di-mapping</p>
                                {doneMenus.map(m => (
                                    <div key={m.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-100">
                                        <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                                        <span className="text-sm font-semibold text-green-700">{m.name}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!selectedMenu && (
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'rgba(77,77,77,0.45)' }}>Pilih Menu untuk Di-mapping</p>
                                {pendingMenus.length === 0 ? (
                                    <div className="text-center py-8">
                                        <CheckCircle2 size={36} className="mx-auto text-green-500 mb-2" />
                                        <p className="text-sm text-gray-400">Semua menu sudah di-mapping.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {pendingMenus.map(m => (
                                            <button key={m.id} onClick={() => selectMenu(m)}
                                                className="w-full p-3.5 rounded-xl border-2 text-left transition-all hover:border-[#327169] hover:bg-[#f0fafa]"
                                                style={{ borderColor: '#e5e7eb' }}>
                                                <div className="flex items-center justify-between gap-2">
                                                    <div>
                                                        <p className="font-bold text-sm" style={{ color: '#327169' }}>{m.name}</p>
                                                        {m.description && <p className="text-xs mt-0.5" style={{ color: 'rgba(77,77,77,0.5)' }}>{m.description}</p>}
                                                    </div>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0 flex items-center gap-1">
                                                        <AlertCircle size={9} /> Belum
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

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
                                <form onSubmit={handleSubmitClick} className="space-y-3">
                                    <div className="grid gap-2 text-[10px] font-bold uppercase tracking-wide px-1"
                                        style={{ color: 'rgba(77,77,77,0.35)', gridTemplateColumns: '1fr 5rem 6rem 5rem auto' }}>
                                        <span>Nama Bahan</span><span>Qty</span><span>Satuan</span><span>kcal</span><span></span>
                                    </div>
                                    {rows.map((row, idx) => (
                                        <div key={idx} className="grid items-center gap-2" style={{ gridTemplateColumns: '1fr 5rem 6rem 5rem auto' }}>
                                            <input value={row.name} onChange={e => updateRow(idx, 'name', e.target.value)} placeholder="Nama bahan" className="input-field text-sm" />
                                            <input value={row.quantity} onChange={e => updateRow(idx, 'quantity', e.target.value)} type="number" placeholder="0" className="input-field text-sm" />
                                            <select value={row.unit} onChange={e => updateRow(idx, 'unit', e.target.value)} className="input-field text-sm">
                                                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                            <input value={row.calories} onChange={e => updateRow(idx, 'calories', e.target.value)} type="number" placeholder="kcal" className="input-field text-sm" />
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

            <ConfirmationModal
                isOpen={showConfirm}
                message="Apakah Anda yakin ingin mensubmit daftar bahan ini ke Nutritionist?"
                confirmLabel="Ya, Kirim"
                onConfirm={handleConfirmedSave}
                onCancel={() => setShowConfirm(false)}
            />
        </>
    )
}

export default function IngredientMappingPage() {
    const { user } = useAuthStore()
    const { menus, setIngredients, verifyStage } = useWorkflowStore()
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [modalDate, setModalDate] = useState(null)
    const [draftDates, setDraftDates] = useState(new Set())

    const { firstDay, daysInMonth } = getMonthData(currentYear, currentMonth)
    const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else setCurrentMonth(m => m - 1) }
    const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else setCurrentMonth(m => m + 1) }
    const markDraft = (dateStr) => setDraftDates(prev => { const s = new Set(prev); s.add(dateStr); return s })

    const getMenusForDate = (dateStr) =>
        menus.filter(m => m.targetDate === dateStr && (m.stages.ingredient_mapping?.status === 'active' || m.stages.ingredient_mapping?.status === 'done'))

    const handleSave = (menuId, ingredients, processedBy) => {
        setIngredients(menuId, ingredients)
        verifyStage(menuId, 'ingredient_mapping', processedBy)
        toast.success('Bahan disimpan! Diteruskan ke Nutritionist.')
    }

    const today = new Date().toISOString().split('T')[0]

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2"><ListChecks size={24} /> Ingredient Mapping</h2>
                <p className="text-sm text-tertiary/60 mt-1">Klik tanggal untuk input bahan setiap menu</p>
            </div>

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
                        const status = getDayStatus(menus, dateStr, draftDates)
                        const isToday = dateStr === today

                        const cellStyle = !status ? 'bg-white text-tertiary/30 border-gray-100 cursor-default'
                            : status === 'final' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 cursor-pointer'
                            : status === 'draft' ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 cursor-pointer'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 cursor-pointer'

                        return (
                            <button key={day}
                                onClick={() => status ? setModalDate(dateStr) : null}
                                className={clsx('relative p-2 rounded-xl text-sm font-semibold transition-all border min-h-[64px] flex flex-col items-start justify-between gap-1',
                                    cellStyle, isToday && 'ring-2 ring-[#327169]/40')}>
                                <span className={clsx('font-bold text-xs', isToday && 'underline')}>{day}</span>
                                <div className="flex items-center justify-between w-full">
                                    {status && dayMenus.length > 0 && <span className="text-[9px] font-bold leading-none">{dayMenus.length} menu</span>}
                                    {status === 'final' && <CheckCircle2 size={12} className="ml-auto" />}
                                    {status === 'draft' && <Clock size={12} className="ml-auto" />}
                                    {status === 'untouched' && <AlertCircle size={12} className="ml-auto" />}
                                </div>
                            </button>
                        )
                    })}
                </div>

                <div className="mt-5 pt-4 border-t flex items-center gap-3 text-xs" style={{ borderColor: '#f3f4f6' }}>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold"><AlertCircle size={10} /> Belum Disentuh</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold"><Clock size={10} /> In Draft</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-semibold"><CheckCircle2 size={10} /> Final</span>
                </div>
            </div>

            {modalDate && (
                <IngredientModal
                    date={modalDate}
                    menus={getMenusForDate(modalDate)}
                    onClose={() => setModalDate(null)}
                    onSave={handleSave}
                    user={user}
                    onMarkDraft={markDraft}
                />
            )}
        </div>
    )
}
