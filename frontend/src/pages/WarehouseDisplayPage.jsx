import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, AlertTriangle, Package, Bell } from 'lucide-react'

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────

const STOCK_ITEMS = [
    { id: 1, name: 'Beras Premium', qty: 250, unit: 'kg', date: '2026-03-01', supplier: 'CV Sumber Beras' },
    { id: 2, name: 'Beras Premium', qty: 100, unit: 'kg', date: '2026-02-28', supplier: 'UD Padi Jaya' },
    { id: 3, name: 'Ayam Potong', qty: 80, unit: 'kg', date: '2026-03-01', supplier: 'PT Broiler Nusantara' },
    { id: 4, name: 'Daging Sapi', qty: 40, unit: 'kg', date: '2026-03-01', supplier: 'CV Mitra Ternak' },
    { id: 5, name: 'Telur Ayam', qty: 300, unit: 'butir', date: '2026-03-02', supplier: 'UD Telur Segar' },
    { id: 6, name: 'Minyak Goreng', qty: 60, unit: 'liter', date: '2026-02-28', supplier: 'PT Bimoli Distribusi' },
    { id: 7, name: 'Gula Pasir', qty: 90, unit: 'kg', date: '2026-03-01', supplier: 'CV Gula Manis' },
    { id: 8, name: 'Tepung Terigu', qty: 120, unit: 'kg', date: '2026-03-01', supplier: 'PT Bogasari Flour' },
    { id: 9, name: 'Wortel', qty: 50, unit: 'kg', date: '2026-03-02', supplier: 'Pasar Induk Kramatjati' },
    { id: 10, name: 'Bayam', qty: 30, unit: 'kg', date: '2026-03-02', supplier: 'Pasar Induk Kramatjati' },
    { id: 11, name: 'Kentang', qty: 75, unit: 'kg', date: '2026-03-01', supplier: 'CV Agro Segar' },
    { id: 12, name: 'Tomat', qty: 45, unit: 'kg', date: '2026-03-02', supplier: 'CV Agro Segar' },
    { id: 13, name: 'Bawang Merah', qty: 35, unit: 'kg', date: '2026-02-28', supplier: 'UD Bumbu Nusantara' },
    { id: 14, name: 'Bawang Putih', qty: 25, unit: 'kg', date: '2026-02-28', supplier: 'UD Bumbu Nusantara' },
    { id: 15, name: 'Ikan Lele Segar', qty: 55, unit: 'kg', date: '2026-03-02', supplier: 'TPI Muara Baru' },
]

const ARRIVALS_RAW = [
    // TODAY 02 Maret 2026
    { id: 1, date: '2026-03-02', time: '07:30', supplier: 'PT Broiler Nusantara', item: 'Ayam Potong', qty: '120 kg' },
    { id: 2, date: '2026-03-02', time: '09:00', supplier: 'CV Sumber Beras', item: 'Beras Premium', qty: '200 kg' },
    { id: 3, date: '2026-03-02', time: '11:30', supplier: 'TPI Muara Baru', item: 'Ikan Lele', qty: '75 kg' },
    { id: 4, date: '2026-03-02', time: '14:00', supplier: 'UD Telur Segar', item: 'Telur Ayam', qty: '500 butir' },
    // TOMORROW 03 Maret 2026
    { id: 5, date: '2026-03-03', time: '08:00', supplier: 'CV Agro Segar', item: 'Wortel & Kentang', qty: '80 kg' },
    { id: 6, date: '2026-03-03', time: '10:30', supplier: 'PT Bogasari Flour', item: 'Tepung Terigu', qty: '150 kg' },
    { id: 7, date: '2026-03-03', time: '13:00', supplier: 'CV Gula Manis', item: 'Gula Pasir', qty: '100 kg' },
    // NEXT DAY 04 Maret 2026
    { id: 8, date: '2026-03-04', time: '07:00', supplier: 'CV Mitra Ternak', item: 'Daging Sapi', qty: '60 kg' },
    { id: 9, date: '2026-03-04', time: '09:30', supplier: 'PT Bimoli Distribusi', item: 'Minyak Goreng', qty: '80 liter' },
    { id: 10, date: '2026-03-04', time: '12:00', supplier: 'UD Bumbu Nusantara', item: 'Bawang Merah & Putih', qty: '50 kg' },
]

