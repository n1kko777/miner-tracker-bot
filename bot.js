const { Telegraf, Scenes } = require("telegraf");
const { session } = require("telegraf-session-mongodb");
const { start } = require("./commands/start");
const { help } = require("./commands/help");
const { binance } = require("./commands/binance");
const {
  addBinancePool,
  addBinancePoolWizard,
} = require("./actions/addBinancePool");

const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error("BOT_TOKEN must be provided!");
}

const bot = new Telegraf(token);

const setup = (db) => {
  // session middleware MUST be initialized
  // before any commands or actions that require sessions
  bot.use(session(db));

  const stage = new Scenes.Stage([addBinancePoolWizard]);

  bot.use(stage.middleware());
  bot.use(Telegraf.log());

  bot.start(start);
  bot.hears("Help", help);
  bot.hears("Binance Pool", binance);

  // actions
  bot.action("addBinancePool", addBinancePool);

  return bot;
};

module.exports = {
  setup,
};
