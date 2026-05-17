'use client'

import { useMemo, useState } from 'react'
import { set, unset, type StringInputProps } from 'sanity'

/**
 * Curated list of icons available across the site, by name. Each entry
 * stores the canonical icon name (kebab-case) used by the renderer's
 * `iconName → component` map. Add to this list whenever you wire a new
 * icon mapping in code.
 */
const ICONS: { name: string; label: string }[] = [
  { name: 'sparkle', label: 'Sparkle (تجميل)' },
  { name: 'ear', label: 'Ear (سمعيات)' },
  { name: 'first-aid', label: 'First Aid (جراحة)' },
  { name: 'tooth', label: 'Tooth (أسنان)' },
  { name: 'stethoscope', label: 'Stethoscope (باطنية)' },
  { name: 'baby', label: 'Baby (أطفال)' },
  { name: 'flower', label: 'Flower (نساء)' },
  { name: 'bone', label: 'Bone (عظام)' },
  { name: 'eye', label: 'Eye (عيون)' },
  { name: 'flask', label: 'Flask (مختبر)' },
  { name: 'syringe', label: 'Syringe' },
  { name: 'heart', label: 'Heart' },
  { name: 'shield-check', label: 'Shield Check' },
  { name: 'calendar-check', label: 'Calendar Check' },
  { name: 'scissors', label: 'Scissors' },
  { name: 'leaf', label: 'Leaf' },
  { name: 'drop', label: 'Drop' },
  { name: 'lightning', label: 'Lightning' },
  { name: 'speaker-high', label: 'Speaker' },
  { name: 'user-circle', label: 'User Circle' },
  { name: 'wrench', label: 'Wrench' },
  { name: 'headphones', label: 'Headphones' },
  { name: 'clock', label: 'Clock' },
  { name: 'microscope', label: 'Microscope' },
  { name: 'user-check', label: 'User Check' },
  { name: 'trophy', label: 'Trophy' },
  { name: 'whatsapp-logo', label: 'WhatsApp' },
  { name: 'phone', label: 'Phone' },
  { name: 'arrow-right', label: 'Arrow Right' },
]

export function IconPicker(props: StringInputProps) {
  const { value, onChange, elementProps } = props
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ICONS
    return ICONS.filter(
      (i) => i.name.includes(q) || i.label.toLowerCase().includes(q),
    )
  }, [query])

  const apply = (name: string) =>
    onChange(name === value ? unset() : set(name))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        {...elementProps}
        type="text"
        placeholder="ابحث عن أيقونة…"
        value={value || ''}
        onChange={(e) => onChange(e.currentTarget.value ? set(e.currentTarget.value) : unset())}
        style={{
          height: 32,
          padding: '0 10px',
          borderRadius: 6,
          border: '1px solid rgba(0,0,0,0.15)',
          fontFamily: 'ui-monospace, monospace',
          fontSize: 13,
        }}
      />
      <input
        type="search"
        placeholder="Filter…"
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        style={{
          height: 30,
          padding: '0 10px',
          borderRadius: 6,
          border: '1px solid rgba(0,0,0,0.1)',
          fontSize: 12,
        }}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 6,
          maxHeight: 260,
          overflowY: 'auto',
          padding: 4,
        }}
      >
        {filtered.map((icon) => {
          const isSelected = value === icon.name
          return (
            <button
              key={icon.name}
              type="button"
              onClick={() => apply(icon.name)}
              title={icon.label}
              aria-pressed={isSelected}
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                border: isSelected ? '2px solid #c9a961' : '1px solid rgba(0,0,0,0.1)',
                background: isSelected ? '#f7f2e8' : '#ffffff',
                color: '#0d3e3e',
                fontSize: 12,
                fontWeight: isSelected ? 600 : 400,
                textAlign: 'start',
                cursor: 'pointer',
              }}
            >
              <code style={{ display: 'block', fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>
                {icon.name}
              </code>
              <span style={{ display: 'block', color: '#6b7575', fontSize: 10, marginTop: 2 }}>
                {icon.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
