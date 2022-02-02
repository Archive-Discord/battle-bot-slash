import { CommandInteraction, GuildMember, Message, MessageEmbed } from "discord.js";
import Embed from '../../utils/Embed';
import { SlashCommandBuilder } from "@discordjs/builders";
import Warning from "../../schemas/warningSchemas";
import BotClient from "@client";
import { Types } from "mongoose";
let { ObjectId } = Types;

function toObjectId(string: string) {
  return new Types.ObjectId(string.toString());
};

export default {
  name: "경고",
  description: "경고 관련 명령어입니다",
  isSlash: true,
  data: new SlashCommandBuilder()
    .setName("경고")
    .setDescription("경고 관련 명령어 입니다")
    .addSubcommand(option =>
      option
        .setName('지급')
        .setDescription('경고를 지급합니다')
        .addUserOption(user => user.setName('user').setDescription('유저를 적어주세요').setRequired(true))
        .addStringOption(reason => reason.setName('사유').setDescription('사유를 적어주세요').setRequired(false))
    )
    .addSubcommand(option =>
      option
        .setName('차감')
        .setDescription('경고를 차감합니다')
        .addUserOption(user => user.setName('user').setDescription('유저를 적어주세요').setRequired(true))
        .addStringOption(id => id.setName('id').setDescription('차감할 경고의 id를 적어주세요').setRequired(true))
        .addStringOption(string => string.setName('사유').setDescription('사유를 적어주세요').setRequired(false))
    )
    .addSubcommand(option =>
      option
        .setName('조회')
        .setDescription('경고를 조회합니다')
        .addUserOption(user => user.setName('user').setDescription('유저를 적어주세요').setRequired(false))
        .addNumberOption(number => number.setName('페이지').setDescription('페이지를 적어주세요').setRequired(false))
    )
    .toJSON(),
  /**
   *
   * @param {import('../../structures/BotClient')} client
   * @param {CommandInteraction} interaction
   */
  async execute(client: BotClient, interaction: CommandInteraction) {
    //if (interaction.type === "DEFAULT" && interaction.content.startsWith(client.config.bot.prefix) + this.name) return interaction.reply('해당 명령어는 (/)커맨드만 사용 가능합니다')
    await interaction.deferReply();

    const member = interaction.member as GuildMember
    if (!member?.permissions.toString().includes('MANAGE_CHANNELS'))
      return interaction.editReply("해당 명령어를 사용할 권한이 없습니다");
    let reason = interaction.options.getString("사유");
    let user = interaction.options.getUser('user');
    if (!reason) reason = "없음"

    let subcommand = interaction.options.getSubcommand()


    if (subcommand === '지급') {

      let insertRes = await Warning.insertMany({
        userId: user?.id,
        guildId: interaction.guild?.id,
        reason: reason,
        managerId: member.id,
      });

      let embedAdd = new Embed(client, 'info')
        .setTitle("경고")
        .setDescription("아래와 같이 경고가 추가되었습니다")
        .setFields(
          { name: "경고 ID", value: insertRes[0]._id.toString() },
          { name: "유저", value: `<@${user?.id}>(\`${user?.id}\`)`, inline: true },
          { name: "사유", value: reason, inline: true })
      console.log(embedAdd)
      return interaction.editReply({ embeds: [embedAdd] });
    } else if (subcommand === '차감') {

      let warningID = interaction.options.getString('id') as string;
      if (!ObjectId.isValid(warningID)) return interaction.editReply('찾을 수 없는 경고 아이디 입니다');
      let warningIDtoObject = toObjectId(warningID);
      let findWarnDB = await Warning.findOne({ userId: user?.id, guildId: interaction.guild?.id, _id: warningIDtoObject })

      if (!findWarnDB) return interaction.editReply('찾을 수 없는 경고 아이디 입니다');

      await Warning.deleteOne({ userId: user?.id, guildId: interaction.guild?.id, _id: warningIDtoObject })

      const embedRemove = new MessageEmbed()
        .setColor('#008000')
        .setTitle('경고')
        .setDescription("아래와 같이 경고가 삭감되었습니다")
        .addFields(
          { name: "유저", value: `<@${user?.id}>(\`${user?.id}\`)`, inline: true },
          { name: "경고 ID", value: warningID, inline: true }
        )
      return interaction.editReply({ embeds: [embedRemove] });
    } else if (subcommand === '조회') {
      let insertRes = await Warning.find({ userId: user?.id, guildId: interaction.guild?.id }).sort({ published_date: -1 }).limit(5)

      let warns = new Array();

      if (insertRes.length == 0) return interaction.editReply('해당 유저의 경고 기록이 없습니다');

      insertRes.forEach((reasons: any) => (warns.push({ name: "ID: " + reasons._id.toString(), value: "사유: " + reasons.reason })))

      const embedList = new MessageEmbed()
        .setColor('#ff7f00')
        .setTitle('경고')
        .setDescription(`${user?.username}님의 최근 5개의 경고 기록입니다`)
        .addFields(warns)

      return interaction.editReply({ embeds: [embedList] });
    }
  },
};
