import type { Customer, Product, Order, Machine, Employee, MonthlyData, CompanyError, SalesArea } from '../types'

export const customers: Customer[] = [
  { id: 'C001', name: 'Rajesh Textiles Pvt Ltd', email: 'rajesh@rtextiles.com', phone: '+91 98765 43210', location: 'Surat, Gujarat', industry: 'Textile', totalOrders: 48, totalValue: 1240000, outstandingBalance: 85000, joinDate: '2022-03-15', status: 'active', lastOrderDate: '2025-05-20' },
  { id: 'C002', name: 'Mehta Fabrics Co.', email: 'mehta@mfabrics.com', phone: '+91 99887 76655', location: 'Ahmedabad, Gujarat', industry: 'Fabric', totalOrders: 36, totalValue: 980000, outstandingBalance: 42000, joinDate: '2021-07-10', status: 'active', lastOrderDate: '2025-05-18' },
  { id: 'C003', name: 'Patel Garments Ltd', email: 'info@patelgarments.com', phone: '+91 97654 32109', location: 'Vadodara, Gujarat', industry: 'Garments', totalOrders: 29, totalValue: 760000, outstandingBalance: 0, joinDate: '2022-11-22', status: 'active', lastOrderDate: '2025-05-12' },
  { id: 'C004', name: 'Shah Industries', email: 'shah@shahindustries.in', phone: '+91 88776 65544', location: 'Rajkot, Gujarat', industry: 'Industrial', totalOrders: 22, totalValue: 650000, outstandingBalance: 120000, joinDate: '2023-01-08', status: 'active', lastOrderDate: '2025-05-05' },
  { id: 'C005', name: 'Joshi Exports', email: 'joshi@joshiexports.com', phone: '+91 91234 56789', location: 'Mumbai, Maharashtra', industry: 'Export', totalOrders: 18, totalValue: 540000, outstandingBalance: 0, joinDate: '2023-04-14', status: 'active', lastOrderDate: '2025-04-28' },
  { id: 'C006', name: 'Kumar Traders', email: 'kumar@kumartraders.com', phone: '+91 87654 32100', location: 'Pune, Maharashtra', industry: 'Trading', totalOrders: 14, totalValue: 320000, outstandingBalance: 65000, joinDate: '2023-08-20', status: 'active', lastOrderDate: '2025-04-15' },
  { id: 'C007', name: 'Verma Textiles', email: 'verma@vermatextiles.in', phone: '+91 96321 45870', location: 'Delhi, NCR', industry: 'Textile', totalOrders: 11, totalValue: 280000, outstandingBalance: 0, joinDate: '2024-01-05', status: 'active', lastOrderDate: '2025-03-30' },
  { id: 'C008', name: 'Singh Clothing House', email: 'singh@singhclothing.com', phone: '+91 95432 10987', location: 'Ludhiana, Punjab', industry: 'Clothing', totalOrders: 8, totalValue: 195000, outstandingBalance: 30000, joinDate: '2024-03-12', status: 'active', lastOrderDate: '2025-03-10' },
  { id: 'C009', name: 'Gupta Fashion World', email: 'gupta@guptafashion.com', phone: '+91 94567 89012', location: 'Jaipur, Rajasthan', industry: 'Fashion', totalOrders: 6, totalValue: 145000, outstandingBalance: 0, joinDate: '2024-06-18', status: 'pending', lastOrderDate: '2025-02-20' },
  { id: 'C010', name: 'Nair Textiles Kerala', email: 'nair@nairtextiles.com', phone: '+91 93456 78901', location: 'Kochi, Kerala', industry: 'Textile', totalOrders: 4, totalValue: 98000, outstandingBalance: 98000, joinDate: '2024-09-01', status: 'inactive', lastOrderDate: '2024-12-15' },
]

