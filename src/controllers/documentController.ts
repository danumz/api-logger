import { Request, Response } from 'express';
import { QuestionPackage, Question } from '../models';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { DocumentProcessor } from '../utils/documentProcessor';
import path from 'path';
import fs from 'fs';

/**
 * Upload and process a Word document to create a question package
 */
export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('No document uploaded', 400);
  }

  // Validate file type
  if (!req.file.mimetype.includes('wordprocessingml') && !req.file.originalname.endsWith('.docx')) {
    // Clean up uploaded file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw new AppError('Only Word documents (.docx) are allowed', 400);
  }

  const { title, description } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    // Clean up uploaded file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw new AppError('Title is required', 400);
  }

  try {
    // Process the document
    const processedData = await DocumentProcessor.processWordDocument(req.file.path);

    if (!processedData.questions || processedData.questions.length === 0) {
      throw new AppError('No questions found in the document', 400);
    }

    // Save media files to uploads directory
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const savedMedia = await DocumentProcessor.saveMediaFiles(processedData.mediaFiles, uploadDir);

    // Create question package
    const questionPackage = await QuestionPackage.create({
      title: title.trim(),
      description: description?.trim(),
    });

    // Create questions and associate with media
    const createdQuestions = [];
    for (const questionData of processedData.questions) {
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

    // Clean up the uploaded document file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(201).json({
      status: 'success',
      message: 'Document processed successfully',
      data: {
        package: questionPackage,
        questions: createdQuestions,
        mediaFiles: savedMedia.map(m => ({
          id: m.id,
          filename: m.filename,
          originalName: m.originalName,
          mimeType: m.mimeType,
          url: `/uploads/${m.filename}`,
        })),
        summary: {
          totalQuestions: createdQuestions.length,
          totalMediaFiles: savedMedia.length,
        },
      },
    });
  } catch (error) {
    // Clean up uploaded file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError(
      `Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500
    );
  }
});

/**
 * Get supported document formats
 */
export const getSupportedFormats = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: {
      supportedFormats: [
        {
          format: 'docx',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          description: 'Microsoft Word Document',
        },
      ],
      documentStructure: {
        questionFormat: 'Q1: Question text or Question 1: Question text',
        answerFormat: 'A: Answer text or Answer: Answer text',
        optionsFormat: 'A. Option 1\nB. Option 2\nC. Option 3\nD. Option 4',
        difficultyFormat: 'Difficulty: easy|medium|hard',
        explanationFormat: 'Explanation: Explanation text',
      },
      features: [
        'Automatic question extraction',
        'Image extraction and storage',
        'Table recognition',
        'Equation detection',
        'Multiple choice options',
        'Answer and explanation parsing',
      ],
    },
  });
});
