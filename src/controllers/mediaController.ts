import { Request, Response } from 'express';
import { Media, Question } from '../models';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { ContentHandler } from '../utils/contentHandlers';
import path from 'path';
import fs from 'fs';

export const uploadMedia = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const { questionId } = req.body;

  // Verify question exists if questionId is provided
  if (questionId) {
    const question = await Question.findByPk(questionId);
    if (!question) {
      throw new AppError('Question not found', 404);
    }
  }

  const mediaType = ContentHandler.getMediaType(req.file.mimetype);

  const media = await Media.create({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    mediaType,
    questionId: questionId ? parseInt(questionId) : undefined,
  });

  res.status(201).json({
    status: 'success',
    data: media,
  });
});

export const getMedia = asyncHandler(async (req: Request, res: Response) => {
  const { questionId } = req.query;

  const whereClause: any = {};
  if (questionId) {
    whereClause.questionId = questionId;
  }

  const media = await Media.findAll({
    where: whereClause,
    include: questionId ? ['question'] : [],
    order: [['createdAt', 'DESC']],
  });

  res.status(200).json({
    status: 'success',
    data: media,
  });
});

export const getMediaById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const media = await Media.findByPk(id, {
    include: ['question'],
  });

  if (!media) {
    throw new AppError('Media not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: media,
  });
});

export const downloadMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const media = await Media.findByPk(id);

  if (!media) {
    throw new AppError('Media not found', 404);
  }

  if (!fs.existsSync(media.path)) {
    throw new AppError('Media file not found on server', 404);
  }

  res.setHeader('Content-Type', media.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${media.originalName}"`);
  res.sendFile(path.resolve(media.path));
});

export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const media = await Media.findByPk(id);

  if (!media) {
    throw new AppError('Media not found', 404);
  }

  // Delete file from filesystem
  if (fs.existsSync(media.path)) {
    fs.unlinkSync(media.path);
  }

  await media.destroy();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
