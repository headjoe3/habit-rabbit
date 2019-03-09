import { CommandoClient, CommandMessage } from "discord.js-commando";
import UserDataCommand, { log_habit_invalidation } from "../../util_user_commands";
import { HabitInfo, REMIND_INTERVAL_INFO_MAP, Config } from "../../util_types";
import { format_date } from "../../responses";

const { user_habit_key } = Config

export default class ViewHabitCommand extends UserDataCommand {
    constructor(client: CommandoClient) {
        super(client, {
            name: "viewhabit",
            group: "simple",
            memberName: "viewhabit",
            description: "Views your commitment in the database",
        })
    }
    async run(message: CommandMessage, args: {}) {
        // Retrieve from database
        const habit = this.get_user_key(message.author, user_habit_key)

        if (HabitInfo.is(habit)) {
            const commitment_date = new Date(habit.timestamp)
            const interval_info = REMIND_INTERVAL_INFO_MAP.get(habit.remind_interval || "")

            return message.channel.sendMessage(
`
Username: \`${message.author.username}\`
Habit description:
\`\`\`txt
${habit.description}
\`\`\`
Commitment Date: \`${format_date(commitment_date)}\`
Reminding interval: \`${interval_info ? interval_info.display_name : "Never"}\`
`
            )
        } else {
            if (typeof habit === "object") {
                log_habit_invalidation(habit)
                return
            }
            return message.channel.sendMessage(`You have not made a habit commitment yet! Use \`${this.group.commands.get("commit")!.usage()}\` to make a commitment`)
        }
    }
}