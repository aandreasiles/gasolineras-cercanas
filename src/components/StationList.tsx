import type { FuelKey, StationWithDistance } from '../types'
import { StationCard } from './StationCard'

interface StationListProps {
  stations: StationWithDistance[]
  fuel: FuelKey
  fetchedAt: string | null
}

export function StationList({ stations, fuel, fetchedAt }: StationListProps) {
  if (stations.length === 0) {
    return (
      <p className="empty-state">
        No hay estaciones con precio publicado de ese carburante en el radio
        seleccionado. Prueba a ampliar el rango.
      </p>
    )
  }

  const lastIndexWithPrice = stations.reduce(
    (last, station, index) =>
      station.prices[fuel] !== null ? index : last,
    -1,
  )

  return (
    <>
      <p className="results-summary">
        {stations.length} estacion{stations.length === 1 ? '' : 'es'} en el
        radio seleccionado
        {fetchedAt ? ` · datos de ${fetchedAt}` : ''}
      </p>
      <ol className="station-list">
        {stations.map((station, index) => (
          <StationCard
            key={station.id}
            station={station}
            rank={index + 1}
            fuel={fuel}
            isCheapest={
              index === 0 && station.prices[fuel] !== null
            }
            isLastWithPrice={index === lastIndexWithPrice && lastIndexWithPrice >= 0}
          />
        ))}
      </ol>
    </>
  )
}