const URGENT_REQUESTS = {
    kitchen: [
        { id: 1, item: 'Bawang Putih', qty: '5 kg', note: 'Habis, butuh sebelum jam 10:00' },
        { id: 2, item: 'Santan Kelapa', qty: '10 liter', note: 'Untuk produksi siang' },
        { id: 3, item: 'Garam Kasar', qty: '3 kg', note: 'Stok habis' },
    ],
    marketing: [
        { id: 1, item: 'Kotak Kemasan', qty: '200 pcs', note: 'Event presentasi besok pagi' },
        { id: 2, item: 'Stiker Label', qty: '500 pcs', note: 'Rebranding produk' },
        { id: 3, item: 'Sarung Tangan', qty: '50 pcs', note: 'Untuk demo masak' },
    ],
    packaging: [
        { id: 1, item: 'Plastik Wrap', qty: '5 roll', note: 'Habis, produksi terhenti' },
        { id: 2, item: 'Tali Rafia', qty: '2 gulung', note: 'Untuk bundling paket' },
        { id: 3, item: 'Foam Sheet', qty: '100 lbr', note: 'Pelapis produk frozen' },
    ],
}

const ADMIN_MESSAGE = {
    from: 'Admin Sistem',
    time: '01 Mar 2026 – 22:00',
    message:
        'Harap semua staff warehouse melakukan pengecekan ulang pada stok beras yang datang pagi ini. Pastikan label QC sudah terpasang pada setiap karung sebelum disimpan di rak penyimpanan. Koordinasikan dengan tim Quality Control jika ditemukan ketidaksesuaian.',
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const TODAY_STR = '2026-03-02'
const TOMOR_STR = '2026-03-03'
const NXTDY_STR = '2026-03-04'

function formatDateDisplay(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
    })
}

function getArrivalsForDate(dateStr) {
    return ARRIVALS_RAW
        .filter((a) => a.date === dateStr)
        .sort((a, b) => a.time.localeCompare(b.time))
}

// ─── LIVE CLOCK ───────────────────────────────────────────────────────────────

function LiveClock() {
    const [now, setNow] = useState(new Date())
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(t)
    }, [])
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    return (
        <div className="text-center px-2">
            <p
                className="font-extrabold leading-none tracking-tight"
                style={{ fontSize: '2.4rem', color: '#327169', fontVariantNumeric: 'tabular-nums' }}
            >
                {timeStr}
            </p>
            <p className="text-xs font-semibold mt-2" style={{ color: '#438c81' }}>{dateStr}</p>
        </div>
    )
}

// ─── VERTICAL MARQUEE ────────────────────────────────────────────────────────
// Generic component: duplicates `items` list for a seamless infinite loop.
// The keyframe `marqueeVertical` (translateY 0→-50%) is defined in index.css.

function VerticalMarquee({ items, renderItem, speed = 30 }) {
    if (!items || items.length === 0) return null
    return (
        <div className="relative flex-1 min-h-0 overflow-hidden">
            {/* Fade — top */}
            <div
                className="absolute inset-x-0 top-0 h-8 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, #ffffff 0%, transparent 100%)' }}
            />
            {/* Animated belt: two identical copies end-to-end */}
            <div
                style={{
                    animationName: 'marqueeVertical',
                    animationDuration: `${speed}s`,
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                }}
            >
                {items.map((item, i) => renderItem(item, i))}
                {items.map((item, i) => renderItem(item, items.length + i))}
            </div>
            {/* Fade — bottom */}
            <div
                className="absolute inset-x-0 bottom-0 h-8 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to top, #ffffff 0%, transparent 100%)' }}
            />
        </div>
    )
}

// ─── STOCK ROW ────────────────────────────────────────────────────────────────

