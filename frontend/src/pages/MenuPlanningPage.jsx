import React, { useState, useMemo } from 'react'
import { Plus, Save, UtensilsCrossed, Calendar, ChevronLeft, ChevronRight, X, Trash2, CheckSquare, Square, Pencil, Check } from 'lucide-react'
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

const EMPTY_ROW = () => ({ name: '', calories: '', description: '' })

// ─── Confirm Delete Modal ────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0"><Trash2 size={18} className="text-red-500" /></div>
                    <div>
                        <h3 className="font-bold text-gray-900">Konfirmasi Hapus</h3>
                        <p className="text-xs text-gray-400">Aksi tidak dapat dibatalkan.</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mb-5">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="btn-secondary flex-1 justify-center">Batal</button>
                    <button onClick={onConfirm} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors">
                        <Trash2 size={14} /> Hapus
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Edit Menu Modal ─────────────────────────────────────────────────────────
function EditMenuModal({ menu, onSave, onClose }) {
    const [name, setName] = useState(menu.name)
    const [calories, setCalories] = useState(menu.calories || '')
    const [description, setDescription] = useState(menu.description || '')

    const handleSave = () => {
        if (!name.trim()) { toast.error('Nama menu wajib diisi!'); return }
        onSave({ name: name.trim(), calories: parseInt(calories) || 0, description: description.trim() })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b" style={{ borderColor: '#f3f4f6', backgroundColor: 'rgba(163,199,199,0.1)' }}>
                    <div className="flex items-center justify-between">
                        <h3 className="font-extrabold" style={{ color: '#327169' }}>Edit Menu</h3>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-400"><X size={18} /></button>
                    </div>
                </div>
                <div className="px-6 py-5 space-y-4">
                    <div>
                        <label className="label">Nama Menu <span className="text-red-400">*</span></label>
                        <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="Nama menu" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label">Kalori (kcal)</label>
                            <input type="number" value={calories} onChange={e => setCalories(e.target.value)} className="input-field" placeholder="cth. 650" />
                        </div>
                        <div>
                            <label className="label">Deskripsi</label>
                            <input value={description} onChange={e => setDescription(e.target.value)} className="input-field" placeholder="Singkat" />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={handleSave} className="btn-primary flex-1 justify-center"><Save size={15} /> Simpan</button>
                        <button onClick={onClose} className="btn-secondary w-28 justify-center">Batal</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function MenuPlanningPage() {
    const { user } = useAuthStore()
    const { menus, addMenu, deleteMenu, updateMenu } = useWorkflowStore()
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [selectedDate, setSelectedDate] = useState(null)

    const [selectedPMs, setSelectedPMs] = useState([])
    const [menuRows, setMenuRows] = useState([EMPTY_ROW()])
    const [plannedPMs, setPlannedPMs] = useState({})

    // Edit / Delete states
    const [editMenu, setEditMenu] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)

    const { firstDay, daysInMonth } = getMonthData(currentYear, currentMonth)

    const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else setCurrentMonth(m => m - 1) }
    const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else setCurrentMonth(m => m + 1) }

    const menusForDate = selectedDate ? menus.filter(m => m.targetDate === selectedDate) : []

    const allPMs = useMemo(() => {
        const benefsForDate = selectedDate ? DEMO_BENEFICIARIES.filter(b => b.deliveryDate === selectedDate) : []
        const base = benefsForDate.length > 0 ? benefsForDate : DEMO_BENEFICIARIES
        return base.map(b => ({ ...b, school: DEMO_SCHOOLS.find(s => s.id === b.schoolId) }))
    }, [selectedDate])

    const togglePM = (id) => setSelectedPMs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    const selectAllPMs = () => { if (selectedPMs.length === allPMs.length) setSelectedPMs([]); else setSelectedPMs(allPMs.map(p => p.id)) }

    const addRow = () => setMenuRows(prev => [...prev, EMPTY_ROW()])
    const removeRow = (idx) => setMenuRows(prev => prev.filter((_, i) => i !== idx))
    const updateRow = (idx, field, value) => setMenuRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))

    const isPMPlanned = (pmId) => {
        if (!selectedDate) return false
        const planned = plannedPMs[selectedDate] || new Set()
        const storePlanned = menus.some(m => m.targetDate === selectedDate && m.beneficiaryId === pmId)
        return planned.has(pmId) || storePlanned
    }

    const allPMsPlanned = useMemo(() => {
        if (!selectedDate || allPMs.length === 0) return false
        const planned = plannedPMs[selectedDate] || new Set()
        const storePlanned = new Set(menus.filter(m => m.targetDate === selectedDate && m.beneficiaryId).map(m => m.beneficiaryId))
        return allPMs.every(pm => planned.has(pm.id) || storePlanned.has(pm.id))
    }, [selectedDate, allPMs, plannedPMs, menus])

    const handleBulkSubmit = () => {
        const validRows = menuRows.filter(r => r.name.trim())
        if (validRows.length === 0) { toast.error('Tambahkan minimal 1 menu!'); return }
        if (selectedPMs.length === 0) { toast.error('Pilih minimal 1 Penerima Manfaat!'); return }
        let count = 0
        selectedPMs.forEach(pmId => {
            validRows.forEach(row => {
                addMenu({
                    name: row.name.trim(), description: row.description.trim(),
                    targetDate: selectedDate, beneficiaryId: pmId,
                    calories: parseInt(row.calories) || 0,
                    currentStage: 1, status: 'in_progress', createdBy: user.name,
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
                    ingredients: [], vendors: [], receiving: [], productionStage: null, estimatedCost: 0,
                })
                count++
            })
        })
        setPlannedPMs(prev => {
            const set = new Set(prev[selectedDate] || [])
            selectedPMs.forEach(id => set.add(id))
            return { ...prev, [selectedDate]: set }
        })
        toast.success(`${count} menu berhasil ditambahkan untuk ${selectedPMs.length} PM!`)
        setMenuRows([EMPTY_ROW()]); setSelectedPMs([])
    }

    const getMenuCountForDay = (day) => {
        const dateStr = formatDate(currentYear, currentMonth, day)
        return menus.filter(m => m.targetDate === dateStr).length
    }

    const handleDateSelect = (dateStr) => { setSelectedDate(dateStr); setSelectedPMs([]); setMenuRows([EMPTY_ROW()]) }

    // Edit menu handler
    const handleEditSave = (updates) => {
        updateMenu(editMenu.id, updates)
        toast.success('Menu berhasil diperbarui!')
        setEditMenu(null)
    }

    // Delete menu handler
    const handleDeleteConfirm = () => {
        deleteMenu(deleteTarget.id)
        toast.success(`Menu "${deleteTarget.name}" dihapus.`)
        setDeleteTarget(null)
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2"><UtensilsCrossed size={24} /> Menu Planning</h2>
                <p className="text-sm text-tertiary/60 mt-1">Pilih tanggal → Pilih PM → Input Menu (bulk) → Submit</p>
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
                                <button key={day} onClick={() => handleDateSelect(dateStr)}
                                    className={clsx('relative p-3 rounded-xl text-sm font-semibold transition-all border',
                                        isSelected ? 'bg-primary text-white border-primary shadow-lg'
                                            : count > 0 ? 'bg-accent-light/50 text-primary border-accent hover:bg-accent-light'
                                                : 'bg-white text-tertiary border-gray-100 hover:border-accent hover:bg-gray-50')}>
                                    {day}
                                    {count > 0 && <span className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full bg-primary text-white">{count}</span>}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Right panel */}
                <div className="space-y-4">
                    {selectedDate ? (
                        <>
                            <div className="card">
                                <h3 className="font-bold text-primary text-sm flex items-center gap-2 mb-3">
                                    <Calendar size={16} />
                                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </h3>

                                {/* Existing menus with Edit/Delete */}
                                {menusForDate.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs font-bold uppercase tracking-wide text-tertiary/50 mb-2">Menu Terdaftar ({menusForDate.length})</p>
                                        <div className="space-y-1.5">
                                            {menusForDate.map(m => {
                                                const benef = DEMO_BENEFICIARIES.find(b => b.id === m.beneficiaryId)
                                                const school = benef ? DEMO_SCHOOLS.find(s => s.id === benef.schoolId) : null
                                                return (
                                                    <div key={m.id} className="p-2.5 rounded-xl border border-gray-100 text-xs flex items-start justify-between gap-2" style={{ backgroundColor: '#fafbfc' }}>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-bold text-primary truncate">{m.name}</p>
                                                            {school && <p className="text-tertiary/40 mt-0.5 truncate">→ {school.name}</p>}
                                                        </div>
                                                        <div className="flex gap-1 flex-shrink-0">
                                                            <button onClick={() => setEditMenu(m)}
                                                                className="p-1.5 rounded-lg text-white hover:opacity-80 transition-opacity"
                                                                style={{ backgroundColor: '#438c81' }}>
                                                                <Pencil size={11} />
                                                            </button>
                                                            <button onClick={() => setDeleteTarget(m)}
                                                                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                                <Trash2 size={11} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {allPMsPlanned && (
                                    <div className="p-3 rounded-xl text-center mb-3" style={{ backgroundColor: '#dcfce7' }}>
                                        <p className="text-xs font-bold" style={{ color: '#16a34a' }}>✓ Semua PM sudah memiliki menu</p>
                                    </div>
                                )}
                            </div>

                            {/* Multi-select PMs */}
                            <div className="card">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#327169' }}>Step 1 — Pilih PM</p>
                                    <button onClick={selectAllPMs} className="text-[10px] font-bold px-2 py-1 rounded-lg hover:opacity-80 transition-opacity" style={{ backgroundColor: 'rgba(67,140,129,0.1)', color: '#438c81' }}>
                                        {selectedPMs.length === allPMs.length ? 'Hapus Semua' : 'Pilih Semua'}
                                    </button>
                                </div>
                                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                    {allPMs.map(pm => {
                                        const checked = selectedPMs.includes(pm.id)
                                        const planned = isPMPlanned(pm.id)
                                        return (
                                            <button key={pm.id} onClick={() => togglePM(pm.id)}
                                                className={clsx('w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all border',
                                                    checked ? 'border-primary bg-accent-light/30' : 'border-gray-100 hover:border-accent hover:bg-gray-50')}>
                                                {checked ? <CheckSquare size={16} style={{ color: '#327169' }} /> : <Square size={16} className="text-gray-300" />}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold truncate" style={{ color: '#4d4d4d' }}>{pm.school?.name || 'PM'}</p>
                                                    <p className="text-[10px]" style={{ color: 'rgba(77,77,77,0.4)' }}>{pm.portionCount} porsi • {pm.school?.type}</p>
                                                </div>
                                                {planned && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>✓</span>}
                                            </button>
                                        )
                                    })}
                                </div>
                                {selectedPMs.length > 0 && <p className="text-[10px] font-bold mt-2" style={{ color: '#438c81' }}>{selectedPMs.length} PM dipilih</p>}
                            </div>

                            {/* Bulk input */}
                            {selectedPMs.length > 0 && (
                                <div className="card">
                                    <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#327169' }}>Step 2 — Input Menu (berlaku untuk semua PM)</p>
                                    <div className="space-y-3">
                                        {menuRows.map((row, idx) => (
                                            <div key={idx} className="p-3 rounded-xl border" style={{ borderColor: '#e5e7eb', backgroundColor: '#fafbfc' }}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(50,113,105,0.1)', color: '#327169' }}>Menu {idx + 1}</span>
                                                    {menuRows.length > 1 && <button onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={12} /></button>}
                                                </div>
                                                <input value={row.name} onChange={e => updateRow(idx, 'name', e.target.value)} className="input-field text-sm mb-2" placeholder="Nama Menu (wajib)" />
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input type="number" value={row.calories} onChange={e => updateRow(idx, 'calories', e.target.value)} className="input-field text-sm" placeholder="Kalori (kcal)" />
                                                    <input value={row.description} onChange={e => updateRow(idx, 'description', e.target.value)} className="input-field text-sm" placeholder="Deskripsi" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={addRow} className="w-full mt-3 inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl transition-all hover:opacity-80 text-white" style={{ backgroundColor: '#327169' }}>
                                        <Plus size={14} /> Tambah Baris
                                    </button>
                                </div>
                            )}

                            {selectedPMs.length > 0 && (
                                <button onClick={handleBulkSubmit}
                                    disabled={menuRows.every(r => !r.name.trim())}
                                    className={clsx('w-full inline-flex items-center justify-center gap-2 text-sm font-bold px-4 py-3 rounded-xl transition-all text-white',
                                        menuRows.some(r => r.name.trim()) ? 'hover:opacity-90 shadow-lg' : 'opacity-40 cursor-not-allowed')}
                                    style={{ backgroundColor: '#327169' }}>
                                    <Save size={16} /> Submit Menu ({menuRows.filter(r => r.name.trim()).length} menu × {selectedPMs.length} PM)
                                </button>
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

            {editMenu && <EditMenuModal menu={editMenu} onSave={handleEditSave} onClose={() => setEditMenu(null)} />}
            {deleteTarget && (
                <ConfirmModal
                    message={`Anda akan menghapus menu "${deleteTarget.name}". Aksi ini tidak dapat dibatalkan.`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    )
}
