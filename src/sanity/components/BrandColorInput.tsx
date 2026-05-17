'use client'

import { useCallback } from 'react'
import { set, unset, type StringInputProps } from 'sanity'

type Swatch = { name: string; value: string }

const PALETTE: Swatch[] = [
  { name: 'Teal Deep', value: '#0d3e3e' },
  { name: 'Teal', value: '#1a5757' },
  { name: 'Teal Light', value: '#2a7373' },
  { name: 'Gold', value: '#c9a961' },
  { name: 'Gold Soft', value: '#e0c890' },
  { name: 'Cream', value: '#f7f2e8' },
  { name: 'Cream Light', value: '#fbf8f0' },
  { name: 'White', value: '#ffffff' },
]

export function BrandColorInput(props: StringInputProps) {
  const { onChange, value, elementProps } = props

  const apply = useCallback(
    (hex: string) => onChange(hex ? set(hex) : unset()),
    [onChange],
  )

  const isSelected = (hex: string) =>
    !!value && value.toLowerCase() === hex.toLowerCase()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        role="group"
        aria-label="لوحة الألوان"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}
      >
        {PALETTE.map((c) => (
          <button
            key={c.value}
            type="button"
            title={`${c.name} (${c.value})`}
            onClick={() => apply(c.value)}
            aria-pressed={isSelected(c.value)}
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: c.value,
              border: isSelected(c.value)
                ? '2px solid #1a5757'
                : '1px solid rgba(0, 0, 0, 0.15)',
              boxShadow: isSelected(c.value)
                ? '0 0 0 2px rgba(201, 169, 97, 0.45)'
                : 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: value || 'transparent',
            border: '1px solid rgba(0, 0, 0, 0.15)',
          }}
        />
        <input
          {...elementProps}
          type="text"
          value={value ?? ''}
          placeholder="#xxxxxx أو أدخل قيمة مخصّصة"
          onChange={(e) => apply(e.currentTarget.value.trim())}
          style={{
            flex: 1,
            height: 32,
            padding: '0 10px',
            borderRadius: 6,
            border: '1px solid rgba(0, 0, 0, 0.15)',
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            fontSize: 13,
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => apply('')}
            style={{
              height: 32,
              padding: '0 10px',
              borderRadius: 6,
              border: '1px solid rgba(0, 0, 0, 0.15)',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            مسح
          </button>
        )}
      </div>
    </div>
  )
}
