import React, { useEffect, useState } from 'react'
import { FaEdit, FaExternalLinkAlt, FaPlus, FaTimes, FaTrashAlt } from 'react-icons/fa'
import { api } from '../api'
import './LocationsSection.css'

function LocationsSection() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    mapType: 'yaga',
    server: 'Harmony',
    x: '',
    y: '',
  })

  useEffect(() => {
    loadLocations()
  }, [])

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
      alert('Por favor, preencha o nome')
      return
    }

    const x = parseInt(formData.x)
    const y = parseInt(formData.y)

    if (isNaN(x) || isNaN(y)) {
      alert('Por favor, preencha coordenadas válidas (X e Y devem ser números)')
      return
    }

    try {
      if (editingLocation) {
        await api.updateLocation(
          editingLocation.id,
          formData.name,
          formData.description,
          formData.mapType,
          formData.server,
          x,
          y
        )
      } else {
        await api.createLocation(
          formData.name,
          formData.description,
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
      alert(`Erro ao salvar localização: ${error.message || 'Erro desconhecido'}`)
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
      url: url,
      mapType: mapType,
      server: server,
      x: location.x?.toString() || '',
      y: location.y?.toString() || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta localização?')) {
      return
    }

    try {
      await api.deleteLocation(id)
      loadLocations()
    } catch (error) {
      console.error('Erro ao deletar localização:', error)
      alert(`Erro ao deletar localização: ${error.message || 'Erro desconhecido'}`)
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
    return <div className="loading">Carregando localizações...</div>
  }

  return (
    <div className="locations-section">
      <div className="locations-header">
        <h2>Locais</h2>
        <button
          className="btn-add"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <FaPlus /> Novo Local
        </button>
      </div>

      {showForm && (
        <div className="location-form-container">
          <form className="location-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <h3>{editingLocation ? 'Editar Localização' : 'Nova Localização'}</h3>
              <button type="button" className="btn-close" onClick={resetForm}>
                <FaTimes />
              </button>
            </div>
            <div className="form-group">
              <label htmlFor="name">Nome *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ex: Vila Principal"
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Descrição</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes sobre o local..."
                rows="3"
              />
            </div>
            <div className="form-group">
              <label htmlFor="url">URL do Mapa</label>
              <input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="Ex: https://harmony.yaga.host/#2296,1726"
              />
              <small className="form-hint">
                Cole a URL do mapa para preencher automaticamente os campos abaixo
              </small>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="mapType">Mapa *</label>
                <select
                  id="mapType"
                  value={formData.mapType}
                  onChange={(e) => setFormData({ ...formData, mapType: e.target.value })}
                  required
                >
                  <option value="yaga">Yaga.host</option>
                  <option value="wurmmaps">WurmMaps.xyz</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="server">Servidor *</label>
                <select
                  id="server"
                  value={formData.server}
                  onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                  required
                >
                  <option value="Harmony">Harmony</option>
                  <option value="Cadence">Cadence</option>
                  <option value="Melody">Melody</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="x">Coordenada X *</label>
                <input
                  id="x"
                  type="number"
                  value={formData.x}
                  onChange={(e) => setFormData({ ...formData, x: e.target.value })}
                  required
                  placeholder="Ex: 2296"
                />
              </div>
              <div className="form-group">
                <label htmlFor="y">Coordenada Y *</label>
                <input
                  id="y"
                  type="number"
                  value={formData.y}
                  onChange={(e) => setFormData({ ...formData, y: e.target.value })}
                  required
                  placeholder="Ex: 1726"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={resetForm}>
                Cancelar
              </button>
              <button type="submit" className="btn-save">
                {editingLocation ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="locations-list">
        {locations.length === 0 ? (
          <div className="empty-state">Nenhuma localização salva ainda</div>
        ) : (
          locations.map((location) => (
            <div key={location.id} className="location-item">
              <div className="location-content">
                <div className="location-header">
                  <h3 className="location-name">{location.name}</h3>
                  <div className="location-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleOpenMap(location)}
                      title="Abrir no mapa"
                    >
                      <FaExternalLinkAlt />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(location)}
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(location.id)}
                      title="Deletar"
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
                    X: {location.x}, Y: {location.y}
                  </span>
                  <span className="map-badge">
                    {location.mapType === 'yaga' ? 'Yaga.host' : 'WurmMaps.xyz'} - {location.server || 'Harmony'}
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
                    Ver no mapa
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

