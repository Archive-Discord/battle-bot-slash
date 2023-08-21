import { Client, EmbedBuilder, EmbedData } from 'discord.js';
import { EmbedType } from '../../typings';

export default class Embed extends EmbedBuilder {
  constructor(client: Client, type: EmbedType) {
    if (!client.isReady()) return;

    const EmbedJSON: EmbedData = {
      timestamp: new Date().toISOString(),
      footer: {
        iconURL: client.user?.avatarURL() ?? undefined,
        text: client.user?.username ?? "배틀이",
      },
    };

    super(EmbedJSON);

    this.setColor(typeToColor(type));
  }

  setType(type: EmbedType) {
    this.setColor(typeToColor(type));
  }
}

export function typeToColor(type: EmbedType) {
  if (type === 'success') return '#57F287';
  else if (type === 'error') return '#F12101';
  else if (type === 'warn') return '#FEE75C';
  else if (type === 'info') return '#5865F2';
  else if (type === 'default') return '#2f3136';
  else return '#2f3136';
}
