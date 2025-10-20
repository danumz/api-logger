import { Request, Response } from 'express';
import { Question, QuestionPackage, Media } from '../models';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { ContentType } from '../types';

export const createQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { packageId } = req.params;
  const { text, contentType, content, options, correctAnswer, explanation, difficulty, tags } = req.body;

  // Verify package exists
  const questionPackage = await QuestionPackage.findByPk(packageId);
  if (!questionPackage) {
    throw new AppError('Question package not found', 404);
  }

  const question = await Question.create({
    packageId: parseInt(packageId),
    text,
    contentType,
    content,
    options,
    correctAnswer,
    explanation,
    difficulty,
    tags,
  });

  res.status(201).json({
    status: 'success',
    data: question,
  });
});

export const getQuestions = asyncHandler(async (req: Request, res: Response) => {
  const { packageId } = req.params;
  const { contentType, difficulty, tag } = req.query;

  const whereClause: any = {};
  
  if (packageId) {
    whereClause.packageId = packageId;
  }

  if (contentType && Object.values(ContentType).includes(contentType as ContentType)) {
    whereClause.contentType = contentType;
  }

  if (difficulty) {
    whereClause.difficulty = difficulty;
  }

  const questions = await Question.findAll({
    where: whereClause,
    include: ['media'],
    order: [['createdAt', 'DESC']],
  });

  // Filter by tag if provided (since tags are stored as JSON)
  let filteredQuestions = questions;
  if (tag) {
    filteredQuestions = questions.filter(q => 
      q.tags && q.tags.includes(tag as string)
    );
  }

  res.status(200).json({
    status: 'success',
    data: filteredQuestions,
  });
});

export const getQuestionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const question = await Question.findByPk(id, {
    include: ['media', 'package'],
  });

  if (!question) {
    throw new AppError('Question not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: question,
  });
});

export const updateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, contentType, content, options, correctAnswer, explanation, difficulty, tags } = req.body;

  const question = await Question.findByPk(id);

  if (!question) {
    throw new AppError('Question not found', 404);
  }

  if (text) question.text = text;
  if (contentType) question.contentType = contentType;
  if (content) question.content = content;
  if (options !== undefined) question.options = options;
  if (correctAnswer !== undefined) question.correctAnswer = correctAnswer;
  if (explanation !== undefined) question.explanation = explanation;
  if (difficulty) question.difficulty = difficulty;
  if (tags !== undefined) question.tags = tags;

  await question.save();

  res.status(200).json({
    status: 'success',
    data: question,
  });
});

export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const question = await Question.findByPk(id);

  if (!question) {
    throw new AppError('Question not found', 404);
  }

  await question.destroy();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getQuestionsByContentType = asyncHandler(async (req: Request, res: Response) => {
  const { contentType } = req.params;

  if (!Object.values(ContentType).includes(contentType as ContentType)) {
    throw new AppError('Invalid content type', 400);
  }

  const questions = await Question.findAll({
    where: { contentType },
    include: ['media', 'package'],
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json({
    status: 'success',
    data: questions,
  });
});
