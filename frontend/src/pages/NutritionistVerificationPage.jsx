import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
    ChevronLeft, ChevronRight, FlaskConical, X, Check, AlertCircle,
    ChevronRight as ArrowRight, AlertTriangle, CheckCircle2, Info,
} from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../store/authStore'
import useWorkflowStore from '../store/workflowStore'

// ─── Calendar Helpers ──────────────────────────────────────────────────────────

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function toDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatMonthYear(date) {
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

function formatDateLabel(dateKey) {
    const [y, m, d] = dateKey.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
}

// ─── Nutrition Field Definitions ───────────────────────────────────────────────

const TABS = [
    {
        id: 'komponen', label: 'Komponen Utama', required: true,
        fields: [
            { key: 'kalori', label: 'Kalori', unit: 'kcal' },
            { key: 'energi', label: 'Energi', unit: 'kJ' },
            { key: 'total_lemak', label: 'Total Lemak', unit: 'g' },
            { key: 'lemak_jenuh', label: 'Lemak Jenuh', unit: 'g' },
            { key: 'lemak_trans', label: 'Lemak Trans', unit: 'g' },
            { key: 'kolesterol', label: 'Kolesterol', unit: 'mg' },
            { key: 'natrium', label: 'Natrium', unit: 'mg' },
            { key: 'total_karbohidrat', label: 'Total Karbohidrat', unit: 'g' },
            { key: 'serat_pangan', label: 'Serat Pangan', unit: 'g' },
            { key: 'total_gula', label: 'Total Gula', unit: 'g' },
            { key: 'tambahan_gula', label: 'Tambahan Gula', unit: 'g' },
            { key: 'protein', label: 'Protein', unit: 'g' },
        ],
    },
    {
        id: 'vitamin', label: 'Vitamin', required: false,
        fields: [
            { key: 'vitamin_d', label: 'Vitamin D', unit: 'mcg' },
            { key: 'vitamin_a_rae', label: 'Vitamin A RAE', unit: 'mcg' },
            { key: 'vitamin_c', label: 'Vitamin C', unit: 'mg' },
            { key: 'vitamin_e', label: 'Vitamin E', unit: 'mg' },
            { key: 'vitamin_k', label: 'Vitamin K', unit: 'mcg' },
            { key: 'tiamin_b1', label: 'Tiamin (B1)', unit: 'mg' },
            { key: 'riboflavin_b2', label: 'Riboflavin (B2)', unit: 'mg' },
            { key: 'niasin_b3', label: 'Niasin (B3)', unit: 'mg' },
            { key: 'vitamin_b6', label: 'Vitamin B6', unit: 'mg' },
            { key: 'folat_dfe', label: 'Folat DFE', unit: 'mcg' },
            { key: 'asam_folat', label: 'Asam Folat', unit: 'mcg' },
            { key: 'vitamin_b12', label: 'Vitamin B12', unit: 'mcg' },
            { key: 'biotin', label: 'Biotin', unit: 'mcg' },
            { key: 'asam_pantotenat', label: 'Asam Pantotenat', unit: 'mg' },
            { key: 'beta_karoten', label: 'Beta Karoten', unit: 'mcg' },
            { key: 'retinol', label: 'Retinol', unit: 'mcg' },
        ],
    },
    {
        id: 'mineral', label: 'Mineral', required: false,
        fields: [
            { key: 'fluorida', label: 'Fluorida', unit: 'mcg' },
            { key: 'kalsium', label: 'Kalsium', unit: 'mg' },
            { key: 'zat_besi', label: 'Zat Besi', unit: 'mg' },
            { key: 'kalium', label: 'Kalium', unit: 'mg' },
            { key: 'fosfor', label: 'Fosfor', unit: 'mg' },
            { key: 'yodium', label: 'Yodium', unit: 'mcg' },
            { key: 'magnesium', label: 'Magnesium', unit: 'mg' },
            { key: 'seng', label: 'Seng', unit: 'mg' },
            { key: 'selenium', label: 'Selenium', unit: 'mcg' },
            { key: 'tembaga', label: 'Tembaga', unit: 'mg' },
            { key: 'mangan', label: 'Mangan', unit: 'mg' },
            { key: 'kromium', label: 'Kromium', unit: 'mcg' },
            { key: 'molibdenum', label: 'Molibdenum', unit: 'mcg' },
            { key: 'klorida', label: 'Klorida', unit: 'mg' },
        ],
    },
    {
        id: 'amino', label: 'Profil Asam Amino', required: false,
        fields: [
            { key: 'histidin', label: 'Histidin', unit: 'g' },
            { key: 'isoleusin', label: 'Isoleusin', unit: 'g' },
            { key: 'sistin', label: 'Sistin', unit: 'g' },
            { key: 'leusin', label: 'Leusin', unit: 'g' },
            { key: 'lisin', label: 'Lisin', unit: 'g' },
            { key: 'metionin', label: 'Metionin', unit: 'g' },
            { key: 'fenilalanin', label: 'Fenilalanin', unit: 'g' },
            { key: 'treonin', label: 'Treonin', unit: 'g' },
            { key: 'triptofan', label: 'Triptofan', unit: 'g' },
            { key: 'tirosin', label: 'Tirosin', unit: 'g' },
            { key: 'valin', label: 'Valin', unit: 'g' },
            { key: 'prolin', label: 'Prolin', unit: 'g' },
            { key: 'alanin', label: 'Alanin', unit: 'g' },
            { key: 'glisin', label: 'Glisin', unit: 'g' },
            { key: 'arginin', label: 'Arginin', unit: 'g' },
            { key: 'asam_aspartat', label: 'Asam Aspartat', unit: 'g' },
            { key: 'serin', label: 'Serin', unit: 'g' },
            { key: 'asam_glutamat', label: 'Asam Glutamat', unit: 'g' },
            { key: 'asparagin', label: 'Asparagin', unit: 'g' },
            { key: 'glutamin', label: 'Glutamin', unit: 'g' },
        ],
    },
    {
        id: 'lainnya', label: 'Nutrisi Lainnya', required: false,
        fields: [
            { key: 'kalori_dari_lemak', label: 'Kalori dari Lemak', unit: 'kcal' },
            { key: 'kalori_dari_lemak_jenuh', label: 'Kalori dari Lemak Jenuh', unit: 'g' },
            { key: 'karbohidrat_lain', label: 'Karbohidrat Lain', unit: 'g' },
            { key: 'lemak_tak_jenuh_ganda', label: 'Lemak Tak Jenuh Ganda', unit: 'g' },
            { key: 'lemak_tak_jenuh_tunggal', label: 'Lemak Tak Jenuh Tunggal', unit: 'g' },
            { key: 'serat_tak_larut', label: 'Serat Tak Larut', unit: 'g' },
            { key: 'serat_larut', label: 'Serat Larut', unit: 'g' },
            { key: 'gula_alkohol', label: 'Gula Alkohol', unit: 'g' },
            { key: 'kolin', label: 'Kolin', unit: 'mg' },
            { key: 'sulfit', label: 'Sulfit', unit: 'mg' },
            { key: 'inulin', label: 'Inulin', unit: 'g' },
            { key: 'kafein', label: 'Kafein', unit: 'mg' },
            { key: 'air', label: 'Air', unit: 'g' },
            { key: 'sukrosa', label: 'Sukrosa', unit: 'g' },
            { key: 'glukosa', label: 'Glukosa', unit: 'g' },
            { key: 'fruktosa', label: 'Fruktosa', unit: 'g' },
            { key: 'maltose', label: 'Maltose', unit: 'g' },
            { key: 'galaktosa', label: 'Galaktosa', unit: 'g' },
            { key: 'abu', label: 'Abu', unit: 'g' },
            { key: 'omega3', label: 'Asam Lemak Omega-3', unit: 'g' },
        ],
    },
]

function buildEmptyFacts() {
    const facts = {}
    TABS.forEach(tab => {
        facts[tab.id] = {}
        tab.fields.forEach(f => { facts[tab.id][f.key] = '' })
    })
    return facts
}

// ─── Calendar Cell ─────────────────────────────────────────────────────────────

function CalendarCell({ day, dateKey, isToday, isCurrentMonth, menusOnDate, onClick }) {
    const verifiedCount = menusOnDate.filter(m => m.stages.nutritionist_review?.status === 'done').length
    const pendingCount = menusOnDate.length - verifiedCount - menusOnDate.filter(m => m.stages.nutritionist_review?.status === 'rejected').length
    const hasContent = menusOnDate.length > 0

    return (
        <div
            onClick={isCurrentMonth && hasContent ? onClick : undefined}
            className={[
                'relative flex flex-col gap-0.5 rounded-xl p-1.5 min-h-[88px] transition-all duration-150 select-none border',
                isCurrentMonth && hasContent
                    ? 'cursor-pointer hover:shadow-md hover:border-[#438c81]'
                    : isCurrentMonth ? 'cursor-default' : 'opacity-25 cursor-default',
                isToday
                    ? 'border-[#a3c7c7] bg-[#a3c7c7]/20 ring-2 ring-[#a3c7c7]/50'
                    : 'border-transparent bg-white hover:bg-[#f0fafa]',
                hasContent && isCurrentMonth && !isToday ? 'bg-[#f7fdfd]' : '',
            ].join(' ')}
        >
            <span className={[
                'text-xs font-bold self-end leading-none w-6 h-6 flex items-center justify-center rounded-full',
                isToday ? 'bg-[#a3c7c7] text-white' : isCurrentMonth ? 'text-[#4d4d4d]' : 'text-gray-300',
            ].join(' ')}>
                {day}
            </span>
            <div className="flex flex-col gap-0.5 mt-0.5">
                {pendingCount > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 leading-tight">
                        {pendingCount} menunggu
                    </span>
                )}
                {verifiedCount > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 leading-tight">
                        {verifiedCount} terverifikasi
                    </span>
                )}
            </div>
        </div>
    )
}

