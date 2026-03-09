// Sistem Informasi Dapur – Role & Workflow Constants

export const ROLES = {
    ADMIN: 'Admin',
    NUTRITIONIST: 'Nutritionist',
    HEAD_CHEF: 'Head Chef',
    ACCOUNTANT: 'Accountant',
    SCD: 'SCD',
    WAREHOUSE: 'Warehouse',
    SUPERVISOR: 'Supervisor',
    CPCD: 'CPCD',
}

export const WORKFLOW_STAGES = [
    { id: 1, key: 'planning', label: 'Menu Planning', role: ROLES.NUTRITIONIST },
    { id: 2, key: 'ingredient_mapping', label: 'Ingredient Mapping', role: ROLES.HEAD_CHEF },
    { id: 3, key: 'nutritionist_review', label: 'Nutritionist Review', role: ROLES.NUTRITIONIST },
    { id: 4, key: 'accountant_review', label: 'Financial Vetting', role: ROLES.ACCOUNTANT },
    { id: 5, key: 'procurement', label: 'Procurement', role: ROLES.SCD },
    { id: 6, key: 'receiving', label: 'Receiving Goods', role: ROLES.WAREHOUSE },
    { id: 7, key: 'production', label: 'Production & QC', role: ROLES.SUPERVISOR },
    { id: 8, key: 'distributed', label: 'Distributed', role: null },
]

export const MENU_STATUS = {
    DRAFT: 'draft',
    IN_PROGRESS: 'in_progress',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    COMPLETED: 'completed',
}

export const PRODUCTION_STAGES = [
    { key: 'in_preparation', label: 'In Preparation', color: '#6b21a8' },
    { key: 'cooking', label: 'Cooking Process', color: '#ca8a04' },
    { key: 'resting', label: 'Resting', color: '#2563eb' },
    { key: 'ready_portion', label: 'Ready for Portioning', color: '#ea580c' },
    { key: 'ready_distribution', label: 'Ready for Distribution', color: '#16a34a' },
]

export const QUALITY_LEGEND = [
    { key: 'prima', label: 'Prima', desc: 'Kondisi sempurna / Segar', color: '#16a34a', bg: '#dcfce7', alert: false },
    { key: 'layak', label: 'Layak', desc: 'Cacat visual minor, aman & bernutrisi', color: '#ca8a04', bg: '#fefce8', alert: false },
    { key: 'cacat', label: 'Cacat/Rusak', desc: 'Kemasan rusak / penyok', color: '#dc2626', bg: '#fef2f2', alert: true },
    { key: 'busuk', label: 'Busuk/Expired', desc: 'Tidak aman / kadaluarsa', color: '#dc2626', bg: '#fef2f2', alert: true },
    { key: 'salah_spec', label: 'Salah Spesifikasi', desc: 'Kualitas baik tapi item salah', color: '#dc2626', bg: '#fef2f2', alert: true },
]

export const COOKING_TIMER_SLOTS = [
    { key: 'prepare_cooking', label: 'Prepare Cooking', defaultStart: '02:00', defaultEnd: '03:00', color: '#7c3aed' },
    { key: 'cooking', label: 'Cooking', defaultStart: '03:00', defaultEnd: '05:00', color: '#dc2626' },
    { key: 'resting', label: 'Resting', defaultStart: '05:00', defaultEnd: '05:30', color: '#2563eb' },
    { key: 'portioning', label: 'Portioning', defaultStart: '05:30', defaultEnd: '06:30', color: '#ca8a04' },
    { key: 'packaging', label: 'Packaging', defaultStart: '06:30', defaultEnd: '07:30', color: '#16a34a' },
]

export const DELIVERY_STATUSES = [
    { key: 'loading', label: 'Loading', color: '#7c3aed', bg: '#f5f3ff' },
    { key: 'on_delivery', label: 'On Delivery', color: '#ca8a04', bg: '#fefce8' },
    { key: 'arrived', label: 'Arrived', color: '#16a34a', bg: '#dcfce7' },
    { key: 'pick_up', label: 'Pick Up', color: '#327169', bg: '#e0f2f2' },
]

export const UNITS = ['kg', 'gram', 'liter', 'ml', 'pcs', 'pack', 'box', 'sachet', 'botol', 'karung', 'butir', 'roll', 'gulung', 'lbr']

