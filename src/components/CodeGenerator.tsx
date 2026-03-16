import { useState, useEffect } from 'react'
import { collection, query, orderBy, limit, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import './CodeGenerator.css'

interface CodeGeneratorProps {
  onBack: () => void
}

interface CodeItem {
  code: string
  coins: number
  customerName: string
  mobile: string
  timestamp: string
}

const makeCode = () => Math.random().toString(36).substring(2, 8).toUpperCase()

export default function CodeGenerator({ onBack }: CodeGeneratorProps) {
  const [coins, setCoins] = useState('5')
  const [generatedCode, setGeneratedCode] = useState('')
  const [codesList, setCodesList] = useState<CodeItem[]>([])
  const [mobile, setMobile] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(false)
  const [toast, setToast] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => { loadRecentCodes() }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const loadRecentCodes = async () => {
    try {
      const q = query(collection(db, 'purchaseCodes'), orderBy('createdAt', 'desc'), limit(50))
      const snapshot = await getDocs(q)
      const codes: CodeItem[] = []
      snapshot.forEach((d) => {
        const data = d.data()
        codes.push({
          code: data.code,
          coins: data.coins,
          customerName: data.customerName || 'Unknown',
          mobile: data.mobile || '',
          timestamp: data.createdAt
        })
      })
      setCodesList(codes)
    } catch {}
  }

  const handleGenerate = async () => {
    setGenerating(true)
    const code = makeCode()
    const coinsNum = parseInt(coins) || 5
    const timestamp = new Date().toISOString()
    const name = customerName.trim() || 'Walk-in Customer'

    try {
      const codeData: Record<string, unknown> = {
        code, coins: coinsNum, used: false, createdAt: timestamp, customerName: name
      }
      if (sendViaWhatsApp && mobile.length === 10) codeData.mobile = mobile

      await setDoc(doc(db, 'purchaseCodes', code), codeData)

      setGeneratedCode(code)
      setCodesList(prev => [{ code, coins: coinsNum, customerName: name, mobile, timestamp }, ...prev])
      setCustomerName('')
      if (sendViaWhatsApp && mobile.length === 10) {
        setMobile('')
        showToast(`Code sent to WhatsApp: +91${mobile}`)
      } else {
        showToast('Code generated!')
      }
    } catch {
      showToast('Failed to generate code. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleBulk = async () => {
    setGenerating(true)
    const coinsNum = parseInt(coins) || 5
    const timestamp = new Date().toISOString()
    const batch = writeBatch(db)
    const codes: CodeItem[] = []

    for (let i = 0; i < 20; i++) {
      const code = makeCode()
      const ref = doc(db, 'purchaseCodes', code)
      batch.set(ref, { code, coins: coinsNum, used: false, createdAt: timestamp, customerName: 'Bulk Generated' })
      codes.push({ code, coins: coinsNum, customerName: 'Bulk Generated', mobile: '', timestamp })
    }

    try {
      await batch.commit()
      setCodesList(prev => [...codes, ...prev])
      showToast('20 codes generated successfully!')
    } catch {
      showToast('Failed to generate bulk codes.')
    } finally {
      setGenerating(false)
    }
  }

  const groupedCodes = codesList.reduce((acc, c) => {
    const name = c.customerName || 'Unknown'
    if (!acc[name]) acc[name] = []
    acc[name].push(c)
    return acc
  }, {} as Record<string, CodeItem[]>)

  return (
    <div className="code-generator">
      <div className="header">
        <h2>Code Generator</h2>
        <button onClick={onBack} className="logout-btn">Back</button>
      </div>

      {toast && <div className="toast">{toast}</div>}

      <div className="generator-card">
        <h3>Generate Purchase Codes</h3>

        <div className="generator-form">
          <label>Customer Name (Optional):</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name"
            className="customer-name-input"
            disabled={generating}
          />

          <label>Coins per code:</label>
          <select value={coins} onChange={(e) => setCoins(e.target.value)} disabled={generating}>
            <option value="5">5 coins (1 plate)</option>
            <option value="10">10 coins (2 plates)</option>
            <option value="15">15 coins (3 plates)</option>
            <option value="25">25 coins (5 plates)</option>
          </select>

          <div className="whatsapp-toggle">
            <label>
              <input
                type="checkbox"
                checked={sendViaWhatsApp}
                onChange={(e) => setSendViaWhatsApp(e.target.checked)}
              />
              📱 Send via WhatsApp
            </label>
          </div>

          {sendViaWhatsApp && (
            <div className="mobile-input">
              <label>Customer Mobile:</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                maxLength={10}
                disabled={generating}
              />
            </div>
          )}

          <div className="button-group">
            <button onClick={handleGenerate} className="generate-btn" disabled={generating}>
              {generating ? 'Generating...' : sendViaWhatsApp ? '📱 Generate & Send' : 'Generate Single Code'}
            </button>
            <button onClick={handleBulk} className="bulk-btn" disabled={generating}>
              {generating ? 'Generating...' : 'Generate 20 Codes'}
            </button>
          </div>
        </div>

        {generatedCode && (
          <div className="generated-code">
            <h4>Latest Code:</h4>
            <div className="code-display">{generatedCode}</div>
            <p className="code-value">{coins} MomoCoins</p>
          </div>
        )}

        {Object.keys(groupedCodes).length > 0 && (
          <div className="codes-by-customer">
            <h4>Codes by Customer:</h4>
            {Object.entries(groupedCodes).map(([name, codes]) => (
              <div key={name} className="customer-group">
                <div className="customer-header">
                  <span className="customer-name">👤 {name}</span>
                  <span className="customer-count">{codes.length} code{codes.length > 1 ? 's' : ''}</span>
                </div>
                <div className="codes-grid">
                  {codes.slice(0, 10).map((c, i) => (
                    <div key={i} className="code-item">
                      <div className="code-text">{c.code}</div>
                      <div className="code-info">{c.coins} coins</div>
                      {c.mobile && <div className="code-mobile">📱 {c.mobile}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => window.print()} className="print-btn">
              🖨️ Print All Codes
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
