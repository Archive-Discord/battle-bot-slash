import { Guild } from 'discord.js'
import express from 'express'
import BotClient from '../../structures/BotClient'

const app = express()
app.post('/', async(req: any, res)=> {
  const guild = req.guild as Guild
  const client = req.client as BotClient
  let queue = client.player.getQueue(guild.id)
  if(!queue) return res.status(200).json({ status: 200, message: "재생중인 노래가 없습니다"})
  await queue.back()
  return res.status(200).json({ status: 200, message: "노래를 스킵했어요!"});
})


export default app