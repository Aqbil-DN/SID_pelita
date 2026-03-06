import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Navigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, CreditCard, Info } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../store/authStore'
import { DEMO_USERS } from '../lib/constants'
import logoSrc from '../assets/Logo.jpeg'

export default function LoginPage() {
    const navigate = useNavigate()
    const { isAuthenticated, setUser } = useAuthStore()
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm()
    const [showPassword, setShowPassword] = useState(false)

    const handleFillDemo = (nik, password) => {
        setValue('nik', nik)
        setValue('password', password)
    }

    if (isAuthenticated) return <Navigate to="/dashboard" replace />

    const onSubmit = ({ nik, password }) => {
        const user = DEMO_USERS.find(
            (u) => u.nik === nik.trim() && u.password === password
        )
        if (!user) {
            toast.error('NIK atau Password salah!')
            return
        }
        const { password: _, ...safeUser } = user
        setUser(safeUser, `demo-token-${user.id}`)
        toast.success(`Selamat datang, ${user.name}!`)
        navigate('/dashboard')
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: 'linear-gradient(135deg, #327169 0%, #438c81 50%, #275c54 100%)',
            }}
        >
            {/* Glass card */}
            <div
                className="w-full max-w-md rounded-3xl shadow-2xl p-8 relative overflow-hidden"
                style={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(20px)',
                }}
            >
                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full" style={{ backgroundColor: 'rgba(163,199,199,0.25)' }} />
                <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full" style={{ backgroundColor: 'rgba(67,140,129,0.15)' }} />

                {/* Logo + Title */}
                <div className="relative z-10 text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img
                            src={logoSrc}
                            alt="Sistem Informasi Dapur"
                            className="w-16 h-16 rounded-2xl object-cover shadow-lg ring-4"
                            style={{ ringColor: 'rgba(163,199,199,0.4)' }}
                        />
                    </div>
                    <h1 className="text-2xl font-extrabold" style={{ color: '#327169' }}>
                        Sistem Informasi Dapur
                    </h1>
                    <p className="text-sm mt-1" style={{ color: '#4d4d4d' }}>
                        Platform Manajemen Produksi Makanan
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 space-y-5">
                    {/* NIK */}
                    <div>
                        <label className="label">No. Induk Karyawan (NIK)</label>
                        <div className="relative">
                            <CreditCard
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2"
                                style={{ color: '#a3c7c7' }}
                            />
                            <input
                                {...register('nik', { required: 'NIK wajib diisi' })}
                                type="text"
                                placeholder="Masukkan NIK"
                                className="input-field pl-10"
                                autoComplete="off"
                            />
                        </div>
                        {errors.nik && (
                            <p className="text-xs text-red-500 mt-1">{errors.nik.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="label">Password</label>
                        <div className="relative">
                            <Lock
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2"
                                style={{ color: '#a3c7c7' }}
                            />
                            <input
                                {...register('password', { required: 'Password wajib diisi' })}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Masukkan password"
                                className="input-field pl-10 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full justify-center py-3 text-base rounded-xl shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #327169, #438c81)' }}
                    >
                        {isSubmitting ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                {/* Demo accounts panel */}
                <div
                    className="relative z-10 mt-6 rounded-xl p-4"
                    style={{ backgroundColor: 'rgba(163,199,199,0.15)', border: '1px solid rgba(163,199,199,0.3)' }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Info size={14} style={{ color: '#327169' }} />
                        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#327169' }}>
                            Demo Accounts
                        </span>
                    </div>
                    <div className="space-y-1.5">
                        {DEMO_USERS.map((u) => (
                            <div
                                key={u.id}
                                onClick={() => handleFillDemo(u.nik, u.password)}
                                className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
                            >
                                <span className="font-semibold" style={{ color: '#4d4d4d' }}>{u.role}</span>
                                <span style={{ color: '#438c81' }}>
                                    NIK: <span className="font-bold">{u.nik}</span> / <span className="font-bold">{u.password}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
