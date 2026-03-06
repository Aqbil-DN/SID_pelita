import React, { useState } from 'react'
import { Truck, Check } from 'lucide-react'
import { toast } from 'react-toastify'
import { DEMO_SCHOOLS, DEMO_DELIVERIES } from '../lib/constants'
import clsx from 'clsx'

export default function DeliveryTrackerPage() {
    const [deliveries, setDeliveries] = useState(DEMO_DELIVERIES.map(d => ({
        ...d,
        school: DEMO_SCHOOLS.find(s => s.id === d.schoolId),
    })))

    const toggleStatus = (id) => {
        setDeliveries(prev => prev.map(d => {
            if (d.id !== id) return d
            const newStatus = d.status === 'in_transit' ? 'arrived' : 'in_transit'
            const newProgress = newStatus === 'arrived' ? 100 : 60
            toast.success(`Status ${d.school?.name}: ${newStatus === 'arrived' ? 'Arrived' : 'In Transit'}`)
            return { ...d, status: newStatus, progress: newProgress }
        }))
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2"><Truck size={24} /> Delivery Tracker</h2>
                <p className="text-sm text-tertiary/60 mt-1">Lacak status pengiriman ke sekolah</p>
            </div>

            <div className="space-y-3">
                {deliveries.map(d => (
                    <div key={d.id} className="card flex items-center gap-4">
                        <div className="flex-1">
                            <p className="font-bold text-primary">{d.school?.name}</p>
                            <p className="text-xs text-tertiary/60">{d.school?.type} • {d.date}</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div className="h-2 rounded-full transition-all" style={{ width: `${d.progress}%`, backgroundColor: d.progress === 100 ? '#16a34a' : '#327169' }} />
                            </div>
                            <p className="text-[10px] text-tertiary/40 mt-1">{d.progress}%</p>
                        </div>
                        <button
                            onClick={() => toggleStatus(d.id)}
                            className={clsx('px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2',
                                d.status === 'arrived' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-primary text-white'
                            )}
                        >
                            {d.status === 'arrived' ? <><Check size={14} /> Arrived</> : <><Truck size={14} /> In Transit</>}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
