export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  location: string
  industry: string
  totalOrders: number
  totalValue: number
  outstandingBalance: number
  joinDate: string
  status: 'active' | 'inactive' | 'pending'
  lastOrderDate: string
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  cost: number
  unit: string
  stock: number
  minStock: number
  description: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  items: OrderItem[]
  totalAmount: number
  profit: number
  orderDate: string
  dueDate: string
  completedDate?: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled'
  assignedEmployeeId: string
  assignedEmployeeName: string
  machineId: string
  machineName: string
  notes: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface Machine {
  id: string
  name: string
  type: string
  status: 'operational' | 'maintenance' | 'idle' | 'faulty'
  billingThisMonth: number
  billingLastMonth: number
  totalBilling: number
  efficiency: number
  lastMaintenanceDate: string
  nextMaintenanceDate: string
  hoursThisMonth: number
  ordersCompleted: number
}

export interface Employee {
  id: string
  name: string
  email: string
  role: string
  department: string
  salesThisMonth: number
  salesLastMonth: number
  totalSales: number
  ordersCompleted: number
  performance: number
  joinDate: string
  status: 'active' | 'inactive'
  plagiarismScore: number
}

export interface MonthlyData {
  month: string
  revenue: number
  profit: number
  orders: number
  expenses: number
}

export interface CompanyError {
  id: string
  category: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  impactArea: string
  estimatedLoss: number
  status: 'open' | 'in_progress' | 'resolved'
  detectedDate: string
}

export interface SalesArea {
  region: string
  revenue: number
  target: number
  growth: number
  orders: number
}
