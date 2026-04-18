import React from 'react'

const border = (o = 0.06) => `1px solid rgba(255,255,255,${o})`
const bg     = (o = 0.03) => `rgba(255,255,255,${o})`

const GTA_COLORS = [
  { id: 0,  hex: '#0d1116' }, { id: 1,  hex: '#1c1d21' }, { id: 2,  hex: '#32383d' },
  { id: 3,  hex: '#454a4d' }, { id: 4,  hex: '#585853' }, { id: 5,  hex: '#848988' },
  { id: 6,  hex: '#c8c8c8' }, { id: 7,  hex: '#f5f5f5' }, { id: 8,  hex: '#9a0000' },
  { id: 9,  hex: '#c20012' }, { id: 10, hex: '#da1918' }, { id: 11, hex: '#b6111b' },
  { id: 12, hex: '#a51e23' }, { id: 13, hex: '#7b1a22' }, { id: 14, hex: '#8a4dbd' },
  { id: 15, hex: '#6b1f7b' }, { id: 16, hex: '#001a7e' }, { id: 17, hex: '#0b1e6f' },
  { id: 18, hex: '#1c3551' }, { id: 19, hex: '#253aa7' }, { id: 20, hex: '#1f4ca8' },
  { id: 21, hex: '#214559' }, { id: 22, hex: '#1b6770' }, { id: 23, hex: '#00735f' },
  { id: 24, hex: '#00613a' }, { id: 25, hex: '#304b30' }, { id: 26, hex: '#18391e' },
  { id: 27, hex: '#2a310a' }, { id: 28, hex: '#726c57' }, { id: 29, hex: '#6c6b4b' },
  { id: 30, hex: '#585332' }, { id: 31, hex: '#473f2b' }, { id: 32, hex: '#3b2d21' },
  { id: 33, hex: '#26201a' }, { id: 34, hex: '#352a1e' }, { id: 35, hex: '#bf9b6e' },
  { id: 36, hex: '#dab46e' }, { id: 37, hex: '#aaad8e' }, { id: 38, hex: '#838b79' },
  { id: 39, hex: '#c8b49e' }, { id: 40, hex: '#a9a28e' }, { id: 41, hex: '#85837f' },
  { id: 42, hex: '#41412e' }, { id: 43, hex: '#3e3a30' }, { id: 44, hex: '#a0a199' },
  { id: 45, hex: '#656a60' }, { id: 46, hex: '#4f5148' }, { id: 47, hex: '#333534' },
  { id: 48, hex: '#242625' }, { id: 49, hex: '#1e2222' }, { id: 50, hex: '#15171a' },
  { id: 51, hex: '#080a0c' }, { id: 52, hex: '#131e27' }, { id: 53, hex: '#3a4956' },
  { id: 54, hex: '#47535e' }, { id: 55, hex: '#61717b' }, { id: 56, hex: '#30383e' },
  { id: 57, hex: '#2b3240' }, { id: 58, hex: '#1e2429' }, { id: 59, hex: '#1d2731' },
  { id: 60, hex: '#394046' }, { id: 61, hex: '#d4a460' }, { id: 62, hex: '#c2a35d' },
  { id: 63, hex: '#9e8e60' }, { id: 64, hex: '#6c5f43' }, { id: 65, hex: '#503e27' },
  { id: 66, hex: '#473829' }, { id: 67, hex: '#3a3026' }, { id: 68, hex: '#2e2821' },
  { id: 69, hex: '#261f19' }, { id: 70, hex: '#6f675e' }, { id: 71, hex: '#e1bf72' },
  { id: 72, hex: '#f2ad30' }, { id: 73, hex: '#f59e00' }, { id: 74, hex: '#e2832b' },
  { id: 75, hex: '#cf6a23' }, { id: 76, hex: '#ff6600' }, { id: 77, hex: '#ca6a23' },
  { id: 78, hex: '#983010' }, { id: 79, hex: '#7d160e' }, { id: 80, hex: '#61100c' },
  { id: 81, hex: '#4a0c0c' }, { id: 82, hex: '#350e0d' }, { id: 83, hex: '#2d100f' },
  { id: 84, hex: '#250f0e' }, { id: 85, hex: '#c2944e' }, { id: 86, hex: '#787868' },
  { id: 87, hex: '#515459' }, { id: 88, hex: '#3c3e42' }, { id: 89, hex: '#373a3f' },
  { id: 90, hex: '#2d3036' }, { id: 91, hex: '#282c31' }, { id: 92, hex: '#25282c' },
  { id: 93, hex: '#676e76' }, { id: 94, hex: '#555e66' }, { id: 95, hex: '#414a52' },
  { id: 96, hex: '#3b434b' }, { id: 97, hex: '#333a41' }, { id: 98, hex: '#2a3038' },
  { id: 99, hex: '#232a31' }, { id: 100, hex: '#475a66' }, { id: 101, hex: '#3f5465' },
  { id: 102, hex: '#2f4251' }, { id: 103, hex: '#2e414f' }, { id: 104, hex: '#283e4e' },
  { id: 105, hex: '#395a83' }, { id: 106, hex: '#ffffff' }, { id: 107, hex: '#f2e8d0' },
  { id: 108, hex: '#efdab7' }, { id: 109, hex: '#e5c48a' }, { id: 110, hex: '#bc9a46' },
  { id: 111, hex: '#916b2e' },
]

export function ColorPicker({ selectedColor, onColorChange }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 600, color: '#888', marginBottom: 6 }}>
        Primary Color
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(22px, 1fr))',
        gap: 3,
        maxHeight: 140,
        overflowY: 'auto',
        padding: 2,
      }}
      className="scrollbar-thin">
        {GTA_COLORS.map(c => (
          <button
            key={c.id}
            onClick={() => onColorChange(c.id)}
            title={`Color ${c.id}`}
            style={{
              width: 22, height: 22, borderRadius: 4, border: 'none',
              background: c.hex, cursor: 'pointer',
              outline: selectedColor === c.id ? '2px solid rgba(255,255,255,0.7)' : '1px solid rgba(255,255,255,0.06)',
              outlineOffset: selectedColor === c.id ? -1 : 0,
              transition: 'outline 0.1s',
            }}
          />
        ))}
      </div>
    </div>
  )
}
