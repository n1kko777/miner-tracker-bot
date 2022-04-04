const ObjectID = require("mongodb").ObjectID;

const COLLECTION_NAME = "sessions";

async function listUsers(req, reply) {
  try {
    const users = this.mongo.db.collection(COLLECTION_NAME);
    const result = await users.find({}).toArray();
    reply.code(200).send(result);
  } catch (error) {
    reply.code(500).send(error);
  }
}

async function getUser(req, reply) {
  try {
    const users = this.mongo.db.collection(COLLECTION_NAME);
    const result = await users.findOne({ _id: new ObjectID(req.params.id) });

    if (result) {
      return reply.code(200).send(result);
    }

    reply.code(204).send({ message: "Not found" });
  } catch (error) {
    reply.code(500).send(error);
  }
}

async function updateUser(req, reply) {
  try {
    const users = this.mongo.db.collection(COLLECTION_NAME);
    const user = await users.findOne({ _id: new ObjectID(req.params.id) });

    const { payer_email, tz, notification, binance, xmr } = req.body;
    const updateDoc = {
      $set: {
        "data.bio.payer_email": payer_email || user.data.bio.payer_email,
        "data.binance": binance || user.data.binance,
        "data.xmr": xmr || user.data.xmr,
        "data.settings.notification":
          notification || user.data.settings.notification,
        "data.settings.tz": tz || user.data.settings.tz,
      },
    };
    const result = await users.updateOne(
      { _id: ObjectID(req.params.id) },
      updateDoc,
      { upsert: true }
    );
    reply.send({
      message: `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
    });
  } catch (error) {
    reply.code(500).send(error);
  }
}

async function deleteUser(req, reply) {
  try {
    const users = this.mongo.db.collection(COLLECTION_NAME);
    const result = await users.deleteOne({ _id: ObjectID(req.params.id) });
    if (result.deletedCount) return reply.send("Deleted");

    reply.code(500).send("Could not delete.");
  } catch (error) {
    reply.code(500).send(error);
  }
}

module.exports = { listUsers, getUser, updateUser, deleteUser };
