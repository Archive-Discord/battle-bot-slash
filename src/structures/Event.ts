// source of https://github.com/ItsRauf/dataminev2/blob/slash/src/events/Event.ts
// TODO: Use This type

import BotClient from '@client';
import { Awaitable, ClientEvents } from 'discord.js';

type EventFunc<E extends keyof ClientEvents> = (
  client: BotClient,
  ...args: ClientEvents[E]
) => Awaitable<void>;

interface EventOpts {
  once: boolean;
}

export class Event<E extends keyof ClientEvents> {
  constructor(
    public name: E,
    public func: EventFunc<E>,
    public opts?: EventOpts
  ) {}
  static isEvent(event: unknown): event is Event<keyof ClientEvents> {
    return event instanceof Event;
  }
  static async waitUntil<E extends keyof ClientEvents>(
    client: BotClient,
    event: E,
    checkFunction: (...args: ClientEvents[E]) => boolean = () => true,
    timeout?: number
  ): Promise<ClientEvents[E] | []> {
    return await new Promise(resolve => {
      let timeoutID: NodeJS.Timeout;
      if (timeout !== undefined) {
        timeoutID = setTimeout(() => {
          client.off(event, eventFunc);
          resolve([]);
        }, timeout);
      }
      const eventFunc = (...args: ClientEvents[E]): void => {
        if (checkFunction(...args)) {
          resolve(args);
          client.off(event, eventFunc);
          if (timeoutID !== undefined) clearTimeout(timeoutID);
        }
      };
      client.on(event, eventFunc);
    });
  }
}