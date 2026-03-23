import React, { useState, useEffect } from 'react'
import { Wrench, Plus, X, Save, ChevronLeft, ChevronRight, Calendar, Clock, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { ROLES } from '../lib/constants'
import ConfirmationModal from '../components/ConfirmationModal'

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const FREQUENCIES = ['Sekali', 'Harian', 'Mingguan', 'Bulanan']
const PIC_ROLES = Object.values(ROLES)
const EVENT_COLORS = ['#327169', '#438c81', '#7c3aed', '#dc2626', '#ca8a04', '#2563eb', '#16a34a', '#ea580c']

const STORAGE_KEY = 'mbg-maintenance-events'

function loadEvents() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveEvents(events) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

function formatDate(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const defaultModal = { agenda: '', frequency: 'Sekali', pic: ROLES.NUTRITIONIST, startTime: '08:00', endTime: '09:00' }

export default function MaintenanceSchedulerPage() {
    const now = new Date()
    const [month, setMonth] = useState(now.getMonth())
    const [year, setYear] = useState(now.getFullYear())
    const [selectedDate, setSelectedDate] = useState(null)
    const [events, setEvents] = useState(loadEvents)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(defaultModal)
    const [editId, setEditId] = useState(null)
    const [showConfirm, setShowConfirm] = useState(false)

    useEffect(() => { saveEvents(events) }, [events])

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
    const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

    const eventsForDate = (dateStr) => events.filter(e => e.date === dateStr)

    const openNewModal = (dateStr) => {
        setSelectedDate(dateStr)
        setForm(defaultModal)
        setEditId(null)
        setShowModal(true)
    }

    const openEditModal = (event, e) => {
        e.stopPropagation()
        setSelectedDate(event.date)
        setForm({ agenda: event.agenda, frequency: event.frequency, pic: event.pic, startTime: event.startTime, endTime: event.endTime })
        setEditId(event.id)
        setShowModal(true)
    }

    const handleSaveClick = () => {
        if (!form.agenda.trim()) { toast.error('Agenda wajib diisi!'); return }
        if (form.startTime >= form.endTime) { toast.error('Waktu selesai harus lebih besar dari waktu mulai!'); return }
        setShowConfirm(true)
    }

    const handleSave = () => {
        setShowConfirm(false)
        if (editId) {
            setEvents(prev => prev.map(e => e.id === editId ? { ...e, ...form } : e))
            toast.success('Jadwal berhasil diperbarui!')
        } else {
            const colorIdx = events.length % EVENT_COLORS.length
            setEvents(prev => [...prev, { id: Date.now(), date: selectedDate, ...form, color: EVENT_COLORS[colorIdx] }])
            toast.success('Jadwal maintenance berhasil ditambahkan!')
        }
        setShowModal(false)
    }

    const handleDelete = (id, e) => {
        e.stopPropagation()
        setEvents(prev => prev.filter(ev => ev.id !== id))
        toast.info('Jadwal dihapus.')
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <Wrench size={24} /> Maintenance Scheduler
                </h2>
                <p className="text-sm text-tertiary/60 mt-1">Klik tanggal untuk menambah jadwal maintenance & fasilitas</p>
            </div>

            <div className="card">
                {/* Calendar header */}
                <div className="flex items-center justify-between mb-5">
                    <button onClick={prevMonth} className="btn-secondary p-2"><ChevronLeft size={18} /></button>
                    <h3 className="text-xl font-bold text-primary">{MONTH_NAMES[month]} {year}</h3>
                    <button onClick={nextMonth} className="btn-secondary p-2"><ChevronRight size={18} /></button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {DAYS.map(d => (
                        <div key={d} className="text-center text-xs font-bold uppercase tracking-wider py-2" style={{ color: 'rgba(77,77,77,0.5)' }}>{d}</div>
                    ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const dateStr = formatDate(year, month, day)
                        const dayEvents = eventsForDate(dateStr)
                        const isToday = dateStr === new Date().toISOString().split('T')[0]

                        return (
                            <div
                                key={day}
                                onClick={() => openNewModal(dateStr)}
                                className="min-h-[90px] rounded-xl border cursor-pointer transition-all hover:shadow-md hover:border-accent p-1.5 group"
                                style={{ borderColor: isToday ? '#327169' : dayEvents.length > 0 ? '#a3c7c7' : '#e5e7eb', backgroundColor: isToday ? 'rgba(50,113,105,0.05)' : dayEvents.length > 0 ? '#f7fdfd' : '#fff' }}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-bold px-1.5 py-0.5 rounded-lg"
                                        style={{ color: isToday ? '#fff' : '#4d4d4d', backgroundColor: isToday ? '#327169' : 'transparent' }}>
                                        {day}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {dayEvents.length >= 3 && <CheckCircle2 size={11} className="text-green-500" />}
                                        {dayEvents.length > 0 && dayEvents.length < 3 && <Clock size={11} className="text-[#438c81]" />}
                                        <Plus size={12} className="opacity-0 group-hover:opacity-60 text-primary transition-opacity" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    {dayEvents.slice(0, 3).map(ev => (
                                        <div
                                            key={ev.id}
                                            onClick={e => openEditModal(ev, e)}
                                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-white text-[9px] font-semibold truncate hover:opacity-80"
                                            style={{ backgroundColor: ev.color }}
                                            title={`${ev.agenda} | ${ev.startTime}–${ev.endTime} | PIC: ${ev.pic}`}
                                        >
                                            <span className="truncate">{ev.agenda}</span>
                                        </div>
                                    ))}
                                    {dayEvents.length > 3 && (
                                        <p className="text-[9px] font-bold text-center" style={{ color: '#438c81' }}>+{dayEvents.length - 3} lagi</p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="card flex items-center gap-4 flex-wrap">
                <span className="text-xs font-bold text-tertiary/50 uppercase tracking-wide">Legenda:</span>
                {EVENT_COLORS.slice(0, 5).map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                        <span className="text-tertiary/60">Jadwal #{i + 1}</span>
                    </div>
                ))}
                <p className="ml-auto text-xs text-tertiary/40">Total: {events.length} jadwal</p>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-lg font-extrabold text-primary flex items-center gap-2">
                                    <Calendar size={18} /> {editId ? 'Edit' : 'Tambah'} Jadwal
                                </h3>
                                <p className="text-xs text-tertiary/50 mt-0.5">
                                    {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-400 transition-colors"><X size={20} /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Agenda / Deskripsi Kegiatan</label>
                                <input
                                    value={form.agenda}
                                    onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))}
                                    className="input-field"
                                    placeholder="Contoh: Service AC Central, Kitchen Hood Cleaning..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label">Frekuensi</label>
                                    <select value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} className="input-field">
                                        {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">PIC (Penanggung Jawab)</label>
                                    <select value={form.pic} onChange={e => setForm(f => ({ ...f, pic: e.target.value }))} className="input-field">
                                        {PIC_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label">Jam Mulai</label>
                                    <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="input-field" />
                                </div>
                                <div>
                                    <label className="label">Jam Selesai</label>
                                    <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className="input-field" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            {editId && (
                                <button
                                    onClick={() => { handleDelete(editId, { stopPropagation: () => {} }); setShowModal(false) }}
                                    className="px-4 py-2.5 rounded-xl text-sm font-bold border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    Hapus
                                </button>
                            )}
                            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Batal</button>
                            <button onClick={handleSaveClick} className="btn-primary flex-1 justify-center">
                                <Save size={15} /> Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={showConfirm}
                message="Apakah Anda yakin ingin menyimpan jadwal maintenance ini?"
                confirmLabel="Ya, Simpan Jadwal"
                onConfirm={handleSave}
                onCancel={() => setShowConfirm(false)}
            />
        </div>
    )
}
