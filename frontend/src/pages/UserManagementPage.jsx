import React, { useState } from 'react'
import { Users, Plus, Trash2, Pencil, X, Check, UserCog, ChefHat, Image as ImageIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { DEMO_USERS, ROLES } from '../lib/constants'
import clsx from 'clsx'

const ROLE_COLOR = {
    [ROLES.ADMIN]: 'bg-purple-100 text-purple-700',
    [ROLES.NUTRITIONIST]: 'bg-accent-light text-primary',
    [ROLES.HEAD_CHEF]: 'bg-orange-100 text-orange-700',
    [ROLES.ACCOUNTANT]: 'bg-blue-100 text-blue-700',
    [ROLES.SCD]: 'bg-indigo-100 text-indigo-700',
    [ROLES.WAREHOUSE]: 'bg-yellow-100 text-yellow-700',
    [ROLES.SUPERVISOR]: 'bg-teal-100 text-teal-700',
}

const KITCHEN_STAFF_INIT = [
    { id: 1, name: 'Pak Joko', position: 'Koki Utama' },
    { id: 2, name: 'Bu Siti', position: 'Asisten Koki' },
    { id: 3, name: 'Pak Budi', position: 'Petugas Kebersihan' },
]

export default function UserManagementPage() {
    const [users, setUsers] = useState(DEMO_USERS.map(({ password: _, ...u }) => u))
    const [kitchenStaff, setKitchenStaff] = useState(KITCHEN_STAFF_INIT)
    const [showAddModal, setShowAddModal] = useState(false)
    const [kitchenStaffName, setKitchenStaffName] = useState('')
    const [kitchenStaffPos, setKitchenStaffPos] = useState('')
    const [photoPreview, setPhotoPreview] = useState(null)

    const { register, handleSubmit, reset, formState: { errors } } = useForm()

    const handlePhotoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPhotoPreview(reader.result)
            }
            reader.readAsDataURL(file)
        } else {
            setPhotoPreview(null)
        }
    }

    const onAddUser = (data) => {
        const newUser = {
            id: Date.now(),
            name: data.name,
            username: data.username,
            role: data.role,
            email: data.email,
            nik: data.nik,
            photo: photoPreview,
        }
        setUsers((p) => [...p, newUser])
        toast.success(`Pengguna "${data.name}" berhasil ditambahkan! ✅`)
        reset()
        setPhotoPreview(null)
        setShowAddModal(false)
    }

    const deleteUser = (id, name) => {
        setUsers((p) => p.filter((u) => u.id !== id))
        toast.info(`Pengguna "${name}" dihapus.`)
    }

    const addKitchenStaff = () => {
        if (!kitchenStaffName.trim()) return
        setKitchenStaff((p) => [...p, { id: Date.now(), name: kitchenStaffName, position: kitchenStaffPos }])
        toast.success('Staf dapur ditambahkan.')
        setKitchenStaffName('')
        setKitchenStaffPos('')
    }

    const removeKitchenStaff = (id) => setKitchenStaff((p) => p.filter((s) => s.id !== id))

    const closeAddModal = () => {
        setShowAddModal(false)
        setPhotoPreview(null)
        reset()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                    <p className="text-sm text-gray-400">Kelola akun pengguna, NIK, dan Foto Profil</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn-primary">
                    <Plus size={16} /> Tambah Pengguna
                </button>
            </div>

            {/* Users table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="table-header">Profil</th>
                                <th className="table-header">NIK</th>
                                <th className="table-header">Username</th>
                                <th className="table-header">Email</th>
                                <th className="table-header">Peran</th>
                                <th className="table-header text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="table-cell">
                                        <div className="flex items-center gap-3">
                                            {u.photo ? (
                                                <img src={u.photo} alt={u.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#327169' }}>
                                                    <span className="text-white text-xs font-bold">{u.name.charAt(0)}</span>
                                                </div>
                                            )}
                                            <span className="font-semibold text-gray-800">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="table-cell font-mono text-sm text-gray-600">{u.nik || '—'}</td>
                                    <td className="table-cell font-mono text-sm text-gray-600">{u.username}</td>
                                    <td className="table-cell text-gray-500 text-sm">{u.email}</td>
                                    <td className="table-cell">
                                        <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full', ROLE_COLOR[u.role] || 'bg-gray-100 text-gray-600')}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="table-cell text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => toast.info('Edit pengguna – hubungkan ke API backend.')}
                                                className="text-blue-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-all"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => deleteUser(u.id, u.name)}
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Kitchen Staff section */}
            <div className="card">
                <div className="flex items-center gap-2 mb-4">
                    <ChefHat size={20} className="text-orange-500" />
                    <div>
                        <h3 className="font-bold text-gray-900">Data Staf Dapur</h3>
                        <p className="text-xs text-gray-400">Staf dapur tidak memerlukan akun login – hanya untuk dokumentasi</p>
                    </div>
                </div>

                <div className="flex gap-3 mb-4">
                    <input
                        type="text"
                        placeholder="Nama staf dapur"
                        className="input-field flex-1"
                        value={kitchenStaffName}
                        onChange={(e) => setKitchenStaffName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Jabatan"
                        className="input-field w-48"
                        value={kitchenStaffPos}
                        onChange={(e) => setKitchenStaffPos(e.target.value)}
                    />
                    <button onClick={addKitchenStaff} className="btn-primary flex-shrink-0">
                        <Plus size={16} /> Tambah
                    </button>
                </div>

                <div className="space-y-2">
                    {kitchenStaff.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-3 bg-orange-50/50 border border-orange-100 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                    <ChefHat size={14} className="text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                                    <p className="text-xs text-gray-400">{s.position || '—'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeKitchenStaff(s.id)}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {kitchenStaff.length === 0 && (
                        <p className="text-center py-4 text-gray-400 text-sm">Belum ada staf dapur.</p>
                    )}
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <UserCog size={20} className="text-primary" /> Tambah Pengguna Baru
                            </h3>
                            <button onClick={closeAddModal} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onAddUser)} className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Nama Lengkap *</label>
                                <input type="text" className="input-field" placeholder="cth. Dr. Budi" {...register('name', { required: true })} />
                            </div>
                            <div>
                                <label className="label">NIK *</label>
                                <input type="text" className="input-field" placeholder="cth. 2026111" {...register('nik', { required: true })} />
                            </div>
                            <div>
                                <label className="label">Username *</label>
                                <input type="text" className="input-field" placeholder="cth. budi" {...register('username', { required: true })} />
                            </div>
                            <div>
                                <label className="label">Email *</label>
                                <input type="email" className="input-field" placeholder="cth. budi@mbg.go.id" {...register('email', { required: true })} />
                            </div>
                            <div>
                                <label className="label">Peran *</label>
                                <select className="input-field" {...register('role', { required: true })}>
                                    {Object.values(ROLES).map((r) => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label flex items-center gap-1"><ImageIcon size={14} /> Upload Foto Profil</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="input-field text-sm"
                                    onChange={handlePhotoChange}
                                />
                                {photoPreview && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <img src={photoPreview} alt="Preview" className="w-8 h-8 rounded-full object-cover" />
                                        <span className="text-xs text-green-600 font-semibold">Foto siap digunakan</span>
                                    </div>
                                )}
                            </div>
                            <div className="col-span-2">
                                <label className="label">Password *</label>
                                <input type="password" className="input-field" placeholder="••••••••" {...register('password', { required: true, minLength: 6 })} />
                                {errors.password && <p className="text-red-500 text-xs mt-1">Password minimal 6 karakter</p>}
                            </div>
                            <div className="col-span-2 flex gap-3 pt-4 border-t mt-2">
                                <button type="submit" className="btn-primary flex-1 justify-center">
                                    <Check size={16} /> Simpan Pengguna
                                </button>
                                <button type="button" onClick={closeAddModal} className="btn-secondary w-32 justify-center">
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