export const STAFF_POSITIONS = [
    'Head Chef', 'Sous Chef', 'Cook', 'Assistant Cook',
    'Nutritionist', 'Supervisor', 'Warehouse Staff', 'Procurement Officer',
    'Accountant', 'Quality Control', 'Delivery Driver', 'Kitchen Helper',
    'Maintenance / CPCD', 'Admin', 'Lainnya',
]

// ─── Navigation ──────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
    // All roles
    { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', roles: 'all' },
    { key: 'workflow', label: 'Workflow Tracker', path: '/workflow', icon: 'GitBranch', roles: 'all' },

    // Nutritionist
    { key: 'menu-planning', label: 'Menu Planning', path: '/menu-planning', icon: 'UtensilsCrossed', roles: [ROLES.NUTRITIONIST] },
    { key: 'nutritionist-verify', label: 'Verifikasi Bahan', path: '/nutritionist-verify', icon: 'CheckSquare', roles: [ROLES.NUTRITIONIST] },
    { key: 'recap-menu-verify', label: 'Recap Menu Verify', path: '/recap-menu-verify', icon: 'ClipboardList', roles: [ROLES.NUTRITIONIST] },

    // Head Chef
    { key: 'ingredient-mapping', label: 'Ingredient Mapping', path: '/ingredient-mapping', icon: 'ListChecks', roles: [ROLES.HEAD_CHEF] },
    { key: 'production-status', label: 'Status Produksi', path: '/production-status', icon: 'Activity', roles: [ROLES.HEAD_CHEF] },
    { key: 'hc-warehouse-request', label: 'Request Gudang', path: '/hc-warehouse-request', icon: 'PackagePlus', roles: [ROLES.HEAD_CHEF] },

    // Accountant
    { key: 'financial-vetting', label: 'Financial Vetting', path: '/financial-vetting', icon: 'BadgeDollarSign', roles: [ROLES.ACCOUNTANT] },
    { key: 'petty-cash-history', label: 'Petty Cash', path: '/petty-cash-history', icon: 'Wallet', roles: [ROLES.ACCOUNTANT] },

    // SCD
    { key: 'vendor', label: 'Kelola Vendor', path: '/vendor', icon: 'Store', roles: [ROLES.SCD] },
    { key: 'procurement', label: 'Procurement', path: '/procurement', icon: 'ShoppingCart', roles: [ROLES.SCD] },
    { key: 'receipt-monitor', label: 'Receipt Monitor', path: '/receipt-monitor', icon: 'PackageSearch', roles: [ROLES.SCD] },

    // Warehouse
    { key: 'receiving', label: 'Receiving Goods', path: '/receiving', icon: 'PackageCheck', roles: [ROLES.WAREHOUSE] },

    // Supervisor
    { key: 'production-qc', label: 'Production & QC', path: '/production-qc', icon: 'ClipboardCheck', roles: [ROLES.SUPERVISOR] },
    { key: 'beneficiary', label: 'Kelola Penerima Manfaat', path: '/beneficiary', icon: 'School', roles: [ROLES.SUPERVISOR] },
    { key: 'portion-planning', label: 'Portion Planning', path: '/portion-planning', icon: 'Calculator', roles: [ROLES.SUPERVISOR] },
    { key: 'cooking-timer', label: 'Cooking Timer', path: '/cooking-timer', icon: 'Timer', roles: [ROLES.SUPERVISOR] },
    { key: 'delivery-tracker', label: 'Delivery Tracker', path: '/delivery-tracker', icon: 'Truck', roles: [ROLES.SUPERVISOR] },
    { key: 'petty-cash', label: 'Petty Cash', path: '/petty-cash', icon: 'Wallet', roles: [ROLES.SUPERVISOR] },
    { key: 'spv-warehouse-request', label: 'Request Gudang', path: '/spv-warehouse-request', icon: 'PackagePlus', roles: [ROLES.SUPERVISOR] },

    // CPCD
    { key: 'maintenance', label: 'Maintenance Scheduler', path: '/maintenance', icon: 'Wrench', roles: [ROLES.CPCD] },

    // Admin
    { key: 'reports', label: 'Reports', path: '/reports', icon: 'BarChart3', roles: [ROLES.ADMIN, ROLES.SUPERVISOR] },
    { key: 'user-management', label: 'User Management', path: '/user-management', icon: 'Users', roles: [ROLES.ADMIN] },
    { key: 'broadcast', label: 'Broadcast Info', path: '/broadcast', icon: 'Megaphone', roles: [ROLES.ADMIN] },

    // Display Suite (kiosk)
    { key: 'display-warehouse', label: 'Display Warehouse', path: '/display/warehouse', icon: 'Monitor', roles: [ROLES.WAREHOUSE, ROLES.ADMIN], kiosk: true },
    { key: 'display-kitchen', label: 'Display Kitchen', path: '/display/kitchen', icon: 'Monitor', roles: [ROLES.HEAD_CHEF, ROLES.ADMIN], kiosk: true },
    { key: 'display-portioning', label: 'Display Portioning', path: '/display/portioning', icon: 'Monitor', roles: [ROLES.SUPERVISOR, ROLES.ADMIN], kiosk: true },
    { key: 'display-packaging', label: 'Display Packaging', path: '/display/packaging', icon: 'Monitor', roles: [ROLES.SUPERVISOR, ROLES.ADMIN], kiosk: true },
    { key: 'display-office', label: 'Display Office', path: '/display/office', icon: 'Monitor', roles: [ROLES.ADMIN], kiosk: true },
]

