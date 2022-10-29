module.exports = class messageEvent {
    constructor(client) {
        this.client = client;
    }

    async run(data) {

        this.client.music.updateVoiceState(data);
    }
}