type ModernCurrencyType = {
    priceChangePercent: string;
    symbol: string;
}

type CoinChartName = {
    coinName: string;
    coinChartName: string;
    chartCreatedDate: number;
}

const urlForSymbols = "https://api.binance.com/api/v3/exchangeInfo";
const chartGeneratorUrl = 'http://localhost:5000/createChart'
const chartDeleteUrl = 'http://localhost:5000/deleteChart'

let coinsSymbols: string[] = [];

const modernCoinToBTCCurrency: ModernCurrencyType[] = [];
const coinsChartsNames: CoinChartName[] = [];

async function fetchCoinToBTCSymbolData(){
    await deleteExpiredCharts()
    console.log('expired charts deleted!')
    try {
        const response = await fetch(urlForSymbols)
        const data = await response.json()
        const btcPairs = data.symbols.filter(symbol => /[A-Z]+BTC/.test(symbol.symbol));
        const btcSymbols = btcPairs.map(pair => pair.symbol);
        coinsSymbols = btcSymbols;
        console.log('symbol names fetching complete!')
        console.log('started fetching data')
        fetchBTCCurrencyHistory(coinsSymbols)
    }catch(error){
        console.error('coin names fetching error = ', error)
    }
}

let stackCount = 0;

async function fetchBTCCurrencyHistory(symbols){
    stackCount++;
    console.log(stackCount, ' stack started')
    let urlForTradingHistory = 'https://api.binance.com/api/v3/ticker?windowSize=1h&symbols=%5B';
    if(symbols.length > 49){
        for(let i = 0; i < 50; i++){
        urlForTradingHistory = urlForTradingHistory + '"' + symbols[0] + '"';
        if(i !== 49){
            urlForTradingHistory = urlForTradingHistory + ',';
        }else{
            urlForTradingHistory = urlForTradingHistory + '%5D'
        }
        symbols.shift()
        };
    }else{
        const iteratorMaxValue = symbols.length
        for(let i = 0; i < iteratorMaxValue; i++){
        urlForTradingHistory = urlForTradingHistory + '"' + symbols[0] + '"';
        if(i !== iteratorMaxValue - 1){
            urlForTradingHistory = urlForTradingHistory + ',';
        }else{
            urlForTradingHistory = urlForTradingHistory + '%5D'
        }
        symbols.shift()
        }
    }
    try{
        const response = await fetch(urlForTradingHistory);
        const data = await response.json();
        data.map(item => modernCoinToBTCCurrency.push(
            {
                priceChangePercent: item.priceChangePercent,
                symbol: item.symbol
            }
        ))
    }catch(error){
        console.error('fetching currency data error = ', error)
    }
    console.log(stackCount, ' stack completed')
    if(symbols.length){
        fetchBTCCurrencyHistory(symbols)
    }
    else{
        stackCount = 0;
        writeChartForCoins(modernCoinToBTCCurrency)
        console.log('currency fetching completed!')
    }
}

async function getCanndleStickData(coin){
    try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${coin}&interval=15m&limit=60`);
        const data = await response.json();
        return data
    }catch (error) {
        console.error('candlestick data fetching error = ', error)
    }
}

function checkIsCoinHaveChart(coinName){
    if(coinsChartsNames.findIndex((coin) => coin.coinName === coinName) !== -1){
        return false
    }
    return true
}

async function writeChartForCoins(coinChartHistory: ModernCurrencyType[]){
    console.log('chart writing start...')
    coinChartHistory.map(item => {
        if(Number(item.priceChangePercent) > 5){
            if(!checkIsCoinHaveChart(item.symbol)){
                console.log('chart writed')
                const coinCandleStickData = getCanndleStickData(item.symbol)
                fetch(chartGeneratorUrl, {
                    method:"POST",
                    headers:{
                        "Content-Type": "application/json"
                    },
                    body:JSON.stringify({
                        chartData: coinCandleStickData,
                        authToken: "47a8e376-2abb-452a-a96c-bc8ea4cf9f7e",
                        watermark: "@binance_pump_detector"
                    })
                })
                    .then(response => response.json())
                    .then(chartName => {
                        coinsChartsNames.push({
                            coinName: item.symbol,
                            coinChartName: chartName,
                            chartCreatedDate: Date.now()
                        });
                    })
                    .catch(e => console.error("Chart generator error = ", e))
            }
        }
    })
    console.log('chart writing completed')
}

async function deleteExpiredCharts(){
    const expiredChartsIndexes: number[] = []
    coinsChartsNames.map((chart, index) => {
        if((Date.now() - chart.chartCreatedDate) > (24 * 60 * 60 * 1000)){
            expiredChartsIndexes.push(index)
            fetch(chartDeleteUrl, {
                method: "DELETE",
                body: JSON.stringify({
                    chartName: chart.coinChartName
                })
            })
                .catch(e => console.error('Chart delete error = ', e))
        }
    })
    expiredChartsIndexes.map(index => {
        coinsChartsNames.splice(index, 1)
    })

}

async function startProgramFunction() {
    try {
        await fetchCoinToBTCSymbolData()
    } catch (error) {
        console.error('error in interval = ', error)
    }
}

console.log('program started')
startProgramFunction()

let intervalCount = 0;
const startFetchingDataIntervalID = setInterval(() => {
    intervalCount++;
    console.log(intervalCount, 'interval started');
    startProgramFunction();
    console.log('------program working ', intervalCount / 2 , ' minutes!------')
}, 30000)