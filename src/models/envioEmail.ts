// src/models/envioEmail.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../instance/conn';
import Empresa from './empresa';
import Perfil from './perfil';

interface EnvioEmailAttributes {
  id: number;
  empresa_id?: number;
  perfil_id?: number;
  ds_assunto: string;
  ds_conteudo: string;
  dt_envio: Date;
}

export interface EnvioEmailCreationAttributes extends Optional<EnvioEmailAttributes, 'id'> {}

class EnvioEmail extends Model<EnvioEmailAttributes, EnvioEmailCreationAttributes> implements EnvioEmailAttributes {
  public id!: number;
  public empresa_id?: number;
  public perfil_id?: number;
  public ds_assunto!: string;
  public ds_conteudo!: string;
  public dt_envio!: Date;

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
    empresa_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'empresa',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    perfil_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'perfil',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      allowNull: true,
    },
    ds_assunto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ds_conteudo: {
      type: DataTypes.TEXT,
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
    modelName: 'EnvioEmail',
    tableName: 'envio_email',
    schema: 'prod_email',
    timestamps: false,
  }
);

EnvioEmail.belongsTo(Empresa, {
  foreignKey: 'empresa_id',
});
EnvioEmail.belongsTo(Perfil, {
  foreignKey: 'perfil_id',
  as: 'perfil',
});

export default EnvioEmail;
