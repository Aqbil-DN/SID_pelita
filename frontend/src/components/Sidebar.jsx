import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, GitBranch, UtensilsCrossed, CheckSquare, ListChecks, Activity,
    PackagePlus, BadgeDollarSign, ShoppingCart, PackageSearch, PackageCheck,
    ClipboardCheck, School, Calculator, Timer, Truck, BarChart3, Users,
    Megaphone, Monitor, X
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import { NAV_ITEMS } from '../lib/constants'
import logoSrc from '../assets/Logo.jpeg'

const iconMap = {
    LayoutDashboard, GitBranch, UtensilsCrossed, CheckSquare, ListChecks, Activity,
    PackagePlus, BadgeDollarSign, ShoppingCart, PackageSearch, PackageCheck,
    ClipboardCheck, School, Calculator, Timer, Truck, BarChart3, Users,
    Megaphone, Monitor,
}

export default function Sidebar({ isOpen, setIsOpen }) {
    const { user } = useAuthStore()
    const location = useLocation()

    const filteredItems = NAV_ITEMS.filter(item => {
        if (item.roles === 'all') return true
        if (!user) return false
        return item.roles.includes(user.role)
    })

    // Group: main, role-specific, display
    const mainItems = filteredItems.filter(i => ['dashboard', 'workflow'].includes(i.key))
    const roleItems = filteredItems.filter(i => !['dashboard', 'workflow'].includes(i.key) && !i.kiosk)
    const displayItems = filteredItems.filter(i => i.kiosk)

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setIsOpen(false)} />}

            <aside
                className={`fixed top-0 left-0 z-40 h-full flex flex-col transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ width: '260px', backgroundColor: '#327169', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <img src={logoSrc} alt="Logo" className="w-10 h-10 rounded-xl object-cover ring-2" style={{ ringColor: 'rgba(255,255,255,0.2)' }} />
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-extrabold text-sm leading-tight">Sistem Informasi</p>
                        <p className="text-xs font-semibold" style={{ color: '#a3c7c7' }}>Dapur</p>
                    </div>
                    <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setIsOpen(false)}><X size={18} /></button>
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {/* Main */}
                    {mainItems.map(item => <SidebarLink key={item.key} item={item} location={location} />)}

                    {/* Role-specific */}
                    {roleItems.length > 0 && (
                        <>
                            <div className="pt-4 pb-1 px-2"><p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Menu</p></div>
                            {roleItems.map(item => <SidebarLink key={item.key} item={item} location={location} />)}
                        </>
                    )}

                    {/* Display suite */}
                    {displayItems.length > 0 && (
                        <>
                            <div className="pt-4 pb-1 px-2"><p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Display</p></div>
                            {displayItems.map(item => <SidebarLink key={item.key} item={item} location={location} />)}
                        </>
                    )}
                </nav>

                {/* Footer */}
                <div className="px-5 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#a3c7c7' }}>
                            {user?.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
                            <p className="text-[10px] truncate" style={{ color: '#a3c7c7' }}>{user?.role} • NIK: {user?.nik}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}

function SidebarLink({ item, location }) {
    const Icon = iconMap[item.icon] || LayoutDashboard
    const isActive = location.pathname === item.path

    return (
        <NavLink
            to={item.path}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                fontWeight: isActive ? 700 : 500,
            }}
        >
            <Icon size={17} />
            <span className="truncate">{item.label}</span>
            {item.kiosk && <span className="ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#a3c7c7' }}>TV</span>}
        </NavLink>
    )
}
