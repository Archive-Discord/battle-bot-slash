const { MessageEmbed, CommandInteraction } = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')
const { Warning } = require('../../schemas/warningSchemas')
var ObjectId = (require('mongoose').Types.ObjectId);

String.prototype.toObjectId = function() {    
    return new ObjectId(this.toString());
};

module.exports = {
  name: '경고삭감',
  description : '유저의 경고를 삭감합니다',
  aliases: ['/경고삭감', '/delwarn', '/rudrhtkrrka'],
  isSlash: true,
  data: new SlashCommandBuilder()
    .setName('경고삭감')
    .setDescription('유저의 경고를 삭감합니다')
    .addUserOption(option => option.setName('유저').setDescription('경고를 삭감할 유저를 선택합니다').setRequired(true))
    .addUserOption(option => option.setName('아이디').setDescription('경고의 아이디를 입력합니다').setRequired(true))
    .toJSON(),
  /**
   * 
   * @param {import('../../structures/BotClient')} client 
   * @param {CommandInteraction} interaction 
   */
  async execute(client, interaction) {
    const member = interaction.member
        if(!member?.permissions.has("MANAGE_CHANNELS")) return await interaction.reply('해당 명령어를 사용할 권한이 없습니다');
        let warningID = interaction.options.getString('아이디');
        let user = interaction.options.getUser('유저');
        if(!user) return await interaction.reply('유저를 선택해 주세요');
        let guildUser = interaction.guild.members.cache.get(user.id)
        if(!guildUser) return await interaction.reply('해당 서버에서 찾을 수 없는 유저입니다');
        if(!warningID) return await interaction.reply('경고 ID를 입력해주세요');
        if(!ObjectId.isValid(warningID)) return await interaction.reply('찾을 수 없는 경고 아이디 입니다');
        let warningIDtoObject = warningID.toObjectId();
        let findWarnDB = await Warning.findOne({userId: user.id, guildId: interaction.guild.id, _id: warningIDtoObject})
        if(!findWarnDB) return await interaction.reply('찾을 수 없는 경고 아이디 입니다');
        await Warning.deleteOne({userId: user.id, guildId: interaction.guild.id, _id: warningIDtoObject})
        const embed = new MessageEmbed()
            .setColor('#008000')
            .setTitle('경고')
            .setDescription("아래와 같이 경고가 삭감되었습니다")
            .addFields(
                { name: "유저", value: `<@${user.id}>` + "(" + "`" + user.id + "`" + ")", inline: true},
                { name: "경고 ID", value: warningID, inline: true}
            )
        await interaction.reply({ embeds: [embed]});
  }
}