const { MessageEmbed, CommandInteraction } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')
const { Warning } = require('../../schemas/warningSchemas')

module.exports = {
  name: '경고',
  description : '유저에게 경고를 추가합니다',
  aliases: ['/경고', '/warn', '/rudrh'],
  isSlash: true,
  data: new SlashCommandBuilder()
    .setName('경고')
    .setDescription('유저에게 경고를 추가합니다')
    .addUserOption(option => option.setName('유저').setDescription('경고를 지급할 유저를 선택합니다').setRequired(true))
    .addStringOption(option => option.setName('사유').setDescription('경고의 사유를 입력합니다'))
    .toJSON(),
  /**
   * 
   * @param {import('../../structures/BotClient')} client 
   * @param {CommandInteraction} interaction 
   */
  async execute(client, interaction) {
    const member = interaction.member
    if(!member?.permissions.has("MANAGE_CHANNELS")) return await interaction.reply('해당 명령어를 사용할 권한이 없습니다');
    let reason = interaction.options.getString('사유');
    let user = interaction.options.getUser('유저');
    if(!user) return await interaction.reply('유저를 선택해 주세요');
    let guildUser = interaction.guild.members.cache.get(user.id)
    if(!guildUser) return await interaction.reply('해당 서버에서 찾을 수 없는 유저입니다');
    if(!reason) reason = '없음'
    let insertRes = await Warning.insertMany({userId: user.id, guildId: interaction.guild.id, reason: reason, managerId: member.id})
    const embed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('경고')
        .setDescription("아래와 같이 경고가 추가되었습니다")
        .addFields(
            { name: "경고 ID", value: insertRes[0]._id.toString() },
            { name: "유저", value: `<@${user.id}>` + "(" + "`" + user.id + "`" + ")", inline: true},
            { name: "사유", value: reason, inline: true}
        )
    await interaction.reply({ embeds: [embed]});
  }
}