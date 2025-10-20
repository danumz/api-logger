import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ContentType, QuestionContent } from '../types';

interface QuestionAttributes {
  id: number;
  packageId: number;
  text: string;
  contentType: ContentType;
  content: QuestionContent;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface QuestionCreationAttributes extends Optional<QuestionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Question extends Model<QuestionAttributes, QuestionCreationAttributes> 
  implements QuestionAttributes {
  public id!: number;
  public packageId!: number;
  public text!: string;
  public contentType!: ContentType;
  public content!: QuestionContent;
  public options?: string[];
  public correctAnswer?: string;
  public explanation?: string;
  public difficulty?: 'easy' | 'medium' | 'hard';
  public tags?: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Question.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    packageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'question_packages',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    contentType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ContentType.TEXT,
    },
    content: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    correctAnswer: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    difficulty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'questions',
    timestamps: true,
  }
);

export default Question;
