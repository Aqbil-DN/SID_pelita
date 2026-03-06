import React from 'react'
import { useForm } from 'react-hook-form'
import { Megaphone, Plus, Trash2, Clock } from 'lucide-react'
import { toast } from 'react-toastify'
import useAuthStore from '../store/authStore'
import useBroadcastStore from '../store/broadcastStore'

export default function BroadcastPage() {
    const { user } = useAuthStore()
    const { messages, addMessage, removeMessage } = useBroadcastStore()
    const { register, handleSubmit, reset, formState: { errors } } = useForm()

    const onSubmit = (data) => {
        addMessage({
            title: data.title,
            message: data.message,
            createdBy: user.name,
            duration: parseInt(data.duration) || 24,
        })
        toast.success('Broadcast berhasil dikirim!')
        reset()
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2"><Megaphone size={24} /> Broadcast Info</h2>
                <p className="text-sm text-tertiary/60 mt-1">Kirim pesan broadcast yang tampil di Office Display</p>
            </div>

            <div className="card">
                <h3 className="font-bold text-primary text-sm mb-4">Buat Broadcast Baru</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="label">Judul</label>
                        <input {...register('title', { required: 'Wajib' })} className="input-field" placeholder="Judul pengumuman" />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                    </div>
                    <div>
                        <label className="label">Isi Pesan</label>
                        <textarea {...register('message', { required: 'Wajib' })} rows={3} className="input-field" placeholder="Isi informasi yang ingin disampaikan..." />
                        {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
                    </div>
                    <div>
                        <label className="label">Durasi Tampil (jam)</label>
                        <input {...register('duration')} type="number" className="input-field w-32" placeholder="24" defaultValue={24} />
                    </div>
                    <button type="submit" className="btn-primary"><Plus size={16} /> Kirim Broadcast</button>
                </form>
            </div>

            <div className="card">
                <h3 className="font-bold text-primary text-sm mb-4">Riwayat Broadcast</h3>
                {messages.length === 0 ? (
                    <p className="text-sm text-gray-400 italic text-center py-6">Belum ada broadcast</p>
                ) : (
                    <div className="space-y-3">
                        {messages.map(msg => (
                            <div key={msg.id} className="p-4 rounded-xl border border-gray-100 hover:border-accent transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="font-bold text-primary">{msg.title || 'Info'}</p>
                                        <p className="text-sm text-tertiary/70 mt-1">{msg.message}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[10px] text-tertiary/40">{msg.createdBy}</span>
                                            <span className="text-[10px] text-tertiary/40 flex items-center gap-1"><Clock size={10} /> {new Date(msg.createdAt).toLocaleString('id-ID')}</span>
                                            <span className="badge-gray text-[10px]">{msg.duration}h</span>
                                        </div>
                                    </div>
                                    <button onClick={() => { removeMessage(msg.id); toast.success('Broadcast dihapus!') }} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
