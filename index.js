require("dotenv").config();

const { MongoClient } = require("mongodb");
const { setup } = require("./bot");

const URL = process.env.URL || "";
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const BOT_TOKEN = process.env.BOT_TOKEN;

const initialize = async () => {
  const db = (
    await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  ).db();
  const bot = setup(db);

  bot.launch({
    webhook: {
      domain: `${URL}/bot${BOT_TOKEN}`,
      port: PORT,
    },
  });

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
};

initialize();
