import QuestionPackage from './QuestionPackage';
import Question from './Question';
import Media from './Media';

// Define relationships
QuestionPackage.hasMany(Question, {
  foreignKey: 'packageId',
  as: 'questions',
  onDelete: 'CASCADE',
});

Question.belongsTo(QuestionPackage, {
  foreignKey: 'packageId',
  as: 'package',
});

Question.hasMany(Media, {
  foreignKey: 'questionId',
  as: 'media',
  onDelete: 'CASCADE',
});

Media.belongsTo(Question, {
  foreignKey: 'questionId',
  as: 'question',
});

export { QuestionPackage, Question, Media };

export const initializeDatabase = async () => {
  try {
    await QuestionPackage.sync();
    await Question.sync();
    await Media.sync();
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};
