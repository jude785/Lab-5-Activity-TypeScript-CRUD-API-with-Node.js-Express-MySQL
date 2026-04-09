import config from '../../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';

export interface Database {
  User: any;
}

const db = {} as Database;

async function initialize(): Promise<void> {
  const { host, port, user, password, database } = config.database;

  const connection = await mysql.createConnection({ host, port, user, password });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  await connection.end();

  const sequelize = new Sequelize(database, user, password, {
    host,
    dialect: 'mysql'
  });

  const userModel = await import('../users/user.model');
  const User = userModel.default(sequelize);

  db.User = User;

  await sequelize.sync({ alter: true });
  console.log('Database initialized and models synced');
}

export { db, initialize };
