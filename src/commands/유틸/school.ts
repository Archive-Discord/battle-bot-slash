import { Message, MessageActionRow, MessageButton, MessageSelectMenu } from 'discord.js';
import { SchoolMealResponse, SchoolDataResponse } from '../../../typings';
import { BaseCommand } from '../../structures/Command'
import Embed from '../../utils/Embed'
import axios, { AxiosError } from "axios"
import { getDate } from '../../utils/convert';
export default new BaseCommand(
  {
    name: 'schoolmeal',
    description: '학교의 급식정보를 보여줍니다',
    aliases: ['급식', 'rmqtlr']
  },
  async (client, message, args) => {
    if (!args[0]) {
      let embed = new Embed(client, 'error')
        .setTitle(`이런...`)
        .setDescription(`학교 이름을 적어주세요`)
      return message.reply({ embeds: [embed] })
    } else {
      let embed = new Embed(client, 'info')
        .setTitle(`급식`)
        .setDescription(`학교 급식을 찾는중이에요...`)
      let msg = await message.reply({embeds: [embed]})
      await axios.get(`https://asia-northeast3-smeals-school.cloudfunctions.net/meals/schools?name=${encodeURI(args[0])}`)
        .then(async(d) => {
          let data: SchoolDataResponse = d.data
          let embed = new Embed(client, 'info')
            .setTitle(`급식`)
            .setDescription(`학교 학교 찾았어요 학교를 선택해 주세요!`)
          let row = new MessageActionRow()
          let select = new MessageSelectMenu()
            .setCustomId('school.meal')
            .setPlaceholder('학교를 선택해주세요!')
          let schoolsTime = 25
          if(data.schools.length < 25) schoolsTime = data.schools.length
          for (let i = 0; i < schoolsTime; i++) {
            select.addOptions([
              {
                label: data.schools[i].name,
                description: data.schools[i].where,
                value: `${data.schools[i].code}|${data.schools[i].scCode}|${data.schools[i].name}`
              }
            ])
          }
          row.addComponents(select)
          await msg.edit({embeds: [embed], components: [row]})
          const collector = msg.createMessageComponentCollector({ time: 60000 })

          collector.on('collect', async (i) => {
            if (i.user.id === message.author.id) {
              if(i.customId === "school.meal") {
                let date = getDate()
                // @ts-ignore
                let value = i.values[0].split("|")
                axios.get(`https://asia-northeast3-smeals-school.cloudfunctions.net/meals/meals?code=${value[0]}&scCode=${value[1]}&date=${date.datestring}`)
                  .then(async(data) => {
                    let meal: SchoolMealResponse = data.data
                    let mealembed = new Embed(client, 'success')
                    .setTitle(`${value[2]} 급식`)
                    .setDescription(`${meal.meals[0].meal.join('\n')} \n\n ${meal.meals[0].calories}`)
                    await i.reply({ embeds: [mealembed] })
                  }).catch(async(e: AxiosError) => {
                    if(e.response?.status === 404) {
                      let mealembed = new Embed(client, 'warn')
                        .setTitle(`${value[2]} 급식`)
                        .setDescription(`어라... ${value[2]}의 급식을 찾을 수 없어요...`)
                      await i.reply({embeds: [mealembed], components: []})
                    }
                  })
              }
            } else {
              i.reply(`명령어를 요청한 **${message.author.username}**만 사용할수 있어요.`)
            }
          })
        })
    }
  }
)