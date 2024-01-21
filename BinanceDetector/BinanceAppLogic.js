"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var BinanceApp_1 = require("./BinanceApp");
var MarketData = [];
var coinsThatHaveChart = [];
var intervalTime = 30000;
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var symbols;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("start");
                    return [4 /*yield*/, (0, BinanceApp_1.getSymbols)()];
                case 1:
                    symbols = _a.sent();
                    setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                        var newMarketData;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, BinanceApp_1.checkMarket)(symbols)];
                                case 1:
                                    newMarketData = _a.sent();
                                    addNewDataToMarketData(newMarketData);
                                    checkCoinsCurrencyChange();
                                    // clearExpiredPrices();
                                    clearExpiredCharts();
                                    console.log(MarketData.length);
                                    console.log(MarketData[0]);
                                    return [2 /*return*/];
                            }
                        });
                    }); }, intervalTime);
                    return [2 /*return*/];
            }
        });
    });
}
function addNewDataToMarketData(newData) {
    newData.map(function (coinData) {
        var coinIndex = MarketData.findIndex(function (item) { return item.symbol === coinData.symbol; });
        if (coinIndex !== -1) {
            MarketData[coinIndex].prices.push({
                price: coinData.price,
                time: new Date().getTime(),
            });
        }
        else {
            MarketData.push({
                symbol: coinData.symbol,
                prices: [
                    {
                        price: coinData.price,
                        time: new Date().getTime(),
                    },
                ],
            });
        }
    });
}
function requestToCreateChart(candleStickData, coinName) {
    return __awaiter(this, void 0, void 0, function () {
        var chartGeneratorUrl;
        return __generator(this, function (_a) {
            console.log("createChart");
            chartGeneratorUrl = "http://localhost:5000/createChart";
            fetch(chartGeneratorUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    candleStickData: candleStickData,
                    authToken: "47a8e376-2abb-452a-a96c-bc8ea4cf9f7e",
                    watermark: "@binance_pump_detector",
                }),
            })
                .then(function (response) { return response.json(); })
                .then(function (imageId) {
                return coinsThatHaveChart.push({
                    coinName: coinName,
                    chartId: imageId,
                    createdTime: new Date().getDate(),
                });
            })
                .catch(function (e) { return console.error("chart create error", e); });
            return [2 /*return*/];
        });
    });
}
function checkCoinsCurrencyChange() {
    var _this = this;
    MarketData.map(function (coin) { return __awaiter(_this, void 0, void 0, function () {
        var hourAgoPrice, modernPrice, candleStickData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(coin.prices.length === 3600 / intervalTime)) return [3 /*break*/, 2];
                    if (!(coinsThatHaveChart.findIndex(function (chart) { return chart.coinName === coin.symbol; }) === -1)) return [3 /*break*/, 2];
                    hourAgoPrice = coin.prices[0].price;
                    modernPrice = coin.prices[coin.prices.length - 1].price;
                    if (!(((hourAgoPrice - modernPrice) / hourAgoPrice) * -1 > 5)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, BinanceApp_1.getCandleStickData)(coin.symbol)];
                case 1:
                    candleStickData = _a.sent();
                    requestToCreateChart(candleStickData, coin.symbol);
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); });
}
function clearExpiredPrices() {
    MarketData.map(function (coin) {
        if (coin.prices.length > 3600 / intervalTime) {
            coin.prices.shift();
        }
    });
}
function clearExpiredCharts() {
    var expiredChartIndex;
    var chartDeleteUrl = "http://localhost:5000/deleteChart";
    coinsThatHaveChart.map(function (chart, index) {
        if (new Date().getDate() - chart.createdTime > 86400) {
            expiredChartIndex = index;
            fetch(chartDeleteUrl, {
                method: "DELETE",
                body: JSON.stringify({
                    chartName: chart.chartId,
                }),
            }).catch(function (e) { return console.error("chart delete error ", e); });
        }
    });
    if (expiredChartIndex !== undefined) {
        coinsThatHaveChart.splice(expiredChartIndex, 1);
    }
}
main();
