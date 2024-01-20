import { CandleStickDataType, PriceDataType, SymbolType } from "../Types/DataTypesForLogic";

async function getSymbols(){
    const response = await fetch('https://api.binance.com/api/v3/exchangeInfo')
    const data = await response.json()
    const filteredSymbols = await data.symbols.filter(symbol => /[A-Z]+BTC/.test(symbol.symbol) && symbol.status === 'TRADING')
    const btcSymbols: SymbolType[] = filteredSymbols.map(pair => pair.symbol);
    return btcSymbols
}

async function checkMarket(symbols: SymbolType[]){
    const response = await fetch('https://api.binance.com/api/v3/ticker/price');
    const data = await response.json();
    // filters data by filtered symbols from props
    const filteredData: PriceDataType[] = await data.filter(item => {
        if(symbols.includes(item.symbol)){
            return true
        }else return false
    })
    
    return filteredData;
}

async function getCandleStickData(coinName){
    const candleStickDataURL = `https://api.binance.com/api/v3/klines?symbol=${coinName}&interval=15m&limit=96`
    const response = await fetch(candleStickDataURL);
    const data: CandleStickDataType = await response.json();
    return data
}

export { getSymbols, checkMarket, getCandleStickData };

