import { BaseCommand, SlashCommand } from '../../structures/Command';
import UserDB from '../../schemas/userSchema';
import Embed from '../../utils/Embed';
import { SlashCommandBuilder, userMention } from '@discordjs/builders';
import DateFormatting from '../../utils/DateFormatting';
import { BaseGuildVoiceChannel, Client, Guild, GuildMember, GuildVoiceChannelResolvable, Message, User } from 'discord.js';
import { VoiceReceiver, joinVoiceChannel, entersState, VoiceConnectionStatus, EndBehaviorType, getVoiceConnection, VoiceConnection } from '@discordjs/voice';
import * as prism from 'prism-media';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import checkGuildPremium from '../../utils/checkPremium';
import RecordSchema from '../../schemas/recordSchema';
import { s3, uploadS3Promise } from '../../utils/s3';
import Logger from '../../utils/Logger';
import { VoiceRecorder } from '../../utils/record/voice-recorder';
import BotClient from '../../structures/BotClient';
import config from '../../../config';

const logger = new Logger('record');

export default new BaseCommand(
  {
    name: 'record',
    description: '보이스 채널에서 대회를 녹음합니다.',
    aliases: ['녹음', 'shrdma'],
  },
  async (client, message, args) => {
    const time = args[0] as unknown as number
    if (!message.guild) {
      return message.reply({
        embeds: [new Embed(client, 'error')
          .setTitle(`❌ 에러 발생`)
          .setDescription('이 명령어는 서버에서만 사용 가능합니다')]
      });
    }
    if (time && isNaN(Number(time))) {
      return message.reply({
        embeds: [new Embed(client, 'error')
          .setTitle(`❌ 에러 발생`)
          .setDescription('시간은 숫자로 입력해주세요')]
      });
    }
    const user = message.member as GuildMember;
    if (!user.voice) {
      return message.reply({
        embeds: [new Embed(client, 'error')
          .setTitle(`❌ 에러 발생`)
          .setDescription('보이스 채널에 접속해주세요')]
      });
    }

    const isPremium = await checkGuildPremium(client, message.guild)
    const recordList = await RecordSchema.find({
      guildId: message.guild.id,
    })

    if (!isPremium) {
      const totalTimes = recordList.reduce((acc, cur) => {
        acc += cur.duration
        return acc
      }, 0)

      if (totalTimes >= 60 * 3) {
        return message.reply({
          embeds: [new Embed(client, 'error')
            .setTitle(`❌ 에러 발생`)
            .setDescription('녹음은 3분까지만 가능합니다.')]
        });
      }
    }

    const recording = client.recordGuilds.get(message.guild.id)
    let connection = getVoiceConnection(message.guild.id)
    if (recording) {
      if (!connection) {
        return message.reply({
          embeds: [new Embed(client, 'error')
            .setTitle(`❌ 에러 발생`)
            .setDescription('녹음 중인 보이스 채널이 없습니다.')]
        });
      }

    } else {
      const recordDB = await RecordSchema.create({
        guildId: message.guild.id,
        channelId: user.voice.channelId,
      })
      client.recordGuilds.set(message.guild.id, recordDB._id)
      const voiceChannel = user.voice.channel as BaseGuildVoiceChannel;
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        // @ts-ignore
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      if (!connection) {
        return message.reply({
          embeds: [new Embed(client, 'error')
            .setTitle(`❌ 에러 발생`)
            .setDescription('보이스 채널에 접속할 수 없습니다.')]
        });
      }

      client.voiceRecorder.startRecording(connection, isPremium ? 10 * 60 * 1_000 : 1 * 60 * 1_000);
      setTimeout(() => {
        const guildRecord = client.recordGuilds.get(message.guild!.id)
        if (guildRecord && guildRecord === recordDB._id) {
          endedRecord(client, recordDB._id, connection as VoiceConnection, message as Message<true>, 'timeout', isPremium)
        }
      }, isPremium ? 8 * 60 * 1_000 : 1 * 60 * 1_000)

      return message.reply({
        embeds: [new Embed(client, 'success')
          .setTitle(`✅ 녹음 시작`)
          .setDescription(`> 녹음을 시작합니다! ${isPremium ? '10분' : '1분'} 후에 자동으로 종료됩니다.\n> 녹음을 종료하려면 \`/녹음\`를 입력해주세요`)]
      });
    }
  },
  // {
  //   data: new SlashCommandBuilder()
  //     .setName('프로필')
  //     .addUserOption((option) =>
  //       option
  //         .setName('user')
  //         .setDescription('프로필을 확인할 유저를 선택합니다')
  //         .setRequired(true),
  //     )
  //     .setDescription('유저의 프로필을 확인합니다'),
  //   options: {
  //     name: '프로필',
  //     isSlash: true,
  //   },
  //   async execute(client, interaction) {
  //     if (!interaction.guild) {
  //       let embed = new Embed(client, 'error');
  //       embed.setTitle('❌ 에러 발생');
  //       embed.setDescription('이 명령어는 서버에서만 사용 가능합니다');
  //       return interaction.reply({ embeds: [embed], ephemeral: true });
  //     }
  //     let seluser = interaction.options.getUser('user');
  //     let user = interaction.guild.members.cache.get(seluser?.id as string);
  //     if (!user) {
  //       let embed = new Embed(client, 'error');
  //       embed.setTitle('❌ 에러 발생');
  //       embed.setDescription('찾을 수 없는 유저입니다');
  //       return interaction.reply({ embeds: [embed] });
  //     }
  //     let userdb = await UserDB.findOne({ id: user.id });

  //     let embed = new Embed(client, 'default')
  //       .setTitle(`${user.user.username}님의 정보`)
  //       .setThumbnail(user.displayAvatarURL())
  //       .addFields({ name: `유저`, value: userMention(user.id), inline: true })
  //       .addFields({ name: `아이디`, value: `\`${user.id}\``, inline: true })
  //       .addFields({
  //         name: `상태`,
  //         value: user.presence
  //           ? user.presence.activities.length === 0
  //             ? '없음'
  //             : user.presence.activities.join(', ')
  //           : '오프라인',
  //         inline: true,
  //       })
  //       .addFields({
  //         name: `서버 가입일`,
  //         value: DateFormatting._format(user.joinedAt as Date, ''),
  //         inline: true,
  //       })
  //       .addFields({
  //         name: `계정 생성일`,
  //         value: DateFormatting._format(user.user.createdAt as Date, ''),
  //         inline: true,
  //       })
  //       .addFields({
  //         name: `${client.user?.username} 웹 가입일`,
  //         value: userdb ? DateFormatting._format(userdb.published_date, '') : '미가입',
  //       })
  //     return interaction.reply({ embeds: [embed] });
  //   },
  // },
);

