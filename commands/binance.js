const moment = require("moment");
const { Markup } = require("telegraf");
const { getAllBinancePoolData, formatHash } = require("../utils");

const inlineButtonConfig = {
  parse_mode: "HTML",
  ...Markup.inlineKeyboard([
    [Markup.button.callback("Update", "updateBinancePool")],
    [Markup.button.callback("Add Pool", "addBinancePool")],
    [Markup.button.callback("Remove Pool", "removeBinancePool")],
    [Markup.button.url("View in browser", "pool.binance.com")],
  ]),
};

const fetchAllBinancePoolData = async (binancePools = []) => {
  const avaiablePools = [];

  await getAllBinancePoolData(
    binancePools.map(
      (el) =>
        `https://pool.binance.com/mining-api/v1/public/pool/stat?observerToken=${el}`
    )
  )
    .then((resp) => {
      resp
        .filter((el) => el.success)
        .forEach(
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

  return avaiablePools;
};

const fetchAllBinanceWorkerDatas = async (binancePools = [], tz) => {
  const signal = {
    0: "",
    1: "🟢",
    2: "🔴",
    3: "️⚪",
  };

  const avaiablePools = [];

  await getAllBinancePoolData(
    binancePools.map(
      (el) =>
        `https://pool.binance.com/mining-api/v1/public/pool/miner/index?groupId=-2&observerToken=${el}&pageIndex=1&searchWorkerName=&sort=0&sortColumn=1&workerStatus=0&pageSize=100`
    )
  )
    .then((resp) => {
      resp
        .filter((el) => el.success)
        .forEach(({ data: { workerDatas } }) => {
          workerDatas.forEach(
            ({ status, workerName, hashRate, dayHashRate, lastShareTime }) => {
              avaiablePools.push(`\n${signal[status]} <b>${workerName}</b>
Real-Hashrate: ${formatHash(parseFloat(hashRate))}
Day-Hashrate: ${formatHash(parseFloat(dayHashRate))}
Last share time: ${moment(new Date(lastShareTime)).utcOffset(tz)}`);
            }
          );
        });
    })
    .catch((e) => {
      console.log(e);
    });

  return avaiablePools;
};

const binance = async (ctx) => {
  if (!ctx.session.binance || !ctx.session.binance.length) {
    return await ctx.reply(
      "<b>Binance Pool</b>\n\nNo data to view...",
      inlineButtonConfig
    );
  }

  const { message_id } = await ctx.reply("Getting data...");
  const avaiablePools = await fetchAllBinanceWorkerDatas(
    ctx.session.binance,
    ctx.session.settings.tz
  );

  ctx.deleteMessage(message_id);
  return await ctx.reply(
    `<b>Binance Pool</b>\n${avaiablePools.join("\n=====================\n")}`,
    inlineButtonConfig
  );
};

module.exports = {
  binance,
  fetchAllBinancePoolData,
  fetchAllBinanceWorkerDatas,
};
