"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const conn_1 = __importDefault(require("../instance/conn"));
class Empresa extends sequelize_1.Model {
}
Empresa.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    ds_nome: {
        type: new sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    cd_cnpj: {
        type: new sequelize_1.DataTypes.STRING(18),
        allowNull: false,
    },
    nr_telefone_1: {
        type: new sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    nr_telefone_2: {
        type: new sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    ds_email: {
        type: new sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    dt_criacao: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    nr_repeticao: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
    },
    ie_situacao: {
        type: sequelize_1.DataTypes.CHAR(1),
        allowNull: true,
        defaultValue: 'A',
    },
    dt_atualizacao: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    dt_vencimento: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    dt_processo: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    nr_valor: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
}, {
    sequelize: conn_1.default,
    modelName: 'Empresa',
    tableName: 'empresa',
    schema: 'prod_email',
    timestamps: false, // Evita a criação automática de colunas createdAt e updatedAt
});
exports.default = Empresa;
