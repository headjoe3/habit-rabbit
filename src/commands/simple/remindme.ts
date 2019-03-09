import { CommandoClient, CommandMessage } from "discord.js-commando";
import UserDataCommand, { log_habit_invalidation } from "../../util_user_commands";
import { REMIND_INTERVAL_USAGE, HabitInfo, REMIND_INTERVAL_INFO_MAP, Config } from "../../util_types";

const { user_habit_key } = Config

export default class RemindMeCommand extends UserDataCommand {
    constructor(client: CommandoClient) {
        super(client, {
            name: "remindme",
            group: "simple",
            memberName: "remindme",
            description: "Sets the interval at which Habit Rabbit will remind you of your commitment",
            args: [
                {
                    key: "interval",
                    label: `${REMIND_INTERVAL_USAGE}`,
                    prompt: `How often would you like me to remind you (\`${REMIND_INTERVAL_USAGE}\`)?`,
                    type: "string",
                }
            ],
        })
    }
    async run(message: CommandMessage, args: { interval: string }) {
        // Retrieve from database
        const habit = this.get_user_key(message.author, user_habit_key)

        if (HabitInfo.is(habit)) {
            const interval_info = REMIND_INTERVAL_INFO_MAP.get(args.interval.toLowerCase())
            if (!interval_info) {
                if (args.interval.toLowerCase() === "never") {
                    habit.last_reminder_timestamp = Date.now()
                    habit.remind_interval = undefined
                    this.set_user_key(message.author, user_habit_key, habit)

                    return message.channel.sendMessage(`Got it, no more reminders, I’ll be here waiting if you want to be reminded again!`)
                } else {
                    return message.channel.sendMessage(`'${args.interval}' is not a valid interval.\nUsage: \`${this.usage()}\``)
                }
            }

            habit.last_reminder_timestamp = Date.now()
            habit.remind_interval = args.interval
            this.set_user_key(message.author, user_habit_key, habit)

            return message.channel.sendMessage(`I’ll remind you to post a \`${this.client.commandPrefix}report\` every ${interval_info.every_name} if you forget`)
        } else {
            if (typeof habit === "object") {
                log_habit_invalidation(habit)
                return
            }
            return message.channel.sendMessage(`You have not made a habit commitment yet! Use \`${this.group.commands.get("commit")!.usage()}\` to make a commitment`)
        }
    }
}