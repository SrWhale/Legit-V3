module.exports = class nodeConnect {
    constructor(client) {
        this.client = client;
    }

    async run(node) {
   
        this.client.music.nodes.get(node.options.tag).reconnectAttempts = 1;
        
        this.client.log(`Node ${node.options.identifier} conectado com sucesso.`, { tags: ['Music Node'], color: 'green' });

        node.send({ op: 'ping' });

        setInterval(() => {
            node.send({ op: 'ping' });
        }, 30000)
    }
}