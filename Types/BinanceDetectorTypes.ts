export type SymbolType = string

export type SymbolDataType = {
    symbol: SymbolType,
    prices: [{
        price: number,
        time: number
    }]
}