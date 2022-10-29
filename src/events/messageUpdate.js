module.exports = class messageUpdateEvent {
    constructor(client) {
        this.client = client;
    }

    async run(oldMessage, newMessage) {
        
        if (oldMessage.guild.id === process.env.PRINCIPAL_SERVER) {
            if(oldMessage.author.bot) return;
            
            if(oldMessage.content !== newMessage.content) {
                const logsEmbed = new this.client.embed()
                .setAuthor('Rede Legit - Logs', this.client.user.displayAvatarURL())
                .setFooter('Rede Legit - Logs', this.client.user.displayAvatarURL())
                .setThumbnail(oldMessage.author.displayAvatarURL({ format: 'png', size: 4096 }))
                
                .setDescription(`${oldMessage.author} editou uma mensagem! \n\nMensagem antiga: \`${oldMessage.content}\`\n\nNova mensagem: \`${newMessage.content}\` `);
                
                this.client.channels.cache.get(this.client.config.logs.channel).send({
                    embeds: [logsEmbed]
                });
            }
        }
    }
}