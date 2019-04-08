import { CommandoClient, CommandMessage } from "discord.js-commando";
import { UserDataCommand } from "../../util/util_user_commands";
import { get_commit_response } from "../../util/responses";
import { HabitInfo, Config } from "../../util/util_types";

const { user_habit_key } = Config

const DEFAULT_REMINDING_INTERVAL = 'daily'

export default class CommitCommand extends UserDataCommand {
    constructor(client: CommandoClient) {
        super(client, {
            name: "commit",
            group: "simple",
            memberName: "commit",
            description: "Sets your commitment in the database",
            args: [
                {
                    key: "habitdescription",
                    label: "habit description",
                    prompt: "What habit would you like to commit to?",
                    type: "string",
                }
            ],
        })
    }
    async run(message: CommandMessage, args: { habitdescription: string }) {
        const { habitdescription } = args

        const existing = this.get_user_key(message.author, user_habit_key)
        let baseHabitInfo = {
            description: habitdescription,
            timestamp: message.createdTimestamp,
            remind_interval: DEFAULT_REMINDING_INTERVAL,
        }
        let fullHabitInfo: HabitInfo
        if (HabitInfo.is(existing)) {
            // Check if a commitment history has been added (for legacy data); if not, add it with the existing description
            if (!existing.habit_commitment_history) {
                existing.habit_commitment_history = [
                    {
                        description: existing.description,
                        timestamp: existing.timestamp,
                    }
                ]
            }

            // Merge new habit description into existing habit
            fullHabitInfo = {
                ...existing,
                ...baseHabitInfo,
            }
        } else {
            // Construct full new habit info
            fullHabitInfo = {
                report_history: [],
                habit_commitment_history: [],
                last_reminder_timestamp: undefined,
                ...baseHabitInfo,
            }
        }

        // Add this habit to habit history
        fullHabitInfo.habit_commitment_history!.push({
            description: habitdescription,
            timestamp: message.createdTimestamp,
        })

        // Add to database
        this.set_user_key(message.author, user_habit_key, fullHabitInfo)

        // Response message
        return message.reply(get_commit_response(message.author))
    }
}