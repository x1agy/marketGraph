const imgUrl =
  "https://i.ibb.co/303v0yk/4c2e1870-b6f1-4afc-a0a2-eaa3dd3f12f0.png";
const coinName = "beb";
const change = 0.05;

console.log(
  encodeURI(
    `https://api.telegram.org/bot6749257932:AAGR51Jcg0JNnrKWWd0RuEQI359uHtTlSy0/sendPhoto?chat_id=-1002068113504&parse_mode=MarkdownV2&photo=${imgUrl}&caption=${coinName}/BTC\\n24h: +${
      change * 100
    }%\\n
    [inline URL](http://www.example.com/)`
  )
);
