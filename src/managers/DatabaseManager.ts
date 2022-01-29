import Logger from "@utils/Logger"
import mongoose from "mongoose"
import path from "path"
import fs from "fs"
import BotClient from "@client"
/**
 * @extends {BaseManager}
 */
export default class DatabaseManager {
  private client: BotClient
  private logger: Logger
  public readonly type: "mongodb" | "sqlite"

  constructor(client: BotClient) {
    this.client = client
    this.logger = new Logger("DatabaseManager")
    this.type = client.config.database.type
  }

  public load(schemaPath = path.join(__dirname, "../schemas")) {
    switch (this.type) {
      case "mongodb": {
        this.logger.debug("Using MongoDB...")
        mongoose
          .connect(this.client.config.database.url)
          .then(async (database) => {
            this.client.db = database

            this.logger.info("Connected to MongoDB!")
          })

        break
      }
      default:
        return this.logger.error("Invalid database type:" + this.type)
    }

    this.loadSchemas(schemaPath)
  }

  loadSchemas(schemaPath: string) {
    this.logger.debug("Loading schemas...")

    let schemaFolder = fs.readdirSync(schemaPath)

    try {
      schemaFolder.forEach((schemaFile) => {
        try {
          if (schemaFile.startsWith("example")) return
          if (!schemaFile.endsWith(".ts"))
            return this.logger.warn(
              `Not a TypeScript file ${schemaFile}. Skipping.`
            )

          let schema = require(`../schemas/${schemaFile}`)

          this.client.schemas.set(schema.modelName, schema)
        } catch (error: any) {
          this.logger.error(
            `Error loading schema ${schemaFile}.\n` + error.stack
          )
        }

      })
      this.logger.debug(
        `Succesfully loaded schemas. count: ${this.client.schemas.size}`
      )
    } catch (error: any) {
      this.logger.error("Error fetching folder list.\n" + error.stack)
    }
  }
}
