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
import { ITEM_TYPE_COLORS, ITEM_TYPE_LABELS } from '../constants'
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

function StockChart({ history, items }) {
  // Preparar dados para o gráfico de linha (histórico)
  const lineChartData = useMemo(() => {
    console.log('[StockChart] Processando histórico:', history)
    
    if (!history || history.length === 0) {
      console.log('[StockChart] Nenhum histórico disponível')
      return null
    }

    // Agrupar por data e tipo, mantendo a maior quantidade para cada data/tipo
    // Isso representa o estado do estoque naquele momento
    const dataByDateType = {}
    history.forEach((point) => {
      const key = `${point.date}_${point.type}`
      if (!dataByDateType[key]) {
        dataByDateType[key] = {
          date: point.date,
          type: point.type,
          quantity: point.quantity,
        }
      } else {
        // Manter a maior quantidade para cada data/tipo (último estado do dia)
        if (point.quantity > dataByDateType[key].quantity) {
          dataByDateType[key].quantity = point.quantity
        }
      }
    })

    console.log('[StockChart] Dados agrupados por data/tipo:', dataByDateType)

    // Coletar todas as datas únicas e ordenar corretamente (como datas, não strings)
    const dateSet = new Set()
    Object.values(dataByDateType).forEach(p => dateSet.add(p.date))
    
    const dates = Array.from(dateSet).sort((a, b) => {
      // Converter para Date para ordenação correta
      const dateA = new Date(a + 'T00:00:00')
      const dateB = new Date(b + 'T00:00:00')
      return dateA - dateB
    })

    console.log('[StockChart] Datas ordenadas:', dates)

    // Agrupar por tipo
    const datasets = {}
    Object.values(dataByDateType).forEach((point) => {
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
        datasets[point.type].data[dateIndex] = point.quantity
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
  }, [history])

  // Preparar dados para o gráfico de barras (estoque atual)
  const barChartData = useMemo(() => {
    if (!items || items.length === 0) {
      return null
    }

    // Agrupar por tipo
    const dataByType = {}
    items.forEach((item) => {
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
  }, [items])

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

