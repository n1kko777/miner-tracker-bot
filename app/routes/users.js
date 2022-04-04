const {
  listUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/users.controller");

async function routes(fastify, options) {
  fastify.get("/users", listUsers);
  fastify.get("/users/:id", getUser);
  fastify.put("/users/:id", updateUser);
  fastify.delete("/users/:id", deleteUser);
}

module.exports = routes;
