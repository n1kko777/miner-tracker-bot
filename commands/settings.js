const { Markup } = require("telegraf");

const inlineButtonConfig = {
  parse_mode: "HTML",
  ...Markup.inlineKeyboard([
    [Markup.button.callback("Set Time Zone", "setTimeZone")],
  ]),
};

const settings = async (ctx) => {
  return await ctx.reply(
    `<b>Settings</b>\n\nTime Zone: ${ctx?.session?.settings?.tz || "00:00"}`,
    inlineButtonConfig
  );
};

module.exports = {
  settings,
};
