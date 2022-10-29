module.exports = class queueEnd {
    constructor(client) {
        this.client = client;
    }

    async run(player) {
        player.destroy();
    }
}