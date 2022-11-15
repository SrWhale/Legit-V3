const moment = require('moment');

const axios = require('axios');

moment.locale('pt-br');
module.exports = class Utils {
    constructor() {
        this.nickname = false;
    }

    async getNickname(client, id) {

        return await new Promise((resolve, reject) => {
            client.mysql.query(`SELECT * FROM lobby.kdiscordcargos_names WHERE member = '${id}'`, (err, response) => {
                if (err) {
                    console.log(err);
                    return resolve(false);
                }
                if (!response.length) return resolve(false);
                resolve(response.map(r => r.name)[0])
            })
        })

    }


    async getUser(client, user) {

        return await new Promise(async (resolve, reject) => {
            const nickFromId = await this.getMysqlInformation(this.client, `SELECT * FROM forum.users WHERE name = '${user}'`)
            if (nickFromId === 'noFound') return resolve(false);

            client.mysql.query(`SELECT * FROM forum.users_social_medias WHERE id = '${nickFromId}'`, (err, response) => {
                if (err) return resolve(false);
                if (!response.length) return resolve(false);

                resolve(true);
            })
        })
    }

    async getUserID(client, nick) {
        return await new Promise(async (resolve, reject) => {
            const nickFromId = await this.getMysqlInformation(client, `SELECT * FROM forum.users WHERE name = '${nick}'`)

            if (nickFromId === 'noFound') resolve(false);

            client.mysql.query(`SELECT * FROM forum.users_social_medias WHERE user_id = '${nickFromId[0].id}'`, (err, response) => {
                if (err) return resolve(false);
                if (!response.length) return resolve(false);

                resolve(response[0].discord_id ? response[0].discord_id : false);
            })
        })
    }


    async validateNickname(client, user) {
        return await new Promise((resolve, reject) => {
            client.mysql3.query(`SELECT * FROM s858_commons.accounts WHERE username = '${user}'`, (err, response) => {
                if (err) return resolve(false);
                if (!response.length) return resolve(false);

                resolve(user);
            })
        })
    }


    getMysqlInformation(client, data) {
        return new Promise((resolve, reject) => {
            client.mysql.query(data, (err, response) => {
                if (err) {
                    console.log(err);
                    resolve('noFound');
                    return;
                };
                if (!response.length) return resolve('noFound');
                resolve(response)
            })
        })
    };

    getMysqlInformation2(client, data) {
        return new Promise((resolve, reject) => {
            client.mysql2.query(data, (err, response) => {
                if (err) {
                    console.log(err);
                    resolve('noFound');
                    return;
                };
                if (!response.length) return resolve('noFound');
                resolve(response)
            })
        })
    };

    getMysqlInformation3(client, data) {
        return new Promise((resolve, reject) => {
            client.mysql3.query(data, (err, response) => {
                if (err) {
                    console.log(err);
                    resolve('noFound');
                    return;
                };
                if (!response.length) return resolve('noFound');
                resolve(response)
            })
        })
    }

    msToTime(duration) {

        var milliseconds = parseInt((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
            days = Math.floor((duration / (1000 * 60 * 60 * 24) % 24))

        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        days = days < 10 ? '0' + days : days;

        return days.toString().replace('0-', '') + " d, " + hours.toString().replace('0-', '') + ' h, ' + minutes.toString().replace('0-', '') + ' m e ' + seconds.toString().replace('0-', '') + ' s';
    }


    getPunicao(client, nick, tipo) {

        return tipo === 'ban' ?
            new Promise((resolve, reject) => {

                client.mysql.query(`SELECT * FROM bungeecord.punicoes WHERE jogador = '${nick}'`, (err, result) => {
                    if (err) {
                        console.log(err);
                        return resolve('noFound');
                    } else if (!result.length) {
                        return resolve('noFound')
                    } else return resolve(result)
                })

            }) :
            new Promise((resolve, reject) => {
                client.mysql.query(`SELECT * FROM bungeecord.punicoes WHERE jogador = '${nick}'`, (err, result) => {
                    if (err) {
                        console.log(err);
                        return resolve('noFound');
                    } else if (!result.length) {
                        return resolve('noFound')
                    } else return resolve(result)
                })
            })
    }

    async deletePunicao(client, nick, ID) {

        return new Promise((resolve, reject) => {
            axios({
                url: 'https://painel-hero.sysbackup.net/api/client/servers/d99c56b9/command',
                method: 'POST',
                data: { command: `despunir ${ID}` },
                headers: {
                    'Authorization': 'Bearer ' + process.env.PTERO_API,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                }
            }).then(res => resolve(true)).catch(async err => await resolve(await this.deletePunicao(client, nick, ID)));
        })
    }

    async realizePunicao(client, nick, reason, prova) {

        return new Promise((resolve, reject) => {
            axios({
                url: 'https://pterodactyl.logichost.com.br/api/client/servers/feda50ad/command',
                method: 'POST',
                data: { command: `punir ${nick} ${reason} ${prova}` },
                headers: {
                    'Authorization': 'Bearer ' + process.env.PTERO_API,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                }
            }).then(res => resolve(true))
        })
    }
}