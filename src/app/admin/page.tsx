'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2, Globe, Lock, Search, MapPin, Home, Plane } from 'lucide-react'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'atlas2024'

const COUNTRY_LOOKUP: Record<string, { code: string; numeric: number; flag: string }> = {
  'Afghanistan': { code: 'AFG', numeric: 4, flag: '🇦🇫' },
  'Albania': { code: 'ALB', numeric: 8, flag: '🇦🇱' },
  'Algeria': { code: 'DZA', numeric: 12, flag: '🇩🇿' },
  'Argentina': { code: 'ARG', numeric: 32, flag: '🇦🇷' },
  'Armenia': { code: 'ARM', numeric: 51, flag: '🇦🇲' },
  'Australia': { code: 'AUS', numeric: 36, flag: '🇦🇺' },
  'Austria': { code: 'AUT', numeric: 40, flag: '🇦🇹' },
  'Azerbaijan': { code: 'AZE', numeric: 31, flag: '🇦🇿' },
  'Bahrain': { code: 'BHR', numeric: 48, flag: '🇧🇭' },
  'Bangladesh': { code: 'BGD', numeric: 50, flag: '🇧🇩' },
  'Belgium': { code: 'BEL', numeric: 56, flag: '🇧🇪' },
  'Bolivia': { code: 'BOL', numeric: 68, flag: '🇧🇴' },
  'Brazil': { code: 'BRA', numeric: 76, flag: '🇧🇷' },
  'Bulgaria': { code: 'BGR', numeric: 100, flag: '🇧🇬' },
  'Cambodia': { code: 'KHM', numeric: 116, flag: '🇰🇭' },
  'Canada': { code: 'CAN', numeric: 124, flag: '🇨🇦' },
  'Chile': { code: 'CHL', numeric: 152, flag: '🇨🇱' },
  'China': { code: 'CHN', numeric: 156, flag: '🇨🇳' },
  'Colombia': { code: 'COL', numeric: 170, flag: '🇨🇴' },
  'Croatia': { code: 'HRV', numeric: 191, flag: '🇭🇷' },
  'Cuba': { code: 'CUB', numeric: 192, flag: '🇨🇺' },
  'Cyprus': { code: 'CYP', numeric: 196, flag: '🇨🇾' },
  'Czech Republic': { code: 'CZE', numeric: 203, flag: '🇨🇿' },
  'Denmark': { code: 'DNK', numeric: 208, flag: '🇩🇰' },
  'Ecuador': { code: 'ECU', numeric: 218, flag: '🇪🇨' },
  'Egypt': { code: 'EGY', numeric: 818, flag: '🇪🇬' },
  'Estonia': { code: 'EST', numeric: 233, flag: '🇪🇪' },
  'Ethiopia': { code: 'ETH', numeric: 231, flag: '🇪🇹' },
  'Finland': { code: 'FIN', numeric: 246, flag: '🇫🇮' },
  'France': { code: 'FRA', numeric: 250, flag: '🇫🇷' },
  'Georgia': { code: 'GEO', numeric: 268, flag: '🇬🇪' },
  'Germany': { code: 'DEU', numeric: 276, flag: '🇩🇪' },
  'Ghana': { code: 'GHA', numeric: 288, flag: '🇬🇭' },
  'Greece': { code: 'GRC', numeric: 300, flag: '🇬🇷' },
  'Hungary': { code: 'HUN', numeric: 348, flag: '🇭🇺' },
  'Iceland': { code: 'ISL', numeric: 352, flag: '🇮🇸' },
  'India': { code: 'IND', numeric: 356, flag: '🇮🇳' },
  'Indonesia': { code: 'IDN', numeric: 360, flag: '🇮🇩' },
  'Iran': { code: 'IRN', numeric: 364, flag: '🇮🇷' },
  'Iraq': { code: 'IRQ', numeric: 368, flag: '🇮🇶' },
  'Ireland': { code: 'IRL', numeric: 372, flag: '🇮🇪' },
  'Israel': { code: 'ISR', numeric: 376, flag: '🇮🇱' },
  'Italy': { code: 'ITA', numeric: 380, flag: '🇮🇹' },
  'Jamaica': { code: 'JAM', numeric: 388, flag: '🇯🇲' },
  'Japan': { code: 'JPN', numeric: 392, flag: '🇯🇵' },
  'Jordan': { code: 'JOR', numeric: 400, flag: '🇯🇴' },
  'Kazakhstan': { code: 'KAZ', numeric: 398, flag: '🇰🇿' },
  'Kenya': { code: 'KEN', numeric: 404, flag: '🇰🇪' },
  'Kuwait': { code: 'KWT', numeric: 414, flag: '🇰🇼' },
  'Laos': { code: 'LAO', numeric: 418, flag: '🇱🇦' },
  'Latvia': { code: 'LVA', numeric: 428, flag: '🇱🇻' },
  'Lebanon': { code: 'LBN', numeric: 422, flag: '🇱🇧' },
  'Lithuania': { code: 'LTU', numeric: 440, flag: '🇱🇹' },
  'Luxembourg': { code: 'LUX', numeric: 442, flag: '🇱🇺' },
  'Malaysia': { code: 'MYS', numeric: 458, flag: '🇲🇾' },
  'Maldives': { code: 'MDV', numeric: 462, flag: '🇲🇻' },
  'Malta': { code: 'MLT', numeric: 470, flag: '🇲🇹' },
  'Mexico': { code: 'MEX', numeric: 484, flag: '🇲🇽' },
  'Mongolia': { code: 'MNG', numeric: 496, flag: '🇲🇳' },
  'Montenegro': { code: 'MNE', numeric: 499, flag: '🇲🇪' },
  'Morocco': { code: 'MAR', numeric: 504, flag: '🇲🇦' },
  'Myanmar': { code: 'MMR', numeric: 104, flag: '🇲🇲' },
  'Nepal': { code: 'NPL', numeric: 524, flag: '🇳🇵' },
  'Netherlands': { code: 'NLD', numeric: 528, flag: '🇳🇱' },
  'New Zealand': { code: 'NZL', numeric: 554, flag: '🇳🇿' },
  'Nigeria': { code: 'NGA', numeric: 566, flag: '🇳🇬' },
  'Norway': { code: 'NOR', numeric: 578, flag: '🇳🇴' },
  'Oman': { code: 'OMN', numeric: 512, flag: '🇴🇲' },
  'Pakistan': { code: 'PAK', numeric: 586, flag: '🇵🇰' },
  'Panama': { code: 'PAN', numeric: 591, flag: '🇵🇦' },
  'Peru': { code: 'PER', numeric: 604, flag: '🇵🇪' },
  'Philippines': { code: 'PHL', numeric: 608, flag: '🇵🇭' },
  'Poland': { code: 'POL', numeric: 616, flag: '🇵🇱' },
  'Portugal': { code: 'PRT', numeric: 620, flag: '🇵🇹' },
  'Qatar': { code: 'QAT', numeric: 634, flag: '🇶🇦' },
  'Romania': { code: 'ROU', numeric: 642, flag: '🇷🇴' },
  'Russia': { code: 'RUS', numeric: 643, flag: '🇷🇺' },
  'Saudi Arabia': { code: 'SAU', numeric: 682, flag: '🇸🇦' },
  'Serbia': { code: 'SRB', numeric: 688, flag: '🇷🇸' },
  'Singapore': { code: 'SGP', numeric: 702, flag: '🇸🇬' },
  'Slovakia': { code: 'SVK', numeric: 703, flag: '🇸🇰' },
  'Slovenia': { code: 'SVN', numeric: 705, flag: '🇸🇮' },
  'South Africa': { code: 'ZAF', numeric: 710, flag: '🇿🇦' },
  'South Korea': { code: 'KOR', numeric: 410, flag: '🇰🇷' },
  'Spain': { code: 'ESP', numeric: 724, flag: '🇪🇸' },
  'Sri Lanka': { code: 'LKA', numeric: 144, flag: '🇱🇰' },
  'Sweden': { code: 'SWE', numeric: 752, flag: '🇸🇪' },
  'Switzerland': { code: 'CHE', numeric: 756, flag: '🇨🇭' },
  'Taiwan': { code: 'TWN', numeric: 158, flag: '🇹🇼' },
  'Tanzania': { code: 'TZA', numeric: 834, flag: '🇹🇿' },
  'Thailand': { code: 'THA', numeric: 764, flag: '🇹🇭' },
  'Tunisia': { code: 'TUN', numeric: 788, flag: '🇹🇳' },
  'Turkey': { code: 'TUR', numeric: 792, flag: '🇹🇷' },
  'Uganda': { code: 'UGA', numeric: 800, flag: '🇺🇬' },
  'Ukraine': { code: 'UKR', numeric: 804, flag: '🇺🇦' },
  'United Arab Emirates': { code: 'ARE', numeric: 784, flag: '🇦🇪' },
  'United Kingdom': { code: 'GBR', numeric: 826, flag: '🇬🇧' },
  'United States': { code: 'USA', numeric: 840, flag: '🇺🇸' },
  'Uruguay': { code: 'URY', numeric: 858, flag: '🇺🇾' },
  'Uzbekistan': { code: 'UZB', numeric: 860, flag: '🇺🇿' },
  'Venezuela': { code: 'VEN', numeric: 862, flag: '🇻🇪' },
  'Vietnam': { code: 'VNM', numeric: 704, flag: '🇻🇳' },
  'Zimbabwe': { code: 'ZWE', numeric: 716, flag: '🇿🇼' },
}

