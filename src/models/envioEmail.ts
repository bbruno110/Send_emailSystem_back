import { DataTypes, Model } from 'sequelize';
import sequelize from '../instance/conn';
import Empresa from './empresa';
import Perfil from './perfil';

interface EnvioEmailAttributes {
  id: number;
  empresas: number[];
  perfilId?: number;
  ds_assunto: string;
  ds_conteudo: string;
  dt_envio: Date;
}

class EnvioEmail extends Model<EnvioEmailAttributes> implements EnvioEmailAttributes {
  public id!: number;
  public empresas!: number[];
  public perfilId?: number;
  public ds_assunto!: string;
  public ds_conteudo!: string;
  public dt_envio!: Date;

  // Timestamps automáticos (createdAt e updatedAt) são desabilitados
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EnvioEmail.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    empresas: {
      type: DataTypes.ARRAY(DataTypes.INTEGER), // Array de números inteiros para IDs das empresas
      allowNull: false,
    },
    perfilId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Perfil', // Nome da tabela de perfil no banco de dados
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    ds_assunto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ds_conteudo: {
      type: DataTypes.TEXT, // Tipo TEXT para conteúdo extenso
      allowNull: false,
    },
    dt_envio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'EnvioEmail', // Nome do modelo
    tableName: 'envio_email', // Nome da tabela no banco de dados
    schema: 'prod_email',
    timestamps: false, // Evita a criação automática de colunas createdAt e updatedAt
  }
);

// Associações com outros modelos (opcional)
EnvioEmail.belongsToMany(Empresa, {
  through: 'EnvioEmailEmpresa',
  foreignKey: 'envioEmailId',
});
EnvioEmail.belongsTo(Perfil, {
  foreignKey: 'perfilId',
  as: 'perfil',
});

export default EnvioEmail;
