import { Player } from 'erela.js';

export function format(millis?: number) {
  if (!millis) return 'Error!';
  try {
    let s: string | number = Math.floor((millis / 1000) % 60);
    let m: string | number = Math.floor((millis / (1000 * 60)) % 60);
    let h: string | number = Math.floor((millis / (1000 * 60 * 60)) % 24);
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    return h + ':' + m + ':' + s + ' | ' + Math.floor(millis / 1000) + ' 초';
  } catch (e) {
    console.log(e);
    return 'error!';
  }
}

export function createBar(player: Player) {
  const leftindicator = '[';
  const rightindicator = ']';
  const slider = '🔘';
  const size = 25;
  const line = '▬';
  if (!player.queue.current)
    return `**[${slider}${line.repeat(size - 1)}${rightindicator}**\n**00:00:00 / 00:00:00**`;
  const current =
    player.queue.current.duration !== 0 ? player.position : player.queue.current.duration;
  const total = player.queue.current.duration || 0;

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
  return `**${leftindicator}${bar[0]}${rightindicator}**\n**${
    new Date(player.position).toISOString().substring(11, 8) +
    ' / ' +
    (player.queue.current.duration == 0
      ? ' ◉ LIVE'
      : new Date(player.queue.current.duration!).toISOString().substring(11, 8))
  }**`;
}
