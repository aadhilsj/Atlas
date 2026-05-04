'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Globe, Camera, Youtube, Users, Lock, ChevronDown, ChevronUp } from 'lucide-react'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'atlas2024'

const FLAG_MAP: Record<string, string> = {
  NOR: '🇳🇴', LKA: '🇱🇰', CHE: '🇨🇭', GBR: '🇬🇧', FRA: '🇫🇷',
  ITA: '🇮🇹', DEU: '🇩🇪', NLD: '🇳🇱', ESP: '🇪🇸', PRT: '🇵🇹',
  USA: '🇺🇸', JPN: '🇯🇵', AUS: '🇦🇺', CAN: '🇨🇦', IND: '🇮🇳',
  SGP: '🇸🇬', THA: '🇹🇭', ARE: '🇦🇪', TUR: '🇹🇷', GRC: '🇬🇷',
}

type Country = { id: string; name: string; country_code: string; numeric_id: number; visited_at: string | null; notes: string | null }
type Photo = { id: string; url: string; caption: string | null }
type Vlog = { id: string; title: string; url: string; platform: string }
type Friend = { id: string; name: string; instagram_handle: string | null }

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [vlogs, setVlogs] = useState<Vlog[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [activeTab, setActiveTab] = useState<'photos' | 'vlogs' | 'friends'>('photos')
  const [saving, setSaving] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('countries')

  // New country form
  const [newCountry, setNewCountry] = useState({ name: '', country_code: '', numeric_id: '', visited_at: '', notes: '' })
  // New photo
  const [newPhoto, setNewPhoto] = useState({ url: '', caption: '' })
  // New vlog
  const [newVlog, setNewVlog] = useState({ title: '', url: '', platform: 'youtube' })
  // New friend
  const [newFriend, setNewFriend] = useState({ name: '', instagram_handle: '' })

  const login = () => {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(false) }
    else setPwError(true)
  }

  useEffect(() => {
    if (!authed) return
    supabase.from('countries').select('*').order('visited_at').then(({ data }) => setCountries(data || []))
  }, [authed])

  const selectCountry = async (c: Country) => {
    setSelectedCountry(c)
    const [p, v, f] = await Promise.all([
      supabase.from('photos').select('*').eq('country_id', c.id),
      supabase.from('vlogs').select('*').eq('country_id', c.id),
      supabase.from('friends').select('*').eq('country_id', c.id),
    ])
    setPhotos(p.data || [])
    setVlogs(v.data || [])
    setFriends(f.data || [])
  }

  const addCountry = async () => {
    if (!newCountry.name || !newCountry.country_code || !newCountry.numeric_id) return
    setSaving(true)
    const { data } = await supabase.from('countries').insert({
      name: newCountry.name,
      country_code: newCountry.country_code.toUpperCase(),
      numeric_id: parseInt(newCountry.numeric_id),
      visited_at: newCountry.visited_at || null,
      notes: newCountry.notes || null,
    }).select().single()
    if (data) setCountries(prev => [...prev, data])
    setNewCountry({ name: '', country_code: '', numeric_id: '', visited_at: '', notes: '' })
    setSaving(false)
  }

  const deleteCountry = async (id: string) => {
    await supabase.from('countries').delete().eq('id', id)
    setCountries(prev => prev.filter(c => c.id !== id))
    if (selectedCountry?.id === id) setSelectedCountry(null)
  }

  const addPhoto = async () => {
    if (!selectedCountry || !newPhoto.url) return
    setSaving(true)
    const { data } = await supabase.from('photos').insert({
      country_id: selectedCountry.id,
      url: newPhoto.url,
      caption: newPhoto.caption || null,
    }).select().single()
    if (data) setPhotos(prev => [...prev, data])
    setNewPhoto({ url: '', caption: '' })
    setSaving(false)
  }

  const deletePhoto = async (id: string) => {
    await supabase.from('photos').delete().eq('id', id)
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  const addVlog = async () => {
    if (!selectedCountry || !newVlog.title || !newVlog.url) return
    setSaving(true)
    const { data } = await supabase.from('vlogs').insert({
      country_id: selectedCountry.id,
      title: newVlog.title,
      url: newVlog.url,
      platform: newVlog.platform,
    }).select().single()
    if (data) setVlogs(prev => [...prev, data])
    setNewVlog({ title: '', url: '', platform: 'youtube' })
    setSaving(false)
  }

  const deleteVlog = async (id: string) => {
    await supabase.from('vlogs').delete().eq('id', id)
    setVlogs(prev => prev.filter(v => v.id !== id))
  }

  const addFriend = async () => {
    if (!selectedCountry || !newFriend.name) return
    setSaving(true)
    const { data } = await supabase.from('friends').insert({
      country_id: selectedCountry.id,
      name: newFriend.name,
      instagram_handle: newFriend.instagram_handle || null,
    }).select().single()
    if (data) setFriends(prev => [...prev, data])
    setNewFriend({ name: '', instagram_handle: '' })
    setSaving(false)
  }

  const deleteFriend = async (id: string) => {
    await supabase.from('friends').delete().eq('id', id)
    setFriends(prev => prev.filter(f => f.id !== id))
  }

  if (!authed) return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', fontFamily: 'var(--font-body)',
    }}>
      <div style={{
        background: 'var(--panel-bg)', border: '1px solid var(--border)',
        borderRadius: 16, padding: '2.5rem', width: 360, textAlign: 'center',
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Lock size={24} color='var(--glow)' style={{ margin: '0 auto 0.75rem' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400, color: 'var(--text-primary)' }}>
            Atlas Admin
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Enter your password to continue</p>
        </div>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="Password"
          style={{
            width: '100%', padding: '0.75rem 1rem', borderRadius: 8,
            border: `1px solid ${pwError ? '#e24b4a' : 'var(--border)'}`,
            background: 'var(--muted-bg)', color: 'var(--text-primary)',
            fontSize: '0.9rem', outline: 'none', marginBottom: '0.75rem',
            fontFamily: 'var(--font-body)',
          }}
        />
        {pwError && <p style={{ fontSize: '0.75rem', color: '#e24b4a', marginBottom: '0.75rem' }}>Incorrect password</p>}
        <button onClick={login} style={{
          width: '100%', padding: '0.75rem', borderRadius: 8,
          background: 'var(--glow)', border: 'none', color: '#fff',
          fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}>
          Enter
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400 }}>Atlas Admin</h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Manage your travel archive</p>
        </div>
        <a href="/" style={{ fontSize: '0.8rem', color: 'var(--glow)', textDecoration: 'none' }}>← View Archive</a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0, height: 'calc(100dvh - 73px)' }}>

        {/* Left — Countries list */}
        <div style={{ borderRight: '1px solid var(--border)', overflowY: 'auto', padding: '1rem 0.75rem' }}>
          <Section
            title="Countries"
            icon={<Globe size={13} />}
            expanded={expandedSection === 'countries'}
            onToggle={() => setExpandedSection(e => e === 'countries' ? null : 'countries')}
          >
            {/* Add country form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              <Input placeholder="Country name" value={newCountry.name} onChange={v => setNewCountry(p => ({ ...p, name: v }))} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <Input placeholder="Code (e.g. JPN)" value={newCountry.country_code} onChange={v => setNewCountry(p => ({ ...p, country_code: v }))} />
                <Input placeholder="Numeric ID" value={newCountry.numeric_id} onChange={v => setNewCountry(p => ({ ...p, numeric_id: v }))} />
              </div>
              <Input placeholder="Visited (YYYY-MM-DD)" value={newCountry.visited_at} onChange={v => setNewCountry(p => ({ ...p, visited_at: v }))} />
              <Input placeholder="Notes (optional)" value={newCountry.notes} onChange={v => setNewCountry(p => ({ ...p, notes: v }))} />
              <AddButton onClick={addCountry} loading={saving} label="Add country" />
            </div>

            {/* Countries list */}
            {countries.map(c => (
              <div
                key={c.id}
                onClick={() => selectCountry(c)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '0.6rem 0.75rem', borderRadius: 8, cursor: 'pointer',
                  background: selectedCountry?.id === c.id ? 'var(--selected-bg)' : 'transparent',
                  marginBottom: 2,
                }}
              >
                <span style={{ fontSize: '1rem' }}>{FLAG_MAP[c.country_code] || '🌍'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: selectedCountry?.id === c.id ? 500 : 400 }}>{c.name}</div>
                  {c.visited_at && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(c.visited_at).getFullYear()}</div>}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deleteCountry(c.id) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 4, display: 'flex' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </Section>
        </div>

        {/* Right — Content editor */}
        <div style={{ overflowY: 'auto', padding: '1.5rem' }}>
          {!selectedCountry ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: 8 }}>
              <Globe size={32} />
              <p style={{ fontSize: '0.9rem' }}>Select a country to manage its content</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 400 }}>
                  {FLAG_MAP[selectedCountry.country_code] || '🌍'} {selectedCountry.name}
                </h2>
                {selectedCountry.notes && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>"{selectedCountry.notes}"</p>
                )}
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                {(['photos', 'vlogs', 'friends'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    padding: '6px 16px', borderRadius: 99, border: 'none', cursor: 'pointer',
                    background: activeTab === tab ? 'var(--glow)' : 'var(--muted-bg)',
                    color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.8rem', fontWeight: 500, fontFamily: 'var(--font-body)',
                    textTransform: 'capitalize',
                  }}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* Photos tab */}
              {activeTab === 'photos' && (
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
                    <Input placeholder="Image URL" value={newPhoto.url} onChange={v => setNewPhoto(p => ({ ...p, url: v }))} />
                    <Input placeholder="Caption (optional)" value={newPhoto.caption} onChange={v => setNewPhoto(p => ({ ...p, caption: v }))} />
                    <AddButton onClick={addPhoto} loading={saving} label="Add" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                    {photos.map(p => (
                      <div key={p.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img src={p.url} alt={p.caption || ''} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                        {p.caption && <div style={{ padding: '6px 8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.caption}</div>}
                        <button onClick={() => deletePhoto(p.id)} style={{
                          position: 'absolute', top: 6, right: 6,
                          background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                          width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: '#fff',
                        }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                    {photos.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No photos yet</p>}
                  </div>
                </div>
              )}

              {/* Vlogs tab */}
              {activeTab === 'vlogs' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 8, marginBottom: '1rem', alignItems: 'end' }}>
                    <Input placeholder="Title" value={newVlog.title} onChange={v => setNewVlog(p => ({ ...p, title: v }))} />
                    <Input placeholder="URL" value={newVlog.url} onChange={v => setNewVlog(p => ({ ...p, url: v }))} />
                    <select
                      value={newVlog.platform}
                      onChange={e => setNewVlog(p => ({ ...p, platform: e.target.value }))}
                      style={{
                        padding: '0.6rem 0.75rem', borderRadius: 8,
                        border: '1px solid var(--border)', background: 'var(--muted-bg)',
                        color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'var(--font-body)',
                      }}
                    >
                      <option value="youtube">YouTube</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                    <AddButton onClick={addVlog} loading={saving} label="Add" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {vlogs.map(v => (
                      <div key={v.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '0.75rem 1rem', borderRadius: 10, border: '1px solid var(--border)',
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: v.platform === 'youtube' ? 'rgba(255,50,50,0.15)' : v.platform === 'instagram' ? 'rgba(200,50,200,0.15)' : 'rgba(0,0,0,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          color: v.platform === 'youtube' ? '#ff4444' : v.platform === 'instagram' ? '#c050c0' : 'var(--text-muted)',
                        }}>
                          <Youtube size={14} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{v.title}</div>
                          <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--glow)', textDecoration: 'none' }}>
                            {v.url.length > 50 ? v.url.slice(0, 50) + '…' : v.url}
                          </a>
                        </div>
                        <button onClick={() => deleteVlog(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {vlogs.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No vlogs yet</p>}
                  </div>
                </div>
              )}

              {/* Friends tab */}
              {activeTab === 'friends' && (
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
                    <Input placeholder="Name" value={newFriend.name} onChange={v => setNewFriend(p => ({ ...p, name: v }))} />
                    <Input placeholder="Instagram @handle" value={newFriend.instagram_handle} onChange={v => setNewFriend(p => ({ ...p, instagram_handle: v }))} />
                    <AddButton onClick={addFriend} loading={saving} label="Add" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {friends.map(f => (
                      <div key={f.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '0.75rem 1rem', borderRadius: 10, border: '1px solid var(--border)',
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'var(--selected-bg)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '0.85rem', fontWeight: 500,
                          color: 'var(--glow)', flexShrink: 0,
                        }}>
                          {f.name[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{f.name}</div>
                          {f.instagram_handle && (
                            <a href={`https://instagram.com/${f.instagram_handle.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: '0.75rem', color: 'var(--glow)', textDecoration: 'none' }}>
                              {f.instagram_handle}
                            </a>
                          )}
                        </div>
                        <button onClick={() => deleteFriend(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {friends.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No friends added yet</p>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Input({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        flex: 1, padding: '0.6rem 0.75rem', borderRadius: 8,
        border: '1px solid var(--border)', background: 'var(--muted-bg)',
        color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none',
        fontFamily: 'var(--font-body)', minWidth: 0,
      }}
    />
  )
}

function AddButton({ onClick, loading, label }: { onClick: () => void; loading: boolean; label: string }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      padding: '0.6rem 1rem', borderRadius: 8,
      background: 'var(--glow)', border: 'none',
      color: '#fff', fontSize: '0.85rem', fontWeight: 500,
      cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
      display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
      fontFamily: 'var(--font-body)',
    }}>
      <Plus size={13} /> {label}
    </button>
  )
}

function Section({ title, icon, expanded, onToggle, children }: {
  title: string; icon: React.ReactNode; expanded: boolean;
  onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <button onClick={onToggle} style={{
        display: 'flex', alignItems: 'center', gap: 6, width: '100%',
        background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem',
        borderRadius: 6, color: 'var(--text-muted)', fontSize: '0.7rem',
        letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500,
        fontFamily: 'var(--font-body)',
      }}>
        {icon} {title}
        <span style={{ marginLeft: 'auto' }}>{expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}</span>
      </button>
      {expanded && <div style={{ marginTop: 8 }}>{children}</div>}
    </div>
  )
}
