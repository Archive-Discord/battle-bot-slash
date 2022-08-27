import { Guild } from 'discord.js';

const guildProfileLink = (guild: Guild) => {
  if (!guild.icon)
    return `https://cdn.discordapp.com/embed/avatars/${
      Math.floor(Math.random() * (5 - 1 + 1)) + 1
    }.png`;
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`;
};

const getDate = (_date?: Date) => {
  let date = new Date();
  if (_date) date = new Date(_date);
  const year = date.getFullYear();
  const month = ('0' + (1 + date.getMonth())).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);

  return {
    datestring: year + month + day,
    date: date,
  };
};

const getNumberEmogi = (index: number) => {
  if (index === 1) return '<:1_:941222002142887996>';
  if (index === 2) return '<:2_:941222070942064640>';
  if (index === 3) return '<:3_:941222337649459211>';
  if (index === 4) return '<:4_:941222420013002793>';
  if (index === 5) return '<:5_:941222491739791381>';
  if (index === 6) return '<:6_:941223228230238248>';
  if (index === 7) return '<:7_:941223228326674502>';
  if (index === 8) return '<:8_:941224241360158760>';
  if (index === 9) return '<:9_:941223228188274718>';
  if (index === 10) return '<:10_:941223228226043964>';
  if (index === 11) return '<:11_:941223228288933908>';
  if (index === 12) return '<:12_:941223228339277874>';
  if (index === 13) return '<:13_:941223228397985832>';
  if (index === 14) return '<:14_:941223228209234010>';
  if (index === 15) return '<:15_:941223228444119040>';
  else undefined;
};

export { guildProfileLink, getDate, getNumberEmogi };
