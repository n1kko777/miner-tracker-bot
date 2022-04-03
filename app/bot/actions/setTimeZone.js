const { Scenes } = require("telegraf");
const { settings } = require("../commands/settings");

const setTimeZoneWizard = new Scenes.WizardScene(
  "set-time-zone",
  async (ctx) => {
    await ctx.reply(
      "Send your current Time zone like <b>+00:00</b>. If you don't know it, visit: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones\n\nor type 'cancel' to leave",
      {
        parse_mode: "HTML",
      }
    );

    return ctx.wizard.next();
  },
  async (ctx) => {
    const selectedTz = (await ctx?.message?.text) || "";

    if (selectedTz === "cancel") {
      await ctx.reply("Canceled");

      return ctx.scene.leave();
    }

    if (selectedTz.match(/^(?:Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])$/)) {
      ctx.session.settings.tz = selectedTz;
      await ctx.reply(`Done!`);
      settings(ctx);

      return await ctx.scene.leave();
    }

    await ctx.reply("Time zone is incorrect");

    return ctx.reply(
      "Send your current Time zone like <b>+00:00</b>. If you don't know it, visit: http://www.csgnetwork.com/directdetecttimezonelist.html\n\nor type 'cancel' to leave",
      {
        parse_mode: "HTML",
      }
    );
  }
);

const setTimeZone = async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter("set-time-zone");
};

module.exports = {
  setTimeZone,
  setTimeZoneWizard,
};
