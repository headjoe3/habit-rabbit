import { Command, CommandoClient, CommandMessage } from "discord.js-commando";
import { format_usage } from "../../responses";
import { has_mod_permissions } from "../../util_user_commands";
import { MessageEmbed, RichEmbed } from "discord.js";

export default class HelpCommand extends Command {
    constructor(bot: CommandoClient) {
        super(bot, {
            name: 'help',
            group: 'simple',
            memberName: 'help',
            description: 'Lists all of Habit Rabbit\'s commands',
            args: [
                {
                    key: 'command_name',
                    label: 'command name',
                    type: 'string',
                    default: 'all',
                    prompt: 'What command would you like help with?'
                }
            ],
            throttling: {
                usages: 1,
                duration: 1.5,
            }
        })
    }

    async run(message: CommandMessage, args: {command_name: string}) {
        if (args.command_name === "all") {
            let embeds: RichEmbed[] = []

            {
                const embed = new RichEmbed()
                    .setTitle('All user commands')
                    .setColor(0x008000)

                for (let [command_name, command] of this.group.commands) {
                    embed.addField(
                        `\`${format_usage(command)}\``,
                        `${command.description}`
                    )
                }

                embeds.push(embed)
            }

            if (has_mod_permissions(message.author, message.guild)) {
                const embed = new RichEmbed()
                    .setTitle('All moderator commands')
                    .setColor(0x008000)

                for (let [command_name, command] of this.client.registry.groups.get('moderator')!.commands) {
                    embed.addField(
                        `\`${format_usage(command)}\``,
                        `${command.description}`
                    )
                }

                embeds.push(embed)
            }

            message.author.createDM()
                .then(channel => {
                    embeds.forEach(embed => {
                        channel.sendEmbed(embed)
                    })
                })

            if (message.guild === null) {
                return
            } else {
                return message.reply(`${message.author} Sent you a DM with a list of commants`)
            }
        } else {
            const command = this.group.commands.get(args.command_name)
            if (command) {
                return message.channel.sendMessage(`${message.author} Usage: \`${format_usage(command)}\``)
            } else {
                return message.channel.sendMessage(`${message.author} '${args.command_name}' is not a valid command`)
            }
        }
    }
}