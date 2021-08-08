const { Markup } = require("telegraf");

const inlineButtonConfig = {
  parse_mode: "HTML",
  ...Markup.inlineKeyboard([
    Markup.button.callback("Add Pool", "addBinancePool"),
  ]),
};

const binance = async (ctx) => {
  if (!ctx.session.binance) {
    return await ctx.reply(
      "<b>Binance Pool</b>\n\nNo data to view...",
      inlineButtonConfig
    );
  }

  return await ctx.reply("Description coming soon...");
};

module.exports = {
  binance,
};
