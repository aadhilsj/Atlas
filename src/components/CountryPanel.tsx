'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Instagram, Youtube, MapPin, Users, Camera, ExternalLink } from 'lucide-react'
import type { CountryFull } from '@/hooks/useData'

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
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.75rem', fontWeight: 400,
                    letterSpacing: '-0.02em', color: 'var(--text-primary)',
                    lineHeight: 1,
                  }}>
                    {data?.name}
                  </h2>
                </div>
              )}
              {data?.visited_at && (
                <p style={{
                  fontSize: '0.75rem', color: 'var(--text-muted)',
                  marginTop: 6, display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <MapPin size={11} />
                  {new Date(data.visited_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </p>
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
              aria-label="Close panel"
            >
              <X size={14} />
            </button>
          </div>

          {/* Notes */}
          {data?.notes && (
            <p style={{
              fontSize: '0.875rem', color: 'var(--text-muted)',
              lineHeight: 1.6, fontStyle: 'italic',
              borderLeft: '2px solid var(--glow)',
              paddingLeft: '0.75rem',
            }}>
              {data.notes}
            </p>
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
                        background: style.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: style.color, flexShrink: 0,
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
                        fontSize: '0.8rem', padding: '5px 12px',
                        borderRadius: 99,
                        border: '1px solid rgba(200,50,200,0.3)',
                        color: '#c050c0',
                        textDecoration: 'none',
                        background: 'rgba(200,50,200,0.08)',
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}>
                      <Instagram size={11} /> {f.instagram_handle}
                    </a>
                  ) : (
                    <span key={f.id} style={{
                      fontSize: '0.8rem', padding: '5px 12px',
                      borderRadius: 99, border: '1px solid var(--border)',
                      color: 'var(--text-muted)', background: 'var(--muted-bg)',
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
