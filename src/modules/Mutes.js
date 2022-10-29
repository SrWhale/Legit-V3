module.exports = class muteManager {
    constructor(client) {
        this.client = client;
    }

    async start() {
        const mutes = await this.client.database.ref(`RedeLegit/mutados/`).once('value').then(d => d.val() || {});
        
        const guild = this.client.guilds.cache.get('564398372161585162');
        
        const rolesToAdd = this.client.config.mutes.cargosToAdd.filter(c => !isNaN(c)).map(role => guild.roles.cache.get(role));
        
        const rolesToRemove = this.client.config.mutes.cargosToRemove.filter(c => !isNaN(c)).map(role => guild.roles.cache.get(role));
        
        for(const [key, value] of Object.entries(mutes)) {
            if(Date.now() >= value.endAt) {
                const member = guild.members.cache.get(key);
                
                if(member) {
                    member.roles.remove(rolesToAdd.map(r => r.id), 'Usuário desmutado automaticamente');
                    if(rolesToRemove.length) member.roles.add(rolesToRemove.map(r => r.id));
                };
                
                this.client.database.ref(`RedeLegit/mutados/${key}`).remove();
                
            } else {
                const member = guild.members.cache.get(key);
                
                this.client.mutes.set(key, setTimeout(() => {
                    
                    if(member) {
                        member.roles.remove(rolesToAdd.map(r => r.id), 'Usuário desmutado automaticamente');
                        if(rolesToRemove.size) member.roles.add(rolesToRemove.map(r => r.id));
                    }
                    
                    this.client.mutes.delete(key);
                    
                    this.client.database.ref(`RedeLegit/mutados/${key}`).remove();
                    
                }, value.endAt - Date.now()))
            }
        }
    }
}