import { CommandoClient, CommandMessage } from "discord.js-commando";
import UserDataCommand, { has_mod_permissions, set_user_key } from "../../util_user_commands";
import { HabitInfo, REMIND_INTERVAL_INFO_MAP, Config } from "../../util_types";

const { user_habit_key } = Config

export default class ResetReminderCooldownCommand extends UserDataCommand {
    constructor(client: CommandoClient) {
        super(client, {
            name: "reset",
            group: "moderator",
            memberName: "reset",
            description: "(Mod only) Resets an object in your user data",
            args: [
                {
                    key: "object_name",
                    type: "string",
                    label: "object name",
                    prompt: "What object do you want to reset (cooldown|habit)?"
                }
            ]
        })
    }

    hasPermission(message: CommandMessage) {
        return has_mod_permissions(message.author, message.guild)
    }

    async run(message: CommandMessage, args: { object_name: string }) {

        // Retrieve from database
        const habit = this.get_user_key(message.author, user_habit_key)

        if (HabitInfo.is(habit)) {
            let obj_name = "Nothing to"
            switch(args.object_name) {
                case "habit": {
                    set_user_key(this.client, message.author, user_habit_key, undefined)
                    obj_name = "habit"
                    break
                }
                case "cooldown": {
                    const interval_info = REMIND_INTERVAL_INFO_MAP.get(habit.remind_interval || "")
                    if (interval_info) {
                        habit.last_reminder_timestamp = 1
                        set_user_key(this.client, message.author, user_habit_key, habit)
                        obj_name = "Reminder cooldown"
                    }
                    break
                }
            }
            return message.channel.sendMessage(obj_name + " reset")
        } else {
            return message.channel.sendMessage("You did not make a commitment")
        }
    }
}