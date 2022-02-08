import { CaptchaGenerator } from 'captcha-canvas'

const captchaCreate = () => {
  function generateCaptcha() {
    const length = 6
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
    let retVal = ''
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n))
    }
    return retVal
  }

  const genCaptcha = generateCaptcha()

  const captcha = new CaptchaGenerator()
    .setDimension(150, 450)
    .setCaptcha({
      text: genCaptcha,
      size: 60,
      color: 'deeppink'
    })
    .setDecoy({
      opacity: 1
    })
    .setTrace({
      color: 'deeppink'
    })
  return {
    buffer: captcha.generateSync(),
    text: genCaptcha
  }
}

export default captchaCreate
