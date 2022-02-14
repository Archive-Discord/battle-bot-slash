import { Guild } from "discord.js";
import { NextFunction, Request, Response } from "express";
import User from "../../schemas/userSchema";

const authGuild = async(req: any, res: Response, next: NextFunction) => {
  if(!req.cookies) return res.status(401).json({ status: 401, message: "로그인 후 이용해주세요" });
  const token = req.cookies.auth
  if (!token) return res.status(401).json({ status: 401, message: "로그인 후 이용해주세요" });
  const user = await User.findOne({token: token})
  if(!user) return res.status(401).json({ status: 401, message: "로그인 후 이용해주세요" });
  const guild = req.client.guilds.cache.get(req.params.guild) as Guild
  if(!guild) return res.status(404).json({ status: 404, message: "찾을 수 없는 서버 입니다"});
  if(!guild.members.cache.get(user.id)) return res.status(404).json({ status: 404, message: "해당 서버에 입장되어 있지 않습니다"});
  req.auth = user;
  req.guild = guild;
  next()
};
export default authGuild;