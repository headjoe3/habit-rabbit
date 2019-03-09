import { Message } from "discord.js";
import { get_user_key, set_user_key } from "./util/util_user_commands";
import { CommandoClient } from "discord.js-commando";
import { HabitInfo, REMIND_INTERVAL_INFO_MAP, REMIND_INTERVAL_USAGE, Config } from "./util/util_types";

const { user_habit_key } = Config

export default function(bot: CommandoClient, message: Message) {
    // Do not update for our own posts
    if (message.author.id === bot.user.id) return;

    // Do not update for commands (especially so we can avoid race conditions)
    if (message.content.startsWith(bot.commandPrefix)) return;

    const habit = get_user_key(bot, message.author, user_habit_key)
    
    if (HabitInfo.is(habit)) {
        const interval_info = REMIND_INTERVAL_INFO_MAP.get(habit.remind_interval || "")
        if (interval_info) {
            const now = Date.now()
            const time_since_last_report = (now - (habit.last_reminder_timestamp || habit.timestamp))
            if (time_since_last_report > interval_info.duration) {
                // Update reminder cooldown first before sending a message in case something goes wrong
                habit.last_reminder_timestamp = now
                set_user_key(bot, message.author, user_habit_key, habit)

                // Reminder message
                message.author.createDM()
                    .then(channel => {
                        channel.sendMessage(
`
Hey, ${message.author}, looks like you haven't posted an report on your habit in a while:
\`\`\`txt
${habit.description}
\`\`\`

Use the command \`${bot.commandPrefix}report\` to log your progress
It’s okay if you’ve fallen off. Failing is part of the process! Accept the setback and get back to work.

If you would like to be reminded more or less often, use the following command:
\`${bot.commandPrefix}remindme ${REMIND_INTERVAL_USAGE}\`

Full command list: \`${bot.commandPrefix}help\`
`
                        )
                    })
            }
        }
    }
}