const { MessageEmbed, CommandInteraction } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')
const { Warning } = require('../../schemas/warningSchemas')

module.exports = {
  name: '경고목록',
  description : '유저의 경고목록을 확인합니다',
  aliases: ['/경고목록', '/warns', '/rudrhahrfhr'],
  isSlash: true,
  data: new SlashCommandBuilder()
    .setName('경고목록')
    .setDescription('유저의 경고목록을 확인합니다')
    .addUserOption(option => option.setName('유저').setDescription('경고를 확인할 유저를 선택합니다').setRequired(true))
    .toJSON(),
  /**
   * 
   * @param {import('../../structures/BotClient')} client 
   * @param {CommandInteraction} interaction 
   */
  async execute(client, interaction) {
    await interaction.deferReply();
    const member = interaction.member
    if(!member?.permissions.has("MANAGE_CHANNELS")) return interaction.editReply('해당 명령어를 사용할 권한이 없습니다');
    let user = interaction.options.getUser('유저');
    if(!user) return interaction.editReply('유저를 선택해 주세요');
    let guildUser = interaction.guild.members.cache.get(user.id)
    if(!guildUser) return interaction.editReply('해당 서버에서 찾을 수 없는 유저입니다');
    let insertRes = await Warning.find({userId: user.id, guildId: interaction.guild.id}).limit(10)
    if(insertRes.length == 0) return interaction.editReply('해당 유저의 경고 기록이 없습니다');
    let warns = new Array();
    insertRes.forEach((reasons) => (warns.push({name: "ID: " + reasons._id.toString(), value: "사유: " +reasons.reason})))
    const embed = new MessageEmbed()
        .setColor('#ff7f00')
        .setTitle('경고')
        .setDescription(`${user.username}님의 최근 10개의 경고 기록입니다`)
        .addFields(warns)
    return interaction.editReply({ embeds: [embed]});
  }
}