import { CommandoClient, CommandMessage } from "discord.js-commando";
import { UserDataCommand, log_habit_invalidation } from "../../util/util_user_commands";
import { HabitInfo, REMIND_INTERVAL_INFO_MAP, Config } from "../../util/util_types";
import { format_date, format_usage } from "../../util/responses";
import { RichEmbed } from "discord.js";

const { user_habit_key } = Config

const HABITS_PER_PAGE = 10

export default class ViewHabitsCommand extends UserDataCommand {
    constructor(client: CommandoClient) {
        super(client, {
            name: "viewhabits",
            group: "simple",
            memberName: "viewhabits",
            description: "Views your most recent habit commitments",
            args: [
                {
                    key: "page",
                    label: "page",
                    default: 1,
                    type: "integer",
                    prompt: "What page would you like to view?",
                }
            ],
        })
    }
    async run(message: CommandMessage, args: {page: number}) {
        // Retrieve from database
        const habit = this.get_user_key(message.author, user_habit_key)

        if (HabitInfo.is(habit)) {
            const commitment_date = new Date(habit.timestamp)
            const interval_info = REMIND_INTERVAL_INFO_MAP.get(habit.remind_interval || "")

            // Vicariously convert legacy data
            if (!habit.habit_commitment_history) {
                habit.habit_commitment_history = [{
                    description: habit.description,
                    timestamp: habit.timestamp,
                }]
            }

            if (habit.habit_commitment_history.length > 0) {
                const pages = Math.ceil(habit.habit_commitment_history.length / HABITS_PER_PAGE)
                const page_start = Math.max(0, habit.habit_commitment_history.length - 1 - (args.page - 1) * HABITS_PER_PAGE)
                message.author.createDM()
                    .then((channel) => {
                        let collated_habit_commitments = new RichEmbed()
                            .setTitle(`Recent habit commitment history (page ${args.page} of ${pages})\n`)
                            .setColor(0x008000)
                        
                        for (
                            let i = Math.max(0, page_start - HABITS_PER_PAGE);
                            i <= page_start;
                            i++
                        ) {
                            const habitCommitment = habit.habit_commitment_history![i]
                            collated_habit_commitments.addField(
                                `\nHabit #${i + 1} on  ${format_date(new Date(habitCommitment.timestamp))}`,
                                `\`\`\`${habitCommitment.description}\`\`\``
                            )
                        }

                        channel.sendEmbed(collated_habit_commitments)
                    })
                if (message.guild === null) {
                    return
                } else {
                    return message.channel.sendMessage("Sent you a DM")
                }
            } else {
                return message.channel.sendMessage(`You have not made any habit commitments yet! Use ${format_usage(this.group.commands.get("commit")!)} to make a commitment`)
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