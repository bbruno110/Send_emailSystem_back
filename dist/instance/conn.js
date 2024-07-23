"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize(process.env.PG_DB, process.env.PG_USER, process.env.PG_PASSWORD, {
    dialect: 'postgres',
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT),
    logging: true
});
exports.default = sequelize;
