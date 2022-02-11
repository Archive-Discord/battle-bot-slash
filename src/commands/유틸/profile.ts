import { BaseCommand, SlashCommand } from '../../structures/Command'
import UserDB from '../../schemas/userSchema'
import Embed from '../../utils/Embed'
import { SlashCommandBuilder, userMention } from '@discordjs/builders'
import DateFormatting from '../../utils/DateFormatting'

export default new BaseCommand(
  {
    name: 'profile',
    description: '유저의 정보를 확인합니다.',
    aliases: ['프로필', 'vmfhvlf', 'vmfhvlf']
  },
  async (client, message, args) => {
    if(!message.guild) {
      let embed = new Embed(client, 'error')
      embed.setTitle('이런...')
      embed.setDescription('이 명령어는 서버에서만 사용 가능합니다')
      return message.reply({embeds: [embed]})
    }
    if(!args[0]) args[0] = message.author.id
    let user = message.guild.members.cache.get(args[0])
    if(message.mentions.users.first()) user = message.guild.members.cache.get(message.mentions.users.first()?.id as string)
    if(!user) {
      let embed = new Embed(client, 'error')
      embed.setTitle('이런...')
      embed.setDescription('찾을 수 없는 유저입니다')
      return message.reply({embeds: [embed]})
    }
    let userdb = await UserDB.findOne({id: user.id})

    let embed = new Embed(client, 'success')
      .setTitle(`${user.user.username}님의 정보`)
      .setThumbnail(user.displayAvatarURL())
      .addField(`유저`, userMention(user.id), true)
      .addField(`아이디`, `\`${user.id}\``, true)
      .addField(`상태`, (user.presence ? (user.presence.activities.length === 0 ? "없음" : user.presence.activities.join(", ") ) : "오프라인"), true)
      .addField(`서버 가입일`, DateFormatting._format(user.joinedAt as Date,''), true)
      .addField(`계정 생성일`, DateFormatting._format(user.user.createdAt as Date,''), true)
      .addField(`${client.user?.username} 웹 가입일`, (userdb ? DateFormatting._format(userdb.published_date ,'') : "미가입"))
    return message.reply({embeds: [embed]})
  },
  {
    data: new SlashCommandBuilder()
    .setName('프로필')
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("프로필을 확인할 유저를 선택합니다")
        .setRequired(true)
    )
    .setDescription('유저의 프로필을 확인합니다'),
    options: {
      name: '프로필',
      isSlash: true
    },
    async execute(client, interaction) {
      if(!interaction.guild) {
        let embed = new Embed(client, 'error')
        embed.setTitle('이런...')
        embed.setDescription('이 명령어는 서버에서만 사용 가능합니다')
        return interaction.reply({embeds: [embed]})
      }
      let seluser = interaction.options.getUser('user')
      let user = interaction.guild.members.cache.get(seluser?.id as string)
      if(!user) {
        let embed = new Embed(client, 'error')
        embed.setTitle('이런...')
        embed.setDescription('찾을 수 없는 유저입니다')
        return interaction.reply({embeds: [embed]})
      }
      let userdb = await UserDB.findOne({id: user.id})
  
      let embed = new Embed(client, 'success')
        .setTitle(`${user.user.username}님의 정보`)
        .setThumbnail(user.displayAvatarURL())
        .addField(`유저`, userMention(user.id), true)
        .addField(`아이디`, `\`${user.id}\``, true)
        .addField(`상태`, (user.presence ? (user.presence.activities.length === 0 ? "없음" : user.presence.activities.join(", ") ) : "오프라인"), true)
        .addField(`서버 가입일`, DateFormatting._format(user.joinedAt as Date,''), true)
        .addField(`계정 생성일`, DateFormatting._format(user.user.createdAt as Date,''), true)
        .addField(`${client.user?.username} 웹 가입일`, (userdb ? DateFormatting._format(userdb.published_date ,'') : "미가입"))
      return interaction.reply({embeds: [embed]})
    }
  }
)

