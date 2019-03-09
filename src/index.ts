// Invite link: https://discordapp.com/api/oauth2/authorize?client_id=481246484843724800&scope=bot&permissions=67584
import * as Commando from "discord.js-commando"
import * as sqlite from "sqlite"
import * as path from "path"
import check_reminders from "./check_reminders";
import { Config } from "./util_types";

const { token, database_path } = Config

const bot = new Commando.CommandoClient()

bot.registry.registerGroup("simple", "simple")
bot.registry.registerGroup("admin", "admin")
bot.registry.registerDefaultTypes()
bot.registry.registerCommandsIn(__dirname + "/commands")

// Register server database provider
sqlite.open(path.join(__dirname, database_path)).then((db) => {
    bot.setProvider(new Commando.SQLiteProvider(db))
        .then(() => {bot.provider.init(bot)});
});

bot.on("ready", () => console.log("ready"))
bot.on("message", (message) => check_reminders(bot, message))

bot.login(token)