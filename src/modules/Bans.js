module.exports = class banManager {
    constructor(client) {
        this.client = client;
    }

    async start() {
        const bans = await this.client.database.ref(`RedeLegit/banidos/`).once('value').then(d => d.val() || {});
        
        const guild = this.client.guilds.cache.get('564398372161585162');
        
        const rolesToAdd = this.client.config.bans.cargosToAdd.filter(c => !isNaN(c)).map(role => guild.roles.cache.get(role));
        
        const rolesToRemove = this.client.config.bans.cargosToRemove.filter(c => !isNaN(c)).map(role => guild.roles.cache.get(role));
        
        for(const [key, value] of Object.entries(bans)) {
            
            if(!value.endAt) {
                this.client.bans.set(key, true);
                
                continue;
            };
            
            if(Date.now() >= value.endAt) {
                const member = guild.members.cache.get(key);
                
                if(member) {
                    member.roles.remove(rolesToAdd.map(r => r.id), 'Usuário desbanido automaticamente');
                    if(rolesToRemove.length) member.roles.add(rolesToRemove.map(r => r.id));
                };
                
                this.client.database.ref(`RedeLegit/banidos/${key}`).remove();
                
            } else {
                const member = guild.members.cache.get(key);
                
                this.client.bans.set(key, setTimeout(() => {
                    
                    if(member) {
                        member.roles.remove(rolesToAdd.map(r => r.id), 'Usuário desbanido automaticamente');
                        
                        if(rolesToRemove.size) member.roles.add(rolesToRemove.map(r => r.id));
                    }
                    
                    this.client.bans.delete(key);
                    
                    this.client.database.ref(`RedeLegit/banidos/${key}`).remove();
                    
                }, value.endAt - Date.now()))
            }
        }
    }
}