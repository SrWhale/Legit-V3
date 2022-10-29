module.exports = class nodeDisconnect {
    constructor(client) {
        this.client = client;
    }

    async run(node) {
        
        this.client.log(`Conexão com o node ${node.options.identifier} perdida.`, { tags: ['Music Node'], color: 'red' });
    }
}