export const products: Product[] = [
  { id: 'P001', name: 'GPS Tracking Unit Pro', category: 'GPS Devices', price: 4500, cost: 2800, unit: 'piece', stock: 145, minStock: 20, description: 'Industrial-grade GPS tracking device' },
  { id: 'P002', name: 'Fleet Monitor Basic', category: 'GPS Devices', price: 2800, cost: 1600, unit: 'piece', stock: 220, minStock: 30, description: 'Basic fleet monitoring unit' },
  { id: 'P003', name: 'Asset Tracker Micro', category: 'GPS Devices', price: 1800, cost: 950, unit: 'piece', stock: 380, minStock: 50, description: 'Compact asset tracking device' },
  { id: 'P004', name: 'GPS Control Panel', category: 'Software', price: 15000, cost: 4000, unit: 'license', stock: 999, minStock: 10, description: 'Web-based fleet management software' },
  { id: 'P005', name: 'Installation Service', category: 'Services', price: 1200, cost: 400, unit: 'visit', stock: 999, minStock: 5, description: 'On-site installation and configuration' },
  { id: 'P006', name: 'Annual Maintenance Contract', category: 'Services', price: 3600, cost: 1200, unit: 'year', stock: 999, minStock: 5, description: 'Yearly maintenance and support' },
  { id: 'P007', name: 'GPS Antenna External', category: 'Accessories', price: 800, cost: 350, unit: 'piece', stock: 8, minStock: 25, description: 'High-gain external GPS antenna' },
  { id: 'P008', name: 'SIM Card Data Pack', category: 'Connectivity', price: 600, cost: 250, unit: 'month', stock: 500, minStock: 100, description: 'IoT SIM with data connectivity' },
  { id: 'P009', name: 'Power Backup Unit', category: 'Accessories', price: 2200, cost: 1100, unit: 'piece', stock: 12, minStock: 20, description: 'Battery backup for GPS units' },
  { id: 'P010', name: 'Custom Integration API', category: 'Software', price: 25000, cost: 8000, unit: 'project', stock: 999, minStock: 1, description: 'Custom API integration services' },
]

