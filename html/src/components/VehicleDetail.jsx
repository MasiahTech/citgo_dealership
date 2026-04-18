import React, { useState, useEffect } from 'react'
import { ArrowLeft, ShoppingCart, CheckCircle, XCircle, Search } from 'lucide-react'
import { ColorPicker } from './ColorPicker'

const border = (o = 0.06) => `1px solid rgba(255,255,255,${o})`
const bg     = (o = 0.03) => `rgba(255,255,255,${o})`

export function VehicleDetail({
  vehicle, selectedColor, onColorChange,
  plateText, onPlateChange, plateAvailable, onCheckPlate,
  purchasing, onPurchase, onBack,
}) {
  const [thumbSrc, setThumbSrc] = useState(null)
  const [thumbError, setThumbError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setThumbSrc(null)
    setThumbError(false)
    if (!vehicle.photo) { setThumbError(true); return }
    fetch(vehicle.photo)
      .then(r => { if (!r.ok) throw 0; return r.blob() })
      .then(b => { if (!cancelled) setThumbSrc(URL.createObjectURL(b)) })
      .catch(() => { if (!cancelled) setThumbError(true) })
    return () => { cancelled = true }
  }, [vehicle.photo])

  const priceStr = '$' + vehicle.price.toLocaleString()

  return (
    <div className="flex flex-col h-full">
      <div style={{ padding: '10px 14px', flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#888', fontSize: 11, fontWeight: 500, padding: 0,
          }}>
          <ArrowLeft style={{ width: 12, height: 12 }} />
          Back to vehicles
        </button>
      </div>

      <div style={{ height: 1, background: bg(0.04) }} />

      <div className="flex-1 overflow-y-auto scrollbar-thin" style={{ padding: 14 }}>
        <div style={{
          width: '100%', aspectRatio: '16/10', borderRadius: 8, overflow: 'hidden',
          background: 'rgba(0,0,0,0.2)', border: border(0.04),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14, position: 'relative',
        }}>
          {!thumbSrc && !thumbError && <div className="skeleton" style={{ position: 'absolute', inset: 0 }} />}
          {thumbError && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 32 }}>🚗</span>
              <span style={{ fontSize: 10, color: '#555' }}>{vehicle.model}</span>
            </div>
          )}
          {thumbSrc && (
            <img src={thumbSrc} alt="" draggable={false} style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'contain', padding: 10,
            }} />
          )}
        </div>

        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#eee', letterSpacing: '-0.02em' }}>
            {vehicle.name}
          </p>
          <p style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
            {vehicle.brand} · {vehicle.category}
          </p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#22c55e', marginTop: 6 }}>
            {priceStr}
          </p>
        </div>

        <div style={{ height: 1, background: bg(0.04), margin: '12px 0' }} />

        <ColorPicker selectedColor={selectedColor} onColorChange={onColorChange} />

        <div style={{ height: 1, background: bg(0.04), margin: '12px 0' }} />

        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#888', marginBottom: 6 }}>
            License Plate
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-center flex-1" style={{
              height: 32, borderRadius: 6, padding: '0 10px',
              background: bg(0.02), border: border(0.06),
            }}>
              <input
                value={plateText}
                onChange={e => onPlateChange(e.target.value)}
                placeholder="Custom plate (max 8 chars)"
                maxLength={8}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: 11, color: '#ccc', caretColor: '#888',
                  fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
                }}
              />
            </div>
            <button
              onClick={onCheckPlate}
              disabled={!plateText.trim()}
              style={{
                height: 32, padding: '0 12px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                background: plateText.trim() ? bg(0.06) : bg(0.02),
                border: border(0.06), cursor: plateText.trim() ? 'pointer' : 'default',
                color: plateText.trim() ? '#aaa' : '#444',
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
              <Search style={{ width: 10, height: 10 }} />
              Check
            </button>
          </div>
          {plateAvailable !== null && (
            <div className="flex items-center gap-1" style={{ marginTop: 6 }}>
              {plateAvailable ? (
                <>
                  <CheckCircle style={{ width: 11, height: 11, color: '#22c55e' }} />
                  <span style={{ fontSize: 10, color: '#22c55e' }}>Plate available</span>
                </>
              ) : (
                <>
                  <XCircle style={{ width: 11, height: 11, color: '#ef4444' }} />
                  <span style={{ fontSize: 10, color: '#ef4444' }}>Plate taken</span>
                </>
              )}
            </div>
          )}
          <p style={{ fontSize: 9, color: '#333', marginTop: 4 }}>
            Leave empty for a random plate
          </p>
        </div>
      </div>

      <div style={{ height: 1, background: bg(0.04) }} />

      <div style={{ padding: '10px 14px', flexShrink: 0, display: 'flex', gap: 8 }}>
        <button
          onClick={onBack}
          style={{
            flex: '0 0 auto', height: 34, padding: '0 16px', borderRadius: 7,
            background: bg(0.03), border: border(0.06),
            fontSize: 11, fontWeight: 500, color: '#888', cursor: 'pointer',
          }}>
          Cancel
        </button>
        <button
          onClick={onPurchase}
          disabled={purchasing}
          style={{
            flex: 1, height: 34, borderRadius: 7,
            background: purchasing ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.2)',
            border: '1px solid rgba(34,197,94,0.3)',
            fontSize: 12, fontWeight: 700,
            color: purchasing ? '#555' : '#22c55e',
            cursor: purchasing ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.15s',
          }}>
          <ShoppingCart style={{ width: 13, height: 13 }} />
          {purchasing ? 'Processing...' : `Purchase ${priceStr}`}
        </button>
      </div>
    </div>
  )
}
