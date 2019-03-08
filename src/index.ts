// Invite link: https://discordapp.com/api/oauth2/authorize?client_id=481246484843724800&scope=bot&permissions=67584
import * as Discord from "discord.js"
const { token } = require("./config.json") as {
    token: string
}

const bot = new Discord.Client()

bot.on("message", message => {
    if (message.content.toLowerCase() === "hello") {
        message.reply("I am a rabbit and therefore can't understand what you are saying")
    }
})

bot.login(token)