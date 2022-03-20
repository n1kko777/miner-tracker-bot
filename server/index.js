const fastify = require("fastify");
const path = require("path");

const PORT = process.env.PORT;

const initialize = () => {
  const app = fastify({ logger: true });

  app.register(require("fastify-static"), {
    root: path.join(__dirname, "./static"),
  });

  app.listen(PORT, "0.0.0.0").then(() => {
    console.log("Listening on port", PORT);
  });
};

initialize();
