require("dotenv").config();

const schedule = require("node-schedule");

const { MongoClient } = require("mongodb");
const { setup } = require("./bot");

const URL = process.env.URL || "";
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;

const initialize = async () => {
  const db = (
    await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  ).db();
  const bot = setup(db);

  bot.catch((error) => {
    console.log("error", error);
    bot.telegram.sendMessage(ADMIN_ID, `Error executing a command: ${error}`);
  });

  bot.launch({
    webhook: {
      domain: `${URL}/bot${BOT_TOKEN}`,
      port: PORT,
    },
  });

  // Enable graceful stop
  process.once("SIGINT", () => {
    schedule.gracefulShutdown();
    return bot.stop("SIGINT");
  });
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
};

initialize();
