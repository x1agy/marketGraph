export type SymbolType = {
    symbol: string;
}

export type SymbolDataType = {
    symbol: SymbolType,
    prices: [{
        price: number,
        time: number
    }]
}