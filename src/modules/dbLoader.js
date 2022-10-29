module.exports = class dbLoader {
    constructor(client) {
        this.client = client;
    }

    async start() {
        const ref = await this.client.database.ref(`RedeLegit`).once('value').then(d => d.val());
        
        this.client.sayChannels = ref['sayChannels'] || {};
        
        this.client.muteModule = ref['muteModule'] || {
            motivos: {},
            cargosToRemove: {},
            cargosToAdd: {},
            allowedChannels: {}
        };
        
        return true;
    }
}