module.exports = class guildMemberUpdateEvent {
    constructor(client) {
        this.client = client;
    }

    async run(oldMember, newMember) {
        
        if (oldMember.guild.id === process.env.PRINCIPAL_SERVER) {
            
            const logsEmbed = new this.client.embed()
            .setAuthor('Rede Legit - Logs', this.client.user.displayAvatarURL())
            .setFooter('Rede Legit - Logs', this.client.user.displayAvatarURL())
            .setThumbnail(newMember.user.displayAvatarURL({ format: 'png', size: 4096 }));
            
            
            
            //Role Syncronization Module
            const servers = this.client.guilds.cache.filter(s => s.members.cache.has(oldMember.id) && s.id !== oldMember.guild.id).map(s => s);

            for (const server of servers) {

                const m = server.members.cache.get(oldMember.id);

                const addRoles = newMember.roles.cache.map(r => server.roles.cache.find(role => role.name.toLowerCase() === r.name.toLowerCase())).filter(r => r && r.hoist && !m.roles.cache.has(r.id));

                const removeRoles = oldMember.roles.cache.filter(r => !newMember.roles.cache.has(r.id)).map(r => server.roles.cache.find(role => role.name.toLowerCase() === r.name.toLowerCase())).filter(r => r && r.hoist && m.roles.cache.has(r.id));

                if(removeRoles.size) await m.roles.remove(removeRoles, 'Sincronização automática de cargos.').catch(() => true);

                if(addRoles.size) await m.roles.add(addRoles, 'Sincronização automática de cargos.').catch(() => true);
            };
            
            
            // Anti role Changes - Module
            const roles1 = oldMember.roles.cache.map(r => r.id);
    		const roles2 = newMember.roles.cache.map(r => r.id);
    		const guild = this.client.guilds.cache.get(oldMember.guild.id);
            
            if(roles1.find(r => !roles2.find(e => e === r)) || roles2.find(r => !roles1.find(e => e === r))) {
                guild.fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE", limit: 1 }).then(e => {
                    
                    if(!e.entries.first()) return;
                    
                    const autor = guild.members.cache.get(e.entries.first().executor.id);
                    
                    if(autor.id === this.client.user.id) return;
                    
                    const allowedUsersToChangeStaff = this.client.config.alterar_nicks_e_cargos;
                    
                    if(['876897405063270420', '876896736201801759', '876896342818062406', '880113111279992933', '876895549528350771', '706272903104168018'].some(role => e.entries.first().changes[0].new.find(r => r.id === role))) {
                        if(!allowedUsersToChangeStaff.includes(autor.id)) {
                            autor.send({
                                embeds: [
                                    new this.client.embed()
                                    .setAuthor('Rede Legit - Módulo de Segurança', this.client.user.displayAvatarURL())
                                    .setTitle('Ação não autorizada.')
                                    .setDescription(`Hey, ${autor}. Você não tem autorização para mexer em cargos de equipe.`)
                                    .setFooter('Isto é um erro? Contate HerobossG0D no privado.', this.client.user.displayAvatarURL())
                                    .setTimestamp()
                                ]
                            })
                            
                            if(oldMember.roles.cache.size > newMember.roles.cache.size) newMember.roles.add(e.entries.first().changes[0].new.map(r => r.id), 'Ação não autorizada.')
                            else newMember.roles.remove(e.entries.first().changes[0].new.map(r => r.id), 'Ação não autorizada.')
                        } else {
                            logsEmbed.setDescription(`Cargos de ${newMember.user} alterados!\n\nCargos antigos: ${oldMember.roles.cache.map(r => r).filter(r => r.id !== oldMember.guild.id).join(", ")}\n\nCargos novos: ${newMember.roles.cache.map(r => r).filter(r => r.id !== oldMember.guild.id).join(", ")} `)
                            
                            this.client.channels.cache.get(this.client.config.logs.channel).send({
                                embeds: [logsEmbed]
                            })
                        }
                    }
                })
            };
            
            //Anti nickname Changes - Module
            if(oldMember.nickname !== newMember.nickname) {
                
                if(!newMember.manageable) return;
                
                guild.fetchAuditLogs({ type: "MEMBER_UPDATE", limit: 1 }).then(e => {
                    if(!e.entries.first()) return;
                    
                    const autor = guild.members.cache.get(e.entries.first().executor.id);
                    
                    if(autor.id === this.client.user.id) return;
                    
                    const allowedUsersToManageNicknames = this.client.config.alterar_nicks_e_cargos;
                    
                    if(allowedUsersToManageNicknames.includes(autor.id)) {
                        
                        for (const server of servers) {
                            const m = server.members.cache.get(oldMember.user.id);
                            
                            m.setNickname(e.entries.first().changes[0].new, 'Sincronização automática de Nicknames').catch(() => true)
                        };
                            logsEmbed.setDescription(`Apelido de ${newMember.user} alterado!\n\nApelido antigo: \`${oldMember.nickname || 'Nenhum'}\`\n\nApelido novo: \`${newMember.nickname || 'Nenhum'}\` `)
                            
                            this.client.channels.cache.get(this.client.config.logs.channel).send({
                                embeds: [logsEmbed]
                            })
                        
                        return;
                    }
                    
                    if(e.entries.first().changes[0].old !== e.entries.first().changes[0].new) newMember.setNickname(e.entries.first().changes[0]?.old || newMember.user.username, 'Ação não autorizada.');
                    
                    autor.send({
                        embeds: [
                            new this.client.embed()
                            .setAuthor('Rede Legit - Módulo de Segurança', this.client.user.displayAvatarURL())
                            .setTitle('Ação não autorizada.')
                            .setDescription(`Hey, ${autor}. Você não tem autorização para mexer no nickname de outras pessoas.`)
                            .setFooter('Isto é um erro? Contate HerobossG0D no privado.', this.client.user.displayAvatarURL())
                            .setTimestamp()
                        ]
                    })
                    
                })
            };
            
            //GERAL LOGS SYSTEM (MEMBER)
            
            if(oldMember.voice.channel) {
                console.log('ixi')
                if(!newMember.voice.channel) {
                    console.log('ixi 2')
                    logsEmbed.setDescription(`${newMember.user} saiu do canal de voz \`${oldMember.voice.channel.name}\`. `)
                    
                    this.client.channels.cache.get(this.client.config.logs.channel).send({
                        embeds: [logsEmbed]
                    })
                } else if(newMember.voice.channel && newMember.voice.channel.id !== oldMember.voice.channel.id) {
                    console.log('ixi 3')
                    logsEmbed.setDescription(`${newMember.user} trocou do canal de voz ${oldMember.voice.channel.name} para o \`${newMember.voice.channel.name}\`. `)
                    
                    this.client.channels.cache.get(this.client.config.logs.channel).send({
                        embeds: [logsEmbed]
                    });
                }
            } else if(newMember.voice.channel) {
                console.log('ixi 4')
                logsEmbed.setDescription(`${newMember.user} entrou no canal de voz \`${newMember.voice.channel.name}\`. `);
                
                this.client.channels.cache.get(this.client.config.logs.channel).send({
                    embeds: [logsEmbed]
                })
            } 
        }
    }
}