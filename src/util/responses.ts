import { User } from "discord.js";
import { Command } from "discord.js-commando";

type ReportResponses  = ((user: User) => string) | string
const REPORT_RESPONSES: ReportResponses[] = [
    "Keep the updates coming, accountability is key to sustained success!",
    "Each day provides its own gifts.",
    "Let’s go champ!",
    "Thanks, and good luck on the path!",
    "When you do a little more than you can you get stronger, and we don’t know the upper limits to that",
    "Action is the next step to realize your goals",
    "Get after it!",
    "Perfect is the Enemy of the Good.",
    "The best time to plant a tree was 20 years ago, the second best time is NOW",
    "We’re all rooting for you! You can do it!",
    "You are not rewarded for the comfortable choice.",
    "Small things, when compounded over time, tend to have big consequences.",
    "To live one day well is the same as to live ten thousand days well. To master twenty-four hours is to master your life.",
    "Sometimes the truth hurts, and sometimes it feels real good.",
    "Scar tissue is stronger than regular tissue. Realize the strength, move on",
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
    return '``'+date.getFullYear()+'-'+('00'+date.getMonth()).slice(-2)+'-'+('00'+date.getDate()).slice(-2)+'``'
}

export function get_commit_response(user: User) {
    return "Your commitment has been added to the database!"
}

export function get_report_response(user: User) {
    const response = REPORT_RESPONSES[Math.floor(Math.random() * REPORT_RESPONSES.length)]
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