const endedRecord = async (client: BotClient, recordId: string, connection: VoiceConnection, message: Message<true>, enededType: "timeout" | "user", isPremium: boolean) => {
  const resultMessage = await message.reply({
    embeds: [new Embed(client, 'success')
      .setTitle(`✅ 녹음 종료`)
      .setDescription(
        enededType === "timeout" ?
          isPremium ? `> 녹음시간 1분이 지나 자동 종료되었습니다. 저장까지 시간이 걸릴 수 있습니다.\n\n[프리미엄](${config.web.baseurl}/premium) 사용 시 단일 녹음 최대 10분까지 이용 가능합니다!`
            : `> 녹음 시간 10분이 지나 자동 종료되었습니다. 저장까지 시간이 걸릴 수 있습니다` :
          enededType === "user" ? `> 녹음이 종료되었습니다. 저장까지 시간이 걸릴 수 있습니다.` : ``
      )]
  });
  const recordData = await client.voiceRecorder.getRecordedVoiceAsBuffer(connection.joinConfig.guildId, 'single');
  client.voiceRecorder.stopRecording(connection)
  client.recordGuilds.delete(message.guild.id)
  const key = `records/${message.guild.id}/${recordId}.mp3`
  await uploadS3Promise({
    Bucket: 'battlebot-project',
    Key: key,
    Body: recordData,
    ContentType: 'audio/mp3',
    ACL: 'public-read',
  })
  await RecordSchema.findOneAndUpdate({
    _id: recordId,
  }, {
    status: 'end',
    file: "/" + key,
  })
  return resultMessage.edit({
    embeds: [new Embed(client, 'success')
      .setTitle(`✅ 녹음 종료`)
      .setDescription(`> 저장이 완료되었습니다.\n\n[녹음 확인하기](${config.web.baseurl}/dashboard/${message.guild.id}/records)`)]
  });
}