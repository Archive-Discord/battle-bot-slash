import path from 'path';
import Logger from './utils/Logger';
import config from '../config';
import BotClient from './structures/BotClient';
import CommandManager from './managers/CommandManager';
import EventManager from './managers/EventManager';
import DatabaseManager from './managers/DatabaseManager';
import ButtonManager from './managers/ButtonManager';
import i18nManager from './managers/i18nManager';

const logger = new Logger('main');

logger.log('Starting up...');

process.on('uncaughtException', (e) => logger.error(e.stack as string));
process.on('unhandledRejection', (e: Error) => logger.error(e.stack as string));

export const client = new BotClient(config.bot.options);
const command = new CommandManager(client);
const event = new EventManager(client);
const database = new DatabaseManager(client);
const button = new ButtonManager(client);
const i18n = new i18nManager(client);

command.load(path.join(__dirname, 'commands'));
event.load(path.join(__dirname, 'events'));
button.load(path.join(__dirname, 'buttons'));
database.load();
i18n.load();

client.start(config.bot.token);