// Major cities per country code
const CITIES_BY_COUNTRY: Record<string, string[]> = {
  NOR: ['Oslo','Bergen','Trondheim','Stavanger','Tromsø','Drammen','Fredrikstad','Kristiansand','Ålesund','Bodø'],
  LKA: ['Colombo','Kandy','Galle','Jaffna','Negombo','Anuradhapura','Trincomalee','Batticaloa','Matara','Nuwara Eliya'],
  CHE: ['Zurich','Geneva','Basel','Bern','Lausanne','Winterthur','Lucerne','Lugano','Interlaken','Zermatt'],
  GBR: ['London','Manchester','Birmingham','Edinburgh','Glasgow','Leeds','Liverpool','Bristol','Oxford','Cambridge','Bath','York'],
  FRA: ['Paris','Lyon','Marseille','Nice','Bordeaux','Toulouse','Strasbourg','Nantes','Cannes','Monaco','Annecy'],
  ITA: ['Rome','Milan','Florence','Venice','Naples','Turin','Bologna','Amalfi','Cinque Terre','Siena','Positano'],
  DEU: ['Berlin','Munich','Hamburg','Frankfurt','Cologne','Stuttgart','Düsseldorf','Leipzig','Dresden','Heidelberg'],
  NLD: ['Amsterdam','Rotterdam','The Hague','Utrecht','Eindhoven','Groningen','Maastricht'],
  ESP: ['Madrid','Barcelona','Seville','Valencia','Bilbao','Granada','Toledo','San Sebastián','Málaga','Ibiza'],
  PRT: ['Lisbon','Porto','Faro','Sintra','Cascais','Évora','Algarve'],
  USA: ['New York','Los Angeles','Chicago','San Francisco','Miami','Las Vegas','New Orleans','Boston','Seattle','Washington DC','Austin','Nashville'],
  JPN: ['Tokyo','Osaka','Kyoto','Hiroshima','Sapporo','Fukuoka','Nagoya','Nara','Hakone','Nikko'],
  AUS: ['Sydney','Melbourne','Brisbane','Perth','Adelaide','Gold Coast','Cairns','Hobart','Byron Bay'],
  CAN: ['Toronto','Vancouver','Montreal','Calgary','Ottawa','Quebec City','Banff','Victoria'],
  IND: ['Mumbai','Delhi','Bangalore','Kolkata','Chennai','Jaipur','Goa','Agra','Varanasi','Kerala'],
  SGP: ['Singapore'],
  THA: ['Bangkok','Chiang Mai','Phuket','Koh Samui','Pai','Ayutthaya','Hua Hin'],
  ARE: ['Dubai','Abu Dhabi','Sharjah'],
  TUR: ['Istanbul','Ankara','Izmir','Cappadocia','Antalya','Bodrum','Pamukkale'],
  GRC: ['Athens','Santorini','Mykonos','Crete','Rhodes','Thessaloniki','Corfu'],
  IDN: ['Bali','Jakarta','Yogyakarta','Lombok','Komodo'],
  MYS: ['Kuala Lumpur','Penang','Langkawi','Kota Kinabalu','Malacca'],
  PHL: ['Manila','Cebu','Boracay','Palawan','Siargao'],
  VNM: ['Hanoi','Ho Chi Minh City','Da Nang','Hoi An','Ha Long Bay','Hue'],
  ZAF: ['Cape Town','Johannesburg','Durban','Kruger','Stellenbosch'],
  KEN: ['Nairobi','Mombasa','Masai Mara','Zanzibar'],
  MAR: ['Marrakech','Casablanca','Fes','Chefchaouen','Essaouira'],
  EGY: ['Cairo','Luxor','Aswan','Hurghada','Alexandria'],
  BRA: ['Rio de Janeiro','São Paulo','Salvador','Florianópolis','Manaus'],
  ARG: ['Buenos Aires','Mendoza','Patagonia','Bariloche','Iguazú'],
  MEX: ['Mexico City','Cancún','Tulum','Oaxaca','Guadalajara','San Cristóbal'],
  HUN: ['Budapest','Eger','Pécs','Debrecen'],
  ISL: ['Reykjavik','Akureyri','Blue Lagoon'],
  DNK: ['Copenhagen','Aarhus','Odense'],
  SWE: ['Stockholm','Gothenburg','Malmö','Uppsala'],
  FIN: ['Helsinki','Tampere','Turku','Rovaniemi'],
  POL: ['Warsaw','Krakow','Gdansk','Wrocław','Poznań'],
  CZE: ['Prague','Brno','Cesky Krumlov'],
  AUT: ['Vienna','Salzburg','Innsbruck','Hallstatt'],
  BEL: ['Brussels','Bruges','Ghent','Antwerp'],
  HRV: ['Dubrovnik','Split','Zagreb','Plitvice'],
  GEO: ['Tbilisi','Batumi','Kazbegi'],
  JOR: ['Amman','Petra','Wadi Rum','Aqaba'],
  QAT: ['Doha'],
  KWT: ['Kuwait City'],
  SAU: ['Riyadh','Jeddah','AlUla'],
  LBN: ['Beirut','Byblos','Baalbek'],
  ISR: ['Tel Aviv','Jerusalem','Haifa','Eilat'],
}

