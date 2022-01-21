const { MessageEmbed, CommandInteraction } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { Warning } = require("../../schemas/warningSchemas");
var ObjectId = (require('mongoose').Types.ObjectId);

String.prototype.toObjectId = function() {    
  return new ObjectId(this.toString());
};

module.exports = {
  name: "경고",
  description: "경고 관련 명령어입니다",
  isSlash: true,
  data: new SlashCommandBuilder()
    .setName("경고")
    .setDescription("경고 관련 명령어 입니다")
    //.addSubcommand(option =>
    //  option
    //    .setName('추가')
    //    .setDescription('경고를 추가합니다')
    //    .addUserOption(user => user.setName('유저').setDescription('유저를 적어주세요').setRequired(true))
    //)
    .addStringOption(option =>
      option
        .setName("옵션")
        .setDescription("사용할 명령어 방식을 선택해주세요")
        .setRequired(true)
        .addChoice("지급", "add")
        .addChoice("삭감", "remove")
        .addChoice("목록", "list")
    )
    .addUserOption(option =>
      option
        .setName("유저")
        .setDescription("경고를 확인할 유저를 선택합니다")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("사유").setDescription("경고의 사유를 입력합니다 (경고 지급시 사용)")
    )
    .addStringOption(option =>
      option.setName("아이디").setDescription("경고의 아이디를 입력합니다 (경고 삭감시 사용)")
    )
    .toJSON(),
  /**
   *
   * @param {import('../../structures/BotClient')} client
   * @param {CommandInteraction} interaction
   */
  async execute(client, interaction) {
    if (interaction.type === "DEFAULT" && interaction.content.startsWith(client.config.bot.prefix) + this.name) return interaction.reply('해당 명령어는 (/)커맨드만 사용 가능합니다')
    await interaction.deferReply();
    const member = interaction.member;
    if (!member?.permissions.has("MANAGE_CHANNELS"))
      return interaction.editReply("해당 명령어를 사용할 권한이 없습니다");
    let option = interaction.options.getString('옵션')
    let reason = interaction.options.getString("사유");
    let user = interaction.options.getUser("유저");
    if (!option) return interaction.editReply("옵션을 선택해 주세요");
    if (!user) return interaction.editReply("유저를 선택해 주세요");
    let guildUser = interaction.guild.members.cache.get(user.id);
    if (!guildUser)
      return interaction.editReply("해당 서버에서 찾을 수 없는 유저입니다");
    if (!reason) reason = "없음";
    if(option === 'add') {
      let insertRes = await Warning.insertMany({
        userId: user.id,
        guildId: interaction.guild.id,
        reason: reason,
        managerId: member.id,
      });
      const embedAdd = new MessageEmbed()
      .setColor("#FF0000")
      .setTitle("경고")
      .setDescription("아래와 같이 경고가 추가되었습니다")
      .addFields(
        { name: "경고 ID", value: insertRes[0]._id.toString() },
        {
          name: "유저",
          value: `<@${user.id}>` + "(" + "`" + user.id + "`" + ")",
          inline: true,
        },
        { name: "사유", value: reason, inline: true }
      );
      return interaction.editReply({ embeds: [embedAdd] });
    } else if (option === 'remove') {
      let warningID = interaction.options.getString("아이디");
      if(!ObjectId.isValid(warningID)) return interaction.editReply('찾을 수 없는 경고 아이디 입니다');
      let warningIDtoObject = warningID.toObjectId();
      let findWarnDB = await Warning.findOne({userId: user.id, guildId: interaction.guild.id, _id: warningIDtoObject})
      if(!findWarnDB) return interaction.editReply('찾을 수 없는 경고 아이디 입니다');
      await Warning.deleteOne({userId: user.id, guildId: interaction.guild.id, _id: warningIDtoObject})
      const embedRemove = new MessageEmbed()
          .setColor('#008000')
          .setTitle('경고')
          .setDescription("아래와 같이 경고가 삭감되었습니다")
          .addFields(
              { name: "유저", value: `<@${user.id}>` + "(" + "`" + user.id + "`" + ")", inline: true},
              { name: "경고 ID", value: warningID, inline: true}
          )
      return interaction.editReply({ embeds: [embedRemove]});
    } else if (option === 'list') {
      let insertRes = await Warning.find({userId: user.id, guildId: interaction.guild.id}).sort({published_date: -1}).limit(5)
      if(insertRes.length == 0) return interaction.editReply('해당 유저의 경고 기록이 없습니다');
      let warns = new Array();
      insertRes.forEach((reasons) => (warns.push({name: "ID: " + reasons._id.toString(), value: "사유: " +reasons.reason})))
      const embedList = new MessageEmbed()
          .setColor('#ff7f00')
          .setTitle('경고')
          .setDescription(`${user.username}님의 최근 5개의 경고 기록입니다`)
          .addFields(warns)
      return interaction.editReply({ embeds: [embedList]});
    } else {
      return interaction.editReply("찾을 수 없는 경고 방식입니다");
    }
  },
};
