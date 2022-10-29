module.exports = class messageDeleteEvent {
    constructor(client) {
        this.client = client;
    }

    async run(message) {
        
        if (message.guild.id === process.env.PRINCIPAL_SERVER) {
            if(message.author.bot) return;
           
                const logsEmbed = new this.client.embed()
                .setAuthor('Rede Legit - Logs', this.client.user.displayAvatarURL())
                .setFooter('Rede Legit - Logs', this.client.user.displayAvatarURL())
                .setThumbnail(message.author.displayAvatarURL({ format: 'png', size: 4096 }))
                
                .setDescription(`${message.author} apagou uma mensagem! \n\nMensagem: \`${message.content}\``);
                
                this.client.channels.cache.get(this.client.config.logs.channel).send({
                    embeds: [logsEmbed]
                });
        }
    }
}