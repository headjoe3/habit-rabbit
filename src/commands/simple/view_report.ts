import { CommandoClient, CommandMessage } from "discord.js-commando";
import { UserDataCommand, log_habit_invalidation } from "../../util/util_user_commands";
import { HabitInfo, Config } from "../../util/util_types";
import { format_date, format_usage } from "../../util/responses";

const { user_habit_key, command_prefix } = Config

export default class ViewReportCommand extends UserDataCommand {
    constructor(client: CommandoClient) {
        super(client, {
            name: "viewreport",
            group: "simple",
            memberName: "viewreport",
            description: "Views a specific report",
            args: [
                {
                    key: "id",
                    label: "id",
                    type: "integer",
                    prompt: `What's the ID of the report you would like to view (use \`${command_prefix}viewreports\` to get a list)`,
                }
            ],
        })
    }
    async run(message: CommandMessage, args: {id: number}) {
        // Retrieve from database
        const habit = this.get_user_key(message.author, user_habit_key)

        if (HabitInfo.is(habit)) {
            if (habit.report_history.length < args.id) {
                return message.channel.sendMessage("No report exists with the id '" + args.id + "'")
            }

            const index = args.id - 1
            const report = habit.report_history[index]

            return message.channel.sendMessage(
`
**Report #${args.id} on  ${format_date(new Date(report.timestamp))}**
\`\`\`${report.description}\`\`\`
`
            )
        } else {
            if (typeof habit === "object") {
                log_habit_invalidation(habit)
                return
            }
            return message.channel.sendMessage(`You have not made a habit commitment yet! Use ${format_usage(this.group.commands.get("commit")!)} to make a commitment`)
        }
    }
}