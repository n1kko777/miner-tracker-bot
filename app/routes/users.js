const { listUsers } = require("../controllers/users.controller");

async function routes(fastify, options) {
  fastify.get("/users", listUsers);
}
module.exports = routes;
