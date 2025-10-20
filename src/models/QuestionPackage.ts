import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface QuestionPackageAttributes {
  id: number;
  title: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface QuestionPackageCreationAttributes extends Optional<QuestionPackageAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class QuestionPackage extends Model<QuestionPackageAttributes, QuestionPackageCreationAttributes> 
  implements QuestionPackageAttributes {
  public id!: number;
  public title!: string;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

QuestionPackage.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'question_packages',
    timestamps: true,
  }
);

export default QuestionPackage;
