import React, { useState } from 'react'
import { Truck, ChevronRight, ChevronLeft, AlertTriangle, X, Save } from 'lucide-react'
import { toast } from 'react-toastify'
import { DELIVERY_STATUSES } from '../lib/constants'
import useDeliveryStore from '../store/deliveryStore'
import clsx from 'clsx'

export default function DeliveryTrackerPage() {
    const { deliveries, advanceStatus, revertStatus, addIncident } = useDeliveryStore()
    const [incidentModal, setIncidentModal] = useState(null) // delivery id
    const [incidentText, setIncidentText] = useState('')

    const statusIndex = (key) => DELIVERY_STATUSES.findIndex(s => s.key === key)

    const handleNext = (id, currentStatus) => {
        const idx = statusIndex(currentStatus)
        if (idx >= DELIVERY_STATUSES.length - 1) { toast.info('Status sudah final.'); return }
        advanceStatus(id)
        toast.success(`Status diperbarui: ${DELIVERY_STATUSES[idx + 1].label}`)
    }

    const handleBack = (id, currentStatus) => {
        const idx = statusIndex(currentStatus)
        if (idx <= 0) { toast.info('Sudah di status awal.'); return }
        revertStatus(id)
        toast.info(`Status dikembalikan: ${DELIVERY_STATUSES[idx - 1].label}`)
    }

    const handleIncidentSubmit = () => {
        if (!incidentText.trim()) { toast.error('Deskripsi insiden wajib diisi!'); return }
        addIncident(incidentModal, incidentText.trim())
        toast.error('⚠ Insiden dicatat!')
        setIncidentModal(null)
        setIncidentText('')
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2"><Truck size={24} /> Delivery Tracker</h2>
                <p className="text-sm text-tertiary/60 mt-1">Lacak dan perbarui status pengiriman ke sekolah</p>
            </div>

            {/* Status legend */}
            <div className="card flex items-center gap-3 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wide text-tertiary/40 mr-1">Status:</span>
                {DELIVERY_STATUSES.map((s, i) => (
                    <React.Fragment key={s.key}>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: s.bg, color: s.color }}>
                            {s.label}
                        </span>
                        {i < DELIVERY_STATUSES.length - 1 && <ChevronRight size={12} className="text-gray-300" />}
                    </React.Fragment>
                ))}
            </div>

            <div className="space-y-4">
                {deliveries.map(d => {
                    const currentStatus = DELIVERY_STATUSES.find(s => s.key === d.status) || DELIVERY_STATUSES[0]
                    const idx = statusIndex(d.status)
                    const isFirst = idx === 0
                    const isLast = idx === DELIVERY_STATUSES.length - 1

                    return (
                        <div key={d.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <p className="font-bold text-primary text-base">{d.school?.name}</p>
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: currentStatus.bg, color: currentStatus.color }}>
                                            {currentStatus.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-tertiary/60 mb-3">{d.school?.type} • {d.date}</p>

                                    {/* 4-step progress bar */}
                                    <div className="flex gap-1 mb-1">
                                        {DELIVERY_STATUSES.map((s, i) => (
                                            <div key={s.key} className="flex-1">
                                                <div className="h-2.5 rounded-full" style={{ backgroundColor: i <= idx ? s.color : '#e5e7eb' }} />
                                                <p className="text-[8px] text-center mt-0.5 font-semibold" style={{ color: i <= idx ? s.color : '#9ca3af' }}>{s.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Incidents */}
                                    {d.incidents && d.incidents.length > 0 && (
                                        <div className="mt-3 space-y-1">
                                            {d.incidents.map((inc, i) => (
                                                <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{ backgroundColor: '#fef2f2' }}>
                                                    <AlertTriangle size={12} className="text-red-500 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-xs text-red-700 font-semibold">{inc.description}</p>
                                                        <p className="text-[9px] text-red-400">{new Date(inc.reportedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleBack(d.id, d.status)}
                                            disabled={isFirst}
                                            className={clsx('flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all border', isFirst ? 'opacity-30 cursor-not-allowed border-gray-200 text-gray-400' : 'border-secondary text-white hover:opacity-80')}
                                            style={{ backgroundColor: isFirst ? 'transparent' : '#438c81' }}
                                        >
                                            <ChevronLeft size={14} /> Back
                                        </button>
                                        <button
                                            onClick={() => handleNext(d.id, d.status)}
                                            disabled={isLast}
                                            className={clsx('flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all border', isLast ? 'opacity-30 cursor-not-allowed border-gray-200 text-gray-400' : 'border-secondary text-white hover:opacity-80')}
                                            style={{ backgroundColor: isLast ? 'transparent' : '#438c81' }}
                                        >
                                            Next <ChevronRight size={14} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => { setIncidentModal(d.id); setIncidentText('') }}
                                        className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-80"
                                        style={{ backgroundColor: '#327169' }}
                                    >
                                        <AlertTriangle size={14} /> Incident
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Incident Modal */}
            {incidentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setIncidentModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-extrabold flex items-center gap-2" style={{ color: '#dc2626' }}>
                                <AlertTriangle size={20} /> Laporan Insiden
                            </h3>
                            <button onClick={() => setIncidentModal(null)} className="text-gray-400 hover:text-red-400"><X size={20} /></button>
                        </div>
                        <p className="text-sm text-tertiary/60 mb-3">
                            Pengiriman: <strong>{deliveries.find(d => d.id === incidentModal)?.school?.name}</strong>
                        </p>
                        <div>
                            <label className="label">Deskripsi Masalah</label>
                            <textarea
                                value={incidentText}
                                onChange={e => setIncidentText(e.target.value)}
                                rows={4}
                                className="input-field"
                                placeholder="Contoh: Kendaraan mogok di Jl. Merdeka, butuh bantuan derek..."
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setIncidentModal(null)} className="btn-secondary flex-1 justify-center">Batal</button>
                            <button onClick={handleIncidentSubmit} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ backgroundColor: '#327169' }}>
                                <Save size={15} /> Lapor Insiden
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
