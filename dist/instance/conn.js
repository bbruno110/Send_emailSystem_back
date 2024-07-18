"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize({
    dialect: 'postgres',
    database: 'sys_emails_env',
    username: 'postgres',
    password: '123Mudar',
    host: 'localhost',
    port: 5433,
    define: {
        timestamps: false, // Evita que o Sequelize adicione colunas de timestamp automaticamente
    },
    logging: false
});
exports.default = sequelize;
