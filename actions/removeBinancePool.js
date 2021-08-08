const { Scenes } = require("telegraf");
const { binance } = require("../commands/binance");

const removeBinancePoolWizard = new Scenes.WizardScene(
  "remove-binance-pool",
  async (ctx) => {
    const binancePools = ctx?.session?.binance || [];

    if (binancePools.length) {
      await ctx.reply(
        "Send me binance pool 'Watcher Link'\n\nor type 'cancel' to leave"
      );
    } else {
      await ctx.reply("No pool to delete");

      return ctx.scene.leave();
    }

    return ctx.wizard.next();
  },
  async (ctx) => {
    const poolLink = (await ctx.message?.text) || "";

    if (poolLink === "cancel") {
      await ctx.reply("Canceled");

      return ctx.scene.leave();
    }

    const { message_id } = await ctx.reply("Checking link...");

    try {
      const binancePools = ctx?.session?.binance || [];

      const deleteToken = poolLink.split("urlParams=")[1];

      if (!deleteToken) {
        throw new Error("Link is incorrect or can't access data");
      }

      if (binancePools.includes(deleteToken)) {
        ctx.session.binance = binancePools.filter((el) => el !== deleteToken);
      } else {
        throw new Error("No link was found");
      }
    } catch (error) {
      ctx.deleteMessage(message_id);
      await ctx.reply(`${error}`);
      ctx.wizard.back();
      return ctx.wizard.steps[ctx.wizard.cursor](ctx);
    }
    ctx.deleteMessage(message_id);

    await ctx.reply(`Done!`);
    binance(ctx);

    return await ctx.scene.leave();
  }
);

const removeBinancePool = async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter("remove-binance-pool");
};

module.exports = {
  removeBinancePool,
  removeBinancePoolWizard,
};
