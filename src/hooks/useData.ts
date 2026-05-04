import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export type Country = {
  id: string
  name: string
  country_code: string
  numeric_id: number
  visited_at: string | null
  cover_photo_url: string | null
  notes: string | null
  residence_status: 'visited' | 'living' | 'lived'
}

export type Photo = {
  id: string
  country_id: string
  url: string
  caption: string | null
  taken_at: string | null
}

export type Friend = {
  id: string
  country_id: string
  name: string
  instagram_handle: string | null
  photo_url: string | null
}

export type Vlog = {
  id: string
  country_id: string
  title: string
  url: string
  platform: string
  thumbnail_url: string | null
}

export type City = {
  id: string
  trip_id: string
  name: string
}

export type Trip = {
  id: string
  country_id: string
  title: string | null
  start_date: string | null
  end_date: string | null
  notes: string | null
  cities: City[]
}

export type CountryFull = Country & {
  photos: Photo[]
  friends: Friend[]
  vlogs: Vlog[]
  trips: Trip[]
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('countries')
      .select('*')
      .order('visited_at', { ascending: true })
      .then(({ data }) => {
        setCountries(data || [])
        setLoading(false)
      })
  }, [])

  return { countries, loading }
}

export function useCountryFull(countryId: string | null) {
  const [data, setData] = useState<CountryFull | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!countryId) { setData(null); return }
    setLoading(true)
    Promise.all([
      supabase.from('countries').select('*').eq('id', countryId).single(),
      supabase.from('photos').select('*').eq('country_id', countryId).order('taken_at'),
      supabase.from('friends').select('*').eq('country_id', countryId),
      supabase.from('vlogs').select('*').eq('country_id', countryId),
      supabase.from('trips').select('*').eq('country_id', countryId).order('start_date'),
    ]).then(async ([country, photos, friends, vlogs, trips]) => {
      if (country.data) {
        const tripData = trips.data || []
        const tripsWithCities: Trip[] = await Promise.all(
          tripData.map(async (trip) => {
            const { data: cities } = await supabase
              .from('cities')
              .select('*')
              .eq('trip_id', trip.id)
            return { ...trip, cities: cities || [] }
          })
        )
        setData({
          ...country.data,
          photos: photos.data || [],
          friends: friends.data || [],
          vlogs: vlogs.data || [],
          trips: tripsWithCities,
        })
      }
      setLoading(false)
    })
  }, [countryId])

  return { data, loading }
}

export function useStats(countries: Country[]) {
  const [friendCount, setFriendCount] = useState(0)
  const [photoCount, setPhotoCount] = useState(0)

  useEffect(() => {
    if (!countries.length) return
    const ids = countries.map(c => c.id)
    Promise.all([
      supabase.from('friends').select('id', { count: 'exact', head: true }).in('country_id', ids),
      supabase.from('photos').select('id', { count: 'exact', head: true }).in('country_id', ids),
    ]).then(([f, p]) => {
      setFriendCount(f.count || 0)
      setPhotoCount(p.count || 0)
    })
  }, [countries])

  return { friendCount, photoCount }
}