export const orders: Order[] = [
  { id: 'ORD-2025-0048', customerId: 'C001', customerName: 'Rajesh Textiles Pvt Ltd', items: [{ productId: 'P001', productName: 'GPS Tracking Unit Pro', quantity: 20, unitPrice: 4500, total: 90000 }, { productId: 'P005', productName: 'Installation Service', quantity: 5, unitPrice: 1200, total: 6000 }], totalAmount: 96000, profit: 44800, orderDate: '2025-05-18', dueDate: '2025-06-05', status: 'in_progress', assignedEmployeeId: 'E001', assignedEmployeeName: 'Priya Sharma', machineId: 'M001', machineName: 'Assembly Line Alpha', notes: 'Priority client — fast-track assembly', priority: 'high' },
  { id: 'ORD-2025-0047', customerId: 'C002', customerName: 'Mehta Fabrics Co.', items: [{ productId: 'P002', productName: 'Fleet Monitor Basic', quantity: 15, unitPrice: 2800, total: 42000 }, { productId: 'P008', productName: 'SIM Card Data Pack', quantity: 15, unitPrice: 600, total: 9000 }], totalAmount: 51000, profit: 21750, orderDate: '2025-05-15', dueDate: '2025-05-30', status: 'pending', assignedEmployeeId: 'E002', assignedEmployeeName: 'Amit Patel', machineId: 'M002', machineName: 'Assembly Line Beta', notes: '', priority: 'medium' },
  { id: 'ORD-2025-0046', customerId: 'C003', customerName: 'Patel Garments Ltd', items: [{ productId: 'P004', productName: 'GPS Control Panel', quantity: 1, unitPrice: 15000, total: 15000 }, { productId: 'P010', productName: 'Custom Integration API', quantity: 1, unitPrice: 25000, total: 25000 }], totalAmount: 40000, profit: 28000, orderDate: '2025-05-10', dueDate: '2025-06-10', status: 'in_progress', assignedEmployeeId: 'E003', assignedEmployeeName: 'Sunita Verma', machineId: 'M003', machineName: 'Software Dev Station', notes: 'API integration with SAP system', priority: 'high' },
  { id: 'ORD-2025-0045', customerId: 'C001', customerName: 'Rajesh Textiles Pvt Ltd', items: [{ productId: 'P006', productName: 'Annual Maintenance Contract', quantity: 20, unitPrice: 3600, total: 72000 }], totalAmount: 72000, profit: 48000, orderDate: '2025-05-05', dueDate: '2025-05-25', status: 'completed', assignedEmployeeId: 'E001', assignedEmployeeName: 'Priya Sharma', machineId: 'M001', machineName: 'Assembly Line Alpha', notes: 'Annual renewal', priority: 'medium', completedDate: '2025-05-22' },
  { id: 'ORD-2025-0044', customerId: 'C004', customerName: 'Shah Industries', items: [{ productId: 'P001', productName: 'GPS Tracking Unit Pro', quantity: 10, unitPrice: 4500, total: 45000 }, { productId: 'P009', productName: 'Power Backup Unit', quantity: 10, unitPrice: 2200, total: 22000 }], totalAmount: 67000, profit: 28500, orderDate: '2025-04-28', dueDate: '2025-05-20', status: 'delayed', assignedEmployeeId: 'E004', assignedEmployeeName: 'Rohan Gupta', machineId: 'M002', machineName: 'Assembly Line Beta', notes: 'Delayed due to component shortage', priority: 'urgent' },
  { id: 'ORD-2025-0043', customerId: 'C005', customerName: 'Joshi Exports', items: [{ productId: 'P003', productName: 'Asset Tracker Micro', quantity: 50, unitPrice: 1800, total: 90000 }, { productId: 'P008', productName: 'SIM Card Data Pack', quantity: 50, unitPrice: 600, total: 30000 }], totalAmount: 120000, profit: 59500, orderDate: '2025-04-20', dueDate: '2025-05-15', status: 'completed', assignedEmployeeId: 'E002', assignedEmployeeName: 'Amit Patel', machineId: 'M001', machineName: 'Assembly Line Alpha', notes: '', priority: 'medium', completedDate: '2025-05-13' },
  { id: 'ORD-2025-0042', customerId: 'C006', customerName: 'Kumar Traders', items: [{ productId: 'P002', productName: 'Fleet Monitor Basic', quantity: 8, unitPrice: 2800, total: 22400 }], totalAmount: 22400, profit: 9600, orderDate: '2025-04-15', dueDate: '2025-04-30', status: 'completed', assignedEmployeeId: 'E001', assignedEmployeeName: 'Priya Sharma', machineId: 'M004', machineName: 'Testing & QA Station', notes: '', priority: 'low', completedDate: '2025-04-28' },
  { id: 'ORD-2025-0041', customerId: 'C002', customerName: 'Mehta Fabrics Co.', items: [{ productId: 'P007', productName: 'GPS Antenna External', quantity: 30, unitPrice: 800, total: 24000 }, { productId: 'P005', productName: 'Installation Service', quantity: 10, unitPrice: 1200, total: 12000 }], totalAmount: 36000, profit: 13950, orderDate: '2025-04-10', dueDate: '2025-04-25', status: 'completed', assignedEmployeeId: 'E003', assignedEmployeeName: 'Sunita Verma', machineId: 'M001', machineName: 'Assembly Line Alpha', notes: '', priority: 'medium', completedDate: '2025-04-23' },
  { id: 'ORD-2025-0040', customerId: 'C007', customerName: 'Verma Textiles', items: [{ productId: 'P001', productName: 'GPS Tracking Unit Pro', quantity: 5, unitPrice: 4500, total: 22500 }], totalAmount: 22500, profit: 8500, orderDate: '2025-03-25', dueDate: '2025-04-10', status: 'completed', assignedEmployeeId: 'E005', assignedEmployeeName: 'Kavita Singh', machineId: 'M002', machineName: 'Assembly Line Beta', notes: '', priority: 'low', completedDate: '2025-04-08' },
  { id: 'ORD-2025-0039', customerId: 'C001', customerName: 'Rajesh Textiles Pvt Ltd', items: [{ productId: 'P010', productName: 'Custom Integration API', quantity: 1, unitPrice: 25000, total: 25000 }, { productId: 'P004', productName: 'GPS Control Panel', quantity: 3, unitPrice: 15000, total: 45000 }], totalAmount: 70000, profit: 45000, orderDate: '2025-03-15', dueDate: '2025-04-20', status: 'completed', assignedEmployeeId: 'E001', assignedEmployeeName: 'Priya Sharma', machineId: 'M003', machineName: 'Software Dev Station', notes: '', priority: 'high', completedDate: '2025-04-18' },
]