// ─── Demo Users ──────────────────────────────────────────────────────────────
import user1Img from '../assets/user1.jpeg'
import user2Img from '../assets/user2.jpeg'
import danielImg from '../assets/daniel.jpeg'
import zeeImg from '../assets/Zee.jpeg'
import minjuImg from '../assets/minju.jpeg'
import freyaImg from '../assets/freya.jpeg'
import hanniImg from '../assets/hanni.jpeg'

export const DEMO_USERS = [
    { id: 1, name: 'Admin Sistem', nik: '2026001', password: 'admin123', role: ROLES.ADMIN, email: 'admin@sidapur.go.id', photo: user1Img, ttl: 'Jakarta, 10 Jan 1985', position: 'Admin' },
    { id: 2, name: 'Dr. Sari Nutrisi', nik: '2026002', password: 'pass123', role: ROLES.NUTRITIONIST, email: 'sari@sidapur.go.id', photo: zeeImg, ttl: 'Bandung, 22 Feb 1990', position: 'Nutritionist' },
    { id: 3, name: 'Chef Budi Santoso', nik: '2026003', password: 'pass123', role: ROLES.HEAD_CHEF, email: 'budi@sidapur.go.id', photo: danielImg, ttl: 'Surabaya, 5 Mei 1988', position: 'Head Chef' },
    { id: 4, name: 'Andi Keuangan', nik: '2026004', password: 'pass123', role: ROLES.ACCOUNTANT, email: 'andi@sidapur.go.id', photo: user2Img, ttl: 'Yogyakarta, 18 Jul 1992', position: 'Accountant' },
    { id: 5, name: 'Rini Pengadaan', nik: '2026005', password: 'pass123', role: ROLES.SCD, email: 'rini@sidapur.go.id', photo: minjuImg, ttl: 'Semarang, 3 Sep 1991', position: 'Procurement Officer' },
    { id: 6, name: 'Doni Gudang', nik: '2026006', password: 'pass123', role: ROLES.WAREHOUSE, email: 'doni@sidapur.go.id', photo: freyaImg, ttl: 'Jakarta, 12 Okt 1993', position: 'Warehouse Staff' },
    { id: 7, name: 'Ibu Dewi SPV', nik: '2026007', password: 'pass123', role: ROLES.SUPERVISOR, email: 'dewi@sidapur.go.id', photo: hanniImg, ttl: 'Depok, 28 Nov 1989', position: 'Supervisor' },
    { id: 8, name: 'Fajar Teknik CPCD', nik: '2026008', password: 'pass123', role: ROLES.CPCD, email: 'fajar@sidapur.go.id', photo: user1Img, ttl: 'Tangerang, 1 Des 1994', position: 'Maintenance / CPCD' },
]

// ─── Demo Schools / Beneficiaries ────────────────────────────────────────────

