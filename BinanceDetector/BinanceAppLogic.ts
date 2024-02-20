import { getSymbols, checkMarket, getCandleStickData } from "./BinanceApp";
import {
  SymbolType,
  SymbolDataType,
  CandleStickDataType,
} from "./Types/DataTypesForLogic";

const MarketData: SymbolDataType[] = [];
const coinsThatHaveChart: {
  coinName: string;
  chartId: string;
  createdTime: number;
}[] = [];
const intervalTime = 20000;
// const hourInUNIXtimestamp = 60000 * 60;
// const percent = 0.05;
const hourInUNIXtimestamp = 200 * 60;
const percent = 0.00001;

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
    console.log("working ", (intervalTime * count) / 60000, " minutes");
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

async function requestToCreateChart(
  candleStickData: CandleStickDataType[],
  coinName: SymbolType
) {
  console.log(candleStickData);
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
    .then((data) => {
      console.log(data);
      //specific for binance
      postImageInChannel(
        data.imageURL,
        coinName.slice(0, -3),
        (Number(candleStickData[candleStickData.length - 1][2]) -
          Number(candleStickData[0][2])) /
          Number(candleStickData[0][2])
      );
      coinsThatHaveChart.push({
        coinName: coinName,
        chartId: data.imageId,
        createdTime: new Date().getDate(),
      });
    })
    .catch((e) => console.error("chart create error", e));
}

function checkCoinsCurrencyChange() {
  MarketData.map(async (coin) => {
    const coinPricesArrayLastElementIndex = coin.prices.length - 1;
    //проверка есть ли уже цены часовой давности
    if (
      coin.prices[coinPricesArrayLastElementIndex].time - coin.prices[0].time >
      hourInUNIXtimestamp
    ) {
      // проверка есть ли уже график у монеты
      if (
        coinsThatHaveChart.findIndex(
          (chart) => chart.coinName === coin.symbol
        ) === -1
      ) {
        const hourAgoPrice = coin.prices[0].price;
        const modernPrice = coin.prices[coin.prices.length - 1].price;
        if ((modernPrice - hourAgoPrice) / hourAgoPrice > percent) {
          const candleStickData: CandleStickDataType[] =
            await getCandleStickData(coin.symbol);
          // check is coin open price and close price are the same
          const onePercentOfChartSize = getOnePercentOfChart(candleStickData);
          candleStickData.forEach((item) => {
            if (item[1] === item[4]) {
              item[4] = Number(item[4]) + onePercentOfChartSize + "";
            }
          });

          const response = await requestToCreateChart(
            candleStickData,
            coin.symbol
          );
        }
      }
    }
  });
}

function clearExpiredPrices() {
  MarketData.forEach((coin) => {
    const coinPricesArrayLastElementIndex = coin.prices.length - 1;
    if (
      coin.prices[coinPricesArrayLastElementIndex].time - coin.prices[0].time >
      hourInUNIXtimestamp
    ) {
      coin.prices.shift();
      console.log(coin.prices.shift());
    }
  });
}

function getOnePercentOfChart(chartData: CandleStickDataType[]) {
  let maxHigh = Number(chartData[0][2]);
  let minLow = Number(chartData[0][3]);
  for (let i = 0; i < chartData.length; i++) {
    if (Number(chartData[i][2]) > maxHigh) {
      maxHigh = Number(chartData[i][2]);
    }
    if (Number(chartData[i][3]) < minLow) {
      minLow = Number(chartData[i][3]);
    }
  }
  const onePercent = (maxHigh - minLow) / 100;
  return onePercent;
}

function postImageInChannel(imgUrl, coinName, change) {
  // fetch(
  //   encodeURI(
  //     `https://api.telegram.org/bot6749257932:AAGR51Jcg0JNnrKWWd0RuEQI359uHtTlSy0/sendPhoto?chat_id=-1002068113504&parse_mode=MarkdownV2&photo=${imgUrl}&caption=${coinName}/BTC\\n24h: +${
  //       change * 100
  //     }%\\n
  //     [inline URL](http://www.example.com/)`
  //   )
  // ).catch((e) => console.error("error posting image in channel", e));

  // fetch(
  //   encodeURI(
  //     `https://api.telegram.org/bot6749257932:AAGR51Jcg0JNnrKWWd0RuEQI359uHtTlSy0/sendPhoto?chat_id=-1002068113504&parse_mode=MarkdownV2&photo=${imgUrl}&caption=${coinName}/BTC\\n24h: +${
  //       change * 100
  //     }%\\n
  //     [inline URL](http://www.example.com/)`
  //   )
  // ).catch((e) => console.error("error posting image in channel", e));
  fetch(
    encodeURI(
      `https://api.telegram.org/bot6749257932:AAGR51Jcg0JNnrKWWd0RuEQI359uHtTlSy0/sendPhoto?chat_id=-1002068113504&photo=${imgUrl}&caption=${coinName}/BTC\\n24h: +${
        change * 100
      }%\\n 
    [inline URL](http://www.example.com/)`
    )
  ).catch((e) => console.error("error posting image in channel", e));
}

main();
