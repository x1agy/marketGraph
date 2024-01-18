import { getSymbols, checkMarket, getCandleStickData } from "./BinanceApp"
import { SymbolType, SymbolDataType } from "../Types/BinanceDetectorTypes";


const MarketData: SymbolDataType[] = [];
const coinsThatHaveChart: {coinName: string, chartId: string}[] = [];

async function main(){
    const symbols: SymbolType[] = await getSymbols()
    setInterval(async () => {
        const newMarketData = await checkMarket(symbols);
        addNewDataToMarketData(newMarketData);

        clearExpiredPrices()
        checkCoinsCurrencyChange();
        console.log(MarketData[0])
    }, 30000)
}

function addNewDataToMarketData(newData){
    newData.map(coinData => {
        const coinIndex = MarketData.findIndex(item => item.symbol === coinData.symbol)
        if(coinIndex !== -1){
            MarketData[coinIndex].prices.push({
                price: coinData.price,
                time: new Date().getTime(),
            })
        }else{
            MarketData.push({
                symbol: coinData.symbol,
                prices:[{
                    price: coinData.price,
                    time: new Date().getTime(),
                }]
            })
        }
    })
}

async function requestToCreateChart(candleStickData, coinName){
    const chartGeneratorUrl = 'http://localhost:5000/createChart';
    fetch(chartGeneratorUrl, {
        method:"POST",
        headers:{
            "Content-Type": "application/json"
        },
        body:JSON.stringify({
            candleStickData,
            authToken: "47a8e376-2abb-452a-a96c-bc8ea4cf9f7e",
            watermark: "@binance_pump_detector"
        })
    })
        .then(response => response.json())
        .then(imageId => coinsThatHaveChart.push({
            coinName: coinName,
            chartId: imageId
        }))
}

function checkCoinsCurrencyChange(){
    MarketData.map(async (coin) => {
        const hourAgoPrice = coin.prices[0].price;
        const modernPrice = coin.prices[coin.prices.length - 1].price
        if(((hourAgoPrice - modernPrice) / hourAgoPrice) * -1 > 5){
            const candleStickData = await getCandleStickData(coin.symbol)
            requestToCreateChart(candleStickData, coin.symbol)
        }
    })
}

function clearExpiredPrices(){
    for(let i = 0; i < MarketData.length; i++){
        if(MarketData[i].prices[MarketData[i].prices.length - 1].time - MarketData[i].prices[0].time > 3600){
            MarketData[i].prices.shift()
        }
    }
}

main()