export const DEMO_SCHOOLS = [
    { id: 1, name: 'SDN 001 Merdeka', type: 'PM Reguler', location: 'Jl. Merdeka No. 10, Jakarta Pusat', phone: '021-1234567' },
    { id: 2, name: 'SDN 002 Pahlawan', type: 'PM Reguler', location: 'Jl. Pahlawan No. 5, Jakarta Timur', phone: '021-2345678' },
    { id: 3, name: 'SDN 003 Bangsa', type: 'PM Reguler', location: 'Jl. Bangsa No. 8, Jakarta Selatan', phone: '021-3456789' },
    { id: 4, name: 'SDN 004 Nusantara', type: 'PM Tambahan', location: 'Jl. Nusantara No. 3, Jakarta Barat', phone: '021-4567890' },
    { id: 5, name: 'SDN 005 Pancasila', type: 'PM Tambahan', location: 'Jl. Pancasila No. 12, Bekasi', phone: '021-5678901' },
    { id: 6, name: 'MI Al-Ikhlas', type: 'PM Reguler', location: 'Jl. Al-Ikhlas No. 7, Depok', phone: '021-6789012' },
    { id: 7, name: 'MI Hidayatullah', type: 'PM Reguler', location: 'Jl. Hidayat No. 15, Tangerang', phone: '021-7890123' },
    { id: 8, name: 'SD Islam Terpadu Al-Azhar', type: 'PM Tambahan', location: 'Jl. Al-Azhar No. 20, Jakarta Selatan', phone: '021-8901234' },
]

export const DEMO_BENEFICIARIES = [
    { id: 1, schoolId: 1, portionCount: 350, deliveryDate: '2026-03-05' },
    { id: 2, schoolId: 2, portionCount: 280, deliveryDate: '2026-03-05' },
    { id: 3, schoolId: 3, portionCount: 300, deliveryDate: '2026-03-05' },
    { id: 4, schoolId: 4, portionCount: 200, deliveryDate: '2026-03-07' },
    { id: 5, schoolId: 5, portionCount: 150, deliveryDate: '2026-03-07' },
    { id: 6, schoolId: 6, portionCount: 320, deliveryDate: '2026-03-10' },
    { id: 7, schoolId: 7, portionCount: 275, deliveryDate: '2026-03-10' },
    { id: 8, schoolId: 8, portionCount: 180, deliveryDate: '2026-03-10' },
]

// ─── Demo Menus (workflow data) ──────────────────────────────────────────────

