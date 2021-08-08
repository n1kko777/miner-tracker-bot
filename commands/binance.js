const { Markup } = require("telegraf");
const { getAllData, formatHash } = require("../utils");

const inlineButtonConfig = {
  parse_mode: "HTML",
  ...Markup.inlineKeyboard([
    [Markup.button.callback("Update", "updateBinancePool")],
    [Markup.button.callback("Add Pool", "addBinancePool")],
  ]),
};

const binance = async (ctx) => {
  if (!ctx.session.binance) {
    return await ctx.reply(
      "<b>Binance Pool</b>\n\nNo data to view...",
      inlineButtonConfig
    );
  }

  const avaiablePools = [];

  await getAllData(
    ctx.session.binance.map(
      (el) =>
        `https://pool.binance.com/mining-api/v1/public/pool/stat?observerToken=${el}`
    )
  )
    .then((resp) => {
      resp.forEach(
        ({
          data: {
            hashRate,
            dayHashRate,
            validNum,
            invalidNum,
            profitToday,
            profitYesterday,
          },
        }) => {
          let profitTodayText = "";

          Object.entries(profitToday).forEach((coin) => {
            const coinName = coin[0];
            const coinValue = coin[1];

            profitTodayText += `\n  - ${coinName}: ${coinValue}`;
          });

          let profitYesterdayText = "";

          Object.entries(profitYesterday).forEach((coin) => {
            const coinName = coin[0];
            const coinValue = coin[1];

            profitYesterdayText += `\n  - ${coinName}: ${coinValue}`;
          });

          avaiablePools.push(`
Real-Hashrate: ${formatHash(parseFloat(hashRate))}
Day-Hashrate: ${formatHash(parseFloat(dayHashRate))}
Active devices: ${validNum}
Inactive devices: ${invalidNum}
Profit Today: ${profitTodayText}
Profit Yesterday: ${profitYesterdayText}
  `);
        }
      );
    })
    .catch((e) => {
      console.log(e);
    });

  return await ctx.reply(
    `<b>Binance Pool</b>\n${avaiablePools.join("\n=====================\n")}`,
    inlineButtonConfig
  );
};

module.exports = {
  binance,
};
