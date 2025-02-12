import Sequelize from 'sequelize';
import userModel from './models/user.model';

export const sequelize = new Sequelize.Sequelize(
  process.env.DB_CONN_STRING as string,
  {
    dialect: 'postgres',
    define: {
      underscored: true,
      freezeTableName: true,
    },
    pool: {
      min: 0,
      max: 5,
    },
    logQueryParameters: process.env.NODE_ENV === 'development',
  }
);

sequelize.authenticate();

export const DB = {
  Users: userModel(sequelize),
  sequelize, // connection instance (RAW queries)
  Sequelize, // library
};