export const DEMO_MENUS = [
    {
        id: 1,
        name: 'Menu Nasi Ayam Spesial',
        description: 'Nasi putih dengan ayam goreng bumbu kuning, sayur asem, dan sambal terasi.',
        targetDate: '2026-03-05',
        beneficiaryId: 1,
        calories: 650,
        currentStage: 6,
        status: 'in_progress',
        createdBy: 'Dr. Sari Nutrisi',
        createdAt: '2026-02-28T08:00:00',
        stages: {
            planning: { completedAt: '2026-02-28T08:00:00', processedBy: 'Dr. Sari Nutrisi', status: 'done' },
            ingredient_mapping: { completedAt: '2026-02-28T11:00:00', processedBy: 'Chef Budi Santoso', status: 'done' },
            nutritionist_review: { completedAt: '2026-02-28T13:00:00', processedBy: 'Dr. Sari Nutrisi', status: 'done' },
            accountant_review: { completedAt: '2026-02-28T14:00:00', processedBy: 'Andi Keuangan', status: 'done' },
            procurement: { completedAt: '2026-03-01T08:00:00', processedBy: 'Rini Pengadaan', status: 'done' },
            receiving: { completedAt: '2026-03-01T10:00:00', processedBy: 'Doni Gudang', status: 'done' },
            production: { completedAt: null, processedBy: null, status: 'active' },
            distributed: { completedAt: null, processedBy: null, status: 'pending' },
        },
        ingredients: [
            { name: 'Beras', quantity: 50, unit: 'kg', maxPrice: 14000 },
            { name: 'Ayam', quantity: 30, unit: 'kg', maxPrice: 38000 },
            { name: 'Minyak goreng', quantity: 5, unit: 'liter', maxPrice: 18000 },
        ],
        vendors: [
            { vendor: 'CV Sembako Jaya', location: 'Pasar Induk Kramatjati', item: 'Beras', price: 13500, qty: 50, unit: 'kg', arrivalDate: '2026-03-03', arrivalTime: '08:00', status: 'arrived' },
            { vendor: 'PT Broiler Nusantara', location: 'Cikarang', item: 'Ayam', price: 37000, qty: 30, unit: 'kg', arrivalDate: '2026-03-03', arrivalTime: '09:00', status: 'arrived' },
        ],
        receiving: [
            { item: 'Beras', qtyOrdered: 50, qtyReceived: 50, quality: 'prima', receiver: 'Doni Gudang', arrivalTime: '08:15' },
            { item: 'Ayam', qtyOrdered: 30, qtyReceived: 30, quality: 'prima', receiver: 'Doni Gudang', arrivalTime: '09:10' },
        ],
        productionStage: 'cooking',
        estimatedCost: 2500000,
    },
    {
        id: 2,
        name: 'Menu Sop Sayur Bergizi',
        description: 'Sop sayur dengan wortel, kentang, buncis, dan daging sapi. Dilengkapi nasi putih.',
        targetDate: '2026-03-07',
        beneficiaryId: 4,
        calories: 450,
        currentStage: 4,
        status: 'in_progress',
        createdBy: 'Dr. Sari Nutrisi',
        createdAt: '2026-03-01T07:00:00',
        stages: {
            planning: { completedAt: '2026-03-01T07:00:00', processedBy: 'Dr. Sari Nutrisi', status: 'done' },
            ingredient_mapping: { completedAt: '2026-03-01T10:00:00', processedBy: 'Chef Budi Santoso', status: 'done' },
            nutritionist_review: { completedAt: '2026-03-01T12:00:00', processedBy: 'Dr. Sari Nutrisi', status: 'done' },
            accountant_review: { completedAt: null, processedBy: null, status: 'active' },
            procurement: { completedAt: null, processedBy: null, status: 'pending' },
            receiving: { completedAt: null, processedBy: null, status: 'pending' },
            production: { completedAt: null, processedBy: null, status: 'pending' },
            distributed: { completedAt: null, processedBy: null, status: 'pending' },
        },
        ingredients: [
            { name: 'Wortel', quantity: 20, unit: 'kg', maxPrice: null },
            { name: 'Kentang', quantity: 15, unit: 'kg', maxPrice: null },
            { name: 'Buncis', quantity: 10, unit: 'kg', maxPrice: null },
            { name: 'Daging Sapi', quantity: 25, unit: 'kg', maxPrice: null },
        ],
        vendors: [],
        receiving: [],
        productionStage: null,
        estimatedCost: 800000,
    },
    {
        id: 3,
        name: 'Paket Makan Siang Ikan Bakar',
        description: 'Ikan lele bakar dengan sambal matah, lalapan, dan nasi merah.',
        targetDate: '2026-03-10',
        beneficiaryId: 6,
        calories: 580,
        currentStage: 1,
        status: 'in_progress',
        createdBy: 'Dr. Sari Nutrisi',
        createdAt: '2026-03-01T09:00:00',
        stages: {
            planning: { completedAt: null, processedBy: null, status: 'active' },
            ingredient_mapping: { completedAt: null, processedBy: null, status: 'pending' },
            nutritionist_review: { completedAt: null, processedBy: null, status: 'pending' },
            accountant_review: { completedAt: null, processedBy: null, status: 'pending' },
            procurement: { completedAt: null, processedBy: null, status: 'pending' },
            receiving: { completedAt: null, processedBy: null, status: 'pending' },
            production: { completedAt: null, processedBy: null, status: 'pending' },
            distributed: { completedAt: null, processedBy: null, status: 'pending' },
        },
        ingredients: [],
        vendors: [],
        receiving: [],
        productionStage: null,
        estimatedCost: 0,
    },
]

// ─── Demo Personnel ──────────────────────────────────────────────────────────

export const DEMO_PERSONNEL = [
    { id: 1, name: 'Chef Budi Santoso', role: 'Head Chef', division: 'Kitchen', phone: '0812-1111-2222' },
    { id: 2, name: 'Aldi Bakar', role: 'Cook', division: 'Kitchen', phone: '0812-2222-3333' },
    { id: 3, name: 'Lina Masak', role: 'Cook', division: 'Kitchen', phone: '0812-3333-4444' },
    { id: 4, name: 'Siti Porsi', role: 'Portioner', division: 'Portioning', phone: '0812-4444-5555' },
    { id: 5, name: 'Budi Pak', role: 'Packer', division: 'Packaging', phone: '0812-5555-6666' },
    { id: 6, name: 'Rina Pak', role: 'Packer', division: 'Packaging', phone: '0812-6666-7777' },
    { id: 7, name: 'Doni Gudang', role: 'Warehouse', division: 'Warehouse', phone: '0812-7777-8888' },
    { id: 8, name: 'Ibu Dewi SPV', role: 'Supervisor', division: 'Management', phone: '0812-8888-9999' },
]

// ─── Demo Warehouse Stock ────────────────────────────────────────────────────

