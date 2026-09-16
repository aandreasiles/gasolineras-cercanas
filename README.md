# Gasolineras Cercanas

Web en React + TypeScript que, usando tu ubicación, lista las gasolineras cercanas ordenadas de la más barata a la más cara, con radio configurable.

Utiliza la [API pública de precios de carburantes del MITECO](https://sedeaplicaciones.minetur.gob.es/ServiciosRestCarburantes/PreciosCarburantes/EstacionesTerrestres/) (Ministerio para la Transición Ecológica y el Reto Demográfico): descarga el listado completo de estaciones (~11.500) y las filtra y ordena en el cliente por distancia, sin API keys.

## Funcionalidades

- Geolocalización del navegador para obtener tu ubicación.
- Radio de búsqueda ajustable (1–50 km) con presets rápidos.
- Ordenación por precio del carburante seleccionado (Gasolina 95 y 98, Diésel, Diésel Premium, GLP), de menor a mayor.
- La estación más barata del radio se destaca.
- Distancia calculada con la fórmula de Haversine.
- Caché local de 30 minutos de los datos del ministerio.
- Sin backend ni claves: todo se ejecuta en el cliente.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
```

## Producción

```bash
npm run build
npm run preview
```

## Despliegue en GitHub Pages

El repositorio incluye un workflow de GitHub Actions (`.github/workflows/deploy.yml`) que construye la app y la publica en GitHub Pages en cada push a la rama `main`. Para que funcione:

1. El repositorio debe tener activado Pages con origen "GitHub Actions" (Settings → Pages → Source: GitHub Actions).
2. La base URL de Vite está configurada en `vite.config.ts` para `/<repo>/`.

## Nota legal

Los datos de precios proceden del Ministerio para la Transición Ecológica y el Reto Demográfico y pueden no estar actualizados en tiempo real.