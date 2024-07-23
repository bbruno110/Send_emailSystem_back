import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../instance/conn';

interface EmpresaAttributes {
  id: number;
  ds_nome: string;
  cd_cnpj: string;
  nr_telefone_1?: string;
  nr_telefone_2?: string;
  ds_email?: string;
  dt_criacao?: Date;
  nr_repeticao?: number;
  ie_situacao?: string;
  dt_atualizacao?: Date;
  dt_vencimento?: Date;
  dt_processo?: Date;
  nr_valor?: number;
  ie_status?: string;
}

interface EmpresaCreationAttributes extends Optional<EmpresaAttributes, 'id'> {}

class Empresa extends Model<EmpresaAttributes, EmpresaCreationAttributes>
  implements EmpresaAttributes {
  public id!: number;
  public ds_nome!: string;
  public cd_cnpj!: string;
  public nr_telefone_1?: string;
  public nr_telefone_2?: string;
  public ds_email?: string;
  public dt_criacao?: Date;
  public nr_repeticao?: number;
  public ie_situacao?: string;
  public dt_atualizacao?: Date;
  public dt_vencimento?: Date;
  public dt_processo?: Date;
  public nr_valor?: number;
  public ie_status?: string;
}

Empresa.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    ds_nome: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    cd_cnpj: {
      type: new DataTypes.STRING(18),
      allowNull: false,
    },
    nr_telefone_1: {
      type: new DataTypes.STRING(20),
      allowNull: true,
    },
    nr_telefone_2: {
      type: new DataTypes.STRING(20),
      allowNull: true,
    },
    ds_email: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    dt_criacao: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    nr_repeticao: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    ie_situacao: {
      type: DataTypes.CHAR(1),
      allowNull: true,
      defaultValue: 'A',
    },
    dt_atualizacao: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    dt_vencimento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dt_processo: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nr_valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    ie_status: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: 'empresa',
    modelName: 'EnvioEmail',
    schema: 'prod_email',
    sequelize,
  }
);

export default Empresa;
