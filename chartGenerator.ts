import { ChartJSNodeCanvas, ChartCallback } from 'chartjs-node-canvas'
import { ChartConfiguration } from 'chart.js'
import { writeFileSync } from 'fs'
import { toRadians } from 'chart.js/helpers'

async function createChart(chartData, watermarkText) {
  let maxDate = -Infinity
  let minDate = +Infinity
  let maxValue = -Infinity
  let minValue = +Infinity

  const data = []

  for (let i of chartData) {
    // переменные для отступов от границ
    if (i[0] > maxDate) {
      maxDate = i[0]
    }
    if (i[0] < minDate) {
      minDate = i[0]
    }
    if (i[3] < minValue) {
      minValue = i[3]
    }
    if (i[2] > maxValue) {
      maxValue = i[2]
    }

    //@ts-ignore
    data.push({
      x: new Date(i[0]),
      o: i[1],
      h: i[2],
      l: i[3],
      c: i[4],
      s: [i[1], i[4]],
    })
  }

  const candleStick = {
    id: 'background-colour',
    beforeDraw: (chart) => {
      const {
        ctx,
        data,
        chartArea: { top, bottom, left, right, width, height },
        scales: { x, y },
      } = chart
      ctx.save()
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, width + 300, height + 300)
      ctx.restore()
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(255, 255, 255, 1)'
      // незакрашенные линии
      data.datasets[0].data.forEach((dataPoint, index) => {
        //@ts-ignore
        const color =
          dataPoint.o <= dataPoint.c
            ? 'rgba(11, 156, 49, 1)'
            : 'rgba(255, 0, 0, 1)'

        ctx.beginPath()
        ctx.moveTo(
          chart.getDatasetMeta(0).data[index].x,
          chart.getDatasetMeta(0).data[index].y
        )
        //@ts-ignore
        ctx.lineTo(
          chart.getDatasetMeta(0).data[index].x,
          y.getPixelForValue(dataPoint.h)
        )
        ctx.strokeStyle = color
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(
          chart.getDatasetMeta(0).data[index].x,
          chart.getDatasetMeta(0).data[index].y
        )
        //@ts-ignore
        ctx.lineTo(
          chart.getDatasetMeta(0).data[index].x,
          y.getPixelForValue(dataPoint.l)
        )
        ctx.strokeStyle = color
        ctx.stroke()
      })
    },
  }

  const watermark = {
    id: 'watermark',
    afterDraw(chart, args, plugins) {
      const {
        ctx,
        chartArea: { top, bottom, left, right, width, height },
      } = chart

      ctx.save()
      ctx.font = 'bold 50px sans-serif'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.textAlign = 'center'
      const centerX = width / 2 + left
      const centerY = height / 2 + top
      ctx.translate(centerX, centerY)
      ctx.rotate(toRadians(-15))
      ctx.fillText(watermarkText, 0, 0)
      ctx.restore()
    },
  }

  const width = 1400
  const height = 700
  const configuration: ChartConfiguration = {
    type: 'bar',
    data: {
      datasets: [
        {
          data,
          backgroundColor: (ctx) => {
            let color
            if (ctx.raw.o <= ctx.raw.c) {
              color = 'rgba(11, 156, 49, 1)'
            } else {
              color = 'rgba(255, 0, 0, 1)'
            }
            return color
          },
          borderColor: 'rgba(0, 0, 0, 1)',
          borderWidth: 1,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      parsing: {
        xAxisKey: 'x',
        yAxisKey: 's',
      },
      scales: {
        x: {
          type: 'timeseries',
          beginAtZero: false,
          ticks: {
            font: {
              size: 16,
              weight: '800',
            },
            backdropPadding: 20,
          },
          //@ts-ignore
          min: new Date(minDate - 3000000),
          //@ts-ignore
          max: new Date(maxDate + 3000000),
        },

        y: {
          type: 'linear',
          position: 'right',
          beginAtZero: false,
          ticks: {
            font: {
              size: 16,
              weight: '800',
            },
            padding: 20,
            callback: function (value, index, values) {
              // Форматирование чисел без научной нотации
              return value.toLocaleString('en-US', { maximumFractionDigits: 9 })
            },
          },
          suggestedMax: maxValue,
          suggestedMin: minValue,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
    plugins: [candleStick, watermark],
  }
  const chartCallback: ChartCallback = (ChartJS) => {
    ChartJS.defaults.responsive = true
    ChartJS.defaults.maintainAspectRatio = false
  }
  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    width,
    height,
    plugins: {
      modern: [require('chartjs-adapter-date-fns')],
    },
    chartCallback,
  })
  const buffer = await chartJSNodeCanvas.renderToBuffer(configuration)
  writeFileSync('./public/canvas.png', buffer, 'base64')
  return 'canvas.png'
}

export default createChart
