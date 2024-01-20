export type SymbolType = string

export type SymbolDataType = {
    symbol: SymbolType,
    prices: [{
        price: number,
        time: number,
    }]
}

export type CandleStickDataType = [
    number,
    string,
    string,
    string,
    string,
    string,
    number,
    string,
    number,
    string,
    string,
]

export type PriceDataType = {
    symbol: string,
    price: number,
}