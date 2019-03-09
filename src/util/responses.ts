import { User } from "discord.js";
import { Command } from "discord.js-commando";

type CommitResponse  = ((user: User) => string) | string
const COMMIT_RESPONSES: CommitResponse[] = [
    "Your commitment has been added to the database!"
]

type MonthIndex = 0|1|2|3|4|5|6|7|8|9|10|11
const MONTH_MAP: Record<MonthIndex, string> = {
    [0]: "Jan",
    [1]: "Feb",
    [2]: "Mar",
    [3]: "Apr",
    [4]: "May",
    [5]: "Jun",
    [6]: "Jul",
    [7]: "Aug",
    [8]: "Sep",
    [9]: "Oct",
    [10]: "Nov",
    [11]: "Dec",
}
export function format_date(date: Date) {
    return `${MONTH_MAP[date.getMonth() as MonthIndex]} ${date.getDate()}, ${date.getFullYear()}`
}

export function get_commit_response(user: User) {
    const response = COMMIT_RESPONSES[Math.floor(Math.random() * COMMIT_RESPONSES.length)]
    if (typeof response === "string") {
        return response
    } else {
        return response(user)
    }
}

export function format_usage(command: Command) {
    if (command.format === null) {
        return `${command.client.commandPrefix}${command.name}`
    } else {
        return `${command.client.commandPrefix}${command.name} ${command.format}`
    }
}