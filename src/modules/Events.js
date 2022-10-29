const { readdirSync, stat } = require('fs');

const { join } = require('path');

module.exports = class EventLoader {
    constructor(client) {
        this.client = client;
    }

    async start() {
        await this.loadEvents('src/events')
    }

    async loadEvents(path) {
        const files = readdirSync(path);

        files.forEach(file => {
            const filePath = join(path, file);

            stat(filePath, (err, stats) => {
                if (stats.isDirectory()) {
                    return this.loadEvents(filePath);
                } else if (stats.isFile()) {

                    const event = new (require(`../../${filePath}`))(this.client);

                    let e = this.client;

                    const eventPath = filePath.split('/').slice(2);

                    for (let i = 0; i < eventPath.length - 1; i++) {
                        e = e[eventPath[i]];
                    }
                  
                    e.on(file.replace('.js', ''), (...args) => event.run(...args));

                    return event;
                }
            })
        })

    }
}