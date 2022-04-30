const path = require("path");
const fastify = require("fastify");
const { MongoClient } = require("mongodb");
const { setup } = require("./bot");

const { BOT_TOKEN, URL: WEBHOOK_URL, MONGODB_URI, ADMIN_ID } = process.env;
const PORT = process.env.PORT || 3000;

if (!WEBHOOK_URL) throw new Error('"WEBHOOK_URL" env var is required!');
if (!BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is required!');

const initialize = async () => {
  const app = fastify({ logger: true });

  app.register(require("fastify-static"), {
    root: path.join(__dirname, "./static"),
  });

  const db = (
    await MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  ).db();

  const bot = setup(db);

  const SECRET_PATH = `/telegraf/${bot.secretPathComponent()}`;

  app.post(SECRET_PATH, (req, rep) => bot.handleUpdate(req.body, rep.raw));

  bot.telegram.setWebhook(WEBHOOK_URL + SECRET_PATH).then(() => {
    console.log("Webhook is set on", WEBHOOK_URL);
  });

  bot.catch((error) => {
    console.log("error", error);
    bot.telegram.sendMessage(ADMIN_ID, `Error executing a command: ${error}`);
  });

  app.listen(PORT, "0.0.0.0").then(() => {
    console.log("Listening on port", PORT);
  });
};

initialize();
