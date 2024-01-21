import { getSymbols, checkMarket, getCandleStickData } from "./BinanceApp";
import { SymbolType, SymbolDataType, CandleStickDataType } from "./Types/DataTypesForLogic";

const MarketData: SymbolDataType[] = [];
const coinsThatHaveChart: {
  coinName: string;
  chartId: string;
  createdTime: number;
}[] = [];
const intervalTime = 30000;

let count = 0;

async function main() {
  console.log("start");
  const symbols: SymbolType[] = await getSymbols();
  setInterval(async () => {
    const newMarketData = await checkMarket(symbols);
    addNewDataToMarketData(newMarketData);
    checkCoinsCurrencyChange();
    clearExpiredPrices();
    count++;
    console.log('working ', (intervalTime * count) / 60000, ' minutes')
    console.log(MarketData[0].prices[0])
  }, intervalTime);
}

function addNewDataToMarketData(newData) {
  newData.map((coinData) => {
    const coinIndex = MarketData.findIndex(
      (item) => item.symbol === coinData.symbol
    );
    if (coinIndex !== -1) {
      MarketData[coinIndex].prices.push({
        price: coinData.price,
        time: new Date().getTime(),
      });
    } else {
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

async function requestToCreateChart(candleStickData: CandleStickDataType[], coinName: SymbolType) {
  console.log("createChart");
  const chartGeneratorUrl = "http://localhost:5000/createChart";
  console.log(coinName)
  fetch(chartGeneratorUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      candleStickData,
      authToken: "47a8e376-2abb-452a-a96c-bc8ea4cf9f7e",
      watermark: "@binance_pump_detector",
      coinName: coinName
    }),
  })
    .then((response) => response.json())
    .then((imageId) =>
      coinsThatHaveChart.push({
        coinName: coinName,
        chartId: imageId,
        createdTime: new Date().getDate(),
      })
    )
    .catch((e) => console.error("chart create error", e));
}

function checkCoinsCurrencyChange() {
  MarketData.map(async (coin) => {
    const coinPricesArrayLastElementIndex = coin.prices.length - 1;
    const hourInUNIXtimestamp = 60000 * 60;
    //проверка есть ли уже цены часовой давности
    if (coin.prices[coinPricesArrayLastElementIndex].time - coin.prices[0].time > hourInUNIXtimestamp) {
      // проверка есть ли уже график у монеты
      if (
        coinsThatHaveChart.findIndex(
          (chart) => chart.coinName === coin.symbol
        ) === -1
      ) {
        const hourAgoPrice = coin.prices[0].price;
        const modernPrice = coin.prices[coin.prices.length - 1].price;
        if (((hourAgoPrice - modernPrice) / hourAgoPrice) * -1 > 5) {
          const candleStickData: CandleStickDataType[] = await getCandleStickData(coin.symbol);
          // check is coin open price and close price are the same
          const onePercentOfChartSize = getOnePercentOfChart(candleStickData);
          candleStickData.forEach(item => {
            if (item[1] === item[4]) {
              item[4] = (Number(item[4]) + onePercentOfChartSize) + '';
            }
          });

          requestToCreateChart(candleStickData, coin.symbol);
        }
      }
    }
  });
}

function clearExpiredPrices() {
  MarketData.forEach((coin) => {
    const coinPricesArrayLastElementIndex = coin.prices.length - 1;
    const hourInUNIXtimestamp = 60000 * 60;
    if (coin.prices[coinPricesArrayLastElementIndex].time - coin.prices[0].time > hourInUNIXtimestamp) {
      coin.prices.shift();
      console.log(coin.prices.shift())
    }
  });
}

function getOnePercentOfChart(chartData: CandleStickDataType[]){
  let maxHigh = Number(chartData[0][2]);
  let minLow = Number(chartData[0][3]);
  for(let i = 0; i < chartData.length; i++){
    if(Number(chartData[i][2]) > maxHigh){
      maxHigh = Number(chartData[i][2]);
    }
    if(Number(chartData[i][3]) < minLow){
      minLow = Number(chartData[i][3])
    }
  }
  const onePercent = (maxHigh - minLow) / 100;
  return onePercent
}

main();
