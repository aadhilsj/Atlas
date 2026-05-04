'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Instagram, Youtube, MapPin, Users, Camera, ExternalLink, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import type { CountryFull, Trip } from '@/hooks/useData'

interface CountryPanelProps {
  data: CountryFull | null
  loading: boolean
  onClose: () => void
}

const PLATFORM_COLORS: Record<string, { bg: string; color: string }> = {
  youtube: { bg: 'rgba(255,50,50,0.12)', color: '#ff4444' },
  instagram: { bg: 'rgba(200,50,200,0.12)', color: '#c050c0' },
  tiktok: { bg: 'rgba(0,200,200,0.12)', color: '#00c8c8' },
}

const FLAG_MAP: Record<string, string> = {
  NOR: '🇳🇴', LKA: '🇱🇰', CHE: '🇨🇭', GBR: '🇬🇧', FRA: '🇫🇷',
  ITA: '🇮🇹', DEU: '🇩🇪', NLD: '🇳🇱', ESP: '🇪🇸', PRT: '🇵🇹',
  USA: '🇺🇸', JPN: '🇯🇵', AUS: '🇦🇺', CAN: '🇨🇦', IND: '🇮🇳',
  SGP: '🇸🇬', THA: '🇹🇭', ARE: '🇦🇪', TUR: '🇹🇷', GRC: '🇬🇷',
}

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

