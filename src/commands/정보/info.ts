import { SlashCommandBuilder } from '@discordjs/builders'
import { version } from "discord.js"
import config from '../../../config'
import { repository } from '../../../package.json'
import { BaseCommand } from '../../structures/Command'
import DateFormatting from '../../utils/DateFormatting'
import Embed from '../../utils/Embed'
const memory = () => {
  const memory = process.memoryUsage().rss
  return (memory/ 1024 / 1024).toFixed(2) + "MB"
}
export default new BaseCommand(
  {
    name: 'info',
    description: '봇의 정보를 보여줍니다',
    aliases: ['정보', 'info', 'wjdqh']
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'default')
        .setTitle(`${client.user?.username} 정보`)
        .setColor('#2f3136')
    let shardEmbed
    shardEmbed = `**서버의 Shard ID#${message.guild?.shard.id} ${client.ws.ping}ms**\n`
    embed.setDescription(shardEmbed)
    embed.addField('서버 수', `${client.guilds.cache.size}서버`, true)
    embed.addField('유저 수', `${client.guilds.cache.reduce((a,b) => a + b.memberCount, 0)}명`, true)
    embed.addField('업타임', `${DateFormatting.relative(new Date(Date.now() - process.uptime() * 1000))}`, true)
    embed.addField('시스템정보', `\`\`\`diff\n- Discord.js: ${version} \n- Node.js: ${process.version}\n- OS: ${process.platform} - Memory: ${memory()} \`\`\``)
    embed.addField('유용한 링크', `[서포트 서버](https://discord.gg/WtGq7D7BZm) | [웹 대시보드](${config.web.baseurl}) | [깃허브](${repository})`)
    return message.reply({embeds: [embed]})
  },
  {
    data: new SlashCommandBuilder()
      .setName('정보')
      .setDescription('봇의 정보를 보여줍니다'),
    options: {
      name: '정보',
      isSlash: true
    },
    async execute(client, interaction) {
      let embed = new Embed(client, 'default')
        .setTitle(`${client.user?.username} 정보`)
        .setColor('#2f3136')
        .setDescription(`
        > 활동중인 서버 수
          ${client.guilds.cache.size} 
        > 유저 수
          ${client.guilds.cache.reduce((a,b) => a + b.memberCount, 0)}
        `)
      return interaction.reply({embeds: [embed]})
    }
  }
)
