const { Scenes, Markup, Composer } = require("telegraf");
const timezones = require("timezones-list");

const stepHandler = new Composer();
stepHandler.action("selectTimeZone", async (ctx) => {
  await ctx.reply("Time zone was successfully update.");

  return ctx.scene.leave();
});

const setTimeZoneWizard = new Scenes.WizardScene(
  "set-time-zone",
  async (ctx) => {
    await ctx.reply(
      "Select your current Time zone. If you don't know it, visit: http://www.csgnetwork.com/directdetecttimezonelist.html\n\nor type 'cancel' to leave",
      {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard(
          Array.from(new Set(timezones.default.map((el) => el.utc))).reduce(
            (arr, nextEl, index) => {
              const arrIndex = parseInt(index / 5);

              arr[arrIndex] = arr[arrIndex] || [];
              arr[arrIndex].push(
                Markup.button.callback(nextEl, "selectTimeZone")
              );

              return [...arr];
            },
            []
          )
        ),
      }
    );

    return ctx.wizard.next();
  },
  stepHandler,
  async (ctx) => {
    const selectedTz = (await ctx?.message?.text) || "";

    if (selectedTz === "cancel") {
      await ctx.reply("Canceled");

      return ctx.scene.leave();
    } else {
      await ctx.reply("Time zone is incorrect, plase use the keyboard");
      ctx.wizard.back();
      return ctx.wizard.steps[ctx.wizard.cursor](ctx);
    }
  }
);

const setTimeZone = async (ctx) => {
  await ctx.answerCbQuery();
  return ctx.scene.enter("set-time-zone");
};

module.exports = {
  setTimeZone,
  setTimeZoneWizard,
};
