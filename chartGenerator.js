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
var chartjs_node_canvas_1 = require("chartjs-node-canvas");
var fs_1 = require("fs");
function createChart(chartData, watermark) {
    return __awaiter(this, void 0, void 0, function () {
        var response, responseData, maxDate, minDate, maxValue, minValue, data, _i, chartData_1, i, candleStick, width, height, configuration, chartCallback, chartJSNodeCanvas, buffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch('https://api.binance.com/api/v3/klines?symbol=SUIBTC&interval=1h&limit=20')];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    responseData = _a.sent();
                    maxDate = -Infinity;
                    minDate = +Infinity;
                    maxValue = -Infinity;
                    minValue = +Infinity;
                    data = [];
                    for (_i = 0, chartData_1 = chartData; _i < chartData_1.length; _i++) {
                        i = chartData_1[_i];
                        // переменные для отступов от границ 
                        if (i[0] > maxDate) {
                            maxDate = i[0];
                        }
                        if (i[0] < minDate) {
                            minDate = i[0];
                        }
                        if (i[3] < minValue) {
                            minValue = i[3];
                        }
                        if (i[2] > maxValue) {
                            maxValue = i[2];
                        }
                        //@ts-ignore
                        data.push({
                            x: new Date(i[0]),
                            o: i[1],
                            h: i[2],
                            l: i[3],
                            c: i[4],
                            s: [i[1], i[4]]
                        });
                    }
                    candleStick = {
                        id: 'background-colour',
                        beforeDraw: function (chart) {
                            var ctx = chart.ctx, data = chart.data, _a = chart.chartArea, top = _a.top, bottom = _a.bottom, left = _a.left, right = _a.right, width = _a.width, height = _a.height, _b = chart.scales, x = _b.x, y = _b.y;
                            ctx.save();
                            ctx.fillStyle = 'white';
                            ctx.fillRect(0, 0, width + 300, height + 300);
                            ctx.restore();
                            ctx.lineWidth = 6;
                            ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
                            // незакрашенные линии
                            data.datasets[0].data.forEach(function (dataPoint, index) {
                                //@ts-ignore
                                var color = dataPoint.o <= dataPoint.c ? 'rgba(11, 156, 49, 1)' : 'rgba(255, 0, 0, 1)';
                                ctx.beginPath();
                                ctx.moveTo(chart.getDatasetMeta(0).data[index].x, chart.getDatasetMeta(0).data[index].y);
                                //@ts-ignore
                                ctx.lineTo(chart.getDatasetMeta(0).data[index].x, y.getPixelForValue(dataPoint.h));
                                ctx.strokeStyle = color;
                                ctx.stroke();
                                ctx.beginPath();
                                ctx.moveTo(chart.getDatasetMeta(0).data[index].x, chart.getDatasetMeta(0).data[index].y);
                                //@ts-ignore
                                ctx.lineTo(chart.getDatasetMeta(0).data[index].x, y.getPixelForValue(dataPoint.l));
                                ctx.strokeStyle = color;
                                ctx.stroke();
                            });
                        }
                    };
                    width = 1400;
                    height = 700;
                    configuration = {
                        type: 'bar',
                        data: {
                            datasets: [{
                                    data: data,
                                    backgroundColor: function (ctx) {
                                        var color;
                                        if (ctx.raw.o <= ctx.raw.c) {
                                            color = 'rgba(11, 156, 49, 1)';
                                        }
                                        else {
                                            color = 'rgba(255, 0, 0, 1)';
                                        }
                                        ;
                                        return color;
                                    },
                                    borderColor: 'rgba(0, 0, 0, 1)',
                                    borderWidth: 1,
                                    borderSkipped: false
                                }]
                        },
                        options: {
                            responsive: true,
                            parsing: {
                                xAxisKey: 'x',
                                yAxisKey: 's',
                            },
                            scales: {
                                x: {
                                    type: 'timeseries',
                                    beginAtZero: false,
                                    ticks: {
                                        font: {
                                            size: 16,
                                            weight: '800',
                                        },
                                        backdropPadding: 20
                                    },
                                    //@ts-ignore
                                    min: new Date(minDate - 3000000),
                                    //@ts-ignore
                                    max: new Date(maxDate + 3000000),
                                },
                                y: {
                                    type: 'linear',
                                    position: 'right',
                                    beginAtZero: false,
                                    ticks: {
                                        font: {
                                            size: 16,
                                            weight: '800',
                                        },
                                        padding: 20,
                                        callback: function (value, index, values) {
                                            // Форматирование чисел без научной нотации
                                            return value.toLocaleString('en-US', { maximumFractionDigits: 20 });
                                        }
                                    },
                                    suggestedMax: maxValue,
                                    suggestedMin: minValue,
                                },
                            },
                            watermark: {
                                text: 'asdasdasd',
                                color: 'pink'
                            },
                        },
                        plugins: [candleStick]
                    };
                    chartCallback = function (ChartJS) {
                        ChartJS.defaults.responsive = true;
                        ChartJS.defaults.maintainAspectRatio = false;
                    };
                    chartJSNodeCanvas = new chartjs_node_canvas_1.ChartJSNodeCanvas({ width: width, height: height, plugins: {
                            modern: [require('chartjs-adapter-date-fns'), require('chartjs-plugin-watermark')]
                        }, chartCallback: chartCallback });
                    return [4 /*yield*/, chartJSNodeCanvas.renderToBuffer(configuration)];
                case 3:
                    buffer = _a.sent();
                    (0, fs_1.writeFileSync)('./public/canvas.png', buffer, 'base64');
                    return [2 /*return*/, ('canvas.png')];
            }
        });
    });
}
exports.default = createChart;
