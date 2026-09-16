export type FuelKey =
  | 'gasoline95'
  | 'gasoline98'
  | 'diesel'
  | 'dieselPremium'
  | 'glp'

export const FUELS: { key: FuelKey; label: string }[] = [
  { key: 'gasoline95', label: 'Gasolina 95' },
  { key: 'gasoline98', label: 'Gasolina 98' },
  { key: 'diesel', label: 'Diésel' },
  { key: 'dieselPremium', label: 'Diésel Premium' },
  { key: 'glp', label: 'GLP' },
]

export type Prices = Record<FuelKey, number | null>

export interface Station {
  id: string
  name: string
  address: string
  municipality: string
  province: string
  schedule: string
  lat: number
  lng: number
  prices: Prices
}

export interface RawStation {
  IDEESS: string
  'Rótulo': string
  'Dirección': string
  Municipio: string
  Provincia: string
  Horario: string
  Latitud: string
  'Longitud (WGS84)': string
  'Precio Gasolina 95 E5'?: string
  'Precio Gasolina 98 E5'?: string
  'Precio Gasoleo A'?: string
  'Precio Gasoleo Premium'?: string
  'Precio Gases licuados del petróleo'?: string
}

export interface RawStationsResponse {
  Fecha: string
  ListaEESSPrecio: RawStation[]
}

export interface StationWithDistance extends Station {
  distanceKm: number
}