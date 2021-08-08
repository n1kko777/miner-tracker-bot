const { Scenes } = require("telegraf");
const { xmr } = require("../commands/xmr");

const removeXmrPoolWizard = new Scenes.WizardScene(
  "remove-xmr-pool",
  async (ctx) => {
    const xmrPools = ctx?.session?.xmr || [];

    if (xmrPools.length) {
      await ctx.reply("Send me your XMR address\n\nor type 'cancel' to leave");
    } else {
      await ctx.reply("No addresses to delete");

      return ctx.scene.leave();
    }

    return ctx.wizard.next();
  },
  async (ctx) => {
    const deleteAddress = (await ctx.message?.text) || "";

    if (deleteAddress === "cancel") {
      await ctx.reply("Canceled");

      return ctx.scene.leave();
    }

    const { message_id } = await ctx.reply("Checking address...");

    try {
      const xmrPools = ctx?.session?.xmr || [];

      if (xmrPools.includes(deleteAddress)) {
        ctx.session.xmr = xmrPools.filter((el) => el !== deleteAddress);
      } else {
        throw new Error("Address wasn't found");
      }
    } catch (error) {
      ctx.deleteMessage(message_id);
      await ctx.reply(`${error}`);
      ctx.wizard.back();
      return ctx.wizard.steps[ctx.wizard.cursor](ctx);
    }
    ctx.deleteMessage(message_id);

    await ctx.reply(`Done!`);
    xmr(ctx);

    return await ctx.scene.leave();
  }
);

const removeXmrPool = async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter("remove-xmr-pool");
};

module.exports = {
  removeXmrPool,
  removeXmrPoolWizard,
};
