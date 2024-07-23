"use strict";
// src/models/envioEmail.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const conn_1 = __importDefault(require("../instance/conn"));
const empresa_1 = __importDefault(require("./empresa"));
const perfil_1 = __importDefault(require("./perfil"));
class EnvioEmail extends sequelize_1.Model {
}
EnvioEmail.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    empresa_id: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'empresa',
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    perfil_id: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'perfil',
            key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        allowNull: true,
    },
    ds_assunto: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    ds_conteudo: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    dt_envio: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: conn_1.default,
    modelName: 'EnvioEmail',
    tableName: 'envio_email',
    schema: 'prod_email',
    timestamps: false,
});
EnvioEmail.belongsTo(empresa_1.default, {
    foreignKey: 'empresa_id',
});
EnvioEmail.belongsTo(perfil_1.default, {
    foreignKey: 'perfil_id',
    as: 'perfil',
});
exports.default = EnvioEmail;
