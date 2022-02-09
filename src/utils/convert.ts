import { Guild } from 'discord.js'

const guildProfileLink = (guild: Guild) => {
  if (!guild.icon)
    return `https://cdn.discordapp.com/embed/avatars/${
      Math.floor(Math.random() * (5 - 1 + 1)) + 1
    }.png`
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`
}

const getDate = (_date?: Date) => {
  let date = new Date();
  if(_date) date = new Date(_date)
  let year = date.getFullYear();
  let month = ("0" + (1 + date.getMonth())).slice(-2);
  let day = ("0" + date.getDate()).slice(-2);

  return {
    datestring: year + month + day,
    date: date
  }
}

export { guildProfileLink, getDate }
