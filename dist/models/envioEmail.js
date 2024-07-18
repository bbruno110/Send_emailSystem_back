"use strict";
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
    empresas: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.INTEGER),
        allowNull: false,
    },
    perfilId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: 'Perfil',
            key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
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
    timestamps: false, // Evita a criação automática de colunas createdAt e updatedAt
});
// Associações com outros modelos (opcional)
EnvioEmail.belongsToMany(empresa_1.default, {
    through: 'EnvioEmailEmpresa',
    foreignKey: 'envioEmailId',
});
EnvioEmail.belongsTo(perfil_1.default, {
    foreignKey: 'perfilId',
    as: 'perfil',
});
exports.default = EnvioEmail;
