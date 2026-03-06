import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div
                className="flex-1 flex flex-col min-w-0 transition-all duration-300"
                style={{ marginLeft: '260px' }}
            >
                <Navbar toggleSidebar={() => setSidebarOpen(v => !v)} />

                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
