const { Guild } = require("discord.js")
/**
 * 
 * @param {Guild} guild 
 * @returns String
 */
 const guildProfileLink = (guild) => {
  if(!guild.icon) return `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * (5 - 1 + 1)) + 1}.png`
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`
}

module.exports = { guildProfileLink }