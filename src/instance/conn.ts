import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(    
  process.env.PG_DB as string,
  process.env.PG_USER as string,
  process.env.PG_PASSWORD as string, {
      dialect: 'postgres',
      host: process.env.PG_HOST as string,
      port: parseInt( process.env.PG_PORT as string ),
      logging: true
  });

export default sequelize;