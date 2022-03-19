import express from 'express'
import cors from "cors"
import Logger from '../utils/Logger'
import BotClient from '../structures/BotClient'
import authGuild from './middleware/authGuild'
import cookieParser from 'cookie-parser'

import playlist from './router/playlist'
import back from './router/back'
import pause from './router/pause'
import skip from './router/skip'

const logger = new Logger('web')
const app = express()
app.listen(3001, () => {
  logger.log('web started')
})

const web = (client: BotClient) => {
  app.use(cookieParser())
  app.use(cors({credentials: true, origin: ['http://localhost:3000', 'http://localhost:3001']}));
  app.use((req: any, res, next) => {
    req.client = client
    next()
  })
  app.use('/:guild/playlist', authGuild, playlist)
  app.use('/:guild/back', authGuild, back)
  app.use('/:guild/pause', authGuild, pause)
  app.use('/:guild/skip', authGuild, skip)
}
export default web