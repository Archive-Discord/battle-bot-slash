import User from '../schemas/userSchema'
import Alert from '../schemas/alertSchema'

interface UrlObj {
  url: string
  value: string
}

const alertSender = async(title: string, message: string, url?: UrlObj, user_id?: string): Promise<boolean> => {
  if(!user_id) {
    const update = await Alert.updateMany({}, { $push: {message: {title: title, message: message, button: url?.url ? url : null , read: false }}}, {upsert: true})
    if(!update) throw new Error('알림을 전송하는데 실패했습니다.')
    return true
  } else {
    const user = await User.findOne({id: user_id})
    if(!user) throw new Error('유저가 웹 대시보드를 로그인한 기록이 존재하지 않습니다.')
    const update = await Alert.updateOne({user_id: user_id}, {$push: {message: {title: title, message: message, button: url?.url ? url : null, read: false }}}, {upsert: true})
    if(!update) throw new Error('알림을 전송하는데 실패했습니다.')
    return true
  }
}

export default alertSender;