export const machines: Machine[] = [
  { id: 'M001', name: 'Assembly Line Alpha', type: 'Assembly', status: 'operational', billingThisMonth: 185000, billingLastMonth: 162000, totalBilling: 1840000, efficiency: 92, lastMaintenanceDate: '2025-04-15', nextMaintenanceDate: '2025-07-15', hoursThisMonth: 420, ordersCompleted: 18 },
  { id: 'M002', name: 'Assembly Line Beta', type: 'Assembly', status: 'operational', billingThisMonth: 124000, billingLastMonth: 138000, totalBilling: 1340000, efficiency: 78, lastMaintenanceDate: '2025-03-20', nextMaintenanceDate: '2025-06-20', hoursThisMonth: 310, ordersCompleted: 12 },
  { id: 'M003', name: 'Software Dev Station', type: 'Software', status: 'operational', billingThisMonth: 92000, billingLastMonth: 85000, totalBilling: 920000, efficiency: 88, lastMaintenanceDate: '2025-05-01', nextMaintenanceDate: '2025-08-01', hoursThisMonth: 480, ordersCompleted: 8 },
  { id: 'M004', name: 'Testing & QA Station', type: 'QA', status: 'maintenance', billingThisMonth: 38000, billingLastMonth: 72000, totalBilling: 680000, efficiency: 65, lastMaintenanceDate: '2025-05-22', nextMaintenanceDate: '2025-05-29', hoursThisMonth: 120, ordersCompleted: 5 },
  { id: 'M005', name: 'PCB Soldering Unit', type: 'Manufacturing', status: 'operational', billingThisMonth: 67000, billingLastMonth: 58000, totalBilling: 540000, efficiency: 85, lastMaintenanceDate: '2025-04-05', nextMaintenanceDate: '2025-07-05', hoursThisMonth: 280, ordersCompleted: 9 },
  { id: 'M006', name: 'Laser Engraving Unit', type: 'Manufacturing', status: 'idle', billingThisMonth: 14000, billingLastMonth: 31000, totalBilling: 320000, efficiency: 40, lastMaintenanceDate: '2025-02-10', nextMaintenanceDate: '2025-05-10', hoursThisMonth: 45, ordersCompleted: 2 },
]

export const employees: Employee[] = [
  { id: 'E001', name: 'Priya Sharma', email: 'priya@gpswork.in', role: 'Senior Sales Executive', department: 'Sales', salesThisMonth: 218000, salesLastMonth: 195000, totalSales: 1850000, ordersCompleted: 48, performance: 94, joinDate: '2021-06-01', status: 'active', plagiarismScore: 0 },
  { id: 'E002', name: 'Amit Patel', email: 'amit@gpswork.in', role: 'Sales Executive', department: 'Sales', salesThisMonth: 171000, salesLastMonth: 158000, totalSales: 1240000, ordersCompleted: 36, performance: 88, joinDate: '2022-01-15', status: 'active', plagiarismScore: 0 },
  { id: 'E003', name: 'Sunita Verma', email: 'sunita@gpswork.in', role: 'Technical Sales Manager', department: 'Sales', salesThisMonth: 132000, salesLastMonth: 145000, totalSales: 1120000, ordersCompleted: 29, performance: 82, joinDate: '2022-05-10', status: 'active', plagiarismScore: 2 },
  { id: 'E004', name: 'Rohan Gupta', email: 'rohan@gpswork.in', role: 'Sales Executive', department: 'Sales', salesThisMonth: 89000, salesLastMonth: 102000, totalSales: 680000, ordersCompleted: 22, performance: 71, joinDate: '2023-02-20', status: 'active', plagiarismScore: 5 },
  { id: 'E005', name: 'Kavita Singh', email: 'kavita@gpswork.in', role: 'Junior Sales Executive', department: 'Sales', salesThisMonth: 54000, salesLastMonth: 61000, totalSales: 340000, ordersCompleted: 14, performance: 65, joinDate: '2023-09-01', status: 'active', plagiarismScore: 0 },
  { id: 'E006', name: 'Deepak Mehta', email: 'deepak@gpswork.in', role: 'Technical Support', department: 'Operations', salesThisMonth: 0, salesLastMonth: 0, totalSales: 0, ordersCompleted: 42, performance: 90, joinDate: '2021-11-15', status: 'active', plagiarismScore: 0 },
  { id: 'E007', name: 'Neha Joshi', email: 'neha@gpswork.in', role: 'Sales Executive', department: 'Sales', salesThisMonth: 42000, salesLastMonth: 38000, totalSales: 180000, ordersCompleted: 8, performance: 60, joinDate: '2024-04-10', status: 'active', plagiarismScore: 8 },
]

export const monthlyData: MonthlyData[] = [
  { month: 'Jun 24', revenue: 380000, profit: 148200, orders: 22, expenses: 231800 },
  { month: 'Jul 24', revenue: 420000, profit: 163800, orders: 25, expenses: 256200 },
  { month: 'Aug 24', revenue: 390000, profit: 152100, orders: 23, expenses: 237900 },
  { month: 'Sep 24', revenue: 450000, profit: 175500, orders: 28, expenses: 274500 },
  { month: 'Oct 24', revenue: 510000, profit: 198900, orders: 31, expenses: 311100 },
  { month: 'Nov 24', revenue: 480000, profit: 187200, orders: 29, expenses: 292800 },
  { month: 'Dec 24', revenue: 620000, profit: 241800, orders: 38, expenses: 378200 },
  { month: 'Jan 25', revenue: 350000, profit: 136500, orders: 20, expenses: 213500 },
  { month: 'Feb 25', revenue: 410000, profit: 159900, orders: 24, expenses: 250100 },
  { month: 'Mar 25', revenue: 490000, profit: 191100, orders: 30, expenses: 298900 },
  { month: 'Apr 25', revenue: 535000, profit: 208650, orders: 33, expenses: 326350 },
  { month: 'May 25', revenue: 520000, profit: 202800, orders: 10, expenses: 317200 },
]

export const lastYearMonthly: MonthlyData[] = [
  { month: 'Jun 23', revenue: 295000, profit: 112100, orders: 18, expenses: 182900 },
  { month: 'Jul 23', revenue: 320000, profit: 121600, orders: 20, expenses: 198400 },
  { month: 'Aug 23', revenue: 305000, profit: 115900, orders: 19, expenses: 189100 },
  { month: 'Sep 23', revenue: 345000, profit: 131100, orders: 22, expenses: 213900 },
  { month: 'Oct 23', revenue: 390000, profit: 148200, orders: 25, expenses: 241800 },
  { month: 'Nov 23', revenue: 360000, profit: 136800, orders: 23, expenses: 223200 },
  { month: 'Dec 23', revenue: 480000, profit: 182400, orders: 30, expenses: 297600 },
  { month: 'Jan 24', revenue: 270000, profit: 102600, orders: 16, expenses: 167400 },
  { month: 'Feb 24', revenue: 315000, profit: 119700, orders: 20, expenses: 195300 },
  { month: 'Mar 24', revenue: 375000, profit: 142500, orders: 24, expenses: 232500 },
  { month: 'Apr 24', revenue: 410000, profit: 155800, orders: 27, expenses: 254200 },
  { month: 'May 24', revenue: 395000, profit: 150100, orders: 26, expenses: 244900 },
]

