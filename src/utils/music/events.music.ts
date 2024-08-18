import { DestroyReasons } from "lavalink-client";
import BotClient from "../../structures/BotClient";
import Logger from "../Logger";
import { currentStatus, currentStatusDisconnected, currntStatusEmpty, liveStatus, liveStatusDelete, } from "./channel.music";
import { MusicSessionStore } from "../redis/music.store";

export function NodesEvents(client: BotClient) {
  const logger = new Logger('MusicManagerNodesEvents');

  client.lavalink.nodeManager.on("raw", (node, payload) => {
  }).on("disconnect", (node, reason) => {
    logger.error(node.id + " :: DISCONNECTED :: " + reason);
  }).on("connect", (node) => {
    logger.log(node.id + " :: CONNECTED :: ");
  }).on("reconnecting", (node) => {
    logger.info(node.id + " :: RECONNECTING :: ");
  }).on("create", (node) => {
    logger.info(node.id + " :: CREATED :: ");
  }).on("destroy", (node) => {
    logger.info(node.id + " :: DESTROYED :: ");
  }).on("error", (node, error, payload) => {
    logger.error(node.id + " :: ERRORED :: " + error + " :: PAYLOAD :: " + payload);
  }).on("resumed", (node, payload, players) => {
    {
      logger.info(node.id + " :: RESUMED :: " + players.length + " PLAYERS STILL PLAYING :: PAYLOAD ::" + payload);
      logger.info("PLAYERS :: " + players);
    }
  });

  client.on('raw', (data) => {
    client.lavalink.sendRawData(data)
  })
}

export function PlayerEvents(client: BotClient) {
  const musicSession = new MusicSessionStore(client.redisClient);

  client.lavalink.on("trackStart", (player, track) => {
    liveStatus(player.guildId, client)
    if (!player.textChannelId) return
    currentStatus(player.textChannelId, track, client)
  }).on("trackEnd", (player, track, reason) => {
    liveStatusDelete(player.guildId, client)
  }).on('playerDisconnect', (player, oldChannel) => {
    currentStatusDisconnected(player, oldChannel, client)
  }).on('playerDestroy', (player, destroyReason) => {
    switch (destroyReason) {
      case DestroyReasons.Disconnected:
      case DestroyReasons.ChannelDeleted:
        break;
      case DestroyReasons.QueueEmpty:
        liveStatusDelete(player.guildId, client)
        currntStatusEmpty(player, client)
        break;
      default:
        break;
    }
    liveStatusDelete(player.guildId, client)
  }).on('playerCreate', (player) => {
    musicSession.set(player.guildId, player.node.sessionId as string)
  })
}
