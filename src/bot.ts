import path from 'path';
import Logger from './utils/Logger';
import config from '../config';
import BotClient from './structures/BotClient';
import CommandManager from './managers/CommandManager';
import EventManager from './managers/EventManager';
import DatabaseManager from './managers/DatabaseManager';
import ButtonManager from './managers/ButtonManager';
import RedisManager from './managers/RedisManager';
import MusicManager from './managers/MusicManager';

const logger = new Logger('main');

logger.log('Starting up...');

const client = new BotClient(config.bot.options);

const command = new CommandManager(client);
const event = new EventManager(client);
const database = new DatabaseManager(client);
const redis = new RedisManager(client);
const button = new ButtonManager(client);

command.load(path.join(__dirname, 'commands'));
event.load(path.join(__dirname, 'events'));
button.load(path.join(__dirname, 'buttons'));
database.load();
redis.load();

client.start(config.bot.token);
process.on('uncaughtException', (e) => logger.error(e.stack as string));
process.on('unhandledRejection', (e: Error) => logger.error(e.stack as string));