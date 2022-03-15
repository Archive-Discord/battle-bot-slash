import { Guild } from 'discord.js'
import express from 'express'
import { DataBaseUser } from '../../../typings'
import BotClient from '../../structures/BotClient'

const app = express()
app.get('/', (req: any, res)=> {
  const guild = req.guild as Guild
  const auth = req.auth as DataBaseUser
  const client = req.client as BotClient
  const queue = client.player.getQueue(guild.id)
  if(!queue) return res.status(200).json({ status: 200, message: "재생중인 노래가 없습니다", data: {
    status: {
      isPause: true
    },
    playing: {
      title: null,
      descriptin: null,
      author: null,
      url: null,
      image:null,
      request: null,
      duration:null,
      currnt: null,
      progress: null
    },
    playList: []
  }})
  return res.status(200).json({ status: 200, message: "재생중인 노래가 없습니다", data: {
    status: {
      isPause: queue.connection.paused
    },
    playing: {
      title: queue.nowPlaying().title,
      descriptin: queue.nowPlaying().description,
      author: queue.nowPlaying().author,
      url: queue.nowPlaying().url,
      image: queue.nowPlaying().thumbnail,
      request: queue.nowPlaying().requestedBy,
      duration: queue.nowPlaying().duration,
      currnt: queue.getPlayerTimestamp().current,
      progress: queue.getPlayerTimestamp().progress,
    },
    playList: queue.tracks
  }});
})


export default app