import { Guild } from 'discord.js'
import express from 'express'
import BotClient from '../../structures/BotClient'

const app = express()
app.post('/', async(req: any, res)=> {
  const guild = req.guild as Guild
  const client = req.client as BotClient
  const queue = client.player.getQueue(guild.id)
  if(!queue) return res.status(404).json({ status: 404, message: "재생중인 노래가 없습니다"})
  await queue.back().catch((e)=> {
    if(e) {
      if(e.statusCode === "TrackNotFound") return res.status(404).json({ status: 404, message: "이전 노래를 찾을 수 없어요!"});
      else return res.status(500).json({ status: 500, message: "알 수 없는 오류가 발생했어요!", data: e.statusCode});
    }
  })
  return res.status(200).json({ status: 200, message: "이전 노래를 재생했어요!"});
})


export default app