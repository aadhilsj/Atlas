'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Instagram, Youtube, MapPin, Users, Camera } from 'lucide-react'
import type { CountryFull } from '@/hooks/useData'

interface CountryPanelProps {
  data: CountryFull | null
  loading: boolean
  onClose: () => void
}

const platformIcon = (platform: string) => {
  if (platform === 'youtube') return <Youtube size={14} />
  return <Instagram size={14} />
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
          className="panel-container"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '340px',
            height: '100%',
            overflowY: 'auto',
            background: 'var(--panel-bg)',
            borderLeft: '1px solid var(--border)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* Close */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              {loading ? (
                <div className="shimmer" style={{ width: 140, height: 28, borderRadius: 4 }} />
              ) : (
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 400, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  {data?.name}
                </h2>
              )}
              {data?.visited_at && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
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
                cursor: 'pointer', color: 'var(--text-muted)',
                flexShrink: 0,
              }}
              aria-label="Close panel"
            >
              <X size={14} />
            </button>
          </div>

          {/* Notes */}
          {data?.notes && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
              "{data.notes}"
            </p>
          )}

          {/* Photos */}
          <section>
            <SectionLabel icon={<Camera size={12} />} label="Photos" count={data?.photos.length} />
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
                    style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', display: 'block', background: 'var(--muted)' }}>
                    <img src={p.url} alt={p.caption || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Vlogs */}
          <section>
            <SectionLabel icon={<Youtube size={12} />} label="Vlogs" count={data?.vlogs.length} />
            {loading ? (
              <div className="shimmer" style={{ height: 56, borderRadius: 8, marginTop: 10 }} />
            ) : data?.vlogs.length === 0 ? (
              <EmptySlot label="No vlogs yet" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {data?.vlogs.map(v => (
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
                      background: 'var(--glow)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#fff', flexShrink: 0,
                    }}>
                      {platformIcon(v.platform)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{v.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{v.platform}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Friends */}
          <section>
            <SectionLabel icon={<Users size={12} />} label="People met" count={data?.friends.length} />
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
                        fontSize: '0.8rem', padding: '4px 12px',
                        borderRadius: 99, border: '1px solid var(--border)',
                        color: 'var(--glow)', textDecoration: 'none',
                        background: 'var(--muted-bg)',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                      <Instagram size={11} /> {f.instagram_handle}
                    </a>
                  ) : (
                    <span key={f.id} style={{
                      fontSize: '0.8rem', padding: '4px 12px',
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

function SectionLabel({ icon, label, count }: { icon: React.ReactNode; label: string; count?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
      <span style={{ fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {label}
      </span>
      {count !== undefined && count > 0 && (
        <span style={{
          fontSize: '0.65rem', padding: '1px 7px', borderRadius: 99,
          background: 'var(--glow)', color: '#fff', marginLeft: 'auto',
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
      marginTop: 10, padding: '1rem', borderRadius: 8,
      border: '1px dashed var(--border)',
      textAlign: 'center', fontSize: '0.8rem',
      color: 'var(--text-muted)',
    }}>
      {label}
    </div>
  )
}
