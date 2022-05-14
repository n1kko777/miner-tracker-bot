const { Markup } = require("telegraf");
const { ADMIN_ID } = process.env;

const inlineButtonConfig = {
  parse_mode: "HTML",
  ...Markup.inlineKeyboard([
    [Markup.button.callback("Update Subscription", "updateSubscription")],
  ]),
};

const statistics = async (ctx) => {
  if (ctx.message.from.id.toString() !== ADMIN_ID.toString()) {
    return;
  }

  const { message_id } = await ctx.reply("Getting data...");

  // TODO: Fastify API

  if (!result?.length) {
    await ctx.deleteMessage(message_id);
    return await ctx.reply("No data...");
  }

  await ctx.deleteMessage(message_id);
  return await ctx.reply(
    `<b>Admin Panel</b>\n\nTotal users: ${result.length}\nActive users: ${
      result.filter((el) => el?.data?.binance?.length || el?.data?.xmr?.length)
        .length
    }\n– Binance pools: ${
      result.filter((el) => el?.data?.binance?.length).length
    }\n– Xmr pools: ${
      result.filter((el) => el?.data?.xmr?.length).length
    }\nSubscribers: ${
      result.filter((el) => el?.data?.bio?.payer_email).length
    }`,
    inlineButtonConfig
  );
};

module.exports = {
  statistics,
};
