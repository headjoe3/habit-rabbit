import { CommandoClient, CommandMessage } from "discord.js-commando";
import UserDataCommand, { get_user_key, log_habit_invalidation } from "../../util/util_user_commands";
import { get_commit_response, get_report_response, format_usage } from "../../util/responses";
import { HabitInfo, Config } from "../../util/util_types";

const { user_habit_key } = Config
const SUCCESS_TAG_KEYWORDS = [
    "success",
    "failure"
]

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
        let { description } = args

        let success_tag: string | undefined

        for (let keyword of SUCCESS_TAG_KEYWORDS) {
            if (description.startsWith(keyword + " ")) {
                description = description.substr(keyword.length + 1)
                success_tag = keyword
            }
        }

        const habit = this.get_user_key(message.author, user_habit_key)
        if (HabitInfo.is(habit)) {
            // Update in database
            habit.last_reminder_timestamp = Date.now()
            habit.report_history.push({
                timestamp: Date.now(),
                description: description,
                success_tag: success_tag,
            })
            this.set_user_key(message.author, user_habit_key, habit)

            // Response message
            return message.reply(get_report_response(message.author))
        } else {
            if (typeof habit === "object") {
                log_habit_invalidation(habit)
                return
            }
            return message.channel.sendMessage(`You have not made a habit commitment yet! Use ${format_usage(this.group.commands.get("commit")!)} to make a commitment`)
        }
    }
}