import React, { useState, useEffect } from 'react'
import { Timer, Save, CheckCircle2, Clock, Hourglass } from 'lucide-react'
import { toast } from 'react-toastify'
import { COOKING_TIMER_SLOTS } from '../lib/constants'

function timeToSeconds(str) {
    const [h, m] = str.split(':').map(Number)
    return h * 3600 + m * 60
}

function nowSeconds() {
    const n = new Date()
    return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds()
}

function formatCountdown(sec) {
    if (sec <= 0) return '00:00:00'
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = sec % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function CookingTimerPage() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

    // Draft = editable inputs, submitted = locked-in times for countdown
    const [drafts, setDrafts] = useState(
        COOKING_TIMER_SLOTS.map(s => ({ startTime: s.defaultStart, endTime: s.defaultEnd }))
    )
    const [submitted, setSubmitted] = useState(null) // null = belum submit
    const [tick, setTick] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 1000)
        return () => clearInterval(interval)
    }, [])

    const updateDraft = (idx, field, value) => {
        setDrafts(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d))
    }

    const handleSubmit = () => {
        // Validate all timers
        for (let i = 0; i < drafts.length; i++) {
            const d = drafts[i]
            if (timeToSeconds(d.endTime) <= timeToSeconds(d.startTime)) {
                toast.error(`${COOKING_TIMER_SLOTS[i].label}: Jam selesai harus lebih besar dari jam mulai!`)
                return
            }
        }
        setSubmitted(drafts.map((d, i) => ({
            ...COOKING_TIMER_SLOTS[i],
            startTime: d.startTime,
            endTime: d.endTime,
        })))
        toast.success('Timer berhasil diset! Countdown otomatis berjalan sesuai waktu.')
    }

    const handleReset = () => {
        setSubmitted(null)
        setDrafts(COOKING_TIMER_SLOTS.map(s => ({ startTime: s.defaultStart, endTime: s.defaultEnd })))
        toast.info('Timer direset.')
    }

    const now = nowSeconds()

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2"><Timer size={24} /> Cooking Timer</h2>
                <p className="text-sm text-tertiary/60 mt-1">Tentukan jam mulai & selesai, lalu submit. Countdown berjalan otomatis.</p>
            </div>

            <div className="card flex items-center gap-6 flex-wrap">
                <div>
                    <label className="label">Tanggal Produksi</label>
                    <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="input-field w-56" />
                </div>
                <div className="ml-auto text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-tertiary/40">Waktu Sekarang</p>
                    <p className="text-2xl font-extrabold text-primary" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                </div>
            </div>

            {/* ── Setting Table (always visible before submit) ── */}
            {!submitted && (
                <div className="card">
                    <h3 className="font-bold text-primary text-sm mb-4">Atur Jadwal Timer</h3>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="table-header">Tahap</th>
                                <th className="table-header text-center">Jam Mulai</th>
                                <th className="table-header text-center">Jam Selesai</th>
                                <th className="table-header text-center">Durasi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {COOKING_TIMER_SLOTS.map((slot, idx) => {
                                const d = drafts[idx]
                                const total = timeToSeconds(d.endTime) - timeToSeconds(d.startTime)
                                const isInvalid = total <= 0
                                return (
                                    <tr key={slot.key}>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: slot.color }} />
                                                <span className="font-bold" style={{ color: slot.color }}>{slot.label}</span>
                                            </div>
                                        </td>
                                        <td className="table-cell text-center">
                                            <input
                                                type="time"
                                                value={d.startTime}
                                                onChange={e => updateDraft(idx, 'startTime', e.target.value)}
                                                className="input-field text-center text-sm font-bold w-32 mx-auto"
                                            />
                                        </td>
                                        <td className="table-cell text-center">
                                            <input
                                                type="time"
                                                value={d.endTime}
                                                onChange={e => updateDraft(idx, 'endTime', e.target.value)}
                                                className="input-field text-center text-sm font-bold w-32 mx-auto"
                                            />
                                        </td>
                                        <td className="table-cell text-center">
                                            {isInvalid
                                                ? <span className="text-red-500 text-xs font-semibold">⚠ Invalid</span>
                                                : <span className="font-bold text-sm" style={{ color: slot.color }}>{formatCountdown(total)}</span>
                                            }
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    <div className="flex justify-end mt-4">
                        <button onClick={handleSubmit} className="btn-primary px-8">
                            <Save size={16} /> Submit Timer
                        </button>
                    </div>
                </div>
            )}

            {/* ── Active Countdown Cards (after submit) ── */}
            {submitted && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {submitted.map((timer) => {
                            const startSec = timeToSeconds(timer.startTime)
                            const endSec = timeToSeconds(timer.endTime)
                            const totalDuration = endSec - startSec

                            let status, remaining, progress
                            if (now < startSec) {
                                status = 'waiting'
                                remaining = totalDuration
                                progress = 0
                            } else if (now >= startSec && now < endSec) {
                                status = 'running'
                                remaining = endSec - now
                                progress = ((now - startSec) / totalDuration) * 100
                            } else {
                                status = 'done'
                                remaining = 0
                                progress = 100
                            }

                            const cfg = {
                                waiting: { label: `Mulai pukul ${timer.startTime}`, color: '#6b7280', bgColor: '#f9fafb', Icon: Hourglass },
                                running: { label: 'Sedang Berjalan', color: timer.color, bgColor: timer.color + '15', Icon: Clock },
                                done: { label: '✓ Selesai', color: '#16a34a', bgColor: '#dcfce7', Icon: CheckCircle2 },
                            }[status]

                            return (
                                <div key={timer.key} className="card text-center relative overflow-hidden">
                                    {status === 'running' && (
                                        <div className="absolute inset-0 rounded-2xl animate-pulse opacity-20 pointer-events-none" style={{ boxShadow: `inset 0 0 40px ${timer.color}` }} />
                                    )}

                                    <div className="relative flex items-center justify-center gap-2 mb-2">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: timer.color }} />
                                        <h4 className="font-bold text-primary">{timer.label}</h4>
                                    </div>

                                    <p className="text-xs text-tertiary/50 mb-3">
                                        {timer.startTime} — {timer.endTime}
                                        <span className="ml-2 text-[10px]" style={{ color: timer.color }}>({formatCountdown(totalDuration)})</span>
                                    </p>

                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-3" style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>
                                        <cfg.Icon size={12} /> {cfg.label}
                                    </div>

                                    <div className="text-4xl font-extrabold mb-4" style={{
                                        color: status === 'done' ? '#16a34a' : status === 'running' ? timer.color : '#9ca3af',
                                        fontVariantNumeric: 'tabular-nums',
                                    }}>
                                        {status === 'done' ? '00:00:00' : formatCountdown(remaining)}
                                    </div>

                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%`, backgroundColor: status === 'done' ? '#16a34a' : timer.color }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex justify-center">
                        <button onClick={handleReset} className="btn-secondary px-6">
                            <Timer size={14} /> Ubah Jadwal
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
