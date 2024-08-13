"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const conn_1 = __importDefault(require("../instance/conn"));
class Empresa extends sequelize_1.Model {
    // Método de validação público e estático
    static validateCpfOrCnpj(instance) {
        if (!instance.nr_cpf && !instance.cd_cnpj) {
            throw new Error('Pelo menos um dos campos "CPF" ou "CNPJ" deve ser preenchido.');
        }
    }
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
        allowNull: true,
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
    ie_status: {
        type: new sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    nr_processo: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    nr_cpf: {
        type: new sequelize_1.DataTypes.STRING(11),
        allowNull: true,
    },
}, {
    tableName: 'empresa',
    modelName: 'Empresa',
    schema: 'prod_email',
    timestamps: false,
    createdAt: false,
    sequelize: conn_1.default,
    hooks: {
        beforeSave: (instance) => __awaiter(void 0, void 0, void 0, function* () {
            Empresa.validateCpfOrCnpj(instance); // Chamada ao método estático
        }),
    },
});
exports.default = Empresa;
