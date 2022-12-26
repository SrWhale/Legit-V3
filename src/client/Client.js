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

        this.nodeactyl = new nodeactyl.NodeactylClient('https://painel.redelegit.com.br/', process.env.PTERO_API);

        this.mysql = mysql.createConnection({
            host: process.env.mysql1_host,
            user: process.env.mysql1_user,
            port: process.env.mysql1_port,
            password: process.env.mysql1_password
        });

        this.analisando = new Collection();

        this.mysql2 = mysql.createConnection({
            host: process.env.mysql2_host,
            user: process.env.mysql2_user,
            port: process.env.mysql2_port,
            password: process.env.mysql2_password
        });

        this.mysql3 = mysql.createConnection({
            host: process.env.mysql3_host,
            user: process.env.mysql3_user,
            port: process.env.mysql3_port,
            password: process.env.mysql3_password
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