import { CommandoClient, CommandMessage } from "discord.js-commando";
import UserDataCommand, { get_user_key, log_habit_invalidation } from "../../util/util_user_commands";
import { get_commit_response, get_report_response } from "../../util/responses";
import { HabitInfo, Config } from "../../util/util_types";

const { user_habit_key } = Config

const DEFAULT_REMINDING_INTERVAL = 'daily'

export default class ReportCommand extends UserDataCommand {
    constructor(client: CommandoClient) {
        super(client, {
            name: "report",
            aliases: ["update"],
            group: "simple",
            memberName: "report",
            description: "Logs an update on your commitment",
            args: [
                {
                    key: "description",
                    label: "report description",
                    prompt: "Tell us about how your habit has been going!",
                    type: "string",
                }
            ],
        })
    }
    async run(message: CommandMessage, args: { description: string }) {
        const { description } = args

        const habit = this.get_user_key(message.author, user_habit_key)
        if (HabitInfo.is(habit)) {
            // Update in database
            habit.last_reminder_timestamp = Date.now()
            this.set_user_key(message.author, user_habit_key, habit)

            // Response message
            return message.reply(get_report_response(message.author))
        } else {
            if (typeof habit === "object") {
                log_habit_invalidation(habit)
                return
            }
            return message.channel.sendMessage(`You have not made a habit commitment yet! Use ${this.group.commands.get("commit")!.usage()} to make a commitment`)
        }
    }
}