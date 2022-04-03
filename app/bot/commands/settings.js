const { Markup } = require("telegraf");

const inlineButtonConfig = {
  parse_mode: "HTML",
  ...Markup.inlineKeyboard([
    [Markup.button.callback("Set Time Zone", "setTimeZone")],
    [
      Markup.button.callback(
        "Enable / disable notifications",
        "switchNotifications"
      ),
    ],
  ]),
};

const settings = async (ctx) => {
  return await ctx.reply(
    `<b>Settings</b>\n\nTime Zone: ${
      ctx?.session?.settings?.tz || "+00:00"
    }\nNotification: ${
      ctx?.session?.settings?.notification
        ? "every " + ctx?.session?.settings?.notification + " min."
        : "off"
    }`,
    inlineButtonConfig
  );
};

module.exports = {
  settings,
};
