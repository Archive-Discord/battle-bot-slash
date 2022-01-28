import Discord, { Client, MessageEmbedOptions } from "discord.js"
import { EmbedType } from "typings/utils/LogEmbed"

class Embed extends Discord.MessageEmbed {
  public client: Discord.Client<true>

  constructor(client: Client<true>, type: EmbedType) {
    const EmbedJSON: MessageEmbedOptions = {
      timestamp: new Date(),
      title: "로그",
      color: "#fff",
      footer: {
        text: client.user.username,
        icon_url: client.user.avatarURL() ?? undefined,
      },
    }
    if (type === "success") EmbedJSON.color = "#57F287"
    else if (type === "error") EmbedJSON.color = "#ED4245"
    else if (type === "warn") EmbedJSON.color = "#FEE75C"
    else if (type === "info") EmbedJSON.color = "#5865F2"
    else if (type === "default") EmbedJSON.color = "#5865F2"

    super(EmbedJSON)
    this.client = client
  }

  setType(type: EmbedType) {
    if (type === "success") this.setColor("#57F287")
    else if (type === "error") this.setColor("#ED4245")
    else if (type === "warn") this.setColor("#FEE75C")
    else if (type === "info") this.setColor("#5865F2")
    else if (type === "default") this.setColor("#5865F2")
  }
}

export default Embed
