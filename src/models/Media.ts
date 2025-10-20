import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { MediaType } from '../types';

interface MediaAttributes {
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  mediaType: MediaType;
  questionId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MediaCreationAttributes extends Optional<MediaAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Media extends Model<MediaAttributes, MediaCreationAttributes> 
  implements MediaAttributes {
  public id!: number;
  public filename!: string;
  public originalName!: string;
  public mimeType!: string;
  public size!: number;
  public path!: string;
  public mediaType!: MediaType;
  public questionId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Media.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mediaType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'questions',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'media',
    timestamps: true,
  }
);

export default Media;