export const companyErrors: CompanyError[] = [
  { id: 'ERR-001', category: 'Inventory', title: 'Low Stock Alert: GPS Antenna & Power Backup', description: 'GPS Antenna External (8 units) and Power Backup Unit (12 units) are below minimum stock levels. This is causing order delays and client dissatisfaction.', severity: 'critical', impactArea: 'Operations & Sales', estimatedLoss: 85000, status: 'open', detectedDate: '2025-05-20' },
  { id: 'ERR-002', category: 'Machine', title: 'Assembly Line Beta Efficiency Drop', description: 'Assembly Line Beta efficiency has dropped from 88% to 78% over the past 2 months. Maintenance is overdue and could impact production capacity.', severity: 'high', impactArea: 'Production', estimatedLoss: 45000, status: 'in_progress', detectedDate: '2025-05-15' },
  { id: 'ERR-003', category: 'Machine', title: 'Laser Engraving Unit Underutilization', description: 'Laser Engraving Unit is running at only 40% efficiency and generating ₹14,000 vs ₹31,000 last month. Needs assessment whether to repurpose or phase out.', severity: 'medium', impactArea: 'Production Cost', estimatedLoss: 34000, status: 'open', detectedDate: '2025-05-10' },
  { id: 'ERR-004', category: 'Collections', title: 'Outstanding Payments from Shah Industries', description: 'Shah Industries has ₹1,20,000 outstanding balance with delayed payment history. Credit risk is escalating and may require collection escalation.', severity: 'high', impactArea: 'Finance & Cash Flow', estimatedLoss: 120000, status: 'open', detectedDate: '2025-05-08' },
  { id: 'ERR-005', category: 'HR', title: 'Employee Plagiarism Detected', description: 'Sales reports from Neha Joshi (score: 8%) and Rohan Gupta (score: 5%) show potential duplicate or plagiarised reporting. Internal audit recommended.', severity: 'medium', impactArea: 'HR & Compliance', estimatedLoss: 15000, status: 'in_progress', detectedDate: '2025-05-18' },
  { id: 'ERR-006', category: 'Sales', title: 'Kerala & Punjab Region Sales Lag', description: 'Kerala and Punjab regions contributing less than 5% of total revenue combined. Market penetration strategy needs revision for these territories.', severity: 'medium', impactArea: 'Sales & Growth', estimatedLoss: 180000, status: 'open', detectedDate: '2025-04-30' },
  { id: 'ERR-007', category: 'Delivery', title: 'Shah Industries Order Delayed (ORD-2025-0044)', description: 'Order for Shah Industries is delayed by 6 days due to component shortage. Customer is frustrated and there is risk of contract cancellation.', severity: 'critical', impactArea: 'Customer Relations', estimatedLoss: 67000, status: 'in_progress', detectedDate: '2025-05-20' },
]

export const salesAreas: SalesArea[] = [
  { region: 'Gujarat', revenue: 2890000, target: 3000000, growth: 18.5, orders: 114 },
  { region: 'Maharashtra', revenue: 1640000, target: 1800000, growth: 12.2, orders: 56 },
  { region: 'Delhi NCR', revenue: 840000, target: 1200000, growth: 8.4, orders: 28 },
  { region: 'Punjab', revenue: 390000, target: 800000, growth: 5.1, orders: 14 },
  { region: 'Rajasthan', revenue: 290000, target: 600000, growth: 3.8, orders: 10 },
  { region: 'Kerala', revenue: 195000, target: 500000, growth: 2.4, orders: 7 },
  { region: 'Karnataka', revenue: 145000, target: 400000, growth: 4.2, orders: 5 },
]
