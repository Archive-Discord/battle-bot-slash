import Logger from "@utils/Logger"
import { ShardingManager } from "discord.js"
import chalk from "chalk"

let config = require("../config")
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
  require("./bot.js") // ㅇㅋ 그냥 Node.gitignore 가지고옴 
} else {
  let manager = new ShardingManager("./src/bot.ts", config.bot.shardingOptions)

  manager.spawn()
  manager.on("shardCreate", async (shard) => {
    logger.debug(`Shard #${shard.id} created.`)
  })
}
