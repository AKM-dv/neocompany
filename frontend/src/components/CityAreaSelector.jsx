import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiCrosshair, FiMapPin, FiXCircle } from 'react-icons/fi'
import client from '../api/client'
import './CityAreaSelector.css'

const LS_CITY = 'sb_pref_city'
const LS_AREA = 'sb_pref_area'

export default function CityAreaSelector({ inline = true, variant = 'glass' }) {
  const navigate = useNavigate()
  const [cities, setCities] = useState([])
  const [areas, setAreas] = useState([])
  const [cityId, setCityId] = useState(() =>
    Number(localStorage.getItem(LS_CITY)) || '',
  )
  const [areaId, setAreaId] = useState(() =>
    Number(localStorage.getItem(LS_AREA)) || '',
  )
  const [coords, setCoords] = useState(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [serviceable, setServiceable] = useState(null)

  useEffect(() => {
    client.get('/api/cities').then((r) => setCities(r.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!cityId) {
      setAreas([])
      return
    }
    client
      .get('/api/areas', { params: { city_id: cityId } })
      .then((r) => setAreas(r.data || []))
      .catch(() => setAreas([]))
  }, [cityId])

  useEffect(() => {
    setServiceable(null)
  }, [cityId, areaId])

  const onApply = () => {
    if (cityId) localStorage.setItem(LS_CITY, String(cityId))
    if (areaId) localStorage.setItem(LS_AREA, String(areaId))
    const ok = Boolean(cityId && areaId && areas.some((a) => Number(a.id) === Number(areaId)))
    setServiceable(ok)
    navigate(`/services?city_id=${cityId}&area_id=${areaId || ''}`)
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        })
        setGeoLoading(false)
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const selClass = variant === 'glass' ? 'glass-select' : 'field-select'

  return (
    <div className={`city-area-inline ${inline ? '' : 'stack'} ca-${variant} city-area-pro`}>
      <div className="city-area-topline">
        <span className={`city-area-label ${variant === 'light' ? 'label-dark' : ''}`}>
          <FiMapPin /> Select Location
        </span>
        <button type="button" className="geo-pill-btn" onClick={useCurrentLocation} disabled={geoLoading}>
          <FiCrosshair />
          {geoLoading ? 'Locating...' : 'Use my location'}
        </button>
      </div>

      <div className="city-area-controls">
        <select
          className={selClass}
          value={cityId}
          onChange={(e) => {
            setCityId(e.target.value ? Number(e.target.value) : '')
            setAreaId('')
          }}
          aria-label="City"
        >
          <option value="">City</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className={selClass}
          value={areaId}
          onChange={(e) =>
            setAreaId(e.target.value ? Number(e.target.value) : '')
          }
          disabled={!cityId}
          aria-label="Area"
        >
          <option value="">Area</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={variant === 'glass' ? 'glass-btn' : 'light-apply-btn'}
          onClick={onApply}
        >
          Check & Apply
        </button>
      </div>

      <div className="city-area-meta">
        <span className="city-area-coord">
          {coords
            ? `Lat ${Number(coords.lat).toFixed(5)}, Lng ${Number(coords.lon).toFixed(5)}`
            : 'Lat/Lng not captured yet'}
        </span>
        {serviceable === true && (
          <span className="serviceable-ok"><FiCheckCircle /> Serviceable</span>
        )}
        {serviceable === false && (
          <span className="serviceable-no"><FiXCircle /> Not serviceable</span>
        )}
      </div>
    </div>
  )
}
