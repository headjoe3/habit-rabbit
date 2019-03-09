import { Command, CommandMessage, CommandoClient, CommandInfo } from "discord.js-commando";
import { User, Guild, GuildMember } from "discord.js";
import { Config, HabitInfo } from "./util_types";
import { PathReporter } from "io-ts/lib/PathReporter";

const GLOBAL_USER_SETTINGS = "global"
const { mod_roles } = Config

export function get_user_key(client: CommandoClient, user: User, key: string): unknown {
    return client.provider.get(GLOBAL_USER_SETTINGS, user.id + "_" + key)
}
export function set_user_key(client: CommandoClient, user: User, key: string, value: unknown) {
    return client.provider.set(GLOBAL_USER_SETTINGS, user.id + "_" + key, value)
}

export default abstract class UserDataCommand extends Command {
    constructor(client: CommandoClient, info: CommandInfo) {
        super(client, info)
    }

    get_user_key(user: User, key: string): unknown {
        return get_user_key(this.client, user, key)
    }
    set_user_key(user: User, key: string, value: unknown) {
        return set_user_key(this.client, user, key, value)
    }
}

export function has_mod_permissions(user: User, server: Guild) {
    // DMs should not have "mod" roles
    if (server === null) return false;
    for (let role_name of mod_roles) {
        const role = server.roles.get(role_name)
        if (role && role.members.has(user.id)) {
            return true
        }
    }
    return false
}

export function log_habit_invalidation(habit: object | null) {
    console.log(`HABIT INVALIDATION: \`${PathReporter.report(HabitInfo.decode(habit))}\``)
}