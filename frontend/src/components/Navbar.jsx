import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, LogOut, Bell, User } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../store/authStore'
import { NAV_ITEMS } from '../lib/constants'

const pageTitles = Object.fromEntries(NAV_ITEMS.map(i => [i.path, i.label]))

export default function Navbar({ toggleSidebar }) {
    const { user, logout: clearAuth } = useAuthStore()
    const location = useLocation()
    const navigate = useNavigate()

    const pageTitle = pageTitles[location.pathname] || 'Dashboard'

    const handleLogout = () => {
        clearAuth()
        toast.info('Anda telah logout.')
        navigate('/login')
    }

    const roleBadgeColor = {
        Admin: '#dc2626',
        Nutritionist: '#16a34a',
        'Head Chef': '#b45309',
        Accountant: '#6b21a8',
        SCD: '#2563eb',
        Warehouse: '#0891b2',
        Supervisor: '#db2777',
    }

    return (
        <header
            className="flex items-center justify-between px-6 py-3 border-b"
            style={{ backgroundColor: '#fff', borderColor: '#f3f4f6', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="lg:hidden text-tertiary hover:text-primary"><Menu size={20} /></button>
                <h1 className="text-lg font-extrabold text-primary">{pageTitle}</h1>
            </div>

            <div className="flex items-center gap-3">
                {/* Notifications */}
                <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <Bell size={18} className="text-tertiary/60" />
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                </button>

                {/* User info */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-50">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#327169', color: '#fff' }}>
                        {user?.name?.charAt(0) || '?'}
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-xs font-bold text-primary leading-tight">{user?.name}</p>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: roleBadgeColor[user?.role] || '#6b7280' }}>{user?.role}</span>
                            <span className="text-[9px] text-tertiary/40">NIK: {user?.nik}</span>
                        </div>
                    </div>
                </div>

                {/* Logout */}
                <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-red-50 transition-colors text-tertiary/60 hover:text-red-500" title="Logout">
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    )
}
