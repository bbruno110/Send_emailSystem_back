import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../instance/conn';

interface EmpresaAttributes {
  id: number;
  ds_nome: string;
  cd_cnpj: string;
  nr_telefone_1: string;
  nr_telefone_2: string;
  ds_email: string;
  dt_criacao: Date;
  nr_repeticao: number;
  ie_situacao: string;
  dt_atualizacao: Date;
}

interface EmpresaCreationAttributes extends Optional<EmpresaAttributes, 'id'> {}

class Empresa extends Model<EmpresaAttributes, EmpresaCreationAttributes> implements EmpresaAttributes {
  public id!: number;
  public ds_nome!: string;
  public cd_cnpj!: string;
  public nr_telefone_1!: string;
  public nr_telefone_2!: string;
  public ds_email!: string;
  public dt_criacao!: Date;
  public nr_repeticao!: number;
  public ie_situacao!: string;
  public dt_atualizacao!: Date;

  // Timestamps automáticos (createdAt e updatedAt) são desabilitados
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Empresa.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ds_nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cd_cnpj: {
      type: DataTypes.STRING(14), // Ajuste o tamanho conforme necessário
      allowNull: false,
      unique: true, // Garantir unicidade do CNPJ
    },
    nr_telefone_1: {
      type: DataTypes.STRING(11), // Ajuste o tamanho conforme necessário
      allowNull: false,
    },
    nr_telefone_2: {
      type: DataTypes.STRING(11), // Ajuste o tamanho conforme necessário
      allowNull: true, // Torna o segundo telefone opcional
    },
    ds_email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true, // Validação de e-mail
      },
    },
    dt_criacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    nr_repeticao: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    ie_situacao: {
      type: DataTypes.STRING(1), // Ajuste o tamanho conforme necessário
      allowNull: false,
      defaultValue: 'A', // Valor padrão para 'ie_situacao'
    },
    dt_atualizacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Empresa', // Nome do modelo
    tableName: 'empresa', // Nome da tabela no banco de dados
    schema: 'prod_email',
    timestamps: false, // Evita a criação automática de colunas createdAt e updatedAt
  }
);

export default Empresa;
