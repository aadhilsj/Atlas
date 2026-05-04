'use client'

import { motion } from 'framer-motion'
import type { Country } from '@/hooks/useData'

interface CountriesListProps {
  countries: Country[]
  selectedId: string | null
  onSelect: (country: Country) => void
}

const FLAG_MAP: Record<string, string> = {
  NOR: '🇳🇴', LKA: '🇱🇰', CHE: '🇨🇭', GBR: '🇬🇧', FRA: '🇫🇷',
  ITA: '🇮🇹', DEU: '🇩🇪', NLD: '🇳🇱', ESP: '🇪🇸', PRT: '🇵🇹',
  USA: '🇺🇸', JPN: '🇯🇵', AUS: '🇦🇺', CAN: '🇨🇦', IND: '🇮🇳',
  SGP: '🇸🇬', THA: '🇹🇭', ARE: '🇦🇪', TUR: '🇹🇷', GRC: '🇬🇷',
}

export default function CountriesList({ countries, selectedId, onSelect }: CountriesListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        padding: '0 0.5rem',
        marginBottom: '0.5rem',
      }}>
        Visited
      </div>
      {countries.map((c, i) => (
        <motion.button
          key={c.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(c)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.6rem 0.75rem',
            borderRadius: 8,
            border: 'none',
            background: selectedId === c.id ? 'var(--selected-bg)' : 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            transition: 'background 0.15s',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={e => {
            if (selectedId !== c.id) (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'
          }}
          onMouseLeave={e => {
            if (selectedId !== c.id) (e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>
            {FLAG_MAP[c.country_code] || '🌍'}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: selectedId === c.id ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {c.name}
            </div>
            {c.visited_at && (
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {new Date(c.visited_at).getFullYear()}
              </div>
            )}
          </div>
          {selectedId === c.id && (
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--glow)', flexShrink: 0 }} />
          )}
        </motion.button>
      ))}
    </div>
  )
}
