<<<<<<< HEAD
import { Client, EmbedBuilder, EmbedData } from 'discord.js'
import { EmbedType } from '../../typings'
=======
import { Client, EmbedBuilder, EmbedData } from 'discord.js';
import { EmbedType } from '../../typings';
>>>>>>> 5a5a0e01e658e350f51c70a59133165872c242c1

export default class Embed extends EmbedBuilder {
  constructor(client: Client, type: EmbedType) {
    if (!client.isReady()) return;

    const EmbedJSON: EmbedData = {
      timestamp: new Date().toISOString(),
      footer: {
<<<<<<< HEAD
        iconURL: client.user.avatarURL() ?? undefined,
        text: client.user.username
      }
    }

    super(EmbedJSON)

    this.setColor(typeToColor(type))
  }

  setType(type: EmbedType) {
    this.setColor(typeToColor(type))
=======
        iconURL: client.user?.avatarURL() ?? undefined,
        text: client.user?.username,
      },
    };

    super(EmbedJSON);

    this.setColor(typeToColor(type));
  }

  setType(type: EmbedType) {
    this.setColor(typeToColor(type));
>>>>>>> 5a5a0e01e658e350f51c70a59133165872c242c1
  }
}

export function typeToColor(type: EmbedType) {
<<<<<<< HEAD
  if (type === 'success') return '#57F287'
  else if (type === 'error') return '#ED4245'
  else if (type === 'warn') return '#FEE75C'
  else if (type === 'info') return '#5865F2'
  else if (type === 'default') return '#5865F2'
  else return '#5865F2'
=======
  if (type === 'success') return '#57F287';
  else if (type === 'error') return '#ED4245';
  else if (type === 'warn') return '#FEE75C';
  else if (type === 'info') return '#5865F2';
  else if (type === 'default') return '#5865F2';
  else return '#5865F2';
>>>>>>> 5a5a0e01e658e350f51c70a59133165872c242c1
}
