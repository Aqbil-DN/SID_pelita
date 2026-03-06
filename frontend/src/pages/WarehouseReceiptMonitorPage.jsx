import React from 'react'
import { PackageSearch, Truck } from 'lucide-react'
import useWorkflowStore from '../store/workflowStore'

export default function WarehouseReceiptMonitorPage() {
    const { menus } = useWorkflowStore()

    const allReceipts = menus.flatMap(m =>
        (m.receiving || []).map(r => ({ ...r, menuName: m.name, menuDate: m.targetDate }))
    )
    const allVendors = menus.flatMap(m =>
        (m.vendors || []).map(v => ({ ...v, menuName: m.name, menuDate: m.targetDate }))
    )

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold text-primary flex items-center gap-2">
                    <PackageSearch size={24} /> Warehouse Receipt Monitor
                </h2>
                <p className="text-sm text-tertiary/60 mt-1">Monitor barang masuk ke gudang</p>
            </div>

            {/* Incoming goods table */}
            <div className="card overflow-x-auto">
                <h3 className="font-bold text-primary text-sm mb-4">Barang Masuk</h3>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="table-header">Menu</th>
                            <th className="table-header">Material</th>
                            <th className="table-header">Status</th>
                            <th className="table-header">Qty Order</th>
                            <th className="table-header">Qty Diterima</th>
                            <th className="table-header">Vendor</th>
                            <th className="table-header">Receiver</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allVendors.map((v, i) => {
                            const receipt = allReceipts.find(r => r.menuName === v.menuName && r.item === v.item)
                            return (
                                <tr key={i}>
                                    <td className="table-cell">
                                        <p className="font-semibold text-primary">{v.menuName}</p>
                                        <p className="text-[10px] text-tertiary/40">{v.menuDate}</p>
                                    </td>
                                    <td className="table-cell font-semibold">{v.item}</td>
                                    <td className="table-cell">
                                        <span className={v.status === 'arrived' ? 'badge-success' : 'badge-info'}>
                                            <Truck size={10} /> {v.status === 'arrived' ? 'Arrived' : 'In Transit'}
                                        </span>
                                    </td>
                                    <td className="table-cell font-bold text-primary">{v.qty} {v.unit}</td>
                                    <td className="table-cell font-bold">{receipt ? `${receipt.qtyReceived} ${v.unit}` : '—'}</td>
                                    <td className="table-cell text-tertiary/60">{v.vendor}</td>
                                    <td className="table-cell text-tertiary/60">{receipt?.receiver || '—'}</td>
                                </tr>
                            )
                        })}
                        {allVendors.length === 0 && (
                            <tr><td colSpan={7} className="table-cell text-center text-gray-400 italic py-8">Belum ada data vendor</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
