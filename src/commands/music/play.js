const { Command } = require('../../client/index');

module.exports = class playCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'play',
            description: 'Toque músicas com o BOT',
            permissions: ['send_messages'],
            options: [{
                name: 'música',
                type: 3,
                description: 'Música a ser tocada',
                required: true
            }]
        })
    }

    async run({ message, player }) {

        if (!message.member.voice.channel) return message.reply({ content: `${message.member}, você precisa estar em um canal de voz para executar este comando!`, ephemeral: true });

        if (message.guild.me.voice.channel && message.guild.me.voice.channel.id !== message.member.voice.channel.id) return message.reply({ content: `${message.member}, você precisa estar no mesmo canal de voz que eu!`, ephemeral: true });

        if (!this.client.music.nodes.filter(node => node.connected === true).size)
            return message.reply({ content: 'O sistema de música não está disponível no momento.', ephemeral: true });

        player = player || await this.client.music.create({
            guild: message.guild.id,
            voiceChannel: message.member.voice.channel.id,
            textChannel: message.channel.id,
            selfDeafen: true
        });

        if (player.state === 'DISCONNECTED') player.connect();

        let amount = 0;

        const music = message.options.getString('música');

        const tracks = await this.client.music.search(music, message.user);

        console.log(tracks)

        if (tracks.error) return message.reply({ content: `Ocorreu um erro ao pesquisar a música.`, ephemeral: true });

        if (!tracks.tracks[0]) return message.reply({ content: `${message.member}, não consegui encontrar esta música.`, ephemeral: true });

        if (tracks.loadType === 'PLAYLIST_LOADED') {

            tracks.tracks.forEach(t => player.queue.add(t));

            if (!player.playing) player.play();

            message.reply(`✅ ${message.member}, \`${tracks.tracks.length}\` músicas foram adicionadas na playlist com sucesso.`);

        } else {

            player.queue.add(tracks.tracks[0]);

            if (!player.playing) player.play();

            message.reply(`✅ ${message.member}, música [${tracks.tracks[0].title}](${tracks.tracks[0].uri}) adicionada na playlist com sucesso.`);
        }
    }
}