function TripCard({ trip }: { trip: Trip }) {
  const [expanded, setExpanded] = useState(false)
  const hasDetail = (trip.notes || trip.cities.length > 0)

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      <div
        onClick={() => hasDetail && setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0.75rem 1rem',
          cursor: hasDetail ? 'pointer' : 'default',
          background: 'var(--muted-bg)',
        }}
      >
        {/* Timeline dot */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--glow)', flexShrink: 0,
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            {trip.title || 'Trip'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={10} />
            {formatDate(trip.start_date)}
            {trip.end_date && trip.end_date !== trip.start_date && ` → ${formatDate(trip.end_date)}`}
          </div>
        </div>

        {/* City chips preview */}
        {trip.cities.length > 0 && !expanded && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 120 }}>
            {trip.cities.slice(0, 2).map(c => (
              <span key={c.id} style={{
                fontSize: '0.65rem', padding: '2px 8px', borderRadius: 99,
                background: 'rgba(77,216,176,0.12)', color: '#4dd8b0',
                border: '1px solid rgba(77,216,176,0.25)',
              }}>{c.name}</span>
            ))}
            {trip.cities.length > 2 && (
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>+{trip.cities.length - 2}</span>
            )}
          </div>
        )}

        {hasDetail && (
          <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </span>
        )}
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)' }}>
              {trip.cities.length > 0 && (
                <div style={{ marginBottom: trip.notes ? '0.75rem' : 0 }}>
                  <div style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Cities</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {trip.cities.map(c => (
                      <span key={c.id} style={{
                        fontSize: '0.78rem', padding: '3px 10px', borderRadius: 99,
                        background: 'rgba(77,216,176,0.1)', color: '#4dd8b0',
                        border: '1px solid rgba(77,216,176,0.25)',
                      }}>{c.name}</span>
                    ))}
                  </div>
                </div>
              )}
              {trip.notes && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  {trip.notes}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CountryPanel({ data, loading, onClose }: CountryPanelProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {(data || loading) && (
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          style={{
            position: 'absolute', top: 0, right: 0,
            width: '340px', height: '100%', overflowY: 'auto',
            background: 'var(--panel-bg)',
            borderLeft: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: '1.25rem',
            padding: '1.5rem',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              {loading ? (
                <div className="shimmer" style={{ width: 140, height: 32, borderRadius: 4 }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {data?.country_code && FLAG_MAP[data.country_code] && (
                    <span style={{ fontSize: '1.75rem' }}>{FLAG_MAP[data.country_code]}</span>
                  )}
                  <div>
                    <h2 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.75rem', fontWeight: 400,
                      letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1,
                    }}>
                      {data?.name}
                    </h2>
                    {data && data.trips.length > 0 && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={10} />
                        {data.trips.length} {data.trips.length === 1 ? 'trip' : 'trips'}
                        {data.trips.flatMap(t => t.cities).length > 0 && (
                          <> · {data.trips.flatMap(t => t.cities).length} cities</>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: '50%', width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0,
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Notes */}
          {data?.notes && (
            <p style={{
              fontSize: '0.875rem', color: 'var(--text-muted)',
              lineHeight: 1.6, fontStyle: 'italic',
              borderLeft: '2px solid var(--glow)', paddingLeft: '0.75rem',
            }}>
              {data.notes}
            </p>
          )}

          {/* Trips */}
          {(loading || (data && data.trips.length > 0)) && (
            <section>
              <SectionLabel icon={<Calendar size={12} />} label="Trips" count={data?.trips.length} color="#e8b86d" />
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                  {[0,1].map(i => <div key={i} className="shimmer" style={{ height: 60, borderRadius: 10 }} />)}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, position: 'relative' }}>
                  {/* Timeline line */}
                  <div style={{
                    position: 'absolute', left: 17, top: 12, bottom: 12,
                    width: 1, background: 'var(--border)',
                  }} />
                  {data?.trips.map(trip => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Photos */}
          <section>
            <SectionLabel icon={<Camera size={12} />} label="Photos" count={data?.photos.length} color="#4a9eff" />
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginTop: 10 }}>
                {[0,1,2].map(i => <div key={i} className="shimmer" style={{ aspectRatio: '1', borderRadius: 8 }} />)}
              </div>
            ) : data?.photos.length === 0 ? (
              <EmptySlot label="No photos yet" />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginTop: 10 }}>
                {data?.photos.map(p => (
                  <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      aspectRatio: '1', borderRadius: 8, overflow: 'hidden',
                      display: 'block', background: 'var(--muted-bg)',
                      border: '1px solid var(--border)',
                    }}>
                    <img src={p.url} alt={p.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Vlogs */}
          <section>
            <SectionLabel icon={<Youtube size={12} />} label="Vlogs" count={data?.vlogs.length} color="#ff4444" />
            {loading ? (
              <div className="shimmer" style={{ height: 56, borderRadius: 8, marginTop: 10 }} />
            ) : data?.vlogs.length === 0 ? (
              <EmptySlot label="No vlogs yet" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {data?.vlogs.map(v => {
                  const style = PLATFORM_COLORS[v.platform] || PLATFORM_COLORS.youtube
                  return (
                    <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '0.75rem', borderRadius: 10,
                        border: '1px solid var(--border)',
                        textDecoration: 'none', color: 'var(--text-primary)',
                        background: 'var(--muted-bg)',
                      }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: style.bg, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: style.color, flexShrink: 0,
                      }}>
                        <Youtube size={14} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</div>
                        <div style={{ fontSize: '0.7rem', color: style.color, textTransform: 'capitalize' }}>{v.platform}</div>
                      </div>
                      <ExternalLink size={13} color="var(--text-muted)" />
                    </a>
                  )
                })}
              </div>
            )}
          </section>

          {/* Friends */}
          <section>
            <SectionLabel icon={<Users size={12} />} label="People met" count={data?.friends.length} color="#4ac97e" />
            {loading ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {[0,1,2].map(i => <div key={i} className="shimmer" style={{ width: 80, height: 28, borderRadius: 99 }} />)}
              </div>
            ) : data?.friends.length === 0 ? (
              <EmptySlot label="No friends added yet" />
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {data?.friends.map(f => (
                  f.instagram_handle ? (
                    <a key={f.id}
                      href={`https://instagram.com/${f.instagram_handle.replace('@','')}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        fontSize: '0.8rem', padding: '5px 12px', borderRadius: 99,
                        border: '1px solid rgba(200,50,200,0.3)', color: '#c050c0',
                        textDecoration: 'none', background: 'rgba(200,50,200,0.08)',
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}>
                      <Instagram size={11} /> {f.instagram_handle}
                    </a>
                  ) : (
                    <span key={f.id} style={{
                      fontSize: '0.8rem', padding: '5px 12px', borderRadius: 99,
                      border: '1px solid var(--border)', color: 'var(--text-muted)',
                      background: 'var(--muted-bg)',
                    }}>
                      {f.name}
                    </span>
                  )
                ))}
              </div>
            )}
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SectionLabel({ icon, label, count, color }: { icon: React.ReactNode; label: string; count?: number; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: color || 'var(--text-muted)' }}>{icon}</span>
      <span style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {label}
      </span>
      {count !== undefined && count > 0 && (
        <span style={{
          fontSize: '0.65rem', padding: '1px 7px', borderRadius: 99,
          background: color || 'var(--glow)', color: '#fff', marginLeft: 'auto',
        }}>
          {count}
        </span>
      )}
    </div>
  )
}

function EmptySlot({ label }: { label: string }) {
  return (
    <div style={{
      marginTop: 10, padding: '0.875rem', borderRadius: 8,
      border: '1px dashed var(--border)',
      textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)',
    }}>
      {label}
    </div>
  )
}
