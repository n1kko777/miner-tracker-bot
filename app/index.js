// const fastify = require("fastify")({ logger: true });
const fastify = require("fastify");
const telegrafPlugin = require("fastify-telegraf");

const path = require("path");

const { MongoClient } = require("mongodb");
const { setup } = require("./bot");

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_ID = process.env.ADMIN_ID;

const { URL: WEBHOOK_URL } = process.env;
if (!WEBHOOK_URL) throw new Error('"URL" env var is required!');

const app = fastify({ logger: true });

app.register(require("fastify-static"), {
  root: path.join(__dirname, "./static"),
});

const initialize = async () => {
  const db = (
    await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  ).db();

  const bot = setup(db);

  const SECRET_PATH = `/telegraf/${bot.secretPathComponent()}`;

  app.register(telegrafPlugin, { bot, path: SECRET_PATH });

  bot.telegram.setWebhook(WEBHOOK_URL).then(() => {
    console.log("Webhook is set on", WEBHOOK_URL);
  });

  bot.catch((error) => {
    console.log("error", error);
    bot.telegram.sendMessage(ADMIN_ID, `Error executing a command: ${error}`);
  });

  bot.telegram.setWebhook(WEBHOOK_URL).then(() => {
    console.log("Webhook is set on", WEBHOOK_URL);
  });

  app.listen(PORT, "0.0.0.0").then((error) => {
    console.log("Listening on port", PORT);

    if (error) {
      console.log("error", error);
      bot.telegram.sendMessage(ADMIN_ID, `Error executing a command: ${error}`);

      throw error;
    }
  });
};

initialize();