export const DEMO_STOCK = [
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

// ─── Demo Delivery Status ────────────────────────────────────────────────────

export const DEMO_DELIVERIES = [
    { id: 1, schoolId: 1, menuId: 1, date: '2026-03-05', status: 'on_delivery', progress: 60 },
    { id: 2, schoolId: 2, menuId: 1, date: '2026-03-05', status: 'loading', progress: 20 },
    { id: 3, schoolId: 3, menuId: 1, date: '2026-03-05', status: 'arrived', progress: 100 },
]

// ─── Demo Process per Beneficiary (PM) ───────────────────────────────────────

export const DEMO_PROCESS_PM = [
    { id: 1, name: 'SDN 001 Merdeka', date: '2026-03-05', estimatedArrival: '07:30', description: 'Pengiriman pagi — rute via Jl. Merdeka', portionCount: 350 },
    { id: 2, name: 'SDN 002 Pahlawan', date: '2026-03-05', estimatedArrival: '08:00', description: 'Pengiriman reguler — tidak ada kendala', portionCount: 280 },
    { id: 3, name: 'SDN 003 Bangsa', date: '2026-03-05', estimatedArrival: '08:30', description: 'Jalan sedang diperbaiki, estimasi mundur 15 menit', portionCount: 300 },
    { id: 4, name: 'SDN 004 Nusantara', date: '2026-03-07', estimatedArrival: '07:45', description: 'Pengiriman jadwal PM Tambahan', portionCount: 200 },
    { id: 5, name: 'SDN 005 Pancasila', date: '2026-03-07', estimatedArrival: '08:15', description: 'Koordinasi dengan pihak sekolah H-1', portionCount: 150 },
    { id: 6, name: 'MI Al-Ikhlas', date: '2026-03-10', estimatedArrival: '07:00', description: 'Pengiriman pertama untuk bulan ini', portionCount: 320 },
]

// ─── Demo Broadcast Messages ─────────────────────────────────────────────────

export const DEMO_BROADCASTS = [
    {
        id: 1,
        title: 'Pengumuman Jadwal Produksi',
        message: 'Harap semua staff warehouse melakukan pengecekan ulang pada stok beras yang datang pagi ini. Pastikan label QC sudah terpasang pada setiap karung sebelum disimpan di rak penyimpanan.',
        createdBy: 'Admin Sistem',
        createdAt: '2026-03-01T22:00:00',
        duration: 48, // hours
    },
    {
        id: 2,
        title: 'Rapat Koordinasi',
        message: 'Rapat koordinasi tim produksi akan diadakan pada hari Rabu, 5 Maret 2026 pukul 08:00 di ruang meeting.',
        createdBy: 'Admin Sistem',
        createdAt: '2026-03-02T10:00:00',
        duration: 72,
    },
]

// ─── Demo Urgent Requests ────────────────────────────────────────────────────

export const DEMO_URGENT_REQUESTS = {
    kitchen: [
        { id: 1, item: 'Bawang Putih', qty: '5 kg', note: 'Habis, butuh sebelum jam 10:00', requestedBy: 'Chef Budi', time: '06:30' },
        { id: 2, item: 'Santan Kelapa', qty: '10 liter', note: 'Untuk produksi siang', requestedBy: 'Aldi Bakar', time: '07:00' },
        { id: 3, item: 'Garam Kasar', qty: '3 kg', note: 'Stok habis', requestedBy: 'Lina Masak', time: '07:15' },
    ],
    marketing: [
        { id: 1, item: 'Kotak Kemasan', qty: '200 pcs', note: 'Event presentasi besok pagi', requestedBy: 'Tim Marketing', time: '09:00' },
        { id: 2, item: 'Stiker Label', qty: '500 pcs', note: 'Rebranding produk', requestedBy: 'Tim Marketing', time: '09:30' },
        { id: 3, item: 'Sarung Tangan', qty: '50 pcs', note: 'Untuk demo masak', requestedBy: 'Tim Marketing', time: '10:00' },
    ],
    packaging: [
        { id: 1, item: 'Plastik Wrap', qty: '5 roll', note: 'Habis, produksi terhenti', requestedBy: 'Budi Pak', time: '06:00' },
        { id: 2, item: 'Tali Rafia', qty: '2 gulung', note: 'Untuk bundling paket', requestedBy: 'Rina Pak', time: '06:30' },
        { id: 3, item: 'Foam Sheet', qty: '100 lbr', note: 'Pelapis produk frozen', requestedBy: 'Budi Pak', time: '07:00' },
    ],
}
