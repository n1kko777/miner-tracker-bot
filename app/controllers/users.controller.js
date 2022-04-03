async function listUsers(req, reply) {
  try {
    const users = this.mongo.db.collection("sessions");
    const result = await users.find({}).toArray();
    reply.code(200).send(result);
  } catch (error) {
    reply.code(500).send(error);
  }
}

module.exports = { listUsers };
