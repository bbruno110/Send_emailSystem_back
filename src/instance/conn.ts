import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'postgres',
  database: 'sys_emails_env',
  username: 'postgres',
  password: '123Mudar',
  host: 'localhost',
  port: 5433, // Porta padrão do PostgreSQL
  define: {
    timestamps: false, // Evita que o Sequelize adicione colunas de timestamp automaticamente
  },
  logging: false
});

export default sequelize;