import type {
  FuelKey,
  Prices,
  RawStation,
  RawStationsResponse,
  Station,
} from '../types'
import { parseSpanishNumber } from '../utils/parse'

const STATIONS_URL =
  'https://sedeaplicaciones.minetur.gob.es/ServiciosRestCarburantes/PreciosCarburantes/EstacionesTerrestres/'

const CACHE_KEY = 'gasolineras-cercanas:stations:v1'
const CACHE_TTL_MS = 30 * 60 * 1000

interface CacheEntry {
  timestamp: number
  fetchedAt: string
  stations: Station[]
}

function mapRawStation(raw: RawStation): Station | null {
  const lat = parseSpanishNumber(raw.Latitud)
  const lng = parseSpanishNumber(raw['Longitud (WGS84)'])
  if (lat === null || lng === null) return null

  const prices: Prices = {
    gasoline95: parseSpanishNumber(raw['Precio Gasolina 95 E5']),
    gasoline98: parseSpanishNumber(raw['Precio Gasolina 98 E5']),
    diesel: parseSpanishNumber(raw['Precio Gasoleo A']),
    dieselPremium: parseSpanishNumber(raw['Precio Gasoleo Premium']),
    glp: parseSpanishNumber(raw['Precio Gases licuados del petróleo']),
  }

  return {
    id: raw.IDEESS,
    name: raw['Rótulo'].trim(),
    address: raw['Dirección'],
    municipality: raw.Municipio,
    province: raw.Provincia,
    schedule: raw.Horario,
    lat,
    lng,
    prices,
  }
}

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null
    return entry
  } catch {
    return null
  }
}

function writeCache(entry: CacheEntry): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch {
    // localStorage no disponible: seguimos sin cachear
  }
}

export interface StationsResult {
  stations: Station[]
  fetchedAt: string
}

export async function fetchAllStations(): Promise<StationsResult> {
  const cached = readCache()
  if (cached) return { stations: cached.stations, fetchedAt: cached.fetchedAt }

  const response = await fetch(STATIONS_URL, {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(
      `Error al consultar la API del MITECO (código ${response.status})`,
    )
  }

  const data: RawStationsResponse = await response.json()
  const stations = data.ListaEESSPrecio.map(mapRawStation).filter(
    (station): station is Station => station !== null,
  )

  const entry: CacheEntry = {
    timestamp: Date.now(),
    fetchedAt: data.Fecha,
    stations,
  }
  writeCache(entry)
  return { stations, fetchedAt: entry.fetchedAt }
}

export function formatFuelPrice(price: number | null): string {
  return price === null ? '—' : `${price.toFixed(3).replace('.', ',')} €/L`
}

export function cheapestFuel(station: Station): {
  price: number | null
  key: FuelKey
} | null {
  let best: { price: number; key: FuelKey } | null = null
  const entries = Object.entries(station.prices) as [FuelKey, number | null][]
  for (const [key, price] of entries) {
    if (price !== null && (best === null || price < best.price)) {
      best = { price, key }
    }
  }
  return best ? { price: best.price, key: best.key } : null
}