// ─── Step Indicator ────────────────────────────────────────────────────────────

function StepIndicator({ step }) {
    const steps = ['Pilih Menu & Verifikasi Bahan', 'Input Fakta Nutrisi']
    return (
        <div className="flex items-center gap-0 mb-5">
            {steps.map((label, idx) => {
                const num = idx + 1
                const active = step === num
                const done = step > num
                return (
                    <React.Fragment key={num}>
                        <div className="flex items-center gap-2">
                            <div className={[
                                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all',
                                done ? 'bg-[#327169] text-white' : active ? 'bg-[#438c81] text-white ring-4 ring-[#438c81]/20' : 'bg-gray-200 text-gray-400'
                            ].join(' ')}>
                                {done ? <Check size={12} /> : num}
                            </div>
                            <span className={`text-xs font-semibold hidden sm:block ${active ? 'text-[#327169]' : done ? 'text-[#438c81]' : 'text-gray-400'}`}>
                                {label}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 rounded ${step > 1 ? 'bg-[#327169]' : 'bg-gray-200'}`} />
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    )
}

// ─── Nutrition Facts Form ──────────────────────────────────────────────────────

function NutritionForm({ facts, onChange, onSave, onBack }) {
    const [activeTab, setActiveTab] = useState('komponen')
    const tab = TABS.find(t => t.id === activeTab)

    const handleChange = (tabId, key, val) => {
        onChange(prev => ({
            ...prev,
            [tabId]: { ...prev[tabId], [key]: val },
        }))
    }

    const handleSave = () => {
        // Validate required tab (komponen)
        const reqTab = TABS.find(t => t.required)
        const missing = reqTab.fields.filter(f => !facts[reqTab.id]?.[f.key]?.toString().trim())
        if (missing.length > 0) {
            toast.error(`Lengkapi semua field di tab "${reqTab.label}" terlebih dahulu!`)
            setActiveTab(reqTab.id)
            return
        }
        onSave(facts)
    }

    return (
        <div className="flex flex-col h-full">
            {/* Tab bar */}
            <div className="flex gap-1 mb-4 flex-wrap">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={[
                            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                            activeTab === t.id
                                ? 'bg-[#327169] text-white shadow-sm'
                                : 'bg-gray-100 text-[#4d4d4d] hover:bg-gray-200',
                        ].join(' ')}
                    >
                        {t.label}
                        {t.required && <span className="ml-1 text-red-400">*</span>}
                    </button>
                ))}
            </div>

            {/* Field grid */}
            <div className="flex-1 overflow-y-auto pr-1">
                {!tab.required && (
                    <div className="flex items-center gap-1.5 mb-3 text-xs text-[#4d4d4d]/60 bg-blue-50 px-3 py-2 rounded-lg">
                        <Info size={12} className="text-blue-400 shrink-0" />
                        Tab ini opsional. Isi sesuai data yang tersedia.
                    </div>
                )}
                {tab.required && (
                    <div className="flex items-center gap-1.5 mb-3 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                        <AlertCircle size={12} className="shrink-0" />
                        Semua field di tab ini wajib diisi.
                    </div>
                )}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {tab.fields.map(f => (
                        <div key={f.key}>
                            <label className="block text-[10px] font-bold uppercase tracking-wide text-[#4d4d4d]/55 mb-1">
                                {f.label} <span className="normal-case font-normal text-[#a3c7c7]">({f.unit})</span>
                                {tab.required && <span className="text-red-400 ml-0.5">*</span>}
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    placeholder="0"
                                    value={facts[tab.id]?.[f.key] ?? ''}
                                    onChange={e => handleChange(tab.id, f.key, e.target.value)}
                                    required={tab.required}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#4d4d4d] focus:outline-none focus:ring-2 focus:ring-[#438c81]/40 focus:border-[#438c81] transition-all pr-10"
                                />
                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#a3c7c7] font-semibold pointer-events-none">
                                    {f.unit}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 mt-4 border-t border-gray-100">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-[#4d4d4d] text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                    <ChevronLeft size={14} /> Kembali
                </button>
                <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                    style={{ backgroundColor: '#327169' }}
                >
                    <CheckCircle2 size={16} /> Simpan Fakta Nutrisi
                </button>
            </div>
        </div>
    )
}

// ─── Two-Step Modal ────────────────────────────────────────────────────────────

function NutritionModal({ dateKey, menusOnDate, onClose }) {
    const { user } = useAuthStore()
    const { verifyStage, ignoreStage, setNutritionFacts } = useWorkflowStore()

    const [step, setStep] = useState(1)
    const [selectedMenu, setSelectedMenu] = useState(null)
    const [showIgnoreForm, setShowIgnoreForm] = useState(false)
    const [ignoreReason, setIgnoreReason] = useState('')
    const [facts, setFacts] = useState(buildEmptyFacts())

    const backdropRef = useRef(null)

    useEffect(() => {
        const handler = e => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    const handleBackdrop = e => { if (e.target === backdropRef.current) onClose() }

    // Pending menus on this date
    const pendingMenus = menusOnDate.filter(m => m.stages.nutritionist_review?.status === 'active')
    const doneMenus = menusOnDate.filter(m => ['done', 'rejected'].includes(m.stages.nutritionist_review?.status))

    const handleSelectMenu = (menu) => {
        setSelectedMenu(menu)
        // Pre-fill facts if already saved
        if (menu.nutritionFacts) {
            setFacts(menu.nutritionFacts)
        } else {
            setFacts(buildEmptyFacts())
        }
        setShowIgnoreForm(false)
        setIgnoreReason('')
    }

    const handleVerify = () => {
        setStep(2)
    }

    const handleIgnoreSubmit = () => {
        if (!ignoreReason.trim()) {
            toast.error('Alasan wajib diisi!')
            return
        }
        ignoreStage(selectedMenu.id, 'nutritionist_review', ignoreReason, user.name)
        toast.warning('Dikembalikan ke Head Chef untuk revisi.')
        setSelectedMenu(null)
        setShowIgnoreForm(false)
        setIgnoreReason('')
    }

    const handleSaveFacts = (savedFacts) => {
        setNutritionFacts(selectedMenu.id, savedFacts)
        verifyStage(selectedMenu.id, 'nutritionist_review', user.name)
        toast.success('Fakta nutrisi disimpan & bahan diverifikasi!')
        onClose()
    }

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdrop}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full mx-4 overflow-hidden flex flex-col"
                style={{ maxWidth: '760px', maxHeight: '90vh' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div style={{ backgroundColor: '#327169' }} className="flex items-center justify-between px-6 py-4 shrink-0">
                    <div className="flex items-center gap-3 text-white">
                        <FlaskConical size={20} />
                        <div>
                            <p className="font-extrabold text-sm leading-tight">Input Fakta Nutrisi</p>
                            <p className="text-white/70 text-xs mt-0.5">{formatDateLabel(dateKey)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col min-h-0">
                    <StepIndicator step={step} />

                    {/* STEP 1 ─────────────────────────────────────── */}
                    {step === 1 && (
                        <div className="flex flex-col gap-4 flex-1">
                            {/* Completed menus */}
                            {doneMenus.length > 0 && (
                                <div className="space-y-1.5">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#4d4d4d]/40">Sudah Diproses</p>
                                    {doneMenus.map(m => (
                                        <div key={m.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${m.stages.nutritionist_review?.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                {m.stages.nutritionist_review?.status === 'done' ? '✓ Terverifikasi' : '✗ Diabaikan'}
                                            </span>
                                            <span className="text-sm font-semibold text-[#4d4d4d]/70">{m.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pending menus */}
                            {pendingMenus.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                                    <CheckCircle2 size={36} className="text-[#a3c7c7] mb-2" />
                                    <p className="text-[#4d4d4d]/60 text-sm">Semua menu pada tanggal ini sudah diproses.</p>
                                </div>
                            )}

                            {pendingMenus.length > 0 && (
                                <>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#4d4d4d]/40">Pilih Menu untuk Diverifikasi</p>
                                    <div className="grid gap-2">
                                        {pendingMenus.map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => handleSelectMenu(m)}
                                                className={[
                                                    'w-full p-4 rounded-xl border-2 text-left transition-all',
                                                    selectedMenu?.id === m.id
                                                        ? 'border-[#327169] bg-[#327169]/5'
                                                        : 'border-gray-200 hover:border-[#438c81] hover:bg-[#f0fafa]',
                                                ].join(' ')}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-sm text-[#327169] truncate">{m.name}</p>
                                                        {m.description && <p className="text-xs text-[#4d4d4d]/55 mt-0.5 line-clamp-1">{m.description}</p>}
                                                    </div>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">Menunggu</span>
                                                </div>
                                                <p className="text-xs text-[#4d4d4d]/50 mt-1.5">{m.ingredients.length} bahan dari Head Chef</p>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Detail panel when menu is selected */}
                                    {selectedMenu && (
                                        <div className="rounded-xl border border-[#a3c7c7]/50 bg-[#f7fdfd] p-4 space-y-3">
                                            <p className="text-xs font-bold uppercase tracking-wide text-[#4d4d4d]/45">Daftar Bahan dari Head Chef</p>
                                            {selectedMenu.ingredients.length === 0 ? (
                                                <p className="text-sm text-gray-400 italic text-center py-3">Belum ada bahan yang di-mapping</p>
                                            ) : (
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr>
                                                            <th className="text-left text-[10px] font-bold uppercase tracking-wide text-[#4d4d4d]/40 pb-1.5">Bahan</th>
                                                            <th className="text-right text-[10px] font-bold uppercase tracking-wide text-[#4d4d4d]/40 pb-1.5">Qty</th>
                                                            <th className="text-right text-[10px] font-bold uppercase tracking-wide text-[#4d4d4d]/40 pb-1.5">Satuan</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {selectedMenu.ingredients.map((ing, i) => (
                                                            <tr key={i}>
                                                                <td className="py-1.5 font-semibold text-[#4d4d4d]">{ing.name}</td>
                                                                <td className="py-1.5 text-right font-bold text-[#327169]">{ing.quantity}</td>
                                                                <td className="py-1.5 text-right text-[#4d4d4d]/55">{ing.unit}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}

                                            {/* Ignore form */}
                                            {showIgnoreForm && (
                                                <div className="mt-2 p-3 rounded-xl border-2 border-red-200 bg-red-50">
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <AlertTriangle size={14} className="text-red-500" />
                                                        <p className="text-xs font-bold text-red-700">Alasan Penolakan (wajib)</p>
                                                    </div>
                                                    <textarea
                                                        value={ignoreReason}
                                                        onChange={e => setIgnoreReason(e.target.value)}
                                                        rows={3}
                                                        placeholder="Tuliskan alasan mengapa daftar bahan ini perlu direvisi..."
                                                        className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 mb-2 resize-none"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button onClick={handleIgnoreSubmit}
                                                            className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors">
                                                            Konfirmasi Tolak
                                                        </button>
                                                        <button onClick={() => { setShowIgnoreForm(false); setIgnoreReason('') }}
                                                            className="flex-1 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-[#4d4d4d] hover:bg-gray-50 transition-colors">
                                                            Batal
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action buttons */}
                                            {!showIgnoreForm && (
                                                <div className="flex gap-3 pt-1">
                                                    <button
                                                        onClick={handleVerify}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                                                        style={{ backgroundColor: '#327169' }}
                                                    >
                                                        <Check size={16} /> Verifikasi & Lanjutkan
                                                        <ArrowRight size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setShowIgnoreForm(true)}
                                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border-2 border-red-300 text-red-500 hover:bg-red-50 transition-all"
                                                    >
                                                        <X size={15} /> Abaikan
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* STEP 2 ─────────────────────────────────────── */}
                    {step === 2 && selectedMenu && (
                        <div className="flex flex-col flex-1 min-h-0">
                            <div className="mb-4 p-3 rounded-xl bg-[#327169]/8 border border-[#a3c7c7]/40">
                                <p className="text-xs text-[#4d4d4d]/55">Menu dipilih</p>
                                <p className="font-bold text-[#327169] text-sm">{selectedMenu.name}</p>
                                <p className="text-xs text-[#4d4d4d]/55 mt-0.5">Isi fakta nutrisi untuk keseluruhan menu (bukan per bahan).</p>
                            </div>
                            <NutritionForm
                                facts={facts}
                                onChange={setFacts}
                                onSave={handleSaveFacts}
                                onBack={() => setStep(1)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function NutritionistVerificationPage() {
    const { menus } = useWorkflowStore()

    const today = new Date()
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
    const [selectedDateKey, setSelectedDateKey] = useState(null)

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
    const goToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))

    // Build calendar grid
    const calendarCells = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay()
        const startOffset = (firstDay + 6) % 7 // Mon-based
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const daysInPrevMonth = new Date(year, month, 0).getDate()
        const cells = []
        for (let i = startOffset - 1; i >= 0; i--) {
            const d = daysInPrevMonth - i
            cells.push({ day: d, dateKey: toDateKey(year, month - 1, d), isCurrentMonth: false })
        }
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push({ day: d, dateKey: toDateKey(year, month, d), isCurrentMonth: true })
        }
        while (cells.length % 7 !== 0) {
            const d = cells.length - startOffset - daysInMonth + 1
            cells.push({ day: d, dateKey: toDateKey(year, month + 1, d), isCurrentMonth: false })
        }
        return cells
    }, [year, month])

    // Menus that have an active nutritionist_review stage
    const menusByDate = useMemo(() => {
        const map = {}
        for (const m of menus) {
            const status = m.stages.nutritionist_review?.status
            if (!status || status === 'pending') continue
            const key = m.targetDate
            if (!map[key]) map[key] = []
            map[key].push(m)
        }
        return map
    }, [menus])

    const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate())

    // Monthly stats
    const monthlyMenus = menus.filter(m => {
        const [py, pm] = (m.targetDate || '').split('-').map(Number)
        return py === year && pm === month + 1
    })
    const pendingThisMonth = monthlyMenus.filter(m => m.stages.nutritionist_review?.status === 'active').length
    const doneThisMonth = monthlyMenus.filter(m => m.stages.nutritionist_review?.status === 'done').length

    const menusForModal = selectedDateKey ? (menusByDate[selectedDateKey] || []) : []

    return (
        <div className="flex flex-col gap-5 h-full">
            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-extrabold text-[#327169] flex items-center gap-2">
                        <FlaskConical size={24} /> Input Fakta Nutrisi
                    </h2>
                    <p className="text-sm text-[#4d4d4d]/60 mt-0.5">
                        Klik tanggal untuk melakukan verifikasi bahan & input fakta nutrisi menu
                    </p>
                </div>

                {/* Stats chips */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-200">
                        <AlertCircle size={12} /> {pendingThisMonth} Menunggu
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold border border-green-200">
                        <CheckCircle2 size={12} /> {doneThisMonth} Terverifikasi
                    </div>
                </div>
            </div>

            {/* Calendar Card */}
            <div className="card flex-1 p-0 overflow-hidden flex flex-col" style={{ minHeight: 0 }}>
                {/* Calendar Header */}
                <div style={{ backgroundColor: '#327169' }} className="flex items-center justify-between px-5 py-3.5 rounded-t-2xl shrink-0">
                    <button onClick={prevMonth} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                        <h3 className="text-white font-bold text-base capitalize">{formatMonthYear(currentDate)}</h3>
                        <button onClick={goToday} className="text-white/70 hover:text-white text-xs font-semibold border border-white/30 px-2.5 py-0.5 rounded-full hover:bg-white/10 transition-colors">
                            Hari Ini
                        </button>
                    </div>
                    <button onClick={nextMonth} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                        <ChevronRight size={18} />
                    </button>
                </div>

                {/* Weekday labels */}
                <div className="grid grid-cols-7 bg-[#327169]/5 border-b border-gray-100 shrink-0">
                    {WEEKDAYS.map(d => (
                        <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider py-2 text-[#327169]">{d}</div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1.5 p-3 flex-1 auto-rows-fr" style={{ overflowY: 'auto' }}>
                    {calendarCells.map(({ day, dateKey, isCurrentMonth }) => (
                        <CalendarCell
                            key={dateKey}
                            day={day}
                            dateKey={dateKey}
                            isToday={dateKey === todayKey}
                            isCurrentMonth={isCurrentMonth}
                            menusOnDate={isCurrentMonth ? (menusByDate[dateKey] || []) : []}
                            onClick={() => setSelectedDateKey(dateKey)}
                        />
                    ))}
                </div>

                {/* Legend */}
                <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4 flex-wrap shrink-0">
                    <div className="flex items-center gap-1.5 text-[10px] text-[#4d4d4d]/60">
                        <span className="w-2.5 h-2.5 rounded-full inline-block bg-amber-400" /> Menu Menunggu Verifikasi
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#4d4d4d]/60">
                        <span className="w-2.5 h-2.5 rounded-full inline-block bg-green-500" /> Sudah Terverifikasi
                    </div>
                    <p className="text-[10px] text-[#4d4d4d]/40 ml-auto">
                        Klik tanggal berwarna untuk verifikasi & input nutrisi
                    </p>
                </div>
            </div>

            {/* Modal */}
            {selectedDateKey && menusForModal.length > 0 && (
                <NutritionModal
                    dateKey={selectedDateKey}
                    menusOnDate={menusForModal}
                    onClose={() => setSelectedDateKey(null)}
                />
            )}
        </div>
    )
}
