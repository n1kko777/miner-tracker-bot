const { Markup } = require("telegraf");
const { fetchAllBinancePoolData } = require("./binance");
const { fetchAllXmrPoolData } = require("./xmr");

const inlineButtonConfig = {
  parse_mode: "HTML",
  ...Markup.inlineKeyboard([
    [Markup.button.callback("Update", "updateDashboard")],
    [Markup.button.callback("Add Binance Pool", "addBinancePool")],
    [Markup.button.callback("Add Xmr Pool", "addXmrPool")],
  ]),
};

const dashboard = async (ctx) => {
  if (
    (!ctx.session.binance || !ctx.session.binance.length) &&
    (!ctx.session.xmr || !ctx.session.xmr.length)
  ) {
    return await ctx.reply(
      "<b>Dashboard</b>\n\nNo data to view...",
      inlineButtonConfig
    );
  }

  const binancePools = await fetchAllBinancePoolData(ctx.session.binance);

  const xmrPools = await fetchAllXmrPoolData(ctx.session.xmr);

  return await ctx.reply(
    `<b>Dashboard</b>\n\n<b>Binance Pool</b>${
      binancePools?.length
        ? binancePools.join("\n=====================\n")
        : "\nNo data to view...\n"
    }\n<b>Xmr Pool</b>${
      xmrPools?.length
        ? xmrPools.join("\n=====================\n")
        : "\nNo data to view..."
    }`,
    inlineButtonConfig
  );
};

module.exports = {
  dashboard,
};
