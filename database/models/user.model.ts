import { Sequelize, DataTypes, Model } from 'sequelize';

export class UserModel extends Model {
  public id!: number;
  public email!: string;
  public password_hash!: string;
  public is_admin!: boolean;
  public created_at: string | undefined;
  public updated_at: string | undefined;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof UserModel {
  UserModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      password_hash: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      is_admin: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: 'users',
      sequelize,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return UserModel;
}
