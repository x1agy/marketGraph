var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var urlForSymbols = "https://api.binance.com/api/v3/exchangeInfo";
var chartGeneratorUrl = 'http://localhost:5000/createChart';
var chartDeleteUrl = 'http://localhost:5000/deleteChart';
var coinsSymbols = [];
var modernCoinToBTCCurrency = [];
var coinsChartsNames = [];
function fetchCoinToBTCSymbolData() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, btcPairs, btcSymbols, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, deleteExpiredCharts()];
                case 1:
                    _a.sent();
                    console.log('expired charts deleted!');
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, fetch(urlForSymbols)];
                case 3:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 4:
                    data = _a.sent();
                    btcPairs = data.symbols.filter(function (symbol) { return /[A-Z]+BTC/.test(symbol.symbol) && symbol.status === 'TRADING'; });
                    btcSymbols = btcPairs.map(function (pair) { return pair.symbol; });
                    coinsSymbols = btcSymbols;
                    console.log(btcPairs.length, ' pairs traiding!');
                    console.log('symbol names fetching complete!');
                    console.log('started fetching data');
                    fetchBTCCurrencyHistory(coinsSymbols);
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error('coin names fetching error = ', error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
var stackCount = 0;
function fetchBTCCurrencyHistory(symbols) {
    return __awaiter(this, void 0, void 0, function () {
        var urlForTradingHistory, i, iteratorMaxValue, i, response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stackCount++;
                    console.log(stackCount, ' stack started');
                    urlForTradingHistory = 'https://api.binance.com/api/v3/ticker?windowSize=1h&symbols=%5B';
                    if (symbols.length > 49) {
                        for (i = 0; i < 50; i++) {
                            urlForTradingHistory = urlForTradingHistory + '"' + symbols[0] + '"';
                            if (i !== 49) {
                                urlForTradingHistory = urlForTradingHistory + ',';
                            }
                            else {
                                urlForTradingHistory = urlForTradingHistory + '%5D';
                            }
                            symbols.shift();
                        }
                        ;
                    }
                    else {
                        iteratorMaxValue = symbols.length;
                        for (i = 0; i < iteratorMaxValue; i++) {
                            urlForTradingHistory = urlForTradingHistory + '"' + symbols[0] + '"';
                            if (i !== iteratorMaxValue - 1) {
                                urlForTradingHistory = urlForTradingHistory + ',';
                            }
                            else {
                                urlForTradingHistory = urlForTradingHistory + '%5D';
                            }
                            symbols.shift();
                        }
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(urlForTradingHistory)];
                case 2:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    data.map(function (item) { return modernCoinToBTCCurrency.push({
                        priceChangePercent: item.priceChangePercent,
                        symbol: item.symbol
                    }); });
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error('fetching currency data error = ', error_2);
                    return [3 /*break*/, 5];
                case 5:
                    console.log(stackCount, ' stack completed');
                    if (symbols.length) {
                        fetchBTCCurrencyHistory(symbols);
                    }
                    else {
                        stackCount = 0;
                        writeChartForCoins(modernCoinToBTCCurrency);
                        console.log('currency fetching completed!');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function getCanndleStickData(coin) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("https://api.binance.com/api/v3/klines?symbol=".concat(coin, "&interval=15m&limit=60"))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    return [2 /*return*/, data];
                case 3:
                    error_3 = _a.sent();
                    console.error('candlestick data fetching error = ', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function checkIsCoinHaveChart(coinName) {
    if (coinsChartsNames.findIndex(function (coin) { return coin.coinName === coinName; }) !== -1) {
        return false;
    }
    return true;
}
function writeChartForCoins(coinChartHistory) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log('chart writing start...');
            coinChartHistory.map(function (item) {
                if (Number(item.priceChangePercent) > 5) {
                    if (!checkIsCoinHaveChart(item.symbol)) {
                        console.log('chart writed');
                        var coinCandleStickData = getCanndleStickData(item.symbol);
                        fetch(chartGeneratorUrl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                chartData: coinCandleStickData,
                                authToken: "47a8e376-2abb-452a-a96c-bc8ea4cf9f7e",
                                watermark: "@binance_pump_detector"
                            })
                        })
                            .then(function (response) { return response.json(); })
                            .then(function (chartName) {
                            coinsChartsNames.push({
                                coinName: item.symbol,
                                coinChartName: chartName,
                                chartCreatedDate: Date.now()
                            });
                        })
                            .catch(function (e) { return console.error("Chart generator error = ", e); });
                    }
                }
            });
            console.log('chart writing completed');
            return [2 /*return*/];
        });
    });
}
function deleteExpiredCharts() {
    return __awaiter(this, void 0, void 0, function () {
        var expiredChartsIndexes;
        return __generator(this, function (_a) {
            expiredChartsIndexes = [];
            coinsChartsNames.map(function (chart, index) {
                if ((Date.now() - chart.chartCreatedDate) > (24 * 60 * 60 * 1000)) {
                    expiredChartsIndexes.push(index);
                    fetch(chartDeleteUrl, {
                        method: "DELETE",
                        body: JSON.stringify({
                            chartName: chart.coinChartName
                        })
                    })
                        .catch(function (e) { return console.error('Chart delete error = ', e); });
                }
            });
            expiredChartsIndexes.map(function (index) {
                coinsChartsNames.splice(index, 1);
            });
            return [2 /*return*/];
        });
    });
}
function startProgramFunction() {
    return __awaiter(this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetchCoinToBTCSymbolData()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    console.error('error in interval = ', error_4);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
console.log('program started');
startProgramFunction();
var intervalCount = 0;
var startFetchingDataIntervalID = setInterval(function () {
    intervalCount++;
    console.log(intervalCount, 'interval started');
    startProgramFunction();
    console.log('------program working ', intervalCount / 2, ' minutes!------');
}, 30000);
