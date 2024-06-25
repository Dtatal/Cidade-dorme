import chalk from "chalk"

export function log(...message: unknown[]) {
  console.log(chalk.magentaBright`[INFO]`, ...message)
}

export function warn(...message: unknown[]) {
  console.warn(chalk.yellow`[WARN]`, ...message)
}

export function error(...message: unknown[]) {
  console.error(chalk.red`[ERROR]`, ...message)
}