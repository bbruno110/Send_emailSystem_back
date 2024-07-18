import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../instance/conn';

interface PerfilAttributes {
  id: number;
  nm_titulo: string;
  ds_conteudo: string;
  dt_criacao: Date;
  dt_atualizacao: Date;
}

interface PerfilCreationAttributes extends Optional<PerfilAttributes, 'id' | 'dt_criacao' | 'dt_atualizacao'> {}

class Perfil extends Model<PerfilAttributes, PerfilCreationAttributes> implements PerfilAttributes {
  public id!: number;
  public nm_titulo!: string;
  public ds_conteudo!: string;
  public dt_criacao!: Date;
  public dt_atualizacao!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Perfil.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nm_titulo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    ds_conteudo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dt_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    dt_atualizacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Perfil',
    tableName: 'perfil',
    schema: 'prod_email',
    timestamps: false,
  }
);

export default Perfil;
