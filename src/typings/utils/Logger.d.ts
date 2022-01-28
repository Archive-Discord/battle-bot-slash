import winston from "winston"

export type ColorsType =
  | "fatal"
  | "error"
  | "warn"
  | "info"
  | "verbose"
  | "debug"
  | "chat"

export interface LoggerClass {
  scope: string
  log(message: string, ...args: any[]): void
  info(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  error(message: string, ...args: any[]): void
  debug(message: string, ...args: any[]): void
  fatal(message: string, ...args: any[]): never
}
