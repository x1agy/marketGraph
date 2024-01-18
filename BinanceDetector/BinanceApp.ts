type SymbolType = {
    symbol: string;
}

type SymbolDataType = {
    symbol: SymbolType,
    prices: [{
        price: number,
        time: number
    }]
}

async function getSymbols(){
    const response = await fetch('https://api.binance.com/api/v3/exchangeInfo')
    const data = await response.json()
    const filteredSymbols = await data.symbols.filter(symbol => /[A-Z]+BTC/.test(symbol.symbol) && symbol.status === 'TRADING')
    const btcSymbols = filteredSymbols.map(pair => pair.symbol);
    return btcSymbols
}

async function checkMarket(marketData: SymbolDataType[], symbols: SymbolType[]){
    const response = await fetch('https://api.binance.com/api/v3/ticker/price');
    const data = await response.json();
    // filters data by filtered symbols from props
    const filteredData = await data.filter(item => {
        if(symbols.includes(item.symbol)){
            return true
        }else return false
    })
    // filters data by is marketData have needed prop ? add prop to prices for symbol in marketData : add new prop for marketData
    for(let i = 0; i < filteredData.length; i++){
        if(marketData.includes(filteredData[i].symbol)){
            const symbolIndex = marketData.findIndex(filteredData[i].symbol)
            marketData[symbolIndex].prices.push({
                price: filteredData.price,
                time: new Date().getTime()
            })
        }else{
            marketData.push({
                symbol: filteredData[i].symbol,
                prices: [{
                    price: filteredData[i].price,
                    time: new Date().getTime()
                }]
            })
        }
    }
    
    return marketData;
}

export { getSymbols, SymbolDataType, SymbolType, checkMarket };

