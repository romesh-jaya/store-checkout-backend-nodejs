import { Sequelize, DataTypes, Model } from 'sequelize';
import * as constants from '../../constants';

export class ProductModel extends Model {
  public id!: number;
  public name!: string;
  public prices!: number[];
  public barcode!: string;
  public status!: string;
  public created_at: string | undefined;
  public updated_at: string | undefined;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof ProductModel {
  ProductModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      prices: {
        allowNull: false,
        type: DataTypes.ARRAY(DataTypes.FLOAT),
      },
      barcode: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      status: {
        allowNull: false,
        type: DataTypes.STRING,
        defaultValue: constants.STATUS_ACTIVE,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: 'products',
      sequelize,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      timestamps: true,
    }
  );

  return ProductModel;
}
