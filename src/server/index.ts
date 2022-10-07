import express from 'express';
import cors from 'cors';
import Logger from '../utils/Logger';
import BotClient from '../structures/BotClient';
import cookieParser from 'cookie-parser';

const logger = new Logger('web')
const app = express()
app.listen(3001, () => {
  logger.log('web started');
});

const web = (client: BotClient) => {
  app.use(cookieParser());
  app.use(
    cors({
      credentials: true,
      origin: ['http://localhost:3000', 'http://localhost:3001'],
    }),
  );
  app.use((req: any, res, next) => {
    req.client = client
    next()
  })
}
export default web
