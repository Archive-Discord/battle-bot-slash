import { Player } from "lavalink-client";
export interface MusicRequester {
  id: string;
  username: string;
  avatar?: string;
}

export const requesterTransformer = (requester: any): MusicRequester => {
  // if it's already the transformed requester
  if (typeof requester === "object" && "avatar" in requester && Object.keys(requester).length === 3) return requester as {
    id: string,
    username: string,
    avatar?: string,
  };
  // if it's still a discord.js User
  if (typeof requester === "object" && "displayAvatarURL" in requester) { // it's a user
    return {
      id: requester.id,
      username: requester.username,
      avatar: requester.displayAvatarURL(),
    }
  }
  // if it's non of the above
  return { id: requester!.toString(), username: "unknown" }; // reteurn something that makes sense for you!
};


export function createBar(player: Player) {
  const leftindicator = '[';
  const rightindicator = ']';
  const slider = '🔘';
  const size = 25;
  const line = '▬';
  if (!player.queue.current)
    return `**[${slider}${line.repeat(size - 1)}${rightindicator}**\n**00:00:00 / 00:00:00**`;
  const current =
    player.queue.current.info.duration !== 0 ? player.position : player.queue.current.info.duration;
  const total = player.queue.current.info.duration || 0;

  const bar =
    current > total
      ? [line.repeat((size / 2) * 2), (current / total) * 100]
      : [
        line.repeat(Math.round((size / 2) * (current / total))).replace(/.$/, slider) +
        line.repeat(size - Math.round(size * (current / total)) + 1),
        current / total,
      ];
  if (!String(bar).includes(slider))
    return `**${leftindicator}${slider}${line.repeat(
      size - 1,
    )}${rightindicator}**\n**00:00:00 / 00:00:00**`;
  return `**${leftindicator}${bar[0]}${rightindicator}**\n**${new Date(player.position).toISOString().substring(11, 8) +
    ' / ' +
    (player.queue.current.info.duration == 0
      ? ' ◉ LIVE'
      : new Date(player.queue.current.info.duration!).toISOString().substring(11, 8))
    }**`;
}