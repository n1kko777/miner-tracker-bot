const { Markup } = require("telegraf");

const start = async (ctx) => {
  if (!ctx.session.bio) {
    ctx.session.bio = ctx.message.from;
  }

  return await ctx.reply(
    "Description coming soon...",
    Markup.keyboard([["Dashboard"], ["Binance Pool", "XMR Pool"], ["Help"]])
      .oneTime()
      .resize()
  );
};

module.exports = {
  start,
};
