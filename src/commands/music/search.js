const { Command } = require('../../client/index');

module.exports = class searchCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'search',
            description: 'Procure músicas no YouTube',
            permissions: ['send_messages'],
            options: [{
                name: 'música',
                type: 3,
                description: 'Música a ser pesquisada',
                required: true
            }]
        })
    }

    async run({ message, player }) {
        
        if (!message.member.voice.channel) return message.reply({ content: `${message.member}, você precisa estar em um canal de voz para executar este comando!`, ephemeral: true });
        
        if (message.guild.me.voice.channel && message.guild.me.voice.channel.id !== message.member.voice.channel.id) return message.reply({ content: `${message.member}, você precisa estar no mesmo canal de voz que eu!`, ephemeral: true });
        
        if (!this.client.music.nodes.filter(node => node.connected === true).size)
            return message.reply({ content: 'O sistema de música não está disponível no momento.', ephemeral: true });

        const music = message.options.getString('música');
        
        const search = await this.client.music.search(music, message.user);
        
        if(search.error) return message.reply({
            content: 'Ocorreu um erro ao pesquisar a música.',
            ephemeral: true
        });
        
        if(!search.tracks.length) return message.reply({
            content: 'Não consegui encontrar nenhuma música relacionada.',
            ephemeral: true
        });
        
        const { MessageSelectMenu, MessageActionRow } = require('discord.js');
        
        const menu = new MessageSelectMenu()
        .setMaxValues(1)
        .setPlaceholder('Selecione uma música para tocar')
        .setCustomId('menu')
        .addOptions(search.tracks.slice(0, 10).map(track => ({
            label: track.title,
            value: track.uri,
            description: track.author
        })));
        
        const row = new MessageActionRow()
        .addComponents(menu)
        
        const msg = await message.reply({ content: 'Selecione uma opção', components: [row], fetchReply: true });
        
        const collector = msg.createMessageComponentCollector({ filter: component => component.user.id === message.user.id, time: 15000, max: 1 })
        
        .on('end', async (collected, reason) => {
            
            collected.first().deferUpdate();
            
            menu.setDisabled(true);
            
            row.spliceComponents(0, 1, menu)
            
            if(!reason === 'limit') return message.editReply({ components: [row] })
            
            const track = search.tracks.find(t => t.uri === collected.first().values[0])
            
            player = player || await this.client.music.create({
            	guild: message.guild.id,
            	voiceChannel: message.member.voice.channel.id,
            	textChannel: message.channel.id,
            	selfDeafen: true
        	});
            
            if (player.state === 'DISCONNECTED') player.connect();
            
            player.queue.add(track);
            
            if (!player.playing) player.play();
            
            message.editReply({ content: `✅ ${message.member}, música [${track.title}](${track.uri}) adicionada na playlist com sucesso.`, components: [row]});
        })
    }
}