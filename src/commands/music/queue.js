const { Command } = require('../../client/index');

const { MessageButton, MessageActionRow } = require('discord.js');

module.exports = class queueCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'queue',
            description: 'Veja a fila atual de músicas',
            permissions: ['send_messages']
        })
    }

    async run({ message, player }) {

        if (!player) return message.reply({
            content: 'Não estou tocando nada no momento.',
            ephemeral: true
        });

        const pages = Math.ceil(player.queue.totalSize / 10);

        let index = 0;

        const embed = new this.client.embed()
            .setAuthor('Rede Legit - Fila de Reprodução', this.client.user.displayAvatarURL())

            .setDescription(`Tocando agora: [${player.queue.current.title}](${player.queue.current.uri}) [${player.queue.current.requester}]\n\n` + player.queue.slice(index * 10, (index + 1) * 10).map((track, i) => `${(index * 10) + (i + 1)} - [${track.title}](${track.uri}) [${track.requester}]`).join('\n'))
            .setFooter(`Página ${index + 1} de ${pages}`);

        const row = new MessageActionRow()
            .addComponents([
                new MessageButton().setCustomId('back').setEmoji('⬅️').setStyle('SECONDARY'),
                new MessageButton().setCustomId('neutral').setLabel(' ').setStyle('PRIMARY'),
                new MessageButton().setCustomId('go').setEmoji('➡️').setStyle('SECONDARY')
            ])

        const msg = await message.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        })

        const buttonCollector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === message.user.id
        })

            .on('collect', async (interaction) => {

                interaction.deferUpdate();

                switch (interaction.customId) {
                    case 'go':
                        if (index === pages - 1) return;

                        index++;

                        embed.setDescription(player.queue.slice(index * 10, (index + 1) * 10).map((track, i) => `${(index * 10) + (i + 1)} - [${track.title}](${track.uri})`).join('\n'))
                        embed.setFooter(`Página ${index + 1} de ${pages}`);

                        message.editReply({
                            embeds: [embed]
                        });

                        break;

                    case 'back':
                        if (index === 0) return;

                        index--

                        embed.setDescription(player.queue.slice(index * 10, (index + 1) * 10).map((track, i) => `${(index * 10) + (i + 1)} - [${track.title}](${track.uri})`).join('\n'))
                        embed.setFooter(`Página ${index + 1} de ${pages}`);

                        message.editReply({
                            embeds: [embed]
                        })

                        break;
                }
            })
    }
}