const { Scenes } = require("telegraf");
const moment = require("moment");
const axios = require("axios");
const schedule = require("node-schedule");

const { getAllBinancePoolData, getAllXmrPoolData } = require("../utils");
const { settings } = require("../commands/settings");

let notificationJob = null;

const { BUYMEACOFFEE_TOKEN, ADMIN_ID } = process.env;

const buyMeACoffeeApiConfig = {
  headers: { Authorization: `Bearer ${BUYMEACOFFEE_TOKEN}` },
};

const switchNotificationsWizard = new Scenes.WizardScene(
  "switch-notifications",
  async (ctx) => {
    if (notificationJob !== null) {
      notificationJob.cancel();
    }

    await ctx.reply(
      "<b>FAQ</b>\n\nBot will track your workers every <b>N</b> minutes. After 3 period of <b>N</b> minutes bot will not notified about stopped workers. <b>Minimum value is 15 minutes.</b>",
      {
        parse_mode: "HTML",
      }
    );

    if (!ctx.session.bio.payer_email) {
      await ctx.reply(
        "This is a paid feature. To activate it, please subscribe to any subscription you like: https://www.buymeacoffee.com/n1kko777 \n\nAfter successful subscription, please send your email:\n\nor type 'cancel' to leave",
        {
          parse_mode: "HTML",
        }
      );
      return ctx.wizard.next();
    } else {
      await ctx.reply(
        "How often do I need to check your workers? Send value in minutes (greater than or equal to 15).\n\nor type 'cancel' to leave",
        {
          parse_mode: "HTML",
        }
      );
      return ctx.wizard.selectStep(2);
    }
  },
  async (ctx) => {
    const targetEmail = (await ctx?.message?.text) || "";

    if (targetEmail === "cancel") {
      await ctx.reply("Canceled");

      return ctx.scene.leave();
    }

    if (targetEmail) {
      const { message_id } = await ctx.reply("Checking subscription...");

      await axios
        .get(
          "https://developers.buymeacoffee.com/api/v1/subscriptions?status=active",
          buyMeACoffeeApiConfig
        )
        .then(async (res) => {
          const isSubscribed = res?.data?.data.some(
            (el) => el.payer_email === targetEmail
          );

          ctx.deleteMessage(message_id);

          if (isSubscribed) {
            await ctx.reply("Successfully subscribed");
            ctx.session.bio.payer_email = targetEmail;
          } else {
            await ctx.reply(
              "Can't find you among the subscribers. Please try to enter the email again or contact me: @n1kk0777\n\nor type 'cancel' to leave"
            );
          }
        })
        .catch(async (error) => {
          ctx.deleteMessage(message_id);
          ctx.reply(
            "Fail...\n\nPlease try again or contact me: @n1kk0777\n\nor type 'cancel' to leave"
          );
          console.log("error", error);
          await ctx.telegram.sendMessage(
            ADMIN_ID,
            `Error executing a command: ${error}`
          );
        });
    }

    if (ctx.session.bio.payer_email) {
      ctx.reply(
        "How often do I need to check your workers? Send value in minutes (greater than or equal to 15).\n\nor type 'cancel' to leave",
        {
          parse_mode: "HTML",
        }
      );

      return ctx.wizard.next();
    } else {
      return ctx.reply(
        "This is a paid feature. To activate it, please subscribe to any subscription you like: https://www.buymeacoffee.com/n1kko777 \n\nAfter successful subscription, please send your email:\n\nor type 'cancel' to leave",
        {
          parse_mode: "HTML",
        }
      );
    }
  },
  async (ctx) => {
    const targetMinutes = (await ctx?.message?.text) || "";

    if (targetMinutes === "cancel") {
      await ctx.reply("Canceled");

      return ctx.scene.leave();
    }

    if (
      !Number.isNaN(targetMinutes.replace(/[^\d]/g, "")) &&
      targetMinutes.replace(/[^\d]/g, "") >= 15
    ) {
      const formatedValue = targetMinutes.replace(/[^\d]/g, "");
      ctx.session.settings.notification = formatedValue;

      notificationJob = schedule.scheduleJob(
        `*/${ctx.session.settings.notification} * * * *`,
        async () => {
          if (
            ctx.session.settings.notification === null ||
            !ctx.session.bio.payer_email
          ) {
            ctx.session.settings.notification = null;
            await ctx.reply(
              "The bot has stopped tracking workers. Please launch again."
            );
            notificationJob.cancel();
            return;
          }

          await getAllBinancePoolData(
            ((await ctx?.session?.binance) || []).map(
              (el) =>
                `https://pool.binance.com/mining-api/v1/public/pool/miner/index?groupId=-2&observerToken=${el}&pageIndex=1&searchWorkerName=&sort=0&sortColumn=1&workerStatus=0&pageSize=100`
            )
          )
            .then((resp) => {
              resp
                .filter((el) => el.success)
                .forEach(({ data: { workerDatas } }) => {
                  workerDatas.forEach(
                    async ({ status, workerName, lastShareTime }) => {
                      if (
                        status == 2 &&
                        moment().isBetween(
                          moment(new Date(lastShareTime)),
                          moment(moment(new Date(lastShareTime))).add(
                            ctx.session.settings.notification * 3,
                            "minutes"
                          )
                        )
                      ) {
                        await ctx.reply(
                          `<b>${workerName}</b> in <b>Binance pool</b> is inactive more than <b>${moment().diff(
                            moment(new Date(lastShareTime)),
                            "minutes"
                          )} min.</b>`,
                          {
                            parse_mode: "HTML",
                          }
                        );
                      }
                    }
                  );
                });
            })
            .catch((e) => {
              console.log(e);
            });

          await getAllXmrPoolData(
            ((await ctx?.session?.xmr) || []).map(
              (el) => `https://web.xmrpool.eu:8119/stats_address?address=${el}`
            )
          )
            .then((resp) => {
              resp
                .filter((el) => el.success)
                .forEach(({ data }) => {
                  data.perWorkerStats.forEach(
                    async ({ workerId, hashrate, lastShare }) => {
                      if (
                        !hashrate &&
                        moment().isBetween(
                          moment(new Date(parseInt(lastShare) * 1000)),
                          moment(
                            moment(new Date(parseInt(lastShare) * 1000))
                          ).add(
                            ctx.session.settings.notification * 3,
                            "minutes"
                          )
                        )
                      ) {
                        await ctx.reply(
                          `<b>${workerId}</b> in <b>Xmr pool</b> is inactive more than <b>${moment().diff(
                            moment(new Date(parseInt(lastShare) * 1000)),
                            "minutes"
                          )} min.</b>`,
                          {
                            parse_mode: "HTML",
                          }
                        );
                      }
                    }
                  );
                });
            })
            .catch((e) => {
              console.log(e);
            });
        }
      );

      await ctx.reply(`Done!`);
      settings(ctx);

      return await ctx.scene.leave();
    }

    ctx.reply(
      "Value is incorrect. Please enter a valid number greater than or equal to 15."
    );

    return ctx.reply(
      "How often do I need to check your workers? Send value in minutes (greater than or equal to 15).\n\nor type 'cancel' to leave",
      {
        parse_mode: "HTML",
      }
    );
  }
);

const switchNotifications = async (ctx) => {
  await ctx.answerCbQuery();
  if (ctx.session.settings.notification) {
    notificationJob?.cancel();
    ctx.session.settings.notification = null;
    await ctx.reply(`Done!`);
    return settings(ctx);
  }
  return ctx.scene.enter("switch-notifications");
};

module.exports = {
  switchNotifications,
  switchNotificationsWizard,
};
