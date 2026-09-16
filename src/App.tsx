import { useEffect, useMemo, useState } from 'react'
import { fetchAllStations, type StationsResult } from './api/miteco'
import { StationList } from './components/StationList'
import { useGeolocation } from './hooks/useGeolocation'
import { FUELS, type FuelKey } from './types'
import { haversineDistanceKm } from './utils/geo'

const RADIUS_PRESETS = [1, 3, 5, 10, 20, 50]

function App() {
  const [result, setResult] = useState<StationsResult | null>(null)
  const [loadingStations, setLoadingStations] = useState(true)
  const [stationsError, setStationsError] = useState<string | null>(null)
  const [radius, setRadius] = useState(10)
  const [fuel, setFuel] = useState<FuelKey>('gasoline95')
  const { coords, status: geoStatus, error: geoError, locate } = useGeolocation()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await fetchAllStations()
        if (!cancelled) setResult(data)
      } catch (err) {
        if (!cancelled) {
          setStationsError(
            err instanceof Error ? err.message : 'Error desconocido',
          )
        }
      } finally {
        if (!cancelled) setLoadingStations(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const nearby = useMemo(() => {
    if (!result || !coords) return []
    return result.stations
      .map((station) => ({
        ...station,
        distanceKm: haversineDistanceKm(
          coords.lat,
          coords.lng,
          station.lat,
          station.lng,
        ),
      }))
      .filter((station) => station.distanceKm <= radius)
      .sort((a, b) => {
        const priceA = a.prices[fuel]
        const priceB = b.prices[fuel]
        if (priceA === null && priceB === null)
          return a.distanceKm - b.distanceKm
        if (priceA === null) return 1
        if (priceB === null) return -1
        return priceA - priceB
      })
  }, [result, coords, radius, fuel])

  const selectedFuelLabel = FUELS.find((f) => f.key === fuel)?.label ?? fuel

  return (
    <div className="app">
      <header className="app-header">
        <h1>⛽ Gasolineras cercanas</h1>
        <p>
          Compara los precios de carburante de las estaciones de servicio que
          tienes cerca, de la más barata a la más cara. Datos oficiales del
          Ministerio para la Transición Ecológica (MITECO).
        </p>
      </header>

      <section className="controls" aria-label="Controles de búsqueda">
        <div className="control">
          <label htmlFor="fuel-select">Carburante</label>
          <select
            id="fuel-select"
            value={fuel}
            onChange={(event) => setFuel(event.target.value as FuelKey)}
          >
            {FUELS.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="control control--radius">
          <label htmlFor="radius-range">
            Radio: <strong>{radius} km</strong>
          </label>
          <input
            id="radius-range"
            type="range"
            min="1"
            max="50"
            step="1"
            value={radius}
            onChange={(event) => setRadius(Number(event.target.value))}
          />
          <div className="presets">
            {RADIUS_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={preset === radius ? 'preset preset--active' : 'preset'}
                onClick={() => setRadius(preset)}
              >
                {preset} km
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="content">
        {geoStatus === 'loading' && (
          <p className="status" role="status">
            Obteniendo tu ubicación…
          </p>
        )}

        {geoStatus === 'error' && (
          <div className="status status--error" role="alert">
            <p>{geoError}</p>
            <button type="button" onClick={locate} className="button">
              Reintentar
            </button>
          </div>
        )}

        {geoStatus === 'ready' && loadingStations && (
          <p className="status" role="status">
            Descargando datos de estaciones de servicio…
          </p>
        )}

        {geoStatus === 'ready' && stationsError && (
          <div className="status status--error" role="alert">
            <p>No se han podido cargar los datos del MITECO. {stationsError}</p>
          </div>
        )}

        {geoStatus === 'ready' && !loadingStations && !stationsError && (
          <>
            <p className="ordre-hint">
              Ordenadas por precio de <strong>{selectedFuelLabel}</strong>, de
              menor a mayor.
            </p>
            <StationList
              stations={nearby}
              fuel={fuel}
              fetchedAt={result?.fetchedAt ?? null}
            />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Datos: MITECO · Precios de carburantes en estaciones de servicio.
          Actualización del ministerio, no en tiempo real.
        </p>
      </footer>
    </div>
  )
}

export default App