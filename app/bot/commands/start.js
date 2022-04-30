const { Markup } = require("telegraf");
const { ADMIN_ID } = process.env;

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

  const keyboard = [
    ["Dashboard"],
    ["Binance Pool", "XMR Pool"],
    ["Settings", "Help"],
  ];

  if (ctx.message.from.id.toString() === ADMIN_ID.toString()) {
    keyboard.push(["Statistics"]);
  }

  return await ctx.reply(
    `Bot help you track your mining Binance and Xmr pool.

Register on the Binance Pool and get lifetime Cashback of 20%, only when registering via the link:
https://accounts.binance.com/en/register?ref=BYJ46M9G

Buy me a coffee:
https://www.buymeacoffee.com/n1kko777`,
    Markup.keyboard(keyboard).resize()
  );
};

module.exports = {
  start,
};
