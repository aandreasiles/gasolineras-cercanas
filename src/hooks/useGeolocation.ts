import { useCallback, useEffect, useState } from 'react'

export interface Coords {
  lat: number
  lng: number
}

type Status = 'idle' | 'loading' | 'ready' | 'error'

export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('error')
      setError('Tu navegador no soporta geolocalización.')
      return
    }
    setStatus('loading')
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setStatus('ready')
      },
      (err) => {
        setStatus('error')
        setCoords(null)
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Has denegado el acceso a tu ubicación.\nConcede el permiso y vuelve a intentarlo.'
            : 'No se ha podido obtener tu ubicación.',
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => locate(), 0)
    return () => window.clearTimeout(timer)
  }, [locate])

  return { coords, status, error, locate }
}