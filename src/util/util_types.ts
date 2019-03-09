import * as t from 'io-ts'
import { ThrowReporter } from 'io-ts/lib/ThrowReporter'

export type CommandArgs = object | string | string[]

// In milliseconds
const MILLISECOND = 1
const SECOND = 1000 * MILLISECOND
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 60 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY

export interface RemindIntervalInfo {
    duration: number,
    display_name: string,
    every_name: string,
}

export const REMIND_INTERVAL_INFO_MAP = new Map<string, RemindIntervalInfo>([
    [
        "daily",
        {
            display_name: "Daily",
            every_name: "day",
            duration: DAY,
        }
    ],
    [
        "semiweekly",
        {
            display_name: "Semi-Weekly",
            every_name: "three days",
            duration: 3 * DAY,
        },
    ],
    [
        "weekly",
        {
            display_name: "Weekly",
            every_name: "week",
            duration: WEEK,
        },
    ],
    [
        "biweekly",
        {
            display_name: "Bi-Weekly",
            every_name: "two weeks",
            duration: 2 * WEEK,
        },
    ],
    [
        "monthly",
        {
            display_name: "Monthly",
            every_name: "month",
            duration: MONTH,
        },
    ],
    [
        "bimonthly",
        {
            display_name: "Bi-Monthly",
            every_name: "two months",
            duration: 2 * MONTH,
        },
    ],
    [
        "quarterly",
        {
            display_name: "Quarterly",
            every_name: "three months",
            duration: 3 * MONTH,
        },
    ],
])

export let REMIND_INTERVAL_USAGE: string = "never"
let prefix = "/"
for (const interval of REMIND_INTERVAL_INFO_MAP) {
    REMIND_INTERVAL_USAGE = REMIND_INTERVAL_USAGE + prefix + interval[0]
    prefix = "/"
}

export const ReportInfo = t.intersection([
    // Required parameters (DO NOT CHANGE unless you want data to be invalidated!)
    t.type({
        timestamp: t.number,
    }),
    
    // Optional parameters (You can add and remove from these!)
    t.partial({
    })
])

export type ReportInfo = t.TypeOf<typeof ReportInfo>

export const HabitInfo = t.intersection([
    // Required parameters (DO NOT CHANGE unless you want data to be invalidated!)
    t.type({
        description: t.string,
        timestamp: t.number,
        report_history: t.array(ReportInfo),
    }),

    // Optional parameters (You can add and remove from these!)
    t.partial({
        remind_interval: t.string,
        last_reminder_timestamp: t.number,
    })
])

export type HabitInfo = t.TypeOf<typeof HabitInfo>

const CONFIG_TYPE = t.type({
    "token": t.string,
    "mod_roles": t.array(t.string),
    "database_path": t.string,
    "user_habit_key": t.string,
    "command_prefix": t.string,
})

let user_config = require("../../rabbit-config.json")
if (!CONFIG_TYPE.is(user_config)) {
    throw ThrowReporter.report(CONFIG_TYPE.decode(user_config))
}

export const Config = user_config