const { Telegraf, Markup } = require("telegraf");
const { session } = require("telegraf-session-mongodb");
const { start } = require("./commands/start");
const { help } = require("./commands/help");

const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error("BOT_TOKEN must be provided!");
}

const bot = new Telegraf(token);

const setup = (db) => {
  // session middleware MUST be initialized
  // before any commands or actions that require sessions
  bot.use(session(db));
  bot.use(Telegraf.log());

  bot.start(start);
  bot.hears("Help", help);

  //   bot.command("/increment", async (ctx) => {
  //     const count = (ctx.session.count || 0) + 1;

  //     await ctx.reply(`Count: ${count}`);

  //     ctx.session.count = count;
  //   });

  //   bot.command("/callback", async (ctx) => {
  //     await ctx.reply("Inline keyboard with callback", {
  //       reply_markup: {
  //         inline_keyboard: [
  //           [{ text: "Increment", callback_data: "increment_counter" }],
  //         ],
  //       },
  //     });
  //   });

  //   bot.on("callback_query", async (ctx) => {
  //     const count = (ctx.session.count || 0) + 1;

  //     // editMessageText
  //     // console.log(`Callback Query ${ctx.from.id}: ${count}`);

  //     await ctx.answerCbQuery();

  //     ctx.session.count = count;
  //   });

  return bot;
};

module.exports = {
  setup,
};
