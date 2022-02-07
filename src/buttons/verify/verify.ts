import { Guild, GuildMember, Message } from "discord.js"
import VerifySetting from "src/schemas/verifySetting"
import { BaseButton } from "src/structures/Command"
import captchaCreate from "src/utils/createCapcha"
import Embed from "src/utils/Embed"
import { anyid } from "anyid"
import Verify from "src/schemas/verify"
import config from "config"
import { guildProfileLink } from "src/utils/convert"
import mailSender from "src/utils/MailSender"

export default new BaseButton({
  name: 'verify'
},async (client, interaction) => {
  await interaction.deferReply({ ephemeral: true })
    const VerifySettingDB = await VerifySetting.findOne({
      guild_id: interaction.guild?.id,
    })
    if(!VerifySettingDB) return interaction.editReply('찾을 수 없는 서버 정보입니다')
    if (VerifySettingDB.type === 'default') {
      const captcha = captchaCreate()
      const captchaEmbed = new Embed(client, 'info')
        .setTitle('인증')
        .setDescription('아래코드를 입력해주세요 제한시간: 30초')
        .setImage('attachment://captcha.png')
      await interaction.editReply(
        {
          embeds: [captchaEmbed],
          files: [{ name: 'captcha.png', attachment: captcha.buffer }],
        })
      const filter = (m: Message) => {
        return m.author.id == interaction.user.id
      }
      await interaction.channel?.awaitMessages({
          filter: filter,
          max: 1,
          time: 30000,
          errors: ['time'],
        })
        .then(async res => {
          await res.first()?.delete()
          const answer = String(res.first())
          if (answer === captcha.text) {
            const captchaSuccess = new Embed(client, 'success')
              .setTitle('인증')
              .setDescription('인증을 성공했습니다')
            try {
              const member = interaction.member as GuildMember
              await member.roles.add(VerifySettingDB?.role_id as string)
            } catch (e) {
              const captchaError = new Embed(client, 'error')
                .setTitle('인증')
                .setDescription('인증완료 역할 지급중 오류가 발생했습니다')
              if (e) return interaction.editReply({ embeds: [captchaError] })
            }
            return interaction.editReply({ embeds: [captchaSuccess] })
          } else {
            const captchaDeny = new Embed(client, 'error')
              .setTitle('인증')
              .setDescription('인증을 실패했습니다 다시 시도해주세요')
            return interaction.editReply({ embeds: [captchaDeny] })
          }
        })
        .catch(() => {
          const captchaTimeout = new Embed(client, 'error')
            .setTitle('인증')
            .setDescription('인증시간이 초과되었습니다 다시 시도해주세요')
          return interaction.editReply({ embeds: [captchaTimeout] })
        })
    } else if (VerifySettingDB.type === 'captcha') {
      const token = anyid().encode('Aa0').bits(48 * 8).random().id()
      const verify = new Verify()
      verify.guild_id = interaction.guild?.id as string;
      verify.user_id = interaction.user.id
      verify.status = 'pending'
      verify.token = token
      verify.save((err) => {
        if(err) return interaction.editReply('정보 생성중 오류가 발생했습니다') 
      })
      const captchaVerify = new Embed(client, 'success')
        .setTitle('인증')
        .setDescription(`[여기](${config.web.baseurl}/verify?token=${token})로 접속하여 인증을 진행해주세요`)
      const captchaGuildEmbed = new Embed(client, 'info')
      captchaGuildEmbed.setThumbnail(guildProfileLink(interaction.guild as Guild))
      captchaGuildEmbed.setTitle(`${interaction.guild?.name} 서버 인증`)
      captchaGuildEmbed.setDescription(`${interaction.guild?.name}서버에서 ${interaction.user.username}님에게 인증을 요청합니다`)
      captchaGuildEmbed.setURL(`${config.web.baseurl}/verify?token=${token}`)
      await interaction.user.send({embeds: [captchaVerify]})
      await interaction.user.send({embeds: [captchaGuildEmbed]})
      return interaction.editReply('DM으로 인증정보를 보내드렸습니다 DM을 확인해주세요')
    } else if (VerifySettingDB.type === 'email') {
      const code = Math.random().toString(36).substr(2,7)
      const captchaEmail = new Embed(client, 'success')
        .setTitle('인증')
        .setDescription('인증을 진행하실 이메일 주소를 30초 내로 입력해주세요!')
      await interaction.editReply({embeds: [captchaEmail]})
      const filter = (m: Message) => {
        return m.author.id == interaction.user.id
      }
      await interaction.channel?.awaitMessages({filter: filter, max: 1, time: 30000, errors: ['time']})
        .then(async res => {
          const regExp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i
          await res.first()?.delete()
          const answer = String(res.first())
          if(answer.match(regExp) != null) {
            mailSender.sendGmail({ serverName: interaction.guild?.name as string, code: code, email: answer })
            const captchaEmailSended = new Embed(client, 'success')
              .setTitle('인증')
              .setDescription('이메일로 인증번호가 발송되었습니다! 2분 내로 인증번호를 입력해주세요')
            await interaction.editReply({embeds: [captchaEmailSended]})
            await interaction.channel?.awaitMessages({filter: filter, max: 1, time: 120000, errors: ['time']})
              .then(async(res2) =>{
                await res2.first()?.delete()
                const answer2 = String(res2.first())
                if (answer2 === code) {
                  const captchaSuccess = new Embed(client, 'success')
                    .setTitle('인증')
                    .setDescription('인증을 성공했습니다')
                  try {
                    const member = interaction.member as GuildMember
                    await member.roles.add(VerifySettingDB?.role_id as string)
                  } catch (e) {
                    const captchaError = new Embed(client, 'error')
                      .setTitle('인증')
                      .setDescription('인증완료 역할 지급중 오류가 발생했습니다')
                    if (e) return interaction.editReply({ embeds: [captchaError] })
                  }
                  return interaction.editReply({ embeds: [captchaSuccess] })
                } else {
                  const captchaDeny = new Embed(client, 'error')
                    .setTitle('인증')
                    .setDescription('인증을 실패했습니다 다시 시도해주세요')
                  return interaction.editReply({ embeds: [captchaDeny] })
                }
              }).catch(() => {
                const captchaTimeout = new Embed(client, 'error')
                  .setTitle('인증')
                  .setDescription('인증시간이 초과되었습니다 다시 시도해주세요')
                return interaction.editReply({ embeds: [captchaTimeout] })
              })
          } else {
            const captchaTimeout = new Embed(client, 'error')
              .setTitle('인증')
              .setDescription('올바른 이메일 형식이 아닙니다 다시 시도해주세요')
            return interaction.editReply({ embeds: [captchaTimeout] })
          }
        }).catch(() => {
          const captchaTimeout = new Embed(client, 'error')
            .setTitle('인증')
            .setDescription('메일 입력시간이 초과되었습니다 다시 시도해주세요')
          return interaction.editReply({ embeds: [captchaTimeout] })
        })
    }
})