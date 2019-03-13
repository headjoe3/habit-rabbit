import { CommandoClient, CommandMessage } from "discord.js-commando";
import UserDataCommand, { log_habit_invalidation } from "../../util/util_user_commands";
import { HabitInfo, REMIND_INTERVAL_INFO_MAP, Config } from "../../util/util_types";
import { format_date, format_usage } from "../../util/responses";
import { RichEmbed } from "discord.js";

const { user_habit_key } = Config

const REPORTS_PER_PAGE = 10
const PREVIEW_LENGTH = 220

export default class ViewReportsCommand extends UserDataCommand {
    constructor(client: CommandoClient) {
        super(client, {
            name: "viewreports",
            group: "simple",
            memberName: "viewreports",
            description: "Views your most recent reports",
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

            if (habit.report_history.length > 0) {
                const pages = Math.ceil(habit.report_history.length / REPORTS_PER_PAGE)
                const page_start = Math.max(0, habit.report_history.length - 1 - (args.page - 1) * REPORTS_PER_PAGE)
                message.author.createDM()
                    .then((channel) => {
                        let collated_reports = new RichEmbed()
                            .setTitle(`Recent report history (page ${args.page} of ${pages})\n`)
                            .setColor(0x008000)
                        
                        let result_was_truncated = false
                        for (
                            let i = Math.max(0, page_start - REPORTS_PER_PAGE);
                            i <= page_start;
                            i++
                        ) {
                            const report = habit.report_history[i]
                            if (report.description.length > PREVIEW_LENGTH) {
                                result_was_truncated = true
                            }
                            collated_reports.addField(
                                `\nReport #${i + 1} on  ${format_date(new Date(report.timestamp))}`,
                                report.description.length > PREVIEW_LENGTH
                                    ? `\`\`\`${report.description.substr(0, PREVIEW_LENGTH)}...\`\`\``
                                    : `\`\`\`${report.description}\`\`\``
                            )
                        }

                        if (result_was_truncated) {
                            collated_reports.addBlankField()
                            collated_reports.addField("To view a full report:", `Use ${format_usage(this.group.commands.get("viewreport")!)}`)
                        }

                        channel.sendEmbed(collated_reports)
                    })
                if (message.guild === null) {
                    return
                } else {
                    return message.channel.sendMessage("Sent you a DM")
                }
            } else {
                return message.channel.sendMessage("You have not made any reports yet")
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