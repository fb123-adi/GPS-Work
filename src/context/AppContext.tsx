import { createContext, useContext, useState, type ReactNode } from 'react'
import { customers, orders, products, machines, employees, monthlyData, lastYearMonthly, companyErrors, salesAreas } from '../data/mockData'
import type { Customer, Order, Product, Machine, Employee, MonthlyData, CompanyError, SalesArea } from '../types'

interface AppContextType {
  customers: Customer[]
  orders: Order[]
  products: Product[]
  machines: Machine[]
  employees: Employee[]
  monthlyData: MonthlyData[]
  lastYearMonthly: MonthlyData[]
  companyErrors: CompanyError[]
  salesAreas: SalesArea[]
  isAdmin: boolean
  currentUser: Employee | null
  setIsAdmin: (v: boolean) => void
  loginAsAdmin: () => void
  loginAsEmployee: (id: string) => void
  logout: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUser, setCurrentUser] = useState<Employee | null>(null)

  const loginAsAdmin = () => {
    setIsAdmin(true)
    setCurrentUser(null)
  }

  const loginAsEmployee = (id: string) => {
    const emp = employees.find(e => e.id === id) ?? null
    setCurrentUser(emp)
    setIsAdmin(false)
  }

  const logout = () => {
    setIsAdmin(false)
    setCurrentUser(null)
  }

  return (
    <AppContext.Provider value={{
      customers, orders, products, machines, employees,
      monthlyData, lastYearMonthly, companyErrors, salesAreas,
      isAdmin, currentUser, setIsAdmin, loginAsAdmin, loginAsEmployee, logout,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
