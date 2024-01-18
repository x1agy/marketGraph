type SymbolType = {
    symbol: string;
}

async function main(){
    const symbolsLink = 'https://api.binance.com/api/v3/exchangeInfo';
    const symbols: SymbolType[] = await getSymbols(symbolsLink)    
}

async function getSymbols(link){
    const response = await fetch(link)
    const data = await response.json()
    const filteredSymbols = data.filter(symbol => /[A-Z]+BTC/.test(symbol.symbol) && symbol.status === 'TRADING')
    return filteredSymbols
}