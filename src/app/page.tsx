'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Globe from '@/components/Globe'
import CountryPanel from '@/components/CountryPanel'
import CountriesList from '@/components/CountriesList'
import StatsBar from '@/components/StatsBar'
import { useCountries, useCountryFull, useStats, type Country } from '@/hooks/useData'
import { Menu, X } from 'lucide-react'

export default function Home() {
  const { countries, loading: countriesLoading } = useCountries()
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: selectedData, loading: panelLoading } = useCountryFull(selectedCountryId)
  const { friendCount, photoCount } = useStats(countries)

  const handleSelect = useCallback((country: Country | null) => {
    if (!country) { setSelectedCountryId(null); return }
    setSelectedCountryId(prev => prev === country.id ? null : country.id)
    setSidebarOpen(false)
  }, [])

  const handleClose = useCallback(() => setSelectedCountryId(null), [])

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          position: 'relative',
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          background: 'rgba(var(--bg), 0.8)',
        }}
      >
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            fontWeight: 400,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}>
            Atlas
          </h1>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 2 }}>
            Travel Archive
          </p>
        </div>

        <StatsBar
          countryCount={countries.length}
          friendCount={friendCount}
          photoCount={photoCount}
        />

        {/* Mobile menu toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            display: 'none',
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 10px',
            cursor: 'pointer', color: 'var(--text-primary)',
          }}
          className="mobile-menu-btn"
          aria-label="Toggle country list"
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </motion.header>

      {/* Main layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* Left sidebar — country list */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            width: '200px',
            flexShrink: 0,
            borderRight: '1px solid var(--border)',
            padding: '1.25rem 0.75rem',
            overflowY: 'auto',
          }}
          className="sidebar-desktop"
        >
          {countriesLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} className="shimmer" style={{ height: 44, borderRadius: 8 }} />
              ))}
            </div>
          ) : (
            <CountriesList
              countries={countries}
              selectedId={selectedCountryId}
              onSelect={handleSelect}
            />
          )}
        </motion.aside>

        {/* Globe centre */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          position: 'relative',
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            style={{
              width: '100%',
              maxWidth: 500,
              position: 'relative',
            }}
          >
            {/* Glow behind globe */}
            <div style={{
              position: 'absolute',
              inset: '-20%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(158,110,42,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <Globe
              countries={countries}
              selectedId={selectedCountryId}
              onSelect={handleSelect}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              marginTop: '1rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
            }}
          >
            {selectedCountryId ? 'Press Esc to close' : 'Drag to rotate · Click a country to explore'}
          </motion.p>
        </div>

        {/* Right panel — country detail */}
        <div style={{ position: 'relative', flexShrink: 0, width: selectedCountryId || panelLoading ? 340 : 0, transition: 'width 0.3s ease' }}>
          <CountryPanel
            data={selectedData}
            loading={panelLoading}
            onClose={handleClose}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
