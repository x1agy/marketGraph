import { getSymbols, checkMarket, getCandleStickData } from "./BinanceApp"
import { SymbolType, SymbolDataType } from "../Types/BinanceDetectorTypes";


const MarketData: SymbolDataType[] = [];
const coinsThatHaveChart: {coinName: string, chartId: string}[] = [];

async function main(){
    const symbols: SymbolType[] = await getSymbols()
    setInterval(async () => {
        const newMarketData = await checkMarket(symbols);
        addNewDataToMarketData(newMarketData);
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

            const lastElementIndexInPrices = MarketData[coinIndex].prices.length - 1;
            const hourAgoPrice = MarketData[coinIndex].prices[ lastElementIndexInPrices ].price;
            const coinName = MarketData[coinIndex].symbol;

            // check expired date
            if(MarketData[coinIndex].prices[ lastElementIndexInPrices ].time - MarketData[coinIndex].prices[0].time > 3600){
                MarketData[coinIndex].prices.shift()
            }

            // check рост монеты 
            if((((hourAgoPrice - MarketData[coinIndex].prices[0].price) / hourAgoPrice) * 100 > 5)){
                // check is coin have chart
                if(coinsThatHaveChart.findIndex((item) => item.coinName === MarketData[coinIndex].symbol) !== -1){
                    const symbolDataForChart = getCandleStickData(coinName);
                    requestToCreateChart(symbolDataForChart, coinName)
                }
            }else{
                console.log('условие не пройдено ', lastElementIndexInPrices, '  ', hourAgoPrice, '  ', MarketData[coinIndex].symbol)
            }

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

main()