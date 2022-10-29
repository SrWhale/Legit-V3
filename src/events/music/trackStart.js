module.exports = class trackStart {
    constructor(client) {
        this.client = client;
    }

    async run(player, track) {
        const embed = new this.client.embed()
            .setAuthor('Rede Legit - Música', this.client.user.displayAvatarURL())
            .setDescription(`▫️ Tocando agora: [${track.title}](${track.uri})\n▫️ Duração da música: <t:${Math.floor(((track.duration / 1000) * 60) + 10800)}:t>\n▫️Solicitado por: ${track.requester} `)
            .setThumbnail(track.displayThumbnail())

        this.client.channels.cache.get(player.textChannel).send({ embeds: [embed] });
    }
}