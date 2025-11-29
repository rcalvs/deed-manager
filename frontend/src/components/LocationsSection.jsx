import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaEdit, FaExternalLinkAlt, FaPlus, FaSearch, FaTimes, FaTrashAlt } from 'react-icons/fa'
import { api } from '../api'
import { CATEGORIES } from '../constants'
import './LocationsSection.css'

function LocationsSection() {
  const { t } = useTranslation()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    url: '',
    mapType: 'yaga',
    server: 'Harmony',
    x: '',
    y: '',
  })

  useEffect(() => {
    loadLocations()
  }, [])

  // Filtrar localizações por categoria e texto de busca
  const filteredLocations = useMemo(() => {
    if (!locations || locations.length === 0) {
      return []
    }
    
    let filtered = locations
    
    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(location => {
        return location.category === selectedCategory
      })
    }
    
    // Filtrar por texto de busca (nome e descrição)
    if (searchText && searchText.trim() !== '') {
      const searchLower = searchText.toLowerCase().trim()
      filtered = filtered.filter(location => {
        const name = (location.name || '').toLowerCase()
        const description = (location.description || '').toLowerCase()
        return name.includes(searchLower) || description.includes(searchLower)
      })
    }
    
    return filtered
  }, [locations, selectedCategory, searchText])

  const loadLocations = async () => {
    try {
      setLoading(true)
      const data = await api.getLocations()
      setLocations(data || [])
    } catch (error) {
      console.error('Erro ao carregar localizações:', error)
    } finally {
      setLoading(false)
    }
  }

  const parseUrl = (url) => {
    if (!url || !url.trim()) {
      return null
    }

    try {
      // Adicionar protocolo se não tiver
      let urlToParse = url.trim()
      if (!urlToParse.startsWith('http://') && !urlToParse.startsWith('https://')) {
        urlToParse = 'https://' + urlToParse
      }

      const urlObj = new URL(urlToParse)
      let mapType = 'yaga'
      let server = 'Harmony'
      let x = null
      let y = null

      // Verificar se é yaga.host
      if (urlObj.hostname.includes('yaga.host')) {
        mapType = 'yaga'
        // Extrair servidor do subdomínio: harmony.yaga.host, cadence.yaga.host, etc
        const hostParts = urlObj.hostname.split('.')
        if (hostParts.length > 0) {
          const subdomain = hostParts[0].toLowerCase()
          if (subdomain === 'harmony' || subdomain === 'cadence' || subdomain === 'melody') {
            server = subdomain.charAt(0).toUpperCase() + subdomain.slice(1)
          }
        }
        // Extrair coordenadas do hash: #2296,1726
        const hash = urlObj.hash
        const match = hash.match(/#(\d+),(\d+)/)
        if (match) {
          x = parseInt(match[1])
          y = parseInt(match[2])
        }
      }
      // Verificar se é wurmmaps.xyz
      else if (urlObj.hostname.includes('wurmmaps.xyz')) {
        mapType = 'wurmmaps'
        // Extrair servidor do pathname: /Harmony/?x=2660&y=3211
        const pathParts = urlObj.pathname.split('/').filter(p => p)
        if (pathParts.length > 0) {
          const possibleServer = pathParts[0]
          if (['Harmony', 'Cadence', 'Melody'].includes(possibleServer)) {
            server = possibleServer
          }
        }
        // Extrair coordenadas dos query params
        const xParam = urlObj.searchParams.get('x')
        const yParam = urlObj.searchParams.get('y')
        if (xParam) x = parseInt(xParam)
        if (yParam) y = parseInt(yParam)
      }

      if (x !== null && y !== null && !isNaN(x) && !isNaN(y)) {
        return { mapType, server, x, y }
      }
    } catch (error) {
      console.error('Erro ao parsear URL:', error)
    }

    return null
  }

  const handleUrlChange = (url) => {
    setFormData({ ...formData, url })
    
    const parsed = parseUrl(url)
    if (parsed) {
      setFormData(prev => ({
        ...prev,
        url,
        mapType: parsed.mapType,
        server: parsed.server,
        x: parsed.x.toString(),
        y: parsed.y.toString(),
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert(t('notes.location.nameRequired'))
      return
    }

    const x = parseInt(formData.x)
    const y = parseInt(formData.y)

    if (isNaN(x) || isNaN(y)) {
      alert(t('notes.location.invalidCoordinates', { defaultValue: 'Please enter valid coordinates (X and Y must be numbers)' }))
      return
    }

    try {
      if (editingLocation) {
        await api.updateLocation(
          editingLocation.id,
          formData.name,
          formData.description,
          formData.category,
          formData.mapType,
          formData.server,
          x,
          y
        )
      } else {
        await api.createLocation(
          formData.name,
          formData.description,
          formData.category,
          formData.mapType,
          formData.server,
          x,
          y
        )
      }
      
      resetForm()
      loadLocations()
    } catch (error) {
      console.error('Erro ao salvar localização:', error)
      alert(`${t('notes.location.saveError')}: ${error.message || t('common.error')}`)
    }
  }

  const handleEdit = (location) => {
    setEditingLocation(location)
    
    // Gerar URL baseada nos dados salvos
    let url = ''
    const mapType = location.mapType || 'yaga'
    const server = location.server || 'Harmony'
    
    if (mapType === 'yaga') {
      url = `https://${server.toLowerCase()}.yaga.host/#${location.x},${location.y}`
    } else if (mapType === 'wurmmaps') {
      url = `https://wurmmaps.xyz/${server}/?x=${location.x}&y=${location.y}`
    }
    
    setFormData({
      name: location.name || '',
      description: location.description || '',
      category: location.category || '',
      url: url,
      mapType: mapType,
      server: server,
      x: location.x?.toString() || '',
      y: location.y?.toString() || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteLocation(id)
      loadLocations()
    } catch (error) {
      console.error('Erro ao deletar localização:', error)
      alert(`${t('notes.location.saveError')}: ${error.message || t('common.error')}`)
    }
  }

  const handleOpenMap = (location) => {
    let url = ''
    if (location.mapType === 'yaga') {
      const serverLower = (location.server || 'Harmony').toLowerCase()
      url = `https://${serverLower}.yaga.host/#${location.x},${location.y}`
    } else if (location.mapType === 'wurmmaps') {
      url = `https://wurmmaps.xyz/${location.server || 'Harmony'}/?x=${location.x}&y=${location.y}`
    } else {
      // Fallback para yaga
      url = `https://harmony.yaga.host/#${location.x},${location.y}`
    }
    window.open(url, '_blank')
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      url: '',
      mapType: 'yaga',
      server: 'Harmony',
      x: '',
      y: '',
    })
    setEditingLocation(null)
    setShowForm(false)
  }

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>
  }

  return (
    <div className="locations-section">
      <div className="locations-header">
        <h2>{t('notes.sections.locations')}</h2>
        <button
          className="btn-add"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <FaPlus /> {t('notes.newLocation')}
        </button>
      </div>

      {showForm && (
        <div className="location-form-container">
          <form className="location-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <h3>{editingLocation ? t('notes.location.editLocation') : t('notes.newLocation')}</h3>
              <button type="button" className="btn-close" onClick={resetForm}>
                <FaTimes />
              </button>
            </div>
            <div className="form-group">
              <label htmlFor="name">{t('notes.location.name')} *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder={t('notes.location.name')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">{t('notes.location.description')}</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('notes.location.description')}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">{t('stock.category')}</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">{t('stock.allCategories')}</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="url">{t('notes.location.url')}</label>
              <input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={t('notes.location.urlPlaceholder')}
              />
              <small className="form-hint">
                {t('notes.location.urlHint')}
              </small>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mapType">{t('notes.location.mapType')} *</label>
                <select
                  id="mapType"
                  value={formData.mapType}
                  onChange={(e) => setFormData({ ...formData, mapType: e.target.value })}
                  required
                >
                  <option value="yaga">{t('notes.location.mapTypes.yaga')}</option>
                  <option value="wurmmaps">{t('notes.location.mapTypes.wurmmaps')}</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="server">{t('notes.location.server')} *</label>
                <select
                  id="server"
                  value={formData.server}
                  onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                  required
                >
                  <option value="Harmony">{t('notes.location.servers.harmony')}</option>
                  <option value="Cadence">{t('notes.location.servers.cadence')}</option>
                  <option value="Melody">{t('notes.location.servers.melody')}</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="x">{t('notes.location.coordinates')} {t('notes.location.x')} *</label>
                <input
                  id="x"
                  type="number"
                  value={formData.x}
                  onChange={(e) => setFormData({ ...formData, x: e.target.value })}
                  required
                  placeholder={t('notes.location.x')}
                />
              </div>
              <div className="form-group">
                <label htmlFor="y">{t('notes.location.coordinates')} {t('notes.location.y')} *</label>
                <input
                  id="y"
                  type="number"
                  value={formData.y}
                  onChange={(e) => setFormData({ ...formData, y: e.target.value })}
                  required
                  placeholder={t('notes.location.y')}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={resetForm}>
                {t('common.cancel')}
              </button>
              <button type="submit" className="btn-save">
                {editingLocation ? t('common.save') : t('common.add')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="locations-filters">
        <div className="search-filter">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('notes.searchLocationPlaceholder', { defaultValue: 'Search locations...' })}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
            style={{ minWidth: '50%', paddingLeft: '2rem' }}
          />
          {searchText && (
            <button
              className="search-clear"
              onClick={() => setSearchText('')}
              title={t('common.close')}
            >
              ×
            </button>
          )}
        </div>
        <div className="category-filter">
          <label htmlFor="category-filter">{t('stock.category')}:</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="all">{t('stock.allCategories')}</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="locations-list">
        {filteredLocations.length === 0 ? (
          <div className="empty-state">
            {locations.length === 0 
              ? t('notes.location.noLocations')
              : t('notes.noLocationsFiltered', { defaultValue: 'No locations match the filters' })
            }
          </div>
        ) : (
          filteredLocations.map((location) => (
            <div key={location.id} className="location-item">
              <div className="location-content">
                <div className="location-header">
                  <div className="location-name-section">
                    <h3 className="location-name">{location.name}</h3>
                    {location.category && (
                      <span className="category-badge" data-category={location.category}>
                        {location.category}
                      </span>
                    )}
                  </div>
                  <div className="location-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleOpenMap(location)}
                      title={t('notes.location.openMap')}
                    >
                      <FaExternalLinkAlt />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(location)}
                      title={t('common.edit')}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => {
                        if (confirm(t('notes.location.deleteConfirm'))) {
                          handleDelete(location.id)
                        }
                      }}
                      title={t('common.delete')}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
                {location.description && (
                  <p className="location-description">{location.description}</p>
                )}
                <div className="location-coords">
                  <span className="coord-badge">
                    {t('notes.location.x')}: {location.x}, {t('notes.location.y')}: {location.y}
                  </span>
                  <span className="map-badge">
                    {location.mapType === 'yaga' ? t('notes.location.mapTypes.yaga') : t('notes.location.mapTypes.wurmmaps')} - {location.server || t('notes.location.servers.harmony')}
                  </span>
                  <a
                    href={(() => {
                      if (location.mapType === 'yaga') {
                        const serverLower = (location.server || 'Harmony').toLowerCase()
                        return `https://${serverLower}.yaga.host/#${location.x},${location.y}`
                      } else if (location.mapType === 'wurmmaps') {
                        return `https://wurmmaps.xyz/${location.server || 'Harmony'}/?x=${location.x}&y=${location.y}`
                      }
                      return `https://harmony.yaga.host/#${location.x},${location.y}`
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    {t('notes.location.openMap')}
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default LocationsSection

