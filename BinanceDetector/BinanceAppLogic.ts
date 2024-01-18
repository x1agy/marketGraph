import { getSymbols, SymbolType, SymbolDataType, checkMarket } from "./BinanceApp"

async function main(){
    const symbols: SymbolType[] = await getSymbols()
    let MarketData: SymbolDataType[] = [];
    setInterval(async () => {
        // change array every 30 seconds
        MarketData = await checkMarket(MarketData, symbols)
        console.log(MarketData)
    }, 30000)
}

main()