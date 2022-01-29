const { CommandInteraction } = require('discord.js') // eslint-disable-line no-unused-vars
const Verify = require('../../schemas/userVerifySchemas')
const VerifySetting = require('../../schemas/verifySchemas')
const createCapcha = require('../../utils/createCapcha')
const Embed = require('../../utils/Embed')
const { anyid } = require('anyid')
const { web } = require('../../../config')
const mailSender = require('../../utils/MailSender')

module.exports = {
  name: 'verify',
  description: '인증 반응',
  /**
   *
   * @param {import('../../structures/BotClient')} client
   * @param {CommandInteraction} interaction
   */
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true })
    let VerifySettingDB = await VerifySetting.findOne({
      guild_id: interaction.guild.id,
    })
    if(!VerifySettingDB) return interaction.editReply('찾을 수 없는 서버 정보입니다')
    if (VerifySettingDB.type === 'default') {
      let captcha = await createCapcha().catch(e => {
        interaction.editReply('캡챠 생성중 오류가 발생했습니다')
        return console.log(e)
      })
      let captchaEmbed = new Embed(client, 'info')
        .setTitle('인증')
        .setDescription('아래코드를 입력해주세요 제한시간: 30초')
        .setImage('attachment://captcha.png')
      await interaction.editReply(
        {
          embeds: [captchaEmbed],
          files: [{ name: 'captcha.png', attachment: captcha.image }],
        })
      const filter = m => {
        return m.author.id == interaction.user.id
      }
      await interaction.channel
        .awaitMessages({
          filter: filter,
          max: 1,
          time: 30000,
          errors: ['time'],
        })
        .then(async res => {
          await res.first().delete()
          let answer = String(res.first())
          if (answer === captcha.text) {
            let captchaSuccess = new Embed(client, 'success')
              .setTitle('인증')
              .setDescription('인증을 성공했습니다')
            try {
              await interaction.member.roles.add(VerifySettingDB.role_id)
            } catch (e) {
              let captchaError = new Embed(client, 'error')
                .setTitle('인증')
                .setDescription('인증완료 역할 지급중 오류가 발생했습니다')
              if (e) return interaction.editReply({ embeds: [captchaError] })
            }
            return interaction.editReply({ embeds: [captchaSuccess] })
          } else {
            let captchaDeny = new Embed(client, 'error')
              .setTitle('인증')
              .setDescription('인증을 실패했습니다 다시 시도해주세요')
            return interaction.editReply({ embeds: [captchaDeny] })
          }
        })
        .catch(() => {
          let captchaTimeout = new Embed(client, 'error')
            .setTitle('인증')
            .setDescription('인증시간이 초과되었습니다 다시 시도해주세요')
          return interaction.editReply({ embeds: [captchaTimeout] })
        })
    } else if (VerifySettingDB.type === 'captcha') {
      let token = anyid().encode('Aa0').bits(48 * 8).random().id()
      let verify = new Verify()
      verify.guild_id = interaction.guild.id
      verify.user_id = interaction.user.id
      verify.status = 'pending'
      verify.token = token
      verify.save((err) => {
        if(err) return interaction.editReply('정보 생성중 오류가 발생했습니다') 
      })
      let captchaVerify = new Embed(client, 'success')
        .setTitle('인증')
        .setDescription('위 링크로 접속하여 인증을 진행해주세요')
      await interaction.user.send({embeds: [captchaVerify]})
      await interaction.user.send(`${web.baseurl}/verify?token=${token}`)
      return interaction.editReply('DM으로 인증정보를 보내드렸습니다 DM을 확인해주세요')
    } else if (VerifySettingDB.type === 'email') {
      let code = Math.random().toString(36).substr(2,7)
      let captchaEmail = new Embed(client, 'success')
        .setTitle('인증')
        .setDescription('인증을 진행하실 이메일 주소를 30초 내로 입력해주세요!')
      await interaction.editReply({embeds: [captchaEmail]})
      const filter = m => {
        return m.author.id == interaction.user.id
      }
      await interaction.channel.awaitMessages({filter: filter, max: 1, time: 30000, errors: ['time']})
        .then(async res => {
          let regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i
          await res.first().delete()
          let answer = String(res.first())
          if(answer.match(regExp) != null) {
            mailSender.sendGmail({ serverName: interaction.guild.name, code: code, email: answer })
            let captchaEmailSended = new Embed(client, 'success')
              .setTitle('인증')
              .setDescription('이메일로 인증번호가 발송되었습니다! 2분 내로 인증번호를 입력해주세요')
            await interaction.editReply({embeds: [captchaEmailSended]})
            await interaction.channel.awaitMessages({filter: filter, max: 1, time: 120000, errors: ['time']})
              .then(async(res2) =>{
                await res2.first().delete()
                let answer2 = String(res2.first())
                if (answer2 === code) {
                  let captchaSuccess = new Embed(client, 'success')
                    .setTitle('인증')
                    .setDescription('인증을 성공했습니다')
                  try {
                    await interaction.member.roles.add(VerifySettingDB.role_id)
                  } catch (e) {
                    let captchaError = new Embed(client, 'error')
                      .setTitle('인증')
                      .setDescription('인증완료 역할 지급중 오류가 발생했습니다')
                    if (e) return interaction.editReply({ embeds: [captchaError] })
                  }
                  return interaction.editReply({ embeds: [captchaSuccess] })
                } else {
                  let captchaDeny = new Embed(client, 'error')
                    .setTitle('인증')
                    .setDescription('인증을 실패했습니다 다시 시도해주세요')
                  return interaction.editReply({ embeds: [captchaDeny] })
                }
              }).catch(() => {
                let captchaTimeout = new Embed(client, 'error')
                  .setTitle('인증')
                  .setDescription('인증시간이 초과되었습니다 다시 시도해주세요')
                return interaction.editReply({ embeds: [captchaTimeout] })
              })
          } else {
            let captchaTimeout = new Embed(client, 'error')
              .setTitle('인증')
              .setDescription('올바른 이메일 형식이 아닙니다 다시 시도해주세요')
            return interaction.editReply({ embeds: [captchaTimeout] })
          }
        }).catch(() => {
          let captchaTimeout = new Embed(client, 'error')
            .setTitle('인증')
            .setDescription('메일 입력시간이 초과되었습니다 다시 시도해주세요')
          return interaction.editReply({ embeds: [captchaTimeout] })
        })
    }
  },
}
