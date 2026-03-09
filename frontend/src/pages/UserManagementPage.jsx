import React, { useState, useRef } from 'react'
import { Users, Plus, Eye, X, Check, UserCog, ChefHat, Upload, ArrowDown, FileText, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { DEMO_USERS, ROLES, STAFF_POSITIONS } from '../lib/constants'
import clsx from 'clsx'

import user1Img from '../assets/user1.jpeg'
import user2Img from '../assets/user2.jpeg'
import danielImg from '../assets/daniel.jpeg'
import gitaImg from '../assets/Gita.jpeg'
import haerin from '../assets/Haerin.jpeg'

const ROLE_COLOR = {
    [ROLES.ADMIN]: 'bg-purple-100 text-purple-700',
    [ROLES.NUTRITIONIST]: 'bg-accent-light text-primary',
    [ROLES.HEAD_CHEF]: 'bg-orange-100 text-orange-700',
    [ROLES.ACCOUNTANT]: 'bg-blue-100 text-blue-700',
    [ROLES.SCD]: 'bg-indigo-100 text-indigo-700',
    [ROLES.WAREHOUSE]: 'bg-yellow-100 text-yellow-700',
    [ROLES.SUPERVISOR]: 'bg-teal-100 text-teal-700',
    [ROLES.CPCD]: 'bg-gray-100 text-gray-700',
}

const STAFF_INIT = [
    { id: 1, name: 'Pak Joko', position: 'Cook', ttl: 'Jakarta, 1 Jun 1985', nik: '3001', domicile: 'Jakarta Timur', photo: user1Img, documents: { coverLetter: 'Lamaran_Joko.pdf', cv: 'CV_Joko.pdf', ktp: 'KTP_Joko.pdf', passportPhoto: 'Foto_Joko.jpg', diploma: 'Ijazah_Joko.pdf', skck: 'SKCK_Joko.pdf', healthCert: 'Sehat_Joko.pdf' } },
    { id: 2, name: 'Bu Siti', position: 'Assistant Cook', ttl: 'Bandung, 12 Mar 1990', nik: '3002', domicile: 'Bandung Barat', photo: gitaImg, documents: { coverLetter: 'Lamaran_Siti.pdf', cv: 'CV_Siti.pdf', ktp: 'KTP_Siti.pdf', passportPhoto: 'Foto_Siti.jpg', diploma: 'Ijazah_Siti.pdf', skck: 'SKCK_Siti.pdf', healthCert: 'Sehat_Siti.pdf', sim: 'SIM_Siti.pdf' } },
    { id: 3, name: 'Pak Budi', position: 'Kitchen Helper', ttl: 'Depok, 5 Jul 1988', nik: '3003', domicile: 'Depok', photo: danielImg, documents: { coverLetter: 'Lamaran_Budi.pdf', cv: 'CV_Budi.pdf', ktp: 'KTP_Budi.pdf', passportPhoto: 'Foto_Budi.jpg', diploma: 'Ijazah_Budi.pdf', skck: 'SKCK_Budi.pdf', healthCert: 'Sehat_Budi.pdf' } },
    { id: 4, name: 'Dinda Rahayu', position: 'Quality Control', ttl: 'Surabaya, 18 Nov 1992', nik: '3004', domicile: 'Surabaya', photo: haerin, documents: { coverLetter: 'Lamaran_Dinda.pdf', cv: 'CV_Dinda.pdf', ktp: 'KTP_Dinda.pdf', passportPhoto: 'Foto_Dinda.jpg', diploma: 'Ijazah_Dinda.pdf', skck: 'SKCK_Dinda.pdf', healthCert: 'Sehat_Dinda.pdf', skillCerts: 'Sertifikat_Dinda.pdf' } },
    { id: 5, name: 'Rizky Firmansyah', position: 'Delivery Driver', ttl: 'Bogor, 22 Apr 1995', nik: '3005', domicile: 'Bogor', photo: user2Img, documents: { coverLetter: 'Lamaran_Rizky.pdf', cv: 'CV_Rizky.pdf', ktp: 'KTP_Rizky.pdf', passportPhoto: 'Foto_Rizky.jpg', diploma: 'Ijazah_Rizky.pdf', skck: 'SKCK_Rizky.pdf', healthCert: 'Sehat_Rizky.pdf', sim: 'SIM_Rizky.pdf', employmentCert: 'Pengalaman_Rizky.pdf' } },
]

const DOC_LABELS = {
    passportPhoto: 'Pas Foto 4×6 (Latar Biru)', ktp: 'Scan KTP', coverLetter: 'Surat Lamaran Kerja',
    cv: 'Daftar Riwayat Hidup (CV)', diploma: 'Ijazah Terakhir & Transkrip Nilai', skck: 'SKCK',
    healthCert: 'Surat Keterangan Sehat', employmentCert: 'Surat Pengalaman Kerja',
    sim: 'Scan SIM A / C', skillCerts: 'Sertifikat Keterampilan', drugFreeCert: 'Surat Bebas Narkoba',
}

const DOC_UPLOAD_FIELDS = [
    { key: 'coverLetter', label: 'Surat Lamaran Kerja', required: true },
    { key: 'cv', label: 'Daftar Riwayat Hidup (CV)', required: true },
    { key: 'ktp', label: 'Scan KTP', required: true },
    { key: 'passportPhoto', label: 'Pas Foto 4x6 (Latar Biru)', required: true },
    { key: 'diploma', label: 'Ijazah Terakhir & Transkrip Nilai', required: true },
    { key: 'skck', label: 'SKCK', required: true },
    { key: 'healthCert', label: 'Surat Keterangan Sehat', required: true },
    { key: 'employmentCert', label: 'Surat Pengalaman Kerja', required: false, note: 'Jika sudah pernah bekerja' },
    { key: 'sim', label: 'Scan SIM A / C', required: false },
    { key: 'skillCerts', label: 'Sertifikat Keterampilan', required: false },
    { key: 'drugFreeCert', label: 'Surat Bebas Narkoba', required: false },
]

// ─── Confirm Delete ──────────────────────────────────────────────────────────
function ConfirmModal({ name, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center"><Trash2 size={18} className="text-red-500" /></div>
                    <div>
                        <h3 className="font-bold text-gray-900">Hapus Data?</h3>
                        <p className="text-xs text-gray-400">Aksi ini tidak dapat dibatalkan.</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mb-5">Anda akan menghapus <span className="font-bold text-primary">"{name}"</span>.</p>
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

// ─── File Upload ──────────────────────────────────────────────────────────────
function FileUploadField({ field, files, setFiles }) {
    const ref = useRef()
    const file = files[field.key]
    return (
        <div>
            <label className="label flex items-center gap-1">
                {field.label}
                {field.required ? <span className="text-red-400">*</span> : <span className="text-xs text-tertiary/40 ml-1">(Opsional)</span>}
            </label>
            {field.note && <p className="text-[10px] text-tertiary/40 -mt-1 mb-1">{field.note}</p>}
            <input ref={ref} type="file" accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={e => {
                if (e.target.files[0]) setFiles(prev => ({ ...prev, [field.key]: e.target.files[0] }))
            }} />
            <button type="button" onClick={() => ref.current?.click()}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-primary text-left"
                style={{ borderColor: file ? '#327169' : '#e5e7eb', backgroundColor: file ? 'rgba(50,113,105,0.04)' : 'transparent' }}>
                <Upload size={14} className="text-tertiary/40 flex-shrink-0" />
                <span className="text-sm truncate" style={{ color: file ? '#327169' : 'rgba(77,77,77,0.4)' }}>
                    {file ? file.name : 'Pilih file...'}
                </span>
                {file && <Check size={13} className="ml-auto text-green-500 flex-shrink-0" />}
            </button>
        </div>
    )
}

// ─── Staff Detail Modal ───────────────────────────────────────────────────────
function StaffDetailModal({ person, onClose }) {
    const docs = person.documents || {}
    return (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
            <div className="relative flex flex-col h-full bg-white shadow-2xl overflow-y-auto" style={{ width: 'min(560px,100vw)' }} onClick={e => e.stopPropagation()}>
                <div className="flex-shrink-0 px-6 py-5 border-b" style={{ borderColor: '#e5e7eb', background: 'linear-gradient(135deg,rgba(50,113,105,0.06) 0%,rgba(163,199,199,0.10) 100%)' }}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            {person.photo ? <img src={person.photo} alt={person.name} className="w-20 h-24 rounded-2xl object-cover border-2" style={{ borderColor: '#a3c7c7' }} />
                                : <div className="w-20 h-24 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#327169' }}><span className="text-white text-2xl font-bold">{person.name?.charAt(0)}</span></div>}
                            <div>
                                <h2 className="text-lg font-extrabold" style={{ color: '#327169' }}>{person.name}</h2>
                                <p className="text-sm font-semibold" style={{ color: '#438c81' }}>{person.position || '—'}</p>
                                <p className="text-xs mt-1" style={{ color: 'rgba(77,77,77,0.5)' }}>NIK: {person.nik || '—'}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-400"><X size={20} /></button>
                    </div>
                </div>
                <div className="flex-1 px-6 py-5 space-y-5">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#327169' }}>Data Pribadi</p>
                        {[['1. Nama Lengkap', person.name], ['2. Posisi Karyawan', person.position], ['3. NIK', person.nik], ['4. Domisili Relawan', person.domicile], ['5. Tempat, Tanggal Lahir', person.ttl]].map(([label, value]) => (
                            <div key={label} className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#f3f4f6' }}>
                                <p className="text-xs font-semibold" style={{ color: 'rgba(77,77,77,0.5)' }}>{label}</p>
                                <p className="text-sm font-bold text-right" style={{ color: '#4d4d4d' }}>{value || '—'}</p>
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#327169' }}>Dokumen & Berkas</p>
                        {[{ num: 6, key: 'passportPhoto', isImage: true }, { num: 7, key: 'coverLetter' }, { num: 8, key: 'cv' }, { num: 9, key: 'diploma' }, { num: 10, key: 'skck' }, { num: 11, key: 'healthCert' }, { num: 12, key: 'employmentCert' }, { num: 13, key: 'sim' }, { num: 14, key: 'skillCerts' }, { num: 15, key: 'drugFreeCert' }].map(({ num, key, isImage }) => {
                            const fileName = docs[key]
                            return (
                                <div key={key} className="flex items-center gap-3 py-2.5 border-b" style={{ borderColor: '#f3f4f6' }}>
                                    <span className="text-[10px] font-bold w-5 text-center" style={{ color: '#a3c7c7' }}>{num}</span>
                                    {isImage && person.photo ? <img src={person.photo} alt="Pas Foto" className="w-8 h-10 rounded-lg object-cover border" /> : <FileText size={14} style={{ color: fileName ? '#438c81' : '#d1d5db' }} className="flex-shrink-0" />}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold" style={{ color: 'rgba(77,77,77,0.5)' }}>{DOC_LABELS[key] || key}</p>
                                        {fileName ? <p className="text-xs font-bold truncate" style={{ color: '#327169' }}>{fileName}</p> : <p className="text-xs italic" style={{ color: '#d1d5db' }}>Tidak diupload</p>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Edit Account Modal ───────────────────────────────────────────────────────
function EditAccountModal({ account, onSave, onClose }) {
    const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: account })
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Pencil size={18} className="text-secondary" /> Edit Akun</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit(onSave)} className="grid grid-cols-2 gap-4">
                    <div><label className="label">Nama Lengkap <span className="text-red-400">*</span></label><input className="input-field" {...register('name', { required: true })} /></div>
                    <div><label className="label">Username</label><input className="input-field" {...register('username')} /></div>
                    <div><label className="label">NIK</label><input type="number" className="input-field" {...register('nik')} /></div>
                    <div><label className="label">Jabatan</label>
                        <select className="input-field" {...register('position')}>
                            <option value="">— Pilih —</option>
                            {STAFF_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div><label className="label">Peran</label>
                        <select className="input-field" {...register('role')}>{Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}</select>
                    </div>
                    <div><label className="label">Email</label><input type="email" className="input-field" {...register('email')} /></div>
                    <div className="col-span-2 flex gap-3 pt-4 border-t mt-2">
                        <button type="submit" className="btn-primary flex-1 justify-center"><Check size={16} /> Simpan Perubahan</button>
                        <button type="button" onClick={onClose} className="btn-secondary w-32 justify-center">Batal</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Edit Staff Modal ─────────────────────────────────────────────────────────
function EditStaffModal({ person, onSave, onClose }) {
    const { register, handleSubmit } = useForm({ defaultValues: person })
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Pencil size={18} className="text-secondary" /> Edit Karyawan</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit(onSave)} className="grid grid-cols-2 gap-4">
                    <div><label className="label">Nama Lengkap <span className="text-red-400">*</span></label><input className="input-field" {...register('name', { required: true })} /></div>
                    <div><label className="label">Posisi</label>
                        <select className="input-field" {...register('position')}>{STAFF_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}</select>
                    </div>
                    <div><label className="label">NIK</label><input type="number" className="input-field" {...register('nik')} /></div>
                    <div><label className="label">Domisili</label><input className="input-field" {...register('domicile')} /></div>
                    <div className="col-span-2"><label className="label">TTL</label><input className="input-field" placeholder="cth. Jakarta, 15 Maret 1990" {...register('ttl')} /></div>
                    <div className="col-span-2 flex gap-3 pt-4 border-t mt-2">
                        <button type="submit" className="btn-primary flex-1 justify-center"><Check size={16} /> Simpan Perubahan</button>
                        <button type="button" onClick={onClose} className="btn-secondary w-32 justify-center">Batal</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UserManagementPage() {
    const [users, setUsers] = useState(DEMO_USERS.map(({ password: _, ...u }) => u))
    const [staff, setStaff] = useState(STAFF_INIT)
    const [showAddAccountModal, setShowAddAccountModal] = useState(false)
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)
    const [showAll, setShowAll] = useState(false)
    const [detailPerson, setDetailPerson] = useState(null)
    const [docFiles, setDocFiles] = useState({})
    const [acctPhotoPreview, setAcctPhotoPreview] = useState(null)
    const [empPhotoPreview, setEmpPhotoPreview] = useState(null)

    // Edit/Delete state
    const [editAccount, setEditAccount] = useState(null)
    const [editStaff, setEditStaff] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null) // { type: 'account'|'staff', id, name }

    const acctForm = useForm()
    const empForm = useForm()
    const displayStaff = showAll ? staff : staff.slice(0, 3)

    const onAddAccount = (data) => {
        setUsers(prev => [...prev, { id: Date.now(), ...data, photo: acctPhotoPreview }])
        toast.success(`Akun "${data.name}" berhasil ditambahkan!`)
        acctForm.reset(); setAcctPhotoPreview(null); setShowAddAccountModal(false)
    }
    const onAddEmployee = (data) => {
        for (const field of DOC_UPLOAD_FIELDS) {
            if (field.required && !docFiles[field.key]) { toast.error(`Upload wajib: ${field.label}`); return }
        }
        const docs = {}
        Object.entries(docFiles).forEach(([k, f]) => { docs[k] = f.name })
        setStaff(prev => [...prev, { id: Date.now(), ...data, photo: empPhotoPreview, documents: docs }])
        toast.success(`Karyawan "${data.name}" berhasil ditambahkan!`)
        empForm.reset(); setEmpPhotoPreview(null); setDocFiles({}); setShowAddEmployeeModal(false)
    }

    const handleSaveAccount = (data) => {
        setUsers(prev => prev.map(u => u.id === editAccount.id ? { ...u, ...data } : u))
        toast.success(`Akun "${data.name}" diperbarui!`); setEditAccount(null)
    }
    const handleSaveStaff = (data) => {
        setStaff(prev => prev.map(s => s.id === editStaff.id ? { ...s, ...data } : s))
        toast.success(`Karyawan "${data.name}" diperbarui!`); setEditStaff(null)
    }
    const handleDeleteConfirm = () => {
        if (deleteTarget.type === 'account') setUsers(prev => prev.filter(u => u.id !== deleteTarget.id))
        else setStaff(prev => prev.filter(s => s.id !== deleteTarget.id))
        toast.success(`"${deleteTarget.name}" berhasil dihapus.`); setDeleteTarget(null)
    }

    const closeAcctModal = () => { setShowAddAccountModal(false); setAcctPhotoPreview(null); acctForm.reset() }
    const closeEmpModal = () => { setShowAddEmployeeModal(false); setEmpPhotoPreview(null); setDocFiles({}); empForm.reset() }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                <p className="text-sm text-gray-400">Kelola akun pengguna & data karyawan</p>
            </div>

            {/* ════ Account List (Edit + Delete, NO Detail) ════ */}
            <div className="card overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-primary text-sm flex items-center gap-2"><Users size={16} /> Akun Pengguna Sistem ({users.length})</h3>
                    <button onClick={() => setShowAddAccountModal(true)} className="btn-primary text-xs"><Plus size={14} /> Tambah Akun</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="table-header">Profil</th>
                                <th className="table-header">NIK</th>
                                <th className="table-header">Jabatan</th>
                                <th className="table-header">Peran</th>
                                <th className="table-header">Email</th>
                                <th className="table-header text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="table-cell">
                                        <div className="flex items-center gap-3">
                                            {u.photo ? <img src={u.photo} alt={u.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                                                : <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#327169' }}><span className="text-white text-xs font-bold">{u.name.charAt(0)}</span></div>}
                                            <span className="font-semibold text-gray-800">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="table-cell font-mono text-xs text-gray-600">{u.nik || '—'}</td>
                                    <td className="table-cell text-xs">{u.position || '—'}</td>
                                    <td className="table-cell">
                                        <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full', ROLE_COLOR[u.role] || 'bg-gray-100 text-gray-600')}>{u.role}</span>
                                    </td>
                                    <td className="table-cell text-gray-500 text-xs">{u.email || '—'}</td>
                                    <td className="table-cell text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button onClick={() => setEditAccount(u)} className="p-1.5 rounded-lg text-white hover:opacity-80 transition-opacity" style={{ backgroundColor: '#438c81' }}><Pencil size={12} /></button>
                                            <button onClick={() => setDeleteTarget({ type: 'account', id: u.id, name: u.name })} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={12} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ════ Staff Cards (Detail + Edit + Delete) ════ */}
            <div className="card">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <ChefHat size={20} className="text-orange-500" />
                        <div>
                            <h3 className="font-bold text-gray-900">Staff ({staff.length})</h3>
                            <p className="text-xs text-gray-400">Data karyawan lengkap dengan dokumen</p>
                        </div>
                    </div>
                    <button onClick={() => setShowAddEmployeeModal(true)} className="btn-primary text-xs"><Plus size={14} /> Tambah Karyawan</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayStaff.map(s => (
                        <div key={s.id} className="rounded-2xl border p-4 flex flex-col items-center text-center transition-all hover:shadow-md" style={{ borderColor: '#e5e7eb', backgroundColor: '#fafbfc' }}>
                            {s.photo ? <img src={s.photo} alt={s.name} className="w-20 h-20 rounded-2xl object-cover mb-3 border-2" style={{ borderColor: '#a3c7c7' }} />
                                : <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: '#438c81' }}><span className="text-white text-2xl font-bold">{s.name?.charAt(0)}</span></div>}
                            <p className="font-bold text-sm" style={{ color: '#327169' }}>{s.name}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(77,77,77,0.5)' }}>{s.ttl || '—'}</p>
                            <p className="text-[11px] font-mono" style={{ color: 'rgba(77,77,77,0.4)' }}>NIK: {s.nik || '—'}</p>
                            <span className="mt-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(67,140,129,0.1)', color: '#438c81' }}>{s.position || '—'}</span>
                            <div className="mt-3 flex gap-1.5 w-full">
                                <button onClick={() => setDetailPerson(s)}
                                    className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-bold px-2 py-2 rounded-xl text-white hover:opacity-80 transition-opacity"
                                    style={{ backgroundColor: '#438c81' }}><Eye size={12} /> Detail</button>
                                <button onClick={() => setEditStaff(s)}
                                    className="inline-flex items-center justify-center p-2 rounded-xl text-white hover:opacity-80 transition-opacity"
                                    style={{ backgroundColor: '#327169' }}><Pencil size={12} /></button>
                                <button onClick={() => setDeleteTarget({ type: 'staff', id: s.id, name: s.name })}
                                    className="inline-flex items-center justify-center p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                    <Trash2 size={12} /></button>
                            </div>
                        </div>
                    ))}
                </div>
                {staff.length === 0 && <p className="text-center py-8 text-gray-400 text-sm italic">Belum ada data karyawan.</p>}
                {staff.length > 3 && (
                    <div className="mt-5 text-center">
                        <button onClick={() => setShowAll(!showAll)}
                            className="inline-flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-80"
                            style={{ backgroundColor: '#438c81' }}>
                            <ArrowDown size={14} className={clsx('transition-transform', showAll && 'rotate-180')} />
                            {showAll ? 'Tutup' : `Lihat Semua (${staff.length})`}
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            {detailPerson && <StaffDetailModal person={detailPerson} onClose={() => setDetailPerson(null)} />}
            {editAccount && <EditAccountModal account={editAccount} onSave={handleSaveAccount} onClose={() => setEditAccount(null)} />}
            {editStaff && <EditStaffModal person={editStaff} onSave={handleSaveStaff} onClose={() => setEditStaff(null)} />}
            {deleteTarget && <ConfirmModal name={deleteTarget.name} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />}

            {/* Add Account Modal */}
            {showAddAccountModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeAcctModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><UserCog size={20} className="text-primary" /> Tambah Akun Baru</h3>
                            <button onClick={closeAcctModal} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><X size={20} /></button>
                        </div>
                        <form onSubmit={acctForm.handleSubmit(onAddAccount)} className="grid grid-cols-2 gap-4">
                            <div><label className="label">Nama Lengkap <span className="text-red-400">*</span></label><input type="text" className="input-field" placeholder="cth. Ahmad Fauzi" {...acctForm.register('name', { required: true })} /></div>
                            <div><label className="label">Username <span className="text-red-400">*</span></label><input type="text" className="input-field" {...acctForm.register('username', { required: true })} /></div>
                            <div><label className="label">NIK <span className="text-red-400">*</span></label><input type="number" className="input-field" {...acctForm.register('nik', { required: true })} /></div>
                            <div><label className="label">Jabatan <span className="text-red-400">*</span></label>
                                <select className="input-field" {...acctForm.register('position', { required: true })}><option value="">— Pilih —</option>{STAFF_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                            <div><label className="label">Role Sistem <span className="text-red-400">*</span></label>
                                <select className="input-field" {...acctForm.register('role', { required: true })}>{Object.values(ROLES).map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                            <div><label className="label">Email <span className="text-red-400">*</span></label><input type="email" className="input-field" {...acctForm.register('email', { required: true })} /></div>
                            <div><label className="label">Foto Profil</label>
                                <input type="file" accept="image/*" className="input-field text-sm" onChange={e => { const f = e.target.files[0]; if (f) { const r = new FileReader(); r.onloadend = () => setAcctPhotoPreview(r.result); r.readAsDataURL(f) } }} />
                                {acctPhotoPreview && <img src={acctPhotoPreview} alt="" className="w-8 h-8 rounded-full object-cover mt-2" />}</div>
                            <div className="col-span-2 flex gap-3 pt-4 border-t mt-2">
                                <button type="submit" className="btn-primary flex-1 justify-center"><Check size={16} /> Simpan Akun</button>
                                <button type="button" onClick={closeAcctModal} className="btn-secondary w-32 justify-center">Batal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Employee Modal */}
            {showAddEmployeeModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeEmpModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5 sticky top-0 bg-white pb-3 border-b z-10" style={{ borderColor: '#f3f4f6' }}>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><ChefHat size={20} className="text-orange-500" /> Tambah Karyawan Baru</h3>
                            <button onClick={closeEmpModal} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"><X size={20} /></button>
                        </div>
                        <form onSubmit={empForm.handleSubmit(onAddEmployee)} className="space-y-5">
                            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#327169' }}>Data Pribadi</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="label">Nama Lengkap <span className="text-red-400">*</span></label><input type="text" className="input-field" {...empForm.register('name', { required: true })} /></div>
                                <div><label className="label">Posisi <span className="text-red-400">*</span></label>
                                    <select className="input-field" {...empForm.register('position', { required: true })}><option value="">— Pilih —</option>{STAFF_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                                <div><label className="label">NIK <span className="text-red-400">*</span></label><input type="number" className="input-field" {...empForm.register('nik', { required: true })} /></div>
                                <div><label className="label">Domisili <span className="text-red-400">*</span></label><input type="text" className="input-field" {...empForm.register('domicile', { required: true })} /></div>
                                <div className="col-span-2"><label className="label">TTL <span className="text-red-400">*</span></label><input type="text" className="input-field" placeholder="cth. Jakarta, 15 Maret 1990" {...empForm.register('ttl', { required: true })} /></div>
                            </div>
                            <div className="border-t pt-5 mt-4" style={{ borderColor: '#f3f4f6' }}>
                                <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: '#327169' }}>Dokumen & Berkas</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {DOC_UPLOAD_FIELDS.map(field => {
                                        if (field.key === 'passportPhoto') {
                                            return (
                                                <div key={field.key}>
                                                    <label className="label">Pas Foto 4x6 (Latar Biru) <span className="text-red-400">*</span></label>
                                                    <input type="file" accept="image/*" className="input-field text-sm" onChange={e => {
                                                        const f = e.target.files[0]; if (f) { setDocFiles(prev => ({ ...prev, passportPhoto: f })); const r = new FileReader(); r.onloadend = () => setEmpPhotoPreview(r.result); r.readAsDataURL(f) }
                                                    }} />
                                                    {empPhotoPreview && <img src={empPhotoPreview} alt="" className="w-10 h-12 rounded-lg object-cover mt-2 border" />}
                                                </div>
                                            )
                                        }
                                        return <FileUploadField key={field.key} field={field} files={docFiles} setFiles={setDocFiles} />
                                    })}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t mt-2">
                                <button type="submit" className="btn-primary flex-1 justify-center"><Check size={16} /> Simpan Karyawan</button>
                                <button type="button" onClick={closeEmpModal} className="btn-secondary w-32 justify-center">Batal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
