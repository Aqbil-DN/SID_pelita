import React, { useState } from 'react'
import { Calculator, Save } from 'lucide-react'
import { toast } from 'react-toastify'
import { DEMO_SCHOOLS } from '../lib/constants'

export default function PortionPlanningPage() {
    const [plans, setPlans] = useState([
        { id: 1, schoolId: 1, portionCount: 350, deliveryDate: '2026-03-05' },
        { id: 2, schoolId: 2, portionCount: 280, deliveryDate: '2026-03-05' },
    ])
    const [form, setForm] = useState({ schoolId: '', portionCount: '', deliveryDate: '' })

    const handleAdd = () => {
        if (!form.schoolId || !form.portionCount || !form.deliveryDate) {
            toast.error('Semua field wajib diisi!')
            return
        }
        setPlans(p => [...p, { id: Date.now(), schoolId: parseInt(form.schoolId), portionCount: parseInt(form.portionCount), deliveryDate: form.deliveryDate }])
        toast.success('Portion planning berhasil ditambahkan! Data akan muncul di kalender Nutritionist.')
        setForm({ schoolId: '', portionCount: '', deliveryDate: '' })
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2"><Calculator size={24} /> Portion Planning</h2>
                <p className="text-sm text-tertiary/60 mt-1">Tentukan jumlah porsi per sekolah dan tanggal pengiriman</p>
            </div>

            <div className="card">
                <h3 className="font-bold text-primary text-sm mb-4">Tambah Rencana Porsi</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <select value={form.schoolId} onChange={e => setForm({ ...form, schoolId: e.target.value })} className="input-field">
                        <option value="">Pilih Sekolah</option>
                        {DEMO_SCHOOLS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <input type="number" value={form.portionCount} onChange={e => setForm({ ...form, portionCount: e.target.value })} className="input-field" placeholder="Jumlah Porsi" />
                    <input type="date" value={form.deliveryDate} onChange={e => setForm({ ...form, deliveryDate: e.target.value })} className="input-field" />
                    <button onClick={handleAdd} className="btn-primary justify-center"><Save size={16} /> Simpan</button>
                </div>
            </div>

            <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                    <thead><tr className="bg-gray-50">
                        <th className="table-header">Sekolah</th>
                        <th className="table-header">Tipe</th>
                        <th className="table-header">Porsi</th>
                        <th className="table-header">Tanggal Kirim</th>
                    </tr></thead>
                    <tbody>
                        {plans.map(p => {
                            const school = DEMO_SCHOOLS.find(s => s.id === p.schoolId)
                            return (
                                <tr key={p.id}>
                                    <td className="table-cell font-semibold text-primary">{school?.name || '—'}</td>
                                    <td className="table-cell"><span className="badge-gray text-[10px]">{school?.type}</span></td>
                                    <td className="table-cell font-bold text-secondary">{p.portionCount}</td>
                                    <td className="table-cell text-tertiary/60">{p.deliveryDate}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
