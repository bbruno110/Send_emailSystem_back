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
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    ds_nome: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    cd_cnpj: {
        type: sequelize_1.DataTypes.STRING(14),
        allowNull: false,
        unique: true, // Garantir unicidade do CNPJ
    },
    nr_telefone_1: {
        type: sequelize_1.DataTypes.STRING(11),
        allowNull: false,
    },
    nr_telefone_2: {
        type: sequelize_1.DataTypes.STRING(11),
        allowNull: true, // Torna o segundo telefone opcional
    },
    ds_email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true, // Validação de e-mail
        },
    },
    dt_criacao: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    nr_repeticao: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    ie_situacao: {
        type: sequelize_1.DataTypes.STRING(1),
        allowNull: false,
        defaultValue: 'A', // Valor padrão para 'ie_situacao'
    },
    dt_atualizacao: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: conn_1.default,
    modelName: 'Empresa',
    tableName: 'empresa',
    schema: 'prod_email',
    timestamps: false, // Evita a criação automática de colunas createdAt e updatedAt
});
exports.default = Empresa;
