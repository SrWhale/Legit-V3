const { Client, Collection } = require('discord.js');

const Embed = require('./Embed.js');

const { readdirSync } = require('fs');

const chalk = require('chalk');

const _ = require('lodash')

const nodeactyl = require('nodeactyl');

const mysql = require('mysql');
const { timeStamp } = require('console');

module.exports = class LegitClient extends Client {
    constructor(options) {
        super(options);

        this.embed = Embed;

        this.events = new Collection();

        this.commands = new Collection();

        this.mutes = new Collection();

        this.bans = new Collection();

        this.nodeactyl = new nodeactyl.NodeactylClient('https://pterodactyl.redelegit.com.br/', process.env.PTERO_API);

        this.mysql = mysql.createConnection({
            host: 'database.logichost.com.br',
            user: 'u789_1ZzNcZwpvk',
            port: 3306,
            password: '6gvQ2hHjcIfd@y91!@5V4mDx'
        });

        this.mysql2 = mysql.createConnection({
            host: '191.96.225.102',
            user: 'admin',
            port: 7141,
            password: '8D3PTHaPR7m2LCBc41z9CU06f4hARcRw'
        })

        this.utils = require('./Utils.js')
    }

    msToTime(duration) {
        var seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

        return hours.toString().replace('0-', '') + 'h ' + minutes.toString().replace('0-', '') + 'm ' + seconds.toString().replace('0-', '') + 's';
    };

    async login() {
        return super.login(process.env.TOKEN)
    }

    log(message, {
        tags = [],
        bold = false,
        italic = false,
        underline = false,
        reversed = false,
        bgColor = false,
        color = 'white'
    } = {}) {
        const colorFunction = _.get(chalk, [bold, italic, underline, reversed, bgColor, color].filter(Boolean).join('.'));

        console.log(...tags.map(t => chalk.cyan(`[${t}]`)), colorFunction(message))
    }

    async loadModules() {
        const modules = readdirSync('src/modules/');

        modules.forEach(file => {
            const module = require(`../modules/${file}`);

            new module(this).start();
        })
    }

    async connectdatabase() {
        const firebase = require('firebase');

        firebase.initializeApp({
            apiKey: process.env.FIREBASE_API,
            authDomain: process.env.FIREBASE_DOMAIN,
            databaseURL: process.env.FIREBASE_URL,
            projectId: process.env.FIREBASE_PROJECTID,
            storageBucket: process.env.FIREBASE_STORAGE,
            messagingSenderId: process.env.FIREBASE_SENDER,
            appId: process.env.FIREBASE_APPID,
            measurementId: process.env.FIREBASE_MEASURE
        });

        this.database = firebase.database();
        return this.log(`[FIREBASE] - Firebase conectado com sucesso.`, { tags: ['Banco de dados'], color: 'green' })
    }
}