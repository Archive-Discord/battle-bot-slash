import { Guild } from 'discord.js'
import express from 'express'
import BotClient from '../../structures/BotClient'

const app = express()
app.post('/', async (req: any, res) => {
  const guild = req.guild as Guild
  const client = req.client as BotClient
  const queue = client.player.getQueue(guild.id)
  if (!queue)
    return res
      .status(400)
      .json({ status: 400, message: '재생중인 노래가 없습니다' })
  if (queue.connection.paused) {
    queue.setPaused(false)
    return res
      .status(200)
      .json({ status: 200, message: '일시정지를 해제 했어요!' })
  } else {
    queue.setPaused(true)
    return res
      .status(200)
      .json({ status: 200, message: '노래를 일시정지 했어요!' })
  }
})

export default app
