import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { School, Plus, Save, Trash2, Edit2, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { DEMO_SCHOOLS } from '../lib/constants'

export default function BeneficiaryManagementPage() {
    const [schools, setSchools] = useState([...DEMO_SCHOOLS])
    const [editId, setEditId] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

    const onSubmit = (data) => {
        if (editId) {
            setSchools(s => s.map(sc => sc.id === editId ? { ...sc, ...data } : sc))
            toast.success('Data sekolah diperbarui!')
            setEditId(null)
        } else {
            setSchools(s => [...s, { id: Date.now(), ...data }])
            toast.success('Sekolah berhasil ditambahkan!')
        }
        reset()
        setShowForm(false)
    }

    const handleEdit = (school) => {
        setEditId(school.id)
        setValue('name', school.name)
        setValue('type', school.type)
        setValue('location', school.location)
        setValue('phone', school.phone)
        setShowForm(true)
    }

    const handleDelete = (id) => {
        setSchools(s => s.filter(sc => sc.id !== id))
        toast.success('Sekolah dihapus!')
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                        <School size={24} /> Kelola Sekolah
                    </h2>
                    <p className="text-sm text-tertiary/60 mt-1">Tambah dan kelola data sekolah penerima manfaat</p>
                </div>
                <button onClick={() => { setShowForm(!showForm); setEditId(null); reset() }} className="btn-primary">
                    <Plus size={16} /> Tambah Sekolah
                </button>
            </div>

            {showForm && (
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-primary text-sm">{editId ? 'Edit Sekolah' : 'Tambah Sekolah Baru'}</h3>
                        <button onClick={() => { setShowForm(false); setEditId(null); reset() }} className="text-gray-400 hover:text-red-400"><X size={16} /></button>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Nama Sekolah</label>
                            <input {...register('name', { required: 'Wajib' })} className="input-field" placeholder="SDN 001 Merdeka" />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                            <label className="label">Tipe PM</label>
                            <select {...register('type')} className="input-field" defaultValue="PM Reguler">
                                <option value="PM Reguler">PM Reguler</option>
                                <option value="PM Tambahan">PM Tambahan</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Lokasi</label>
                            <input {...register('location')} className="input-field" placeholder="Jl. Merdeka No. 10" />
                        </div>
                        <div>
                            <label className="label">Telepon</label>
                            <input {...register('phone')} className="input-field" placeholder="021-1234567" />
                        </div>
                        <div className="md:col-span-2">
                            <button type="submit" className="btn-primary"><Save size={16} /> {editId ? 'Update' : 'Simpan'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="table-header">#</th>
                            <th className="table-header">Nama Sekolah</th>
                            <th className="table-header">Tipe</th>
                            <th className="table-header">Lokasi</th>
                            <th className="table-header">Telepon</th>
                            <th className="table-header text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schools.map((s, i) => (
                            <tr key={s.id}>
                                <td className="table-cell text-tertiary/50">{i + 1}</td>
                                <td className="table-cell font-semibold text-primary">{s.name}</td>
                                <td className="table-cell"><span className={s.type === 'PM Reguler' ? 'badge-primary' : 'badge-warning'}>{s.type}</span></td>
                                <td className="table-cell text-tertiary/60 text-xs">{s.location}</td>
                                <td className="table-cell text-tertiary/60">{s.phone}</td>
                                <td className="table-cell text-center">
                                    <button onClick={() => handleEdit(s)} className="text-secondary hover:text-primary mr-2"><Edit2 size={14} /></button>
                                    <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
