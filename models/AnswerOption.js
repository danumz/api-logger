const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class AnswerOption extends Model {}

AnswerOption.init({
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  questionId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'questions',
      key: 'id'
    }
  },
  optionText: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  optionLetter: {
    type: DataTypes.CHAR(1),
    allowNull: false,
    validate: {
      isIn: [['A', 'B', 'C', 'D']]
    }
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {},
    get() {
      const rawValue = this.getDataValue('metadata');
      return rawValue ? JSON.parse(rawValue) : {};
    },
    set(value) {
      this.setDataValue('metadata', JSON.stringify(value));
    }
  }
}, {
  sequelize,
  modelName: 'AnswerOption',
  tableName: 'answer_options',
  timestamps: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

module.exports = AnswerOption;