const express = require('express')
const bodyParser = require('body-parser')
const createChart = require('./chartGenerator').default
const fs = require('fs')

const app = express()
const port = 5000

app.use(bodyParser.json())

app.post('/createChart', (req, res) => {
  delete require.cache[require.resolve('chartjs-adapter-date-fns')]

  const { candleStickData, authToken, watermark, coinName } = req.body;

  if (authToken != '47a8e376-2abb-452a-a96c-bc8ea4cf9f7e') {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  createChart(candleStickData, watermark, coinName).then((fileName) => {
    const imageUrl = fileName
    res.json({ imageUrl })
  })
})

app.use('/public', express.static('public'))

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})
