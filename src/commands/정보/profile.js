const { MessageEmbed, CommandInteraction } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

export default {
  name: '프로필',
  description : '유저의 프로필을 확인합니다',
  isSlash: true,
  data: new SlashCommandBuilder()
    .setName('프로필')
    .setDescription('유저의 프로필을 확인합니다')
    .addUserOption(option =>
      option
        .setName("유저")
        .setDescription("프로필을 확인할 유저를 선택합니다")
        .setRequired(true)
    )
    .toJSON(),
  /**
   *
   * @param {import('../../structures/BotClient')} client
   * @param {CommandInteraction} interaction
   */
  async execute(client, interaction) {
    if (interaction.type === "DEFAULT" && interaction.content.startsWith(client.config.bot.prefix) + this.name) return interaction.reply('해당 명령어는 (/)커맨드만 사용 가능합니다')
    await interaction.deferReply();
    let user = interaction.options.getUser("유저");
    if (!user) return interaction.editReply("유저를 선택해 주세요");
    const embed  = new MessageEmbed()
      .setTitle(`${user.username}님의 프로필 입니다`)
      .setImage(user.displayAvatarURL())
    await interaction.editReply({embeds: [embed]})
  },
};