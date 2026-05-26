import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Orders from './pages/Orders'
import Products from './pages/Products'
import Machines from './pages/Machines'
import Analytics from './pages/Analytics'
import SalesAreas from './pages/SalesAreas'
import ErrorAnalysis from './pages/ErrorAnalysis'
import AIAssistant from './pages/AIAssistant'
import Admin from './pages/Admin'
import Login from './pages/Login'

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/products" element={<Products />} />
            <Route path="/machines" element={<Machines />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/areas" element={<SalesAreas />} />
            <Route path="/errors" element={<ErrorAnalysis />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  )
}
