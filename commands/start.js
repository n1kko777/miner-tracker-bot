const { Markup } = require("telegraf");

const start = async (ctx) => {
  if (!ctx.session.bio) {
    ctx.session.bio = { ...ctx.message.from, payer_email: null };
    ctx.session.binance = [];
    ctx.session.xmr = [];
    ctx.session.settings = {
      tz: "+00:00",
      notification: null,
    };
  }

  return await ctx.reply(
    `Bot help you track your mining Binance and Xmr pool.

Register on the Binance Pool and get lifetime Cashback of 20%, only when registering via the link:
https://accounts.binance.com/ru/register?ref=BYJ46M9G

Buy me a coffee:
https://www.buymeacoffee.com/n1kko777`,
    Markup.keyboard([
      ["Dashboard"],
      ["Binance Pool", "XMR Pool"],
      ["Settings", "Help"],
    ]).resize()
  );
};

module.exports = {
  start,
};
