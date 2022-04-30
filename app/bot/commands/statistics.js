const { MongoClient } = require("mongodb");
const { ADMIN_ID, MONGODB_URI } = process.env;

const statistics = async (ctx) => {
  if (ctx.message.from.id.toString() !== ADMIN_ID.toString()) {
    return;
  }

  const { message_id } = await ctx.reply("Getting data...");

  return await MongoClient.connect(MONGODB_URI, async (err, db) => {
    if (err) throw err;

    const dbo = db.db();
    const users = dbo.collection("sessions");
    const result = await users.find({}).toArray();
    db.close();

    if (!result.length) {
      await ctx.deleteMessage(message_id);
      return await ctx.reply("No data...");
    }

    await ctx.deleteMessage(message_id);
    return await ctx.reply(
      `<b>Statistics</b>\n\nTotal users: ${result.length}\nActive users: ${
        result.filter(
          (el) => el?.data?.binance?.length || el?.data?.xmr?.length
        ).length
      }\n– Binance pools: ${
        result.filter((el) => el?.data?.binance?.length).length
      }\n– Xmr pools: ${
        result.filter((el) => el?.data?.xmr?.length).length
      }\nSubscribers: ${
        result.filter((el) => el?.data?.bio?.payer_email).length
      }`,
      {
        parse_mode: "HTML",
      }
    );
  });
};

module.exports = {
  statistics,
};
