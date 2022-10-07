import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildMember, EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../../structures/Command';
import Embed from '../../utils/Embed';
import mongoose from 'mongoose';
import Warning from '../../schemas/Warning';
import { userWarnAdd } from '../../utils/WarnHandler';
let ObjectId = mongoose.Types.ObjectId;
// @ts-ignore
String.prototype.toObjectId = function () {
  // @ts-ignore
  return new ObjectId(this.toString());
};

export default new BaseCommand(
  {
    name: 'warning',
    description: '유저에게 경고를 추가합니다',
    aliases: ['경고'],
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'error')
      .setTitle(client.i18n.t('main.title.error'))
      .setDescription(client.i18n.t('main.description.slashcommand'));
    return message.reply({ embeds: [embed] });
  },
  {
    // @ts-ignore
    data: new SlashCommandBuilder()
      .setName('경고')
      .setDescription('경고 관련 명령어 입니다.')
      .addSubcommand((option) =>
        option
          .setName('지급')
          .setDescription('경고를 지급합니다.')
          .addUserOption((user) =>
            user.setName('user').setDescription('유저를 적어주세요.').setRequired(true),
          )
          .addStringOption((reason) =>
            reason.setName('사유').setDescription('사유를 적어주세요.').setRequired(false),
          ),
      )
      .addSubcommand((option) =>
        option
          .setName('차감')
          .setDescription('경고를 차감합니다.')
          .addUserOption((user) =>
            user.setName('user').setDescription('유저를 적어주세요.').setRequired(true),
          )
          .addStringOption((id) =>
            id.setName('id').setDescription('차감할 경고의 ID를 적어주세요.').setRequired(true),
          ),
      )
      .addSubcommand((option) =>
        option
          .setName('조회')
          .setDescription('경고를 조회합니다.')
          .addUserOption((user) =>
            user.setName('user').setDescription('유저를 적어주세요.').setRequired(true),
          )
          .addNumberOption((number) =>
            number.setName('페이지').setDescription('페이지를 적어주세요.').setRequired(false),
          ),
      ),
    options: {
      name: '경고',
      isSlash: true,
    },
    async execute(client, interaction) {
      await interaction.deferReply({ ephemeral: true });
      let member = interaction.member as GuildMember;
      member = interaction.guild?.members.cache.get(member.id) as GuildMember;
      if (!member.permissions.has('ManageChannels'))
        return interaction.editReply(client.i18n.t('commands.Warning.message.permission'));
      let reason = interaction.options.getString('사유');
      let user = interaction.options.getUser('user');
      if (!reason) reason = 'None';

      let subcommand = interaction.options.getSubcommand();
      if (subcommand === '지급') {
        return userWarnAdd(
          client,
          user?.id as string,
          interaction.guild?.id as string,
          reason,
          interaction.user.id,
          interaction,
        );
      } else if (subcommand === '차감') {
        let warningID = interaction.options.getString('id');
        // @ts-ignore
        if (!ObjectId.isValid(warningID as string))
          return interaction.editReply(client.i18n.t('commands.Warning.message.notfound'));
        // @ts-ignore
        let warningIDtoObject = warningID.toObjectId();
        let findWarnDB = await Warning.findOne({
          userId: user?.id,
          guildId: interaction.guild?.id,
          _id: warningIDtoObject,
        });

        if (!findWarnDB)
          return interaction.editReply(client.i18n.t('commands.Warning.message.notfound'));

        await Warning.deleteOne({
          userId: user?.id,
          guildId: interaction.guild?.id,
          _id: warningIDtoObject,
        });

        const embedRemove = new EmbedBuilder()
          .setColor('#2f3136')
          .setTitle(client.i18n.t('commands.Warning.title.warn'))
          .setDescription(client.i18n.t('commands.Warning.description.deleted'))
          .addFields({
            name: client.i18n.t('commands.Warning.fields.user'),
            value: client.i18n.t('commands.Warning.fields.userv', {
              id: user?.id,
            }),
            inline: true,
          })
          .addFields({
            name: client.i18n.t('commands.Warning.fields.id'),
            value: warningID as string,
            inline: true,
          });
        return interaction.editReply({ embeds: [embedRemove] });
      } else if (subcommand === '조회') {
        let warningID = interaction.options.getNumber('페이지');
        let insertRes = await Warning.find({
          userId: user?.id,
          guildId: interaction.guild?.id,
        })
          .sort({ published_date: -1 })
          .limit(5)
          .skip(warningID ? (warningID - 1) * 5 : 0);
        let insertResLength = await Warning.find({
          userId: user?.id,
          guildId: interaction.guild?.id,
        });
        let warns = new Array();

        if (insertRes.length == 0)
          return interaction.editReply(client.i18n.t('commands.Warning.message.no'));

        insertRes.forEach((reasons) =>
          warns.push({
            name: 'ID: ' + reasons._id.toString(),
            value: client.i18n.t('commands.Warning.fields.reasonv', {
              reason: reasons.reason,
            }),
          }),
        );

        const embedList = new EmbedBuilder()
          .setColor('#2f3136')
          .setTitle(client.i18n.t('commands.Warning.title.warn'))
          .setDescription(
            client.i18n.t('commands.Warning.description.warn', {
              username: user?.username,
              length: insertResLength.length,
            }),
          )
          .setFooter({
            text: client.i18n.t('commands.Warning.footer', {
              warn: warningID ? warningID : 1,
              warn2: Math.ceil(insertResLength.length / 5),
            }),
          })
          .addFields(warns);

        return interaction.editReply({ embeds: [embedList] });
      }
    },
  },
);
