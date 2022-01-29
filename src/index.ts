import Logger from "@utils/Logger"
import { ShardingManager } from "discord.js"
import chalk from "chalk"

import config from '@config'
let logger = new Logger("main")

console.log(
  chalk.cyanBright(`
=========================================================

            ${require("../package.json").name}@${config.BUILD_NUMBER}
            Version : ${config.BUILD_VERSION}

=========================================================
`)
)

if (!config.bot.sharding) {
  require("./bot")
} else {
  let manager = new ShardingManager("./src/bot.ts", config.bot.shardingOptions)

  manager.spawn()
  manager.on("shardCreate", async (shard) => {
    logger.debug(`Shard #${shard.id} created.`)
  })
}
