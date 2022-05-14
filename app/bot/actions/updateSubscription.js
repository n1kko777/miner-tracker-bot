const { Scenes } = require("telegraf");
const { statistics } = require("../commands/statistics");
const { ADMIN_ID } = process.env;

const updateSubscriptionWizard = new Scenes.WizardScene(
  "update-subscription",
  async (ctx) => {
    await ctx.reply("Send user id\n\nor type 'cancel' to leave", {
      parse_mode: "HTML",
    });

    return ctx.wizard.next();
  },
  async (ctx) => {
    const targetUserId = (await ctx?.message?.text) || "";

    if (targetUserId === "cancel") {
      await ctx.reply("Canceled");

      return ctx.scene.leave();
    }

    if (!targetUserId) {
      return ctx.reply("Send user id\n\nor type 'cancel' to leave", {
        parse_mode: "HTML",
      });
    }

    ctx.scene.state.targetUserId = targetUserId;

    const { message_id } = await ctx.reply("Checking for user...");

    // TODO: Fastify API

    await ctx.deleteMessage(message_id);

    if (!user) {
      await ctx.reply("User not found! Please try again");
      return ctx.reply("Send user id\n\nor type 'cancel' to leave", {
        parse_mode: "HTML",
      });
    }

    await ctx.reply(
      "Send user payment email or send 0 to cancel subscription\n\nor type 'cancel' to leave",
      {
        parse_mode: "HTML",
      }
    );

    return ctx.wizard.next();
  },
  async (ctx) => {
    const targetEmail = (await ctx?.message?.text) || "";

    if (targetEmail === "cancel") {
      await ctx.reply("Canceled");

      return ctx.scene.leave();
    }

    if (Number(targetEmail) === 0) {
      ctx.scene.state.targetEmail = null;
    } else {
      ctx.scene.state.targetEmail = targetEmail;
    }

    const { message_id } = await ctx.reply("Updating data...");

    // TODO: Fastify API

    await ctx.deleteMessage(message_id);

    if (!result || result.modifiedCount === 0) {
      await ctx.reply("Can't update! Please try again");
      return ctx.reply(
        "Send user payment email or send <b>0</b> to cancel subscription\n\nor type 'cancel' to leave",
        {
          parse_mode: "HTML",
        }
      );
    }

    await ctx.reply(`Done!`);
    await statistics(ctx);

    return await ctx.scene.leave();
  }
);

const updateSubscription = async (ctx) => {
  await ctx.answerCbQuery();

  if (ctx.update.callback_query.from.id.toString() === ADMIN_ID.toString()) {
    return ctx.scene.enter("update-subscription");
  }
};

module.exports = {
  updateSubscription,
  updateSubscriptionWizard,
};
