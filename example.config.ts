import ko from './src/locales/ko.json'
import en from './src/locales/en.json'
import { IConfig } from './typings'
import fs from 'fs'

let BUILD_NUMBER: string | null = fs.readFileSync('.git/HEAD').toString().trim()

if (BUILD_NUMBER?.indexOf(':') === -1) {
  BUILD_NUMBER
} else {
  try {
    BUILD_NUMBER = fs
      .readFileSync('.git/' + BUILD_NUMBER?.substring(5))
      .toString()
      .trim()
      .substring(0, 6)
  } catch (e) {
    BUILD_NUMBER = null
  }
}

let config: IConfig = {
  BUILD_NUMBER,
  BUILD_VERSION: '0.0.1-dev',
  githubToken: '',
  pubgapikey: '',
  klaytnapikey: '',
  updateServer: {
    koreanbots: '', // https://koreanbots.dev
    archive: '' // https://archiver.me
  },
  web: {
    baseurl: ''
  },
  bot: {
    sharding: false,
    options: {
      intents: [130815],
      allowedMentions: { parse: ['users', 'roles'], repliedUser: false }
    },
    token: '',
    owners: [],
    prefix: '!',
    cooldown: 2000
  },
  report: {
    /**
     * @type {'webhook', 'text'}
     */
    type: 'webhook',
    webhook: {
      url: ''
    },
    text: {
      guildID: '',
      channelID: ''
    }
  },
  guildAddAlert: {
    guildID: '',
    channelID: ''
  },
  devGuild: {
    guildID: '',
    channelID: ''
  },
  database: {
    /**
     * @type {'mongodb'|'sqlite'|'quick.db'}
     */
    type: 'mongodb',
    url: 'mongodb://localhost:27017/',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  logger: {
    level: 'chat',
    dev: false
  },
  email: {
    Google_Email: '',
    Google_Client_Id: '',
    Google_Client_Secret: '',
    Google_Redirect_Url: '',
    Google_Refresh_Token: ''
  },
  i18n: {
    options: {
      debug: false,
      lng: 'ko',
      resources: {
        ko: {
          translation: ko
        },
        en: {
          translation: en
        }
      },
      fallbackLng: ['ko', 'en']
    }
  }
}

export default config
