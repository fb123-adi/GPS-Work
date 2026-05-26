import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useApp } from '../context/AppContext'

export default function Login() {
  const { loginAsAdmin, loginAsEmployee, employees } = useApp()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'admin' | 'employee'>('admin')
  const [password, setPassword] = useState('')
  const [empId, setEmpId] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    if (mode === 'admin') {
      if (password === 'gpswork2025') {
        loginAsAdmin()
        navigate('/')
      } else {
        setError('Incorrect admin password')
      }
    } else {
      if (empId) {
        loginAsEmployee(empId)
        navigate('/')
      } else {
        setError('Please select an employee')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">G</div>
          <h1 className="text-2xl font-bold text-white">GPS Work</h1>
          <p className="text-gray-400 text-sm mt-1">Business Management Dashboard</p>
        </div>

        <div className="card">
          <div className="flex rounded-lg bg-gray-800 p-1 mb-5">
            {(['admin', 'employee'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${mode === m ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                {m}
              </button>
            ))}
          </div>

          {mode === 'admin' ? (
            <div className="space-y-3">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Admin password"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500" />
              <p className="text-xs text-gray-600">Demo: gpswork2025</p>
            </div>
          ) : (
            <div className="space-y-3">
              <select value={empId} onChange={e => setEmpId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500">
                <option value="">Select employee…</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.role}</option>)}
              </select>
            </div>
          )}

          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

          <button onClick={handleLogin} className="btn-primary w-full mt-4">
            Sign In
          </button>

          <div className="mt-4 pt-4 border-t border-gray-800 text-center">
            <button onClick={() => { loginAsAdmin(); navigate('/') }} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Continue as guest (view only)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
