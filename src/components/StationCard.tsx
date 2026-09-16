import { formatFuelPrice } from '../api/miteco'
import { FUELS, type FuelKey, type StationWithDistance } from '../types'

interface StationCardProps {
  station: StationWithDistance
  rank: number
  fuel: FuelKey
  isCheapest: boolean
  isLastWithPrice: boolean
}

export function StationCard({
  station,
  rank,
  fuel,
  isCheapest,
  isLastWithPrice,
}: StationCardProps) {
  const selectedPrice = station.prices[fuel]

  return (
    <li
      className={`station-card${isCheapest ? ' station-card--cheapest' : ''}${selectedPrice === null ? ' station-card--no-price' : ''}`}
    >
      <div className="station-card__main">
        <span className="station-card__rank" aria-hidden="true">
          {selectedPrice !== null ? rank : '·'}
        </span>
        <div className="station-card__info">
          <p className="station-card__name">{station.name}</p>
          <p className="station-card__address">
            {station.address} · {station.municipality} ({station.province}){' '}
            <a
              className="station-card__maps-link"
              href={`https://www.google.com/maps?q=${station.lat},${station.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
📍 Ver en mapa
            </a>
          </p>
          <p className="station-card__meta">
            {isCheapest && <span className="badge">La más barata</span>}
            {station.distanceKm < 1
              ? `${(station.distanceKm * 1000).toFixed(0)} m`
              : `${station.distanceKm.toFixed(1)} km`}
            {station.schedule ? ` · ${station.schedule}` : ''}
          </p>
        </div>
        <div className="station-card__price">
          {selectedPrice !== null ? (
            <>
              <p className="station-card__price-amount">
                {formatFuelPrice(selectedPrice)}
              </p>
              <p className="station-card__price-label">
                {FUELS.find((f) => f.key === fuel)?.label}
              </p>
            </>
          ) : (
            <p className="station-card__price-missing">Sin precio</p>
          )}
        </div>
      </div>

      {isLastWithPrice && (
        <p className="station-card__note">
          Las estaciones siguientes no tienen publicado ese carburante.
        </p>
      )}

      <details className="station-card__all-prices">
        <summary>Todos los precios</summary>
        <ul>
          {FUELS.map(({ key, label }) => (
            <li key={key}>
              <span>{label}</span>
              <span
                className={
                  key === fuel && station.prices[key] !== null ? 'highlight' : ''
                }
              >
                {formatFuelPrice(station.prices[key])}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </li>
  )
}