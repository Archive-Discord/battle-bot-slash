
const Discord = require('discord.js')
const Embed = require('../../utils/Embed')
const { Premium } = require('../../schemas/premiumSchemas')
const Logger = require('../../utils/Logger')
const log = new Logger('premium')

module.exports = {
  name: '프리미엄추가',
  description : '서버에 프리미엄을 추가합니다',
  aliases: ['addpremium'],
  isSlash: false,
  /**
   * @param {import('../../structures/BotClient')} client 
   * @param {Discord.Message} message 
   * @param {string[]} args 
   */
  async execute(client, message, args) {
    if(!client.dokdo.owners.includes(message.author.id))
      return message.reply(`해당 명령어는 ${client.user.username}의 주인이 사용할 수 있는 명령어입니다.`)

    let LoadingEmbed = new Embed(client, 'warn')
      .setTitle('잠시만 기다려주십시요')
      .setDescription('해당 서버의 정보를 찾는 중이에요...')
    let msg = await message.reply({embeds: [LoadingEmbed]})
    let guild = client.guilds.cache.get(args[0])
    let ErrorEmbed = new Embed(client, 'error')
      .setTitle('오류!')
      .setDescription('해당 서버는 봇이 입장되어 있지 않습니다')
    if(!guild) return await msg.edit({embeds: [ErrorEmbed]})
    let premiumDB = await Premium.findOne({guild_id: guild.id})
    let date = new Date(args[1])
    if(!premiumDB) {
        let premium = new Premium()
        premium.guild_id = guild.id
        premium.nextpay_date = date
        premium.save(async(err) => {
            if(err) {
                let ErrorEmbed = new Embed(client, 'error')
                    .setTitle('오류!')
                    .setDescription('데이터 저장중 오류가 발생했습니다')
                return await msg.edit({embeds: [ErrorEmbed]})
            }
        })
        let successEmbed = new Embed(client, 'success')
                    .setTitle('프리미엄')
                    .setDescription(`관리자 ${message.author.username}에 의하여 ${guild.name}서버의 프리미엄 만료일이 ${date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월 ' + date.getDate() + '일'} 로 설정되었습니다`)
        try {
            let owner = client.users.cache.get(guild.ownerId)
            await owner.send({embeds: [successEmbed]})
        } catch(e) {
            log.error(e)
        }
        log.info(`관리자 ${message.author.username}에 의하여 ${guild.name}서버의 프리미엄 만료일이 ${date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월 ' + date.getDate() + '일'} 로 설정되었습니다`)
        return await msg.edit({embeds: [successEmbed]})
    } else {
        await Premium.updateOne({guild_id: guild.id}, {$set: {nextpay_date: date}})
        let successEmbed = new Embed(client, 'success')
                    .setTitle('프리미엄')
                    .setDescription(`관리자 ${message.author.username}에 의하여 ${guild.name}서버의 프리미엄 만료일이 ${date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월 ' + date.getDate() + '일'} 로 설정되었습니다`)
        try {
            let owner = client.users.cache.get(guild.ownerId)
            await owner.send({embeds: [successEmbed]})
        } catch(e) {
            log.error(e)
        }
        log.info(`관리자 ${message.author.username}에 의하여 ${guild.name}서버의 프리미엄 만료일이 ${date.getFullYear() + '년 ' + date.getMonth() + 1 + '월 ' + date.getDate() + '일'} 로 설정되었습니다`)
        return await msg.edit({embeds: [successEmbed]})

    }
  },
}