import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import { ROLES } from './lib/constants'

// Nutritionist
import MenuPlanningPage from './pages/MenuPlanningPage'
import NutritionistVerificationPage from './pages/NutritionistVerificationPage'
import RecapMenuVerifyPage from './pages/RecapMenuVerifyPage'

// Head Chef
import IngredientMappingPage from './pages/IngredientMappingPage'
import ProductionStatusPage from './pages/ProductionStatusPage'
import WarehouseRequestPage from './pages/WarehouseRequestPage'

// Accountant
import FinancialVettingPage from './pages/FinancialVettingPage'
import PettyCashHistoryPage from './pages/PettyCashHistoryPage'

// SCD
import ProcurementPage from './pages/ProcurementPage'
import VendorManagementPage from './pages/VendorManagementPage'
import WarehouseReceiptMonitorPage from './pages/WarehouseReceiptMonitorPage'

// Warehouse
import ReceivingPage from './pages/ReceivingPage'

// Supervisor
import ProductionQCPage from './pages/ProductionQCPage'
import BeneficiaryManagementPage from './pages/BeneficiaryManagementPage'
import PortionPlanningPage from './pages/PortionPlanningPage'
import CookingTimerPage from './pages/CookingTimerPage'
import DeliveryTrackerPage from './pages/DeliveryTrackerPage'
import SpvWarehouseRequestPage from './pages/SpvWarehouseRequestPage'
import PettyCashPage from './pages/PettyCashPage'

// CPCD
import MaintenanceSchedulerPage from './pages/MaintenanceSchedulerPage'

// Admin
import BroadcastPage from './pages/BroadcastPage'
import UserManagementPage from './pages/UserManagementPage'
import ReportsPage from './pages/ReportsPage'
import WorkflowTrackerPage from './pages/WorkflowTrackerPage'

// Display Suite (Kiosk — outside Layout)
import WarehouseDisplayPage from './pages/WarehouseDisplayPage'
import KitchenDisplayPage from './pages/KitchenDisplayPage'
import PortioningDisplayPage from './pages/PortioningDisplayPage'
import PackagingDisplayPage from './pages/PackagingDisplayPage'
import OfficeDisplayPage from './pages/OfficeDisplayPage'

const ALL_ROLES = Object.values(ROLES)

export default function App() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Kiosk displays — OUTSIDE Layout (no sidebar/navbar) */}
            <Route path="/display/warehouse" element={<WarehouseDisplayPage />} />
            <Route path="/display/kitchen" element={<KitchenDisplayPage />} />
            <Route path="/display/portioning" element={<PortioningDisplayPage />} />
            <Route path="/display/packaging" element={<PackagingDisplayPage />} />
            <Route path="/display/office" element={<OfficeDisplayPage />} />

            {/* App Layout (with sidebar + navbar) */}
            <Route element={<PrivateRoute allowedRoles={ALL_ROLES}><Layout /></PrivateRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/workflow" element={<WorkflowTrackerPage />} />

                {/* Nutritionist */}
                <Route path="/menu-planning" element={<PrivateRoute allowedRoles={[ROLES.NUTRITIONIST]}><MenuPlanningPage /></PrivateRoute>} />
                <Route path="/nutritionist-verify" element={<PrivateRoute allowedRoles={[ROLES.NUTRITIONIST]}><NutritionistVerificationPage /></PrivateRoute>} />
                <Route path="/recap-menu-verify" element={<PrivateRoute allowedRoles={[ROLES.NUTRITIONIST]}><RecapMenuVerifyPage /></PrivateRoute>} />

                {/* Head Chef */}
                <Route path="/ingredient-mapping" element={<PrivateRoute allowedRoles={[ROLES.HEAD_CHEF]}><IngredientMappingPage /></PrivateRoute>} />
                <Route path="/production-status" element={<PrivateRoute allowedRoles={[ROLES.HEAD_CHEF]}><ProductionStatusPage /></PrivateRoute>} />
                <Route path="/hc-warehouse-request" element={<PrivateRoute allowedRoles={[ROLES.HEAD_CHEF]}><WarehouseRequestPage /></PrivateRoute>} />

                {/* Accountant */}
                <Route path="/financial-vetting" element={<PrivateRoute allowedRoles={[ROLES.ACCOUNTANT]}><FinancialVettingPage /></PrivateRoute>} />
                <Route path="/petty-cash-history" element={<PrivateRoute allowedRoles={[ROLES.ACCOUNTANT]}><PettyCashHistoryPage /></PrivateRoute>} />

                {/* SCD */}
                <Route path="/vendor" element={<PrivateRoute allowedRoles={[ROLES.SCD]}><VendorManagementPage /></PrivateRoute>} />
                <Route path="/procurement" element={<PrivateRoute allowedRoles={[ROLES.SCD]}><ProcurementPage /></PrivateRoute>} />
                <Route path="/receipt-monitor" element={<PrivateRoute allowedRoles={[ROLES.SCD]}><WarehouseReceiptMonitorPage /></PrivateRoute>} />

                {/* Warehouse */}
                <Route path="/receiving" element={<PrivateRoute allowedRoles={[ROLES.WAREHOUSE]}><ReceivingPage /></PrivateRoute>} />

                {/* Supervisor */}
                <Route path="/production-qc" element={<PrivateRoute allowedRoles={[ROLES.SUPERVISOR]}><ProductionQCPage /></PrivateRoute>} />
                <Route path="/beneficiary" element={<PrivateRoute allowedRoles={[ROLES.SUPERVISOR]}><BeneficiaryManagementPage /></PrivateRoute>} />
                <Route path="/portion-planning" element={<PrivateRoute allowedRoles={[ROLES.SUPERVISOR]}><PortionPlanningPage /></PrivateRoute>} />
                <Route path="/cooking-timer" element={<PrivateRoute allowedRoles={[ROLES.SUPERVISOR]}><CookingTimerPage /></PrivateRoute>} />
                <Route path="/delivery-tracker" element={<PrivateRoute allowedRoles={[ROLES.SUPERVISOR]}><DeliveryTrackerPage /></PrivateRoute>} />
                <Route path="/petty-cash" element={<PrivateRoute allowedRoles={[ROLES.SUPERVISOR]}><PettyCashPage /></PrivateRoute>} />
                <Route path="/spv-warehouse-request" element={<PrivateRoute allowedRoles={[ROLES.SUPERVISOR]}><SpvWarehouseRequestPage /></PrivateRoute>} />

                {/* CPCD */}
                <Route path="/maintenance" element={<PrivateRoute allowedRoles={[ROLES.CPCD]}><MaintenanceSchedulerPage /></PrivateRoute>} />

                {/* Admin */}
                <Route path="/reports" element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPERVISOR]}><ReportsPage /></PrivateRoute>} />
                <Route path="/user-management" element={<PrivateRoute allowedRoles={[ROLES.ADMIN]}><UserManagementPage /></PrivateRoute>} />
                <Route path="/broadcast" element={<PrivateRoute allowedRoles={[ROLES.ADMIN]}><BroadcastPage /></PrivateRoute>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}
