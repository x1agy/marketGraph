import { getSymbols, checkMarket, getCandleStickData } from "./BinanceApp";
import { SymbolType, SymbolDataType } from "./Types/DataTypesForLogic";

const MarketData: SymbolDataType[] = [];
const coinsThatHaveChart: {
  coinName: string;
  chartId: string;
  createdTime: number;
}[] = [];
const intervalTime = 30000;

async function main() {
  console.log("start");
  const symbols: SymbolType[] = await getSymbols();
  setInterval(async () => {
    const newMarketData = await checkMarket(symbols);
    addNewDataToMarketData(newMarketData);
    checkCoinsCurrencyChange();
    clearExpiredPrices();
    clearExpiredCharts();
    console.log(MarketData.length);
    console.log(MarketData[0]);
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

async function requestToCreateChart(candleStickData, coinName) {
  console.log("createChart");
  const chartGeneratorUrl = "http://localhost:5000/createChart";
  fetch(chartGeneratorUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      candleStickData,
      authToken: "47a8e376-2abb-452a-a96c-bc8ea4cf9f7e",
      watermark: "@binance_pump_detector",
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
    //проверка есть ли уже цены часовой давности
    if (coin.prices.length === 3600 / intervalTime) {
      // проверка есть ли уже график у монеты
      if (
        coinsThatHaveChart.findIndex(
          (chart) => chart.coinName === coin.symbol
        ) === -1
      ) {
        const hourAgoPrice = coin.prices[0].price;
        const modernPrice = coin.prices[coin.prices.length - 1].price;
        if (((hourAgoPrice - modernPrice) / hourAgoPrice) * -1 > 5) {
          const candleStickData = await getCandleStickData(coin.symbol);
          requestToCreateChart(candleStickData, coin.symbol);
        }
      }
    }
  });
}

function clearExpiredPrices() {
  MarketData.map((coin) => {
    if (coin.prices.length > 3600 / intervalTime) {
      coin.prices.shift();
    }
  });
}

function clearExpiredCharts() {
  let expiredChartIndex;
  const chartDeleteUrl = "http://localhost:5000/deleteChart";
  coinsThatHaveChart.map((chart, index) => {
    if (new Date().getDate() - chart.createdTime > 86400) {
      expiredChartIndex = index;
      fetch(chartDeleteUrl, {
        method: "DELETE",
        body: JSON.stringify({
          chartName: chart.chartId,
        }),
      }).catch((e) => console.error("chart delete error ", e));
    }
  });
  if (expiredChartIndex !== undefined) {
    coinsThatHaveChart.splice(expiredChartIndex, 1);
  }
}

main();
