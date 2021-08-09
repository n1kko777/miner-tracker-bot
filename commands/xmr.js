const { Markup } = require("telegraf");
const { getAllXmrPoolData, formatXmrValue } = require("../utils");

const inlineButtonConfig = {
  parse_mode: "HTML",
  ...Markup.inlineKeyboard([
    [Markup.button.callback("Update", "updateXmrPool")],
    [Markup.button.callback("Add Pool", "addXmrPool")],
    [Markup.button.callback("Remove Pool", "removeXmrPool")],
  ]),
};

const fetchAllXmrPoolData = async (xmrPools) => {
  const avaiablePools = [];

  await getAllXmrPoolData(
    xmrPools.map(
      (el) => `https://web.xmrpool.eu:8119/stats_address?address=${el}`
    )
  )
    .then((resp) => {
      resp
        .filter((el) => el.success)
        .forEach(({ data: { balance, last_reward, paid, hashrate } }) => {
          avaiablePools.push(`
Pending Balance: ${formatXmrValue(balance)} XMR
Last Block Reward: ${formatXmrValue(last_reward)} XMR
Total Paid: ${formatXmrValue(paid)} XMR
Hash Rate: ${hashrate}/s
              `);
        });
    })
    .catch((e) => {
      console.log(e);
    });

  return avaiablePools;
};

const xmr = async (ctx) => {
  if (!ctx.session.xmr || !ctx.session.xmr.length) {
    return await ctx.reply(
      "<b>XMR Pool</b>\n\nNo data to view...",
      inlineButtonConfig
    );
  }
  const { message_id } = await ctx.reply("Getting data...");
  const avaiablePools = await fetchAllXmrPoolData(ctx.session.xmr);

  ctx.deleteMessage(message_id);
  return await ctx.reply(
    `<b>XMR Pool</b>\n${avaiablePools.join("\n=====================\n")}`,
    inlineButtonConfig
  );
};

module.exports = {
  xmr,
  fetchAllXmrPoolData,
};