function StockRow({ item, striped }) {
    const dateShort = new Date(item.date + 'T00:00:00').toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short',
    })
    return (
        <div
            className="flex items-center gap-2 px-3 py-2.5"
            style={{ backgroundColor: striped ? '#f0f8f8' : '#ffffff' }}
        >
            {/* Left: name + supplier */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: '#4d4d4d' }}>{item.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{item.supplier}</p>
            </div>
            {/* Right: qty + date */}
            <div className="text-right flex-shrink-0">
                <p className="font-bold text-sm" style={{ color: '#327169' }}>
                    {item.qty} <span className="text-xs font-normal text-gray-400">{item.unit}</span>
                </p>
                <p className="text-[10px] text-gray-400">{dateShort}</p>
            </div>
        </div>
    )
}

// ─── ARRIVAL ROW ──────────────────────────────────────────────────────────────

// ROW_HEIGHT must match the minHeight set on the element (px)
const ARRIVAL_ROW_H = 36
const ARRIVAL_VISIBLE = 2   // rows shown at a time in each table

function ArrivalRow({ row, striped }) {
    return (
        <div
            className="grid items-center px-3"
            style={{
                gridTemplateColumns: '2.8rem 1fr 1fr 3.2rem',
                minHeight: `${ARRIVAL_ROW_H}px`,
                backgroundColor: striped ? '#f0f8f8' : '#ffffff',
            }}
        >
            <span className="font-bold text-xs" style={{ color: '#327169' }}>{row.time}</span>
            <span className="text-[11px] text-gray-500 leading-tight truncate pr-1">{row.supplier}</span>
            <span className="font-semibold text-xs leading-tight truncate" style={{ color: '#4d4d4d' }}>{row.item}</span>
            <span className="text-[11px] font-semibold text-right" style={{ color: '#438c81' }}>{row.qty}</span>
        </div>
    )
}

// ─── ARRIVAL TABLE ────────────────────────────────────────────────────────────
// Shows exactly ARRIVAL_VISIBLE rows. Activates marquee when rows > ARRIVAL_VISIBLE.

