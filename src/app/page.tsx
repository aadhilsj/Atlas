'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Globe, ArrowLeft, MapPin, Home, Package } from 'lucide-react'

const FLAG_MAP: Record<string, string> = {
  NOR: '🇳🇴', LKA: '🇱🇰', CHE: '🇨🇭', GBR: '🇬🇧', FRA: '🇫🇷',
  ITA: '🇮🇹', DEU: '🇩🇪', NLD: '🇳🇱', ESP: '🇪🇸', PRT: '🇵🇹',
  USA: '🇺🇸', JPN: '🇯🇵', AUS: '🇦🇺', CAN: '🇨🇦', IND: '🇮🇳',
  SGP: '🇸🇬', THA: '🇹🇭', ARE: '🇦🇪', TUR: '🇹🇷', GRC: '🇬🇷',
  HUN: '🇭🇺', ISL: '🇮🇸', DNK: '🇩🇰', SWE: '🇸🇪', FIN: '🇫🇮',
  POL: '🇵🇱', CZE: '🇨🇿', AUT: '🇦🇹', BEL: '🇧🇪', HRV: '🇭🇷',
}

type City = { id: string; name: string }
type TripEntry = {
  id: string
  title: string | null
  start_date: string | null
  end_date: string | null
  notes: string | null
  cities: City[]
  country: {
    id: string
    name: string
    country_code: string
    residence_status: string
  }
}

type YearGroup = {
  year: number
  trips: TripEntry[]
}

function formatDateRange(start: string | null, end: string | null) {
  if (!start) return null
  const s = new Date(start)
  const sStr = s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  if (!end || end === start) return sStr
  const e = new Date(end)
  const eStr = e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${sStr} – ${eStr}`
}

export default function TimelinePage() {
  const [yearGroups, setYearGroups] = useState<YearGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCountries, setTotalCountries] = useState(0)
  const [totalTrips, setTotalTrips] = useState(0)

  useEffect(() => {
    async function load() {
      const { data: trips } = await supabase
        .from('trips')
        .select('*, countries(id, name, country_code, residence_status)')
        .order('start_date', { ascending: true })

      if (!trips) { setLoading(false); return }

      const tripsWithCities: TripEntry[] = await Promise.all(
        trips.map(async (t: any) => {
          const { data: cities } = await supabase
            .from('cities')
            .select('id, name')
            .eq('trip_id', t.id)
          return {
            id: t.id,
            title: t.title,
            start_date: t.start_date,
            end_date: t.end_date,
            notes: t.notes,
            cities: cities || [],
            country: t.countries,
          }
        })
      )

      // Group by year
      const byYear: Record<number, TripEntry[]> = {}
      tripsWithCities.forEach(t => {
        if (!t.start_date) return
        const year = new Date(t.start_date).getFullYear()
        if (!byYear[year]) byYear[year] = []
        byYear[year].push(t)
      })

      const groups = Object.entries(byYear)
        .map(([year, trips]) => ({ year: parseInt(year), trips }))
        .sort((a, b) => b.year - a.year) // newest first

      setYearGroups(groups)
      setTotalTrips(tripsWithCities.length)
      setTotalCountries(new Set(tripsWithCities.map(t => t.country?.id)).size)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="/" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.8rem', color: 'var(--text-muted)',
            textDecoration: 'none',
          }}>
            <ArrowLeft size={14} /> Globe
          </a>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1 }}>
              Timeline
            </h1>
            <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 2 }}>
              Travel Archive
            </p>
          </div>
        </div>

        {/* Stats */}
        {!loading && (
          <div style={{ display: 'flex', gap: '2rem' }}>
            {[
              { value: totalCountries, label: 'countries' },
              { value: totalTrips, label: 'trips' },
              { value: yearGroups.length, label: 'years' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--glow)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </motion.header>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {[0,1,2].map(i => (
              <div key={i}>
                <div className="shimmer" style={{ width: 60, height: 20, borderRadius: 4, marginBottom: 16 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[0,1].map(j => <div key={j} className="shimmer" style={{ height: 72, borderRadius: 12 }} />)}
                </div>
              </div>
            ))}
          </div>
        ) : yearGroups.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '4rem', color: 'var(--text-muted)' }}>
            <Globe size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '0.9rem' }}>No trips yet — add your first country in admin.</p>
          </div>
        ) : (
          yearGroups.map((group, gi) => (
            <motion.div
              key={group.year}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.06 }}
              style={{ marginBottom: '3rem' }}
            >
              {/* Year heading */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                marginBottom: '1rem',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.5rem', fontWeight: 400,
                  color: 'var(--glow)', lineHeight: 1,
                  letterSpacing: '-0.03em',
                }}>
                  {group.year}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {group.trips.length} {group.trips.length === 1 ? 'trip' : 'trips'}
                </span>
              </div>

              {/* Trips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
                {group.trips.map((trip, ti) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: gi * 0.06 + ti * 0.04 }}
                    style={{
                      position: 'relative',
                      background: 'var(--panel-bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '1rem 1.25rem',
                      marginLeft: 16,
                    }}
                  >
                    {/* Timeline dot */}
                    <div style={{
                      position: 'absolute', left: -23,
                      top: '50%', transform: 'translateY(-50%)',
                      width: 10, height: 10, borderRadius: '50%',
                      background: trip.country?.residence_status === 'living' ? '#4dd8b0'
                        : trip.country?.residence_status === 'lived' ? '#4a9eff'
                        : 'var(--glow)',
                      border: '2px solid var(--bg)',
                    }} />

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      {/* Flag */}
                      <span style={{ fontSize: '1.6rem', lineHeight: 1, flexShrink: 0, marginTop: 2 }}>
                        {FLAG_MAP[trip.country?.country_code] || '🌍'}
                      </span>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                            {trip.country?.name}
                          </span>
                          {trip.title && trip.title !== 'First visit' && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              {trip.title}
                            </span>
                          )}
                          {trip.country?.residence_status === 'living' && (
                            <span style={{ fontSize: '0.65rem', padding: '1px 7px', borderRadius: 99, background: 'rgba(77,216,176,0.12)', color: '#4dd8b0', border: '1px solid rgba(77,216,176,0.2)' }}>🏠 living</span>
                          )}
                          {trip.country?.residence_status === 'lived' && (
                            <span style={{ fontSize: '0.65rem', padding: '1px 7px', borderRadius: 99, background: 'rgba(74,158,255,0.12)', color: '#4a9eff', border: '1px solid rgba(74,158,255,0.2)' }}>📦 lived</span>
                          )}
                        </div>

                        {/* Date */}
                        {trip.start_date && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>
                            {formatDateRange(trip.start_date, trip.end_date)}
                          </div>
                        )}

                        {/* Cities */}
                        {trip.cities.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                            {trip.cities.map(c => (
                              <span key={c.id} style={{
                                fontSize: '0.72rem', padding: '2px 9px', borderRadius: 99,
                                background: 'rgba(77,216,176,0.08)', color: '#4dd8b0',
                                border: '1px solid rgba(77,216,176,0.2)',
                              }}>
                                {c.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Notes */}
                        {trip.notes && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.6, fontStyle: 'italic' }}>
                            {trip.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
