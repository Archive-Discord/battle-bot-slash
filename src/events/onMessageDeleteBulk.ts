import { Event } from '../structures/Event';
import dateFormat from '../utils/DateFormatting';
import LoggerSetting from '../schemas/LogSettingSchema';
import Embed from '../utils/Embed';
import { AttachmentBuilder, TextChannel } from 'discord.js';
import { LogFlags } from '../../typings';
import { checkLogFlag } from '../utils/Utils';

export default new Event('messageDeleteBulk', async (client, messages) => {
  messages.first()?.guild?.id;
  const LoggerSettingDB = await LoggerSetting.findOne({
    guild_id: messages.first()?.guild?.id,
  });
  if (!LoggerSettingDB) return;
  if (!checkLogFlag(LoggerSettingDB.loggerFlags, LogFlags.MESSAGE_DELETE)) return;
  const logChannel = messages
    .first()
    ?.guild?.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel;
  if (!logChannel) return;
  const channel = messages.first()?.channel as TextChannel;
  let humanLog = `**삭제된 메시지들 #${channel.name} (${channel.id}) 서버 ${channel.guild.name} (${channel.guild.id})**`;
  for (const message of [...messages.values()].reverse()) {
    humanLog += `\r\n\r\n[${dateFormat.date(message.createdAt)}] ${message.author?.tag ?? '찾을 수 없음'
      } (${message.id})`;
    humanLog += ' : ' + message.content;
  }
  const attachment = new AttachmentBuilder(Buffer.from(humanLog, 'utf-8'), {
    name: 'DeletedMessages.txt',
  });
  const msg = await logChannel.send({ files: [attachment] });
  const embed = new Embed(client, 'error').setTitle('메시지 대량 삭제').addFields(
    { name: '삭제된 메시지', value: `${messages.size}` },
    {
      name: '삭제된 메시지 확인',
      value: `[링크](https://txt.discord.website/?txt=${logChannel.id}/${msg.attachments.first()?.id
        }/DeletedMessages)`,
    },
  );
  return await logChannel.send({ embeds: [embed] });
});
