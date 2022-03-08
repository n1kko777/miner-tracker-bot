require("dotenv").config();
const fastify = require("fastify");
const path = require("path");

const { MongoClient } = require("mongodb");
const { setup } = require("./bot");

const PORT = process.env.PORT;
const WEBHOOK_URL = process.env.URL;
const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_ID = process.env.ADMIN_ID;

const app = fastify();

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
  app.post(SECRET_PATH, (req, rep) => bot.handleUpdate(req.body, rep.raw));

  bot.catch((error) => {
    console.log("error", error);
    bot.telegram.sendMessage(ADMIN_ID, `Error executing a command: ${error}`);
  });

  bot.telegram.setWebhook(WEBHOOK_URL + SECRET_PATH).then(() => {
    console.log("Webhook is set on", WEBHOOK_URL);
  });

  app.listen(PORT).then(() => {
    console.log("Listening on port", PORT);
  });
};

initialize();
