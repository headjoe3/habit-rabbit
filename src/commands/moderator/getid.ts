import { CommandoClient, CommandMessage } from "discord.js-commando";
import UserDataCommand, { has_mod_permissions } from "../../util/util_user_commands";

export default class GetIDCommand extends UserDataCommand {
    constructor(client: CommandoClient) {
        super(client, {
            name: "getid",
            group: "moderator",
            memberName: "getid",
            description: "Gets the id of a server object",
            args: [
                {
                    key: "object_type",
                    type: "string",
                    label: "user | emoji | channel | role",
                    prompt: "What kind of ID do you want (user | emoji | channel | role)?"
                },
                {
                    key: "object_name",
                    type: "string",
                    label: "object name",
                    prompt: "What's the name of the object you want?"
                }
            ]
        })
    }

    hasPermission(message: CommandMessage) {
        return has_mod_permissions(message.author, message.guild)
    }

    async run(message: CommandMessage, args: { object_type: string, object_name: string }) {
        if (!has_mod_permissions(message.author, message.guild)) {
            console.log("Silent command fail for user: " + message.author.username)
            return
        }

        let found_id = "not found"
        switch (args.object_type) {
            case "user": {
                for (let [ id, user ] of message.guild.members) {
                    if (user.displayName === args.object_name || user.nickname === args.object_name) {
                        found_id = id
                        break
                    }
                }
                break
            }
            case "emoji": {
                for (let [ id, emoji ] of message.guild.emojis) {
                    if (emoji.identifier == args.object_name) {
                        found_id = id
                        break
                    }
                }
                break
            }
            case "channel": {
                for (let [ id, channels ] of message.guild.channels) {
                    if (channels.name == args.object_name) {
                        found_id = id
                        break
                    }
                }
                break
            }
            case "role": {
                for (let [ id, role ] of message.guild.roles) {
                    if (role.name == args.object_name) {
                        found_id = id
                        break
                    }
                }
                break
            }
        }
        return message.reply(`\`${found_id}\``);
    }
}