const { Scenes } = require("telegraf");
const { settings } = require("../commands/settings");

const switchNotificationsWizard = new Scenes.WizardScene(
  "switch-notifications",
  async (ctx) => {
    await ctx.reply(
      "How often do I need to check the workers? Send value in minutes.\n\nor type 'cancel' to leave",
      {
        parse_mode: "HTML",
      }
    );

    return ctx.wizard.next();
  },
  async (ctx) => {
    const targetMinutes = (await ctx?.message?.text) || "";

    if (targetMinutes === "cancel") {
      await ctx.reply("Canceled");

      return ctx.scene.leave();
    }

    if (
      !Number.isNaN(targetMinutes.replace(/[^\d]/g, "")) &&
      targetMinutes.replace(/[^\d]/g, "") > 0
    ) {
      ctx.session.settings.notification = targetMinutes.replace(/[^\d]/g, "");
      await ctx.reply(`Done!`);
      settings(ctx);

      return await ctx.scene.leave();
    }

    await ctx.reply(
      "Value is incorrect. Please enter a valid number more then 0."
    );

    return ctx.reply(
      "How often do I need to check the workers? Send value in minutes.\n\nor type 'cancel' to leave",
      {
        parse_mode: "HTML",
      }
    );
  }
);

const switchNotifications = async (ctx) => {
  await ctx.answerCbQuery();
  if (ctx.session.settings.notification) {
    ctx.session.settings.notification = null;
    await ctx.reply(`Done!`);
    return settings(ctx);
  }
  return ctx.scene.enter("switch-notifications");
};

module.exports = {
  switchNotifications,
  switchNotificationsWizard,
};
