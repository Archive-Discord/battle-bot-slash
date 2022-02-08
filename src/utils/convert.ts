import { Guild } from 'discord.js'

const guildProfileLink = (guild: Guild) => {
  if (!guild.icon)
    return `https://cdn.discordapp.com/embed/avatars/${
      Math.floor(Math.random() * (5 - 1 + 1)) + 1
    }.png`
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`
}

export { guildProfileLink }