function ArrivalTable({ dateStr, label, headerColor }) {
    const rows = getArrivalsForDate(dateStr)
    const needsMarquee = rows.length > ARRIVAL_VISIBLE
    const windowH = ARRIVAL_ROW_H * ARRIVAL_VISIBLE    // px

    return (
        <div
            className="bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden"
            style={{ borderColor: '#a3c7c7' }}
        >
            {/* Card header */}
            <div className="flex-shrink-0 px-4 py-2 rounded-t-2xl" style={{ backgroundColor: headerColor }}>
                <p className="text-white font-bold text-sm">{label}</p>
                <p className="text-white/70 text-[11px] font-medium mt-0.5">{formatDateDisplay(dateStr)}</p>
            </div>

            {/* Column labels */}
            <div
                className="flex-shrink-0 px-3 py-1.5 bg-[#f0f8f8] grid"
                style={{ gridTemplateColumns: '2.8rem 1fr 1fr 3.2rem' }}
            >
                {['Jam', 'Supplier', 'Item', 'Qty'].map((h) => (
                    <span key={h} className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#327169' }}>
                        {h}
                    </span>
                ))}
            </div>

            {/* Data area — fixed height window */}
            {rows.length === 0 ? (
                <div className="flex items-center justify-center py-4 text-xs text-gray-400 italic">
                    Tidak ada jadwal
                </div>
            ) : needsMarquee ? (
                <div className="relative overflow-hidden flex-shrink-0" style={{ height: `${windowH}px` }}>
                    {/* Fade top */}
                    <div
                        className="absolute inset-x-0 top-0 h-5 z-10 pointer-events-none"
                        style={{ background: 'linear-gradient(to bottom, #ffffff, transparent)' }}
                    />
                    {/* Animated belt */}
                    <div
                        style={{
                            animationName: 'marqueeVertical',
                            animationDuration: `${rows.length * 3}s`,
                            animationTimingFunction: 'linear',
                            animationIterationCount: 'infinite',
                        }}
                    >
                        {[...rows, ...rows].map((r, i) => (
                            <ArrivalRow key={i} row={r} striped={i % 2 !== 0} />
                        ))}
                    </div>
                    {/* Fade bottom */}
                    <div
                        className="absolute inset-x-0 bottom-0 h-5 z-10 pointer-events-none"
                        style={{ background: 'linear-gradient(to top, #ffffff, transparent)' }}
                    />
                </div>
            ) : (
                <div className="flex-shrink-0">
                    {rows.map((r, i) => (
                        <ArrivalRow key={r.id} row={r} striped={i % 2 !== 0} />
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── URGENT REQUEST ROW ───────────────────────────────────────────────────────

function UrgentRow({ item, accentColor, striped }) {
    return (
        <div
            className="flex items-start gap-3 px-4 py-3"
            style={{ backgroundColor: striped ? '#fafafa' : '#ffffff', borderBottom: '1px solid #f3f4f6' }}
        >
            <span
                className="text-[10px] font-extrabold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0"
                style={{ backgroundColor: accentColor, color: '#fff' }}
            >
                REQ
            </span>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm leading-tight" style={{ color: '#327169' }}>{item.item}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: '#438c81' }}>{item.qty}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{item.note}</p>
            </div>
        </div>
    )
}

// ─── URGENT CARD ─────────────────────────────────────────────────────────────

function UrgentCard({ title, items, accentColor = '#d97706' }) {
    return (
        <div
            className="flex-1 min-h-0 bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden"
            style={{ borderColor: '#a3c7c7' }}
        >
            {/* Header */}
            <div
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-t-2xl"
                style={{ backgroundColor: accentColor }}
            >
                <AlertTriangle size={13} className="text-white flex-shrink-0" />
                <p className="text-white font-bold text-sm uppercase tracking-wide">{title}</p>
            </div>

            {/* Vertical Marquee */}
            <VerticalMarquee
                items={items}
                renderItem={(item, idx) => (
                    <UrgentRow
                        key={idx}
                        item={item}
                        accentColor={accentColor}
                        striped={(idx % items.length) % 2 !== 0}
                    />
                )}
                speed={10}
            />
        </div>
    )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function WarehouseDisplayPage() {
    const navigate = useNavigate()
    const [showExit, setShowExit] = useState(false)

    return (
        <div
            style={{
                height: '100vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#eef2f2',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onMouseMove={() => setShowExit(true)}
            onMouseLeave={() => setShowExit(false)}
        >
            {/* ── Top Bar ─────────────────────────────────────────── */}
            <div
                className="flex items-center justify-between px-6 py-3 flex-shrink-0"
                style={{ backgroundColor: '#327169', boxShadow: '0 2px 8px rgba(50,113,105,0.25)' }}
            >
                <div className="flex items-center gap-3">
                    <Package size={20} className="text-white opacity-80" />
                    <p className="text-white font-extrabold text-base tracking-wide">
                        Sistem Informasi Dapur — Warehouse Display
                    </p>
                </div>
                <span
                    className="text-xs font-bold px-3 py-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: '#438c81', color: '#fff' }}
                >
                    ● LIVE
                </span>
            </div>

            {/* ── Main Grid ───────────────────────────────────────── */}
            <div
                className="flex-1 min-h-0 grid gap-3 p-3"
                style={{ gridTemplateColumns: '1fr 2fr' }}
            >
                {/* ══ LEFT COLUMN: Stock Inventory Marquee ══ */}
                <div
                    className="bg-white rounded-2xl shadow-sm border flex flex-col overflow-hidden min-h-0"
                    style={{ borderColor: '#a3c7c7' }}
                >
                    {/* Card header */}
                    <div className="flex-shrink-0 px-4 py-2.5 rounded-t-2xl" style={{ backgroundColor: '#327169' }}>
                        <p className="text-white font-bold text-sm">Real-Time Stock Level</p>
                        <p className="text-white/70 text-[11px] mt-0.5">{STOCK_ITEMS.length} item terdaftar</p>
                    </div>

                    {/* Column labels */}
                    <div
                        className="flex-shrink-0 flex items-center justify-between px-3 py-2"
                        style={{ backgroundColor: '#f0f8f8', borderBottom: '1px solid #e5f0f0' }}
                    >
                        <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#327169' }}>
                            Nama Item / Supplier
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#327169' }}>
                            Stok / Tgl
                        </span>
                    </div>

                    {/* Marquee belt */}
                    <VerticalMarquee
                        items={STOCK_ITEMS}
                        renderItem={(item, idx) => (
                            <StockRow key={idx} item={item} striped={(idx % STOCK_ITEMS.length) % 2 !== 0} />
                        )}
                        speed={40}
                    />
                </div>

                {/* ══ RIGHT COLUMN ══ */}
                <div className="flex flex-col gap-3 min-h-0">

                    {/* ── Row 1: Admin Message + Clock ── */}
                    <div className="flex-shrink-0 grid gap-3" style={{ gridTemplateColumns: '3fr 2fr' }}>

                        {/* Admin message — compact */}
                        <div
                            className="flex flex-col rounded-2xl border overflow-hidden"
                            style={{ backgroundColor: 'rgba(163,199,199,0.10)', borderColor: '#438c81' }}
                        >
                            <div
                                className="flex items-center gap-1.5 px-3 py-2 flex-shrink-0"
                                style={{ borderBottom: '1px solid rgba(67,140,129,0.2)' }}
                            >
                                <Bell size={11} style={{ color: '#327169' }} />
                                <span className="font-bold text-xs uppercase tracking-wide" style={{ color: '#327169' }}>
                                    Info Admin
                                </span>
                                <span
                                    className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                    style={{ backgroundColor: '#c8e0e0', color: '#327169' }}
                                >
                                    INFO
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto px-3 py-2">
                                <p style={{ fontSize: '0.78rem', color: '#4d4d4d', lineHeight: '1.55' }}>
                                    {ADMIN_MESSAGE.message}
                                </p>
                            </div>
                            <div
                                className="flex items-center justify-end px-3 py-1 flex-shrink-0"
                                style={{ borderTop: '1px solid rgba(67,140,129,0.12)' }}
                            >
                                <span style={{ fontSize: '10px', color: 'rgba(77,77,77,0.4)', fontWeight: 500 }}>
                                    Update: {ADMIN_MESSAGE.time}
                                </span>
                            </div>
                        </div>

                        {/* Live clock */}
                        <div
                            className="bg-white rounded-2xl shadow-sm border flex items-center justify-center"
                            style={{ borderColor: '#a3c7c7' }}
                        >
                            <LiveClock />
                        </div>
                    </div>

                    {/* ── Row 2: 3-Day Arrival Schedule ── */}
                    <div className="flex-shrink-0 grid grid-cols-3 gap-3">
                        <ArrivalTable dateStr={TODAY_STR} label="HARI INI" headerColor="#327169" />
                        <ArrivalTable dateStr={TOMOR_STR} label="BESOK" headerColor="#438c81" />
                        <ArrivalTable dateStr={NXTDY_STR} label="LUSA" headerColor="#7aacac" />
                    </div>

                    {/* ── Row 3: Urgent Requests ── */}
                    <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">
                        <UrgentCard title="Kitchen Request" items={URGENT_REQUESTS.kitchen} accentColor="#b45309" />
                        <UrgentCard title="Pemorsian" items={URGENT_REQUESTS.marketing} accentColor="#1d4ed8" />
                        <UrgentCard title="Pengemasan" items={URGENT_REQUESTS.packaging} accentColor="#7c3aed" />
                    </div>
                </div>
            </div>

            {/* ── Floating Exit Button ─────────────────────────────── */}
            <button
                onClick={() => navigate('/dashboard')}
                className="fixed bottom-6 right-6 flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-full shadow-xl transition-all duration-300"
                style={{
                    backgroundColor: '#327169',
                    color: '#fff',
                    opacity: showExit ? 1 : 0,
                    pointerEvents: showExit ? 'auto' : 'none',
                    transform: showExit ? 'scale(1)' : 'scale(0.85)',
                    zIndex: 50,
                }}
            >
                <LogOut size={15} />
                Keluar Display
            </button>
        </div>
    )
}