const FLAG_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_LOOKUP).map(([, v]) => [v.code, v.flag])
)

const RESIDENCE_OPTIONS = [
  { value: 'visited', label: 'Visited', icon: '✈️', color: 'var(--glow)' },
  { value: 'living', label: 'Living here', icon: '🏠', color: '#4dd8b0' },
  { value: 'lived', label: 'Lived here', icon: '📦', color: '#4a9eff' },
]

type Country = { id: string; name: string; country_code: string; numeric_id: number; visited_at: string | null; notes: string | null; residence_status: string }
type Photo = { id: string; url: string; caption: string | null }
type Vlog = { id: string; title: string; url: string; platform: string }
type Friend = { id: string; name: string; instagram_handle: string | null }
type City = { id: string; trip_id: string; name: string }
type Trip = { id: string; country_id: string; title: string | null; start_date: string | null; end_date: string | null; notes: string | null; cities: City[] }

const inputStyle: React.CSSProperties = {
  flex: 1, padding: '0.6rem 0.75rem', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--muted-bg)',
  color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none',
  fontFamily: 'var(--font-body)', minWidth: 0, width: '100%',
  boxSizing: 'border-box',
}

// City autocomplete component
function CityInput({ countryCode, onAdd }: { countryCode: string; onAdd: (city: string) => void }) {
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (!value.trim()) { setSuggestions([]); return }
    const cities = CITIES_BY_COUNTRY[countryCode] || []
    setSuggestions(cities.filter(c => c.toLowerCase().startsWith(value.toLowerCase()) && c.toLowerCase() !== value.toLowerCase()).slice(0, 5))
  }, [value, countryCode])

  const submit = (city: string) => {
    if (!city.trim()) return
    onAdd(city.trim())
    setValue('')
    setSuggestions([])
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          placeholder="Add a city..."
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(value) }}
          style={{ ...inputStyle, fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}
        />
        <button
          onClick={() => submit(value)}
          style={{ padding: '0.4rem 0.75rem', borderRadius: 8, background: 'rgba(77,216,176,0.15)', border: '1px solid rgba(77,216,176,0.3)', color: '#4dd8b0', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
          + Add
        </button>
      </div>
      {suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 60, zIndex: 50, background: 'var(--panel-bg)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginTop: 3, boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => submit(s)}
              style={{ display: 'block', width: '100%', padding: '0.5rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.82rem', textAlign: 'left', fontFamily: 'var(--font-body)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
              <span style={{ color: '#4dd8b0' }}>📍</span> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [vlogs, setVlogs] = useState<Vlog[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [activeTab, setActiveTab] = useState<'trips' | 'photos' | 'vlogs' | 'friends'>('trips')
  const [saving, setSaving] = useState(false)

  const [countrySearch, setCountrySearch] = useState('')
  const [searchResults, setSearchResults] = useState<string[]>([])
  const [selectedResult, setSelectedResult] = useState<string | null>(null)
  const [newCountryDate, setNewCountryDate] = useState('')
  const [newCountryNotes, setNewCountryNotes] = useState('')
  const [newCountryResidence, setNewCountryResidence] = useState('visited')

  const [newPhoto, setNewPhoto] = useState({ url: '', caption: '' })
  const [newVlog, setNewVlog] = useState({ title: '', url: '', platform: 'youtube' })
  const [newFriend, setNewFriend] = useState({ name: '', instagram_handle: '' })
  const [newTrip, setNewTrip] = useState({ title: '', start_date: '', end_date: '', notes: '' })

  const login = () => {
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(false) }
    else setPwError(true)
  }

  useEffect(() => {
    if (!authed) return
    supabase.from('countries').select('*').order('visited_at').then(({ data }) => setCountries(data || []))
  }, [authed])

  useEffect(() => {
    if (!countrySearch.trim()) { setSearchResults([]); return }
    const q = countrySearch.toLowerCase()
    setSearchResults(Object.keys(COUNTRY_LOOKUP).filter(n => n.toLowerCase().includes(q)).slice(0, 6))
  }, [countrySearch])

  const selectSearchResult = (name: string) => {
    setSelectedResult(name)
    setCountrySearch(name)
    setSearchResults([])
  }

  const addCountry = async () => {
    if (!selectedResult) return
    const info = COUNTRY_LOOKUP[selectedResult]
    if (!info) return
    setSaving(true)
    const { data: existing } = await supabase.from('countries').select('id').eq('country_code', info.code).single()
    if (existing) { alert(`${selectedResult} is already in your archive!`); setSaving(false); return }
    const { data, error } = await supabase.from('countries').insert({
      name: selectedResult, country_code: info.code, numeric_id: info.numeric,
      visited_at: newCountryDate || null, notes: newCountryNotes || null,
      residence_status: newCountryResidence,
    }).select().single()
    if (error) { alert('Error: ' + error.message); setSaving(false); return }
    if (data) {
      setCountries(prev => [...prev, data])
      if (newCountryDate && newCountryResidence === 'visited') {
        const { data: trip } = await supabase.from('trips').insert({ country_id: data.id, title: 'First visit', start_date: newCountryDate }).select().single()
        if (trip) setTrips(prev => [...prev, { ...trip, cities: [] }])
      }
    }
    setCountrySearch(''); setSelectedResult(null); setNewCountryDate(''); setNewCountryNotes(''); setNewCountryResidence('visited')
    setSaving(false)
  }

  const deleteCountry = async (id: string) => {
    if (!confirm('Delete this country and all its content?')) return
    await supabase.from('countries').delete().eq('id', id)
    setCountries(prev => prev.filter(c => c.id !== id))
    if (selectedCountry?.id === id) setSelectedCountry(null)
  }

  const updateResidence = async (id: string, status: string) => {
    await supabase.from('countries').update({ residence_status: status }).eq('id', id)
    setCountries(prev => prev.map(c => c.id === id ? { ...c, residence_status: status } : c))
    if (selectedCountry?.id === id) setSelectedCountry(prev => prev ? { ...prev, residence_status: status } : null)
  }

  const selectCountry = async (c: Country) => {
    setSelectedCountry(c)
    const [p, v, f, t] = await Promise.all([
      supabase.from('photos').select('*').eq('country_id', c.id),
      supabase.from('vlogs').select('*').eq('country_id', c.id),
      supabase.from('friends').select('*').eq('country_id', c.id),
      supabase.from('trips').select('*').eq('country_id', c.id).order('start_date'),
    ])
    const tripData = t.data || []
    const tripsWithCities = await Promise.all(tripData.map(async trip => {
      const { data: cities } = await supabase.from('cities').select('*').eq('trip_id', trip.id)
      return { ...trip, cities: cities || [] }
    }))
    setPhotos(p.data || []); setVlogs(v.data || []); setFriends(f.data || []); setTrips(tripsWithCities)
  }

  const addTrip = async () => {
    if (!selectedCountry || !newTrip.start_date) return
    setSaving(true)
    const { data } = await supabase.from('trips').insert({ country_id: selectedCountry.id, title: newTrip.title || null, start_date: newTrip.start_date, end_date: newTrip.end_date || null, notes: newTrip.notes || null }).select().single()
    if (data) setTrips(prev => [...prev, { ...data, cities: [] }])
    setNewTrip({ title: '', start_date: '', end_date: '', notes: '' })
    setSaving(false)
  }

  const deleteTrip = async (id: string) => {
    await supabase.from('trips').delete().eq('id', id)
    setTrips(prev => prev.filter(t => t.id !== id))
  }

  const addCity = async (tripId: string, cityName: string) => {
    const { data } = await supabase.from('cities').insert({ trip_id: tripId, name: cityName }).select().single()
    if (data) setTrips(prev => prev.map(t => t.id === tripId ? { ...t, cities: [...t.cities, data] } : t))
  }

  const deleteCity = async (tripId: string, cityId: string) => {
    await supabase.from('cities').delete().eq('id', cityId)
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, cities: t.cities.filter(c => c.id !== cityId) } : t))
  }

  const addPhoto = async () => {
    if (!selectedCountry || !newPhoto.url) return
    setSaving(true)
    const { data } = await supabase.from('photos').insert({ country_id: selectedCountry.id, url: newPhoto.url, caption: newPhoto.caption || null }).select().single()
    if (data) setPhotos(prev => [...prev, data])
    setNewPhoto({ url: '', caption: '' }); setSaving(false)
  }

  const deletePhoto = async (id: string) => {
    await supabase.from('photos').delete().eq('id', id)
    setPhotos(prev => prev.filter(p => p.id !== id))
  }

  const addVlog = async () => {
    if (!selectedCountry || !newVlog.title || !newVlog.url) return
    setSaving(true)
    const { data } = await supabase.from('vlogs').insert({ country_id: selectedCountry.id, ...newVlog }).select().single()
    if (data) setVlogs(prev => [...prev, data])
    setNewVlog({ title: '', url: '', platform: 'youtube' }); setSaving(false)
  }

  const deleteVlog = async (id: string) => {
    await supabase.from('vlogs').delete().eq('id', id)
    setVlogs(prev => prev.filter(v => v.id !== id))
  }

  const addFriend = async () => {
    if (!selectedCountry || !newFriend.name) return
    setSaving(true)
    const { data } = await supabase.from('friends').insert({ country_id: selectedCountry.id, name: newFriend.name, instagram_handle: newFriend.instagram_handle || null }).select().single()
    if (data) setFriends(prev => [...prev, data])
    setNewFriend({ name: '', instagram_handle: '' }); setSaving(false)
  }

  const deleteFriend = async (id: string) => {
    await supabase.from('friends').delete().eq('id', id)
    setFriends(prev => prev.filter(f => f.id !== id))
  }

  if (!authed) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>
      <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--border)', borderRadius: 16, padding: '2.5rem', width: 360, textAlign: 'center' }}>
        <Lock size={24} color='var(--glow)' style={{ margin: '0 auto 0.75rem' }} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400, color: 'var(--text-primary)' }}>Atlas Admin</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, marginBottom: '1.5rem' }}>Enter your password to continue</p>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="Password"
          style={{ ...inputStyle, marginBottom: '0.75rem', border: `1px solid ${pwError ? '#e24b4a' : 'var(--border)'}` }} />
        {pwError && <p style={{ fontSize: '0.75rem', color: '#e24b4a', marginBottom: '0.75rem' }}>Incorrect password</p>}
        <button onClick={login} style={{ width: '100%', padding: '0.75rem', borderRadius: 8, background: 'var(--glow)', border: 'none', color: '#fff', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Enter</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 400 }}>Atlas Admin</h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Manage your travel archive</p>
        </div>
        <a href="/" style={{ fontSize: '0.8rem', color: 'var(--glow)', textDecoration: 'none' }}>← View Archive</a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: 'calc(100dvh - 73px)' }}>

        {/* Sidebar */}
        <div style={{ borderRight: '1px solid var(--border)', overflowY: 'auto', padding: '1rem 0.75rem' }}>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 0.5rem', marginBottom: '0.75rem' }}>Countries</div>

          <div style={{ position: 'relative', marginBottom: 8 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Search & add country..." value={countrySearch}
              onChange={e => { setCountrySearch(e.target.value); setSelectedResult(null) }}
              style={{ ...inputStyle, paddingLeft: '2rem' }} />
            {searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--panel-bg)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginTop: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                {searchResults.map(name => (
                  <button key={name} onClick={() => selectSearchResult(name)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '0.6rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'left', fontFamily: 'var(--font-body)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                    <span>{COUNTRY_LOOKUP[name].flag}</span> {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, padding: '0.75rem', background: 'var(--selected-bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--glow)', fontWeight: 500 }}>{COUNTRY_LOOKUP[selectedResult]?.flag} {selectedResult}</div>

              {/* Residence toggle */}
              <div style={{ display: 'flex', gap: 4 }}>
                {RESIDENCE_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => setNewCountryResidence(opt.value)}
                    style={{ flex: 1, padding: '4px 0', borderRadius: 6, border: `1px solid ${newCountryResidence === opt.value ? opt.color : 'var(--border)'}`, background: newCountryResidence === opt.value ? `${opt.color}22` : 'transparent', color: newCountryResidence === opt.value ? opt.color : 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                    {opt.icon}<br />{opt.label}
                  </button>
                ))}
              </div>

              <input type="date" value={newCountryDate} onChange={e => setNewCountryDate(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
              <input type="text" value={newCountryNotes} onChange={e => setNewCountryNotes(e.target.value)} placeholder="Notes (optional)" style={inputStyle} />
              <button onClick={addCountry} disabled={saving} style={{ padding: '0.5rem', borderRadius: 8, background: 'var(--glow)', border: 'none', color: '#fff', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Plus size={12} /> Add country
              </button>
            </div>
          )}

          {countries.map(c => (
            <div key={c.id} onClick={() => selectCountry(c)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 0.75rem', borderRadius: 8, cursor: 'pointer', background: selectedCountry?.id === c.id ? 'var(--selected-bg)' : 'transparent', marginBottom: 2 }}
              onMouseEnter={e => { if (selectedCountry?.id !== c.id) (e.currentTarget as HTMLElement).style.background = 'var(--hover-bg)' }}
              onMouseLeave={e => { if (selectedCountry?.id !== c.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
              <span style={{ fontSize: '1rem' }}>{FLAG_MAP[c.country_code] || '🌍'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: selectedCountry?.id === c.id ? 500 : 400 }}>{c.name}</div>
                <div style={{ fontSize: '0.7rem', color: c.residence_status === 'living' ? '#4dd8b0' : c.residence_status === 'lived' ? '#4a9eff' : 'var(--text-muted)' }}>
                  {c.residence_status === 'living' ? '🏠 Living' : c.residence_status === 'lived' ? '📦 Lived' : c.visited_at ? new Date(c.visited_at).getFullYear() : ''}
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteCountry(c.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex' }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', padding: '1.5rem' }}>
          {!selectedCountry ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: 8 }}>
              <Globe size={32} /><p style={{ fontSize: '0.9rem' }}>Select a country to manage its content</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 400 }}>{FLAG_MAP[selectedCountry.country_code] || '🌍'} {selectedCountry.name}</h2>
                  {selectedCountry.notes && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>"{selectedCountry.notes}"</p>}
                </div>

                {/* Residence status switcher */}
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  {RESIDENCE_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => updateResidence(selectedCountry.id, opt.value)}
                      style={{ padding: '5px 10px', borderRadius: 8, border: `1px solid ${selectedCountry.residence_status === opt.value ? opt.color : 'var(--border)'}`, background: selectedCountry.residence_status === opt.value ? `${opt.color}22` : 'transparent', color: selectedCountry.residence_status === opt.value ? opt.color : 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap' }}>
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                {(['trips', 'photos', 'vlogs', 'friends'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '6px 16px', borderRadius: 99, border: 'none', cursor: 'pointer', background: activeTab === tab ? 'var(--glow)' : 'var(--muted-bg)', color: activeTab === tab ? '#fff' : 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, fontFamily: 'var(--font-body)', textTransform: 'capitalize' }}>{tab}</button>
                ))}
              </div>

              {/* Trips */}
              {activeTab === 'trips' && (
                <div>
                  {selectedCountry.residence_status !== 'visited' && (
                    <div style={{ padding: '0.75rem 1rem', borderRadius: 10, border: '1px solid var(--border)', marginBottom: '1rem', background: 'var(--muted-bg)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {selectedCountry.residence_status === 'living' ? '🏠 You\'re currently living here.' : '📦 You used to live here.'} You can still log trips/visits below.
                    </div>
                  )}
                  <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '1rem', marginBottom: '1.5rem', background: 'var(--muted-bg)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Add a trip</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <input type="text" placeholder='Trip name (e.g. "Summer 2024")' value={newTrip.title} onChange={e => setNewTrip(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Start date</div>
                          <input type="date" value={newTrip.start_date} onChange={e => setNewTrip(p => ({ ...p, start_date: e.target.value }))} style={{ ...inputStyle, colorScheme: 'dark' }} /></div>
                        <div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>End date</div>
                          <input type="date" value={newTrip.end_date} onChange={e => setNewTrip(p => ({ ...p, end_date: e.target.value }))} style={{ ...inputStyle, colorScheme: 'dark' }} /></div>
                      </div>
                      <input type="text" placeholder="Notes (optional)" value={newTrip.notes} onChange={e => setNewTrip(p => ({ ...p, notes: e.target.value }))} style={inputStyle} />
                      <button onClick={addTrip} disabled={saving || !newTrip.start_date} style={{ padding: '0.6rem 1rem', borderRadius: 8, background: 'var(--glow)', border: 'none', color: '#fff', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4, opacity: !newTrip.start_date ? 0.5 : 1 }}>
                        <Plus size={13} /> Add trip
                      </button>
                    </div>
                  </div>

                  {trips.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No trips yet.</p>}
                  {trips.map(trip => (
                    <div key={trip.id} style={{ border: '1px solid var(--border)', borderRadius: 10, marginBottom: 12, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem', background: 'var(--muted-bg)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--glow)', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{trip.title || 'Trip'}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : ''}
                            {trip.end_date ? ` → ${new Date(trip.end_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}` : ''}
                          </div>
                        </div>
                        <button onClick={() => deleteTrip(trip.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Trash2 size={13} /></button>
                      </div>
                      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} /> Cities</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                          {trip.cities.map(city => (
                            <span key={city.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', padding: '3px 10px', borderRadius: 99, background: 'rgba(77,216,176,0.1)', color: '#4dd8b0', border: '1px solid rgba(77,216,176,0.25)' }}>
                              {city.name}
                              <button onClick={() => deleteCity(trip.id, city.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4dd8b0', padding: 0, display: 'flex', lineHeight: 1 }}>✕</button>
                            </span>
                          ))}
                          {trip.cities.length === 0 && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No cities yet</span>}
                        </div>
                        <CityInput countryCode={selectedCountry.country_code} onAdd={(city) => addCity(trip.id, city)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Photos */}
              {activeTab === 'photos' && (
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
                    <input type="text" placeholder="Image URL" value={newPhoto.url} onChange={e => setNewPhoto(p => ({ ...p, url: e.target.value }))} style={inputStyle} />
                    <input type="text" placeholder="Caption (optional)" value={newPhoto.caption} onChange={e => setNewPhoto(p => ({ ...p, caption: e.target.value }))} style={inputStyle} />
                    <button onClick={addPhoto} disabled={saving} style={{ padding: '0.6rem 1rem', borderRadius: 8, background: 'var(--glow)', border: 'none', color: '#fff', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={13} /> Add</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                    {photos.map(p => (
                      <div key={p.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img src={p.url} alt={p.caption || ''} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                        {p.caption && <div style={{ padding: '6px 8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.caption}</div>}
                        <button onClick={() => deletePhoto(p.id)} style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><Trash2 size={11} /></button>
                      </div>
                    ))}
                    {photos.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No photos yet</p>}
                  </div>
                </div>
              )}

              {/* Vlogs */}
              {activeTab === 'vlogs' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 8, marginBottom: '1rem' }}>
                    <input type="text" placeholder="Title" value={newVlog.title} onChange={e => setNewVlog(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
                    <input type="text" placeholder="URL" value={newVlog.url} onChange={e => setNewVlog(p => ({ ...p, url: e.target.value }))} style={inputStyle} />
                    <select value={newVlog.platform} onChange={e => setNewVlog(p => ({ ...p, platform: e.target.value }))} style={{ ...inputStyle, flex: 'none', width: 'auto' }}>
                      <option value="youtube">YouTube</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                    <button onClick={addVlog} disabled={saving} style={{ padding: '0.6rem 1rem', borderRadius: 8, background: 'var(--glow)', border: 'none', color: '#fff', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={13} /> Add</button>
                  </div>
                  {vlogs.map(v => (
                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{v.title}</div>
                        <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--glow)', textDecoration: 'none' }}>{v.url.length > 50 ? v.url.slice(0, 50) + '…' : v.url}</a>
                      </div>
                      <button onClick={() => deleteVlog(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  {vlogs.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No vlogs yet</p>}
                </div>
              )}

              {/* Friends */}
              {activeTab === 'friends' && (
                <div>
                  <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
                    <input type="text" placeholder="Name" value={newFriend.name} onChange={e => setNewFriend(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                    <input type="text" placeholder="Instagram @handle" value={newFriend.instagram_handle} onChange={e => setNewFriend(p => ({ ...p, instagram_handle: e.target.value }))} style={inputStyle} />
                    <button onClick={addFriend} disabled={saving} style={{ padding: '0.6rem 1rem', borderRadius: 8, background: 'var(--glow)', border: 'none', color: '#fff', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={13} /> Add</button>
                  </div>
                  {friends.map(f => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--selected-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 500, color: 'var(--glow)', flexShrink: 0 }}>
                        {f.name[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{f.name}</div>
                        {f.instagram_handle && <a href={`https://instagram.com/${f.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--glow)', textDecoration: 'none' }}>{f.instagram_handle}</a>}
                      </div>
                      <button onClick={() => deleteFriend(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Trash2 size={14} /></button>
                    </div>
                  ))}
                  {friends.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No friends added yet</p>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
