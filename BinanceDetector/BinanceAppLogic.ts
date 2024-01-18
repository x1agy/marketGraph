import { getSymbols, checkMarket } from "./BinanceApp"
import { SymbolType, SymbolDataType } from "./BinanceDetectorTypes";


const MarketData: SymbolDataType[] = [];

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

main()