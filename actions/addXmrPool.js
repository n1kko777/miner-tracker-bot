const { Scenes } = require("telegraf");
const axios = require("axios");
const { xmr } = require("../commands/xmr");

const addXmrPoolWizard = new Scenes.WizardScene(
  "add-xmr-pool",
  async (ctx) => {
    await ctx.reply("Send me your XMR address\n\nor type 'cancel' to leave");

    return ctx.wizard.next();
  },
  async (ctx) => {
    const newAddress = (await ctx.message?.text) || "";

    if (newAddress === "cancel") {
      await ctx.reply("Canceled");

      return ctx.scene.leave();
    }

    const { message_id } = await ctx.reply("Checking address...");

    try {
      const xmrPools = ctx?.session?.xmr || [];

      const poolLink = `https://web.xmrpool.eu:8119/stats_address?address=${newAddress}`;

      if (!newAddress) {
        throw new Error("Address is incorrect or can't access data");
      }

      if (xmrPools.includes(newAddress)) {
        throw new Error("Address already exist");
      }

      const res = await axios.get(poolLink);

      if (res.status === 200 && res.data) {
        xmrPools.push(newAddress);
        ctx.session.xmr = xmrPools;
      } else {
        throw new Error("Address is incorrect or can't access data");
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

const addXmrPool = async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter("add-xmr-pool");
};

module.exports = {
  addXmrPool,
  addXmrPoolWizard,
};
