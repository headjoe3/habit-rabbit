import { CommandoClient, CommandMessage } from "discord.js-commando";
import { UserDataCommand, log_habit_invalidation } from "../../util/util_user_commands";
import { HabitInfo, REMIND_INTERVAL_INFO_MAP, Config, HabitCommitmentInfo } from "../../util/util_types";
import { format_date, format_usage } from "../../util/responses";

const { user_habit_key } = Config

export default class ViewHabitCommand extends UserDataCommand {
    constructor(client: CommandoClient) {
        super(client, {
            name: "viewhabit",
            aliases: ["viewcommitment"],
            group: "simple",
            memberName: "viewhabit",
            description: "Views your commitment in the database",
            args: [
                {
                    key: "id",
                    label: "id",
                    default: 0,
                    type: "integer",
                    prompt: "What commitment id would you like to view?",
                }
            ]
        })
    }
    async run(message: CommandMessage, args: {id: number}) {
        // Retrieve from database
        const habit = this.get_user_key(message.author, user_habit_key)

        if (HabitInfo.is(habit)) {
            if (args.id == 0) {
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
Last report: \`${
    (habit.report_history.length > 0)
        ? format_date(new Date(habit.report_history[habit.report_history.length - 1].timestamp))
        : "You haven't made a report yet"
}\`
Reports: \`${habit.report_history.length}\` (Use \`${format_usage(this.group.commands.get("viewreports")!)}\` or \`${format_usage(this.group.commands.get("viewreport")!)}\` to view)
Habits: \`${habit.habit_commitment_history ? habit.habit_commitment_history.length : 1}\` (Use \`${format_usage(this.group.commands.get("viewhabits")!)}\` or \`${format_usage(this.group.commands.get("viewhabit")!)}\` to view)
`
                )
            } else {
                let habitCommitment: HabitCommitmentInfo | undefined = undefined

                // Let legacy data be used
                if (args.id == 1 && !habit.habit_commitment_history) {
                    habitCommitment = habit
                } else {
                    if (habit.habit_commitment_history) {
                        habitCommitment = habit.habit_commitment_history[args.id - 1]
                    }
                }

                if (habitCommitment) {
                    const commitment_date = new Date(habitCommitment.timestamp)
    
                    return message.channel.sendMessage(
`
Username: \`${message.author.username}\`
Habit description:
\`\`\`txt
${habitCommitment.description}
\`\`\`
Commitment Date: \`${format_date(commitment_date)}\`
`
                    )
                } else {
                    return message.channel.sendMessage("No habit commitment exists with the id '" + args.id + "'")
                }
            }
        } else {
            if (typeof habit === "object") {
                log_habit_invalidation(habit)
                return
            }
            return message.channel.sendMessage(`You have not made a habit commitment yet! Use ${format_usage(this.group.commands.get("commit")!)} to make a commitment`)
        }
    }
}