import React, { useEffect, useRef } from 'react'
import { AlertTriangle, X, Check } from 'lucide-react'

/**
 * Global reusable confirmation popup.
 *
 * Usage:
 *   <ConfirmationModal
 *     isOpen={showConfirm}
 *     onConfirm={handleActualSubmit}
 *     onCancel={() => setShowConfirm(false)}
 *     message="Apakah Anda yakin ingin mensubmit?"   // optional override
 *   />
 */
export default function ConfirmationModal({
    isOpen,
    onConfirm,
    onCancel,
    message = 'Apakah Anda yakin ingin mensubmit?',
    confirmLabel = 'Ya, Submit',
    cancelLabel = 'Batal',
    variant = 'primary', // 'primary' | 'danger'
}) {
    const backdropRef = useRef(null)

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return
        const handler = (e) => { if (e.key === 'Escape') onCancel() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [isOpen, onCancel])

    if (!isOpen) return null

    const handleBackdrop = (e) => {
        if (e.target === backdropRef.current) onCancel()
    }

    const confirmBg = variant === 'danger' ? '#ef4444' : '#327169'
    const iconBg = variant === 'danger' ? '#fef2f2' : 'rgba(50,113,105,0.1)'
    const iconColor = variant === 'danger' ? '#ef4444' : '#327169'

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdrop}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
                onClick={e => e.stopPropagation()}
                style={{ animation: 'confModalIn 0.18s cubic-bezier(0.34,1.56,0.64,1)' }}
            >
                {/* Header strip */}
                <div className="px-6 pt-6 pb-4 flex items-start gap-4">
                    <div
                        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: iconBg }}
                    >
                        <AlertTriangle size={20} style={{ color: iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                        <p className="font-extrabold text-sm" style={{ color: '#1f2937' }}>Konfirmasi Aksi</p>
                        <p className="text-sm mt-1.5 leading-relaxed" style={{ color: '#4b5563' }}>{message}</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors ml-1"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
                        style={{ borderColor: '#e5e7eb', color: '#6b7280' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.97]"
                        style={{ backgroundColor: confirmBg }}
                    >
                        <Check size={15} />
                        {confirmLabel}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes confModalIn {
                    from { opacity: 0; transform: scale(0.85) translateY(8px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0); }
                }
            `}</style>
        </div>
    )
}
