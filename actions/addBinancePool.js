const { Scenes } = require("telegraf");
const axios = require("axios");

const addBinancePoolWizard = new Scenes.WizardScene(
  "add-binance-pool",
  async (ctx) => {
    await ctx.reply(
      "Send me binance pool 'Watcher Link'\n\nor type 'cancel' to leave"
    );

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

      const newToken = poolLink.split("urlParams=")[1];

      if (!newToken) {
        throw new Error("Link is incorrect or can't access data");
      }

      if (binancePools.map((el) => el.token).includes(newToken)) {
        throw new Error("Link already exist");
      }

      const res = await axios.get(
        `https://pool.binance.com/mining-api/v1/public/pool/stat?observerToken=${newToken}`
      );

      if (res.status === 200 && res.data.data) {
        binancePools.push(newToken);
        ctx.session.binance = binancePools;
      } else {
        throw new Error("Link is incorrect or can't access data");
      }
    } catch (error) {
      ctx.deleteMessage(message_id);
      await ctx.reply(`${error}`);
      ctx.wizard.back();
      return ctx.wizard.steps[ctx.wizard.cursor](ctx);
    }
    ctx.deleteMessage(message_id);

    await ctx.reply(`Done!`);
    return await ctx.scene.leave();
  }
);

const addBinancePool = async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter("add-binance-pool");
};

module.exports = {
  addBinancePool,
  addBinancePoolWizard,
};
