const { Command } = require('../../client/index');

module.exports = class skipCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'skip',
            description: 'Pule a música que está tocando neste momento',
            permissions: ['send_messages']
        })
    }

    async run({ message, player }) {

        if (!message.member.voice.channel) return message.reply({ content: `${message.member}, você precisa estar em um canal de voz para executar este comando!`, ephemeral: true });

        if (message.guild.me.voice.channel && message.guild.me.voice.channel.id !== message.member.voice.channel.id) return message.reply({ content: `${message.member}, você precisa estar no mesmo canal de voz que eu!`, ephemeral: true });

        if (!player) return message.reply({
            content: 'Não estou tocando nada no momento.',
            ephemeral: true
        });

        if (player.queue.current.requester.id === message.user.id) {
            player.stop(true);

            return message.reply(`A música foi pulada pelo autor da mesma.`);
        } else if (this.isStaff(message.user.id)) {
            player.stop(true);

            return message.reply(`À música foi pulada por um membro da equipe de moderação.`);

        } else return message.reply({
            content: `Você não tem autorização para pular músicas.`,
            ephemeral: true
        });
    }
}