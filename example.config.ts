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
  githubToken: '1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',
  pubgapikey:
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJiYzc5OTFlMC1kYmQxLTAxMzktZGYwMi0wYWRjMjYyMjExNmMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNjI4NTc2NzUyLCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6Ii0yYmFmNzQ4NC0zYWVkLTQ1MDAtODFhOC1kNDA4MmM3NTE4NmEifQ.XQSrzmKpJ09F4OCS_LtEwO4bCGwK8-pp3N5IHMcNjss',
  klaytnapikey:
    'S0FTS0c4QTk0SExGQjFLMzczT1k3RkZKOlNMeWNkNG5VVlJxaEZnMUp4cHBsYVVLTWZDQkRBN0lIQzFld3dQOEU=',
  updateServer: {
    koreanbots: '', // https://koreanbots.dev
    archive: '' // https://archiver.me
  },
  web: {
    baseurl: 'http://localhost/'
  },
  bot: {
    sharding: false,
    options: {
      intents: [130815],
      allowedMentions: { parse: ['users', 'roles'], repliedUser: false }
    },
    token:
      'OTI4MjU0NTA5NjUyNzcwODU2.GZpJW6.dBXHmy42fj0gihPhJ4eHoG0XvF6qA7oKIxTtGE',
    owners: ['896570484588703744'],
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
      guildID: '916704781551169577',
      channelID: '1001488570470641735'
    }
  },
  guildAddAlert: {
    guildID: '916704781551169577',
    channelID: '1001488570470641735'
  },
  devGuild: {
    guildID: '916704781551169577',
    channelID: '1001488570470641735'
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
    Google_Email: 'admin@battlebot.kr',
    Google_Client_Id:
      '481289387359-clq605bfcm5nmbhf9h9k52aqta2s67ss.apps.googleusercontent.com',
    Google_Client_Secret: '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',
    Google_Redirect_Url: 'https://developers.google.com/oauthplayground',
    Google_Refresh_Token:
      '1//0496BCJG9FetdCgYIARAAGAQSNwF-L9IrPD9dps2dMjQ7uuvqunrUrGQMnNK_Tn37GI7c17bdvwud1OMZHiORDk6vQtiRSYknsPA'
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
