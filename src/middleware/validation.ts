import { Request, Response, NextFunction } from 'express';
import { ContentType } from '../types';
import { AppError } from './errorHandler';

export const validateQuestionPackage = (req: Request, res: Response, next: NextFunction) => {
  const { title, questions } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new AppError('Title is required and must be a non-empty string', 400);
  }

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new AppError('Questions array is required and must not be empty', 400);
  }

  // Validate each question
  questions.forEach((question: any, index: number) => {
    if (!question.text || typeof question.text !== 'string') {
      throw new AppError(`Question at index ${index} must have a text field`, 400);
    }

    if (!question.contentType || !Object.values(ContentType).includes(question.contentType)) {
      throw new AppError(`Question at index ${index} has invalid contentType`, 400);
    }

    if (!question.content || typeof question.content !== 'object') {
      throw new AppError(`Question at index ${index} must have a content object`, 400);
    }
  });

  next();
};

export const validateQuestion = (req: Request, res: Response, next: NextFunction) => {
  const { text, contentType, content } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new AppError('Text is required and must be a non-empty string', 400);
  }

  if (!contentType || !Object.values(ContentType).includes(contentType)) {
    throw new AppError('Invalid contentType', 400);
  }

  if (!content || typeof content !== 'object') {
    throw new AppError('Content must be an object', 400);
  }

  next();
};

export const validateMediaUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  next();
};
