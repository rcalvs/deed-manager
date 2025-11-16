import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import React, { useMemo } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import { ITEM_CATEGORIES, ITEM_TYPE_COLORS, ITEM_TYPE_LABELS } from '../constants'
import './StockChart.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function StockChart({ history, items, selectedCategory = 'all', searchText = '' }) {
  // Função auxiliar para filtrar itens
  const filterItems = useMemo(() => {
    return (itemList) => {
      if (!itemList || itemList.length === 0) {
        return []
      }
      
      let filtered = itemList
      
      // Filtrar por categoria
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(item => {
          const category = item.category || ITEM_CATEGORIES[item.type]
          return category === selectedCategory
        })
      }
      
      // Filtrar por texto de busca
      if (searchText && searchText.trim() !== '') {
        const searchLower = searchText.toLowerCase().trim()
        filtered = filtered.filter(item => {
          const itemLabel = ITEM_TYPE_LABELS[item.type] || item.type || ''
          return itemLabel.toLowerCase().includes(searchLower)
        })
      }
      
      return filtered
    }
  }, [selectedCategory, searchText])

  // Preparar dados para o gráfico de linha (histórico)
  const lineChartData = useMemo(() => {
    console.log('[StockChart] Processando histórico:', history)
    
    if (!history || history.length === 0) {
      console.log('[StockChart] Nenhum histórico disponível')
      return null
    }
    
    // Filtrar histórico pelos mesmos filtros
    const filteredHistory = history.filter(point => {
      // Verificar categoria
      if (selectedCategory !== 'all') {
        const category = ITEM_CATEGORIES[point.type]
        if (category !== selectedCategory) {
          return false
        }
      }
      
      // Verificar busca por texto
      if (searchText && searchText.trim() !== '') {
        const searchLower = searchText.toLowerCase().trim()
        const itemLabel = ITEM_TYPE_LABELS[point.type] || point.type || ''
        if (!itemLabel.toLowerCase().includes(searchLower)) {
          return false
        }
      }
      
      return true
    })
    
    if (filteredHistory.length === 0) {
      console.log('[StockChart] Nenhum histórico após filtros')
      return null
    }

    // Ordenar histórico por data e timestamp (para garantir ordem cronológica)
    const sortedHistory = [...filteredHistory].sort((a, b) => {
      const dateA = new Date(a.date + 'T00:00:00')
      const dateB = new Date(b.date + 'T00:00:00')
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB
      }
      // Se mesma data, manter ordem original (já vem ordenado do backend)
      return 0
    })

    // Agrupar por data e tipo/qualidade, mantendo o ÚLTIMO registro de cada data/tipo/qualidade
    // O quantity já representa a quantidade total acumulada após cada transação
    const dataByDateTypeQuality = {}
    sortedHistory.forEach((point) => {
      const key = `${point.date}_${point.type}_${point.quality}`
      // Sempre atualizar com o último valor (já está ordenado cronologicamente)
      // Isso garante que pegamos o estado final de cada dia
      dataByDateTypeQuality[key] = {
        date: point.date,
        type: point.type,
        quality: point.quality,
        quantity: point.quantity, // Esta é a quantidade total acumulada
      }
    })

    console.log('[StockChart] Dados agrupados por data/tipo/qualidade:', dataByDateTypeQuality)

    // Coletar todas as datas únicas e ordenar corretamente
    const dateSet = new Set()
    Object.values(dataByDateTypeQuality).forEach(p => dateSet.add(p.date))
    
    const dates = Array.from(dateSet).sort((a, b) => {
      const dateA = new Date(a + 'T00:00:00')
      const dateB = new Date(b + 'T00:00:00')
      return dateA - dateB
    })

    console.log('[StockChart] Datas ordenadas:', dates)

    // Agrupar por tipo (somando todas as qualidades do mesmo tipo para cada data)
    // Isso mostra a quantidade total de cada tipo ao longo do tempo
    const datasets = {}
    Object.values(dataByDateTypeQuality).forEach((point) => {
      if (!datasets[point.type]) {
        datasets[point.type] = {
          label: ITEM_TYPE_LABELS[point.type] || point.type,
          data: new Array(dates.length).fill(0),
          borderColor: ITEM_TYPE_COLORS[point.type] || 'rgba(100, 149, 237, 1)',
          backgroundColor: ITEM_TYPE_COLORS[point.type]?.replace('1)', '0.1)') || 'rgba(100, 149, 237, 0.1)',
          fill: true,
          tension: 0.4,
        }
      }
      const dateIndex = dates.indexOf(point.date)
      if (dateIndex !== -1) {
        // Somar a quantidade para o mesmo tipo na mesma data
        // (pode haver múltiplas qualidades do mesmo tipo)
        datasets[point.type].data[dateIndex] += point.quantity
      }
    })

    console.log('[StockChart] Datasets preparados:', datasets)

    // Formatar datas para exibição
    const formattedDates = dates.map(date => {
      try {
        // A data vem no formato "YYYY-MM-DD"
        const d = new Date(date + 'T00:00:00')
        if (isNaN(d.getTime())) {
          return date
        }
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      } catch (e) {
        console.warn('[StockChart] Erro ao formatar data:', date, e)
        return date
      }
    })

    const result = {
      labels: formattedDates,
      datasets: Object.values(datasets),
    }
    
    console.log('[StockChart] Dados finais do gráfico:', result)
    return result
  }, [history, selectedCategory, searchText])

  // Preparar dados para o gráfico de barras (estoque atual)
  const barChartData = useMemo(() => {
    if (!items || items.length === 0) {
      return null
    }

    // Aplicar filtros aos itens
    const filteredItems = filterItems(items)
    
    if (filteredItems.length === 0) {
      return null
    }

    // Agrupar por tipo
    const dataByType = {}
    filteredItems.forEach((item) => {
      if (!dataByType[item.type]) {
        dataByType[item.type] = 0
      }
      dataByType[item.type] += item.quantity
    })

    const labels = Object.keys(dataByType).map(
      (type) => ITEM_TYPE_LABELS[type] || type
    )
    const data = Object.values(dataByType)
    const colors = Object.keys(dataByType).map(
      (type) => ITEM_TYPE_COLORS[type] || 'rgba(100, 149, 237, 1)'
    )

    return {
      labels,
      datasets: [
        {
          label: 'Quantidade Total',
          data,
          backgroundColor: colors.map((c) => c.replace('1)', '0.8)')),
          borderColor: colors,
          borderWidth: 2,
        },
      ],
    }
  }, [items, filterItems])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e0e0e0',
        },
      },
      title: {
        display: true,
        color: '#e0e0e0',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#e0e0e0',
        bodyColor: '#e0e0e0',
        borderColor: '#3a4a62',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#b0b0b0',
        },
        grid: {
          color: '#3a4a62',
        },
      },
      y: {
        ticks: {
          color: '#b0b0b0',
          callback: function (value) {
            return value.toLocaleString('pt-BR')
          },
        },
        grid: {
          color: '#3a4a62',
        },
      },
    },
  }

  const lineChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        ...chartOptions.plugins.title,
        text: 'Evolução do Estoque (Últimos 30 dias)',
      },
    },
  }

  const barChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        ...chartOptions.plugins.title,
        text: 'Estoque Atual por Tipo',
      },
    },
  }

  return (
    <div className="stock-chart-container">
      <div className="chart-section">
        <h3>Gráfico de Evolução</h3>
        <div className="chart-wrapper">
          {lineChartData ? (
            <Line data={lineChartData} options={lineChartOptions} />
          ) : (
            <div className="no-data">Nenhum dado histórico disponível</div>
          )}
        </div>
      </div>
      <div className="chart-section">
        <h3>Estoque Atual</h3>
        <div className="chart-wrapper">
          {barChartData ? (
            <Bar data={barChartData} options={barChartOptions} />
          ) : (
            <div className="no-data">Nenhum item no estoque</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StockChart

