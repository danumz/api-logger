import { Request, Response } from 'express';
import { QuestionPackage, Question } from '../models';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { QuestionPackageUpload } from '../types';

export const createQuestionPackage = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, questions }: QuestionPackageUpload = req.body;

  // Create the question package
  const questionPackage = await QuestionPackage.create({
    title,
    description,
  });

  // Create associated questions
  const createdQuestions = [];
  for (const questionData of questions) {
    const question = await Question.create({
      packageId: questionPackage.id,
      text: questionData.text,
      contentType: questionData.contentType,
      content: questionData.content,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation,
      difficulty: questionData.difficulty,
      tags: questionData.tags,
    });
    createdQuestions.push(question);
  }

  res.status(201).json({
    status: 'success',
    data: {
      package: questionPackage,
      questions: createdQuestions,
    },
  });
});

export const getQuestionPackages = asyncHandler(async (req: Request, res: Response) => {
  const packages = await QuestionPackage.findAll({
    include: [
      {
        association: 'questions',
        include: ['media'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json({
    status: 'success',
    data: packages,
  });
});

export const getQuestionPackageById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const questionPackage = await QuestionPackage.findByPk(id, {
    include: [
      {
        association: 'questions',
        include: ['media'],
      },
    ],
  });

  if (!questionPackage) {
    throw new AppError('Question package not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: questionPackage,
  });
});

export const updateQuestionPackage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const questionPackage = await QuestionPackage.findByPk(id);

  if (!questionPackage) {
    throw new AppError('Question package not found', 404);
  }

  if (title) questionPackage.title = title;
  if (description !== undefined) questionPackage.description = description;

  await questionPackage.save();

  res.status(200).json({
    status: 'success',
    data: questionPackage,
  });
});

export const deleteQuestionPackage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const questionPackage = await QuestionPackage.findByPk(id);

  if (!questionPackage) {
    throw new AppError('Question package not found', 404);
  }

  await questionPackage.destroy();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
