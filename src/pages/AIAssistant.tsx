import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Lightbulb, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react'
import Header from '../components/layout/Header'
import { useApp } from '../context/AppContext'
import Anthropic from '@anthropic-ai/sdk'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const suggestions = [
  'What should I focus on to increase profits this month?',
  'Give me 3 low-risk business expansion ideas (risk < 25%)',
  'How can I recover the lagging sales areas in Kerala and Punjab?',
  'What steps can I take to fix the delayed Shah Industries order?',
  'How do I improve machine efficiency at Assembly Line Beta?',
  'Which new markets should GPS Work target next?',
  'How can we reduce outstanding customer balances?',
]

function buildContext(app: ReturnType<typeof useApp>): string {
  const currentMonth = app.monthlyData[app.monthlyData.length - 1]
  const avgLastYearProfit = app.lastYearMonthly.reduce((s, m) => s + m.profit, 0) / app.lastYearMonthly.length
  const topCustomer = [...app.customers].sort((a, b) => b.totalValue - a.totalValue)[0]
  const openErrors = app.companyErrors.filter(e => e.status !== 'resolved')

  return `You are an expert business consultant AI for GPS Work, a GPS device and fleet management solutions company based in India.

BUSINESS CONTEXT:
- Company: GPS Work — sells GPS tracking devices, fleet management software, installation services, and maintenance contracts
- Current Month (May 2025): Revenue ₹${(currentMonth.revenue / 100000).toFixed(1)}L, Profit ₹${(currentMonth.profit / 100000).toFixed(1)}L
- Average Last Year Monthly Profit: ₹${(avgLastYearProfit / 100000).toFixed(1)}L
- Most Valuable Customer: ${topCustomer.name} (₹${(topCustomer.totalValue / 100000).toFixed(1)}L lifetime value)
- Active Customers: ${app.customers.filter(c => c.status === 'active').length}

OPEN ISSUES:
${openErrors.map(e => `- [${e.severity.toUpperCase()}] ${e.title}: ${e.description.slice(0, 80)}...`).join('\n')}

SALES AREAS (weakest):
${app.salesAreas.filter(a => (a.revenue / a.target) < 0.65).map(a => `- ${a.region}: ${(a.revenue / a.target * 100).toFixed(0)}% of target`).join('\n')}

TOP PRODUCTS BY MARGIN:
${app.products.sort((a, b) => (b.price - b.cost) / b.price - (a.price - a.cost) / a.price).slice(0, 3).map(p => `- ${p.name}: ${(((p.price - p.cost) / p.price) * 100).toFixed(0)}% margin`).join('\n')}

Your role: Provide actionable, data-driven advice. When suggesting expansion ideas, ensure risk probability is below 25%. Be concise, practical, and specific to GPS Work's context. Format responses with clear sections when helpful. Always suggest measurable outcomes.`
}

export default function AIAssistant() {
  const app = useApp()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gps_claude_key') ?? '')
  const [showKeyInput, setShowKeyInput] = useState(!localStorage.getItem('gps_claude_key'))
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const saveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gps_claude_key', apiKey.trim())
      setShowKeyInput(false)
    }
  }

  const sendMessage = async (text?: string) => {
    const userMsg = text ?? input.trim()
    if (!userMsg || loading) return

    const systemContext = buildContext(app)
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const client = new Anthropic({
        apiKey: apiKey.trim() || (import.meta as any).env?.VITE_ANTHROPIC_KEY,
        dangerouslyAllowBrowser: true,
      })

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemContext,
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
      })

      const assistantMsg = response.content[0].type === 'text' ? response.content[0].text : ''
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMsg }])
    } catch (err: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**Error connecting to Claude AI.**\n\n${err?.message ?? 'Please check your API key and try again.'}\n\nMake sure you have a valid Anthropic API key set above.`
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <Header title="AI Assistant" subtitle="Powered by Claude — business insights, risk analysis & expansion ideas" />

      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-4">

        {/* API Key Setup */}
        {showKeyInput && (
          <div className="card border-blue-800/50 bg-blue-950/20">
            <div className="flex items-center gap-2 mb-3">
              <Bot size={16} className="text-blue-400" />
              <span className="text-sm font-semibold text-white">Connect Claude AI</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">Enter your Anthropic API key to enable the AI assistant. Your key is stored locally and never sent to any third party.</p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveKey()}
                placeholder="sk-ant-..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button onClick={saveKey} className="btn-primary text-sm">Connect</button>
              <button onClick={() => setShowKeyInput(false)} className="btn-secondary text-sm">Skip</button>
            </div>
          </div>
        )}

        {!showKeyInput && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Claude AI Connected
            </div>
            <button onClick={() => setShowKeyInput(true)} className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1">
              <RefreshCw size={11} /> Change Key
            </button>
          </div>
        )}

        {/* Quick suggestions */}
        {messages.length === 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={14} className="text-amber-400" />
              <span className="text-xs text-gray-400 font-medium">Quick questions about GPS Work</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="text-xs bg-gray-800 border border-gray-700 hover:border-blue-600 hover:bg-blue-950/30 text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors text-left">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={14} className="text-white" />
                </div>
              )}
              <div className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-gray-800 text-gray-200 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span className="text-xs text-gray-400">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Ask about profits, expansion ideas, risk analysis, customer strategy…"
            rows={2}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors flex-shrink-0"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1"><TrendingUp size={11} /> Risk-filtered expansion ideas</span>
          <span className="flex items-center gap-1"><AlertTriangle size={11} /> Contextual issue analysis</span>
          <span>· Press Enter to send, Shift+Enter for new line</span>
        </div>

      </div>
    </div>
  )
}
