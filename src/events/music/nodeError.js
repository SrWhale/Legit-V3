module.exports = class nodeError {
    constructor(client) {
        this.client = client;
    }

    async run(node, error) {
        
        if(error.message.includes('pong')) return;
        
        this.client.log(`Ocorreu um erro no node ${node.options.identifier}. Erro: ${error}`, { tags: ['Music Node'], color: 'red'})
    }
}