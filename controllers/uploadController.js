const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const wordProcessor = require('../services/wordProcessor');
const { Question, QuestionPackage, AnswerOption } = require('../models');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.docx') {
      return cb(new Error('Only .docx files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

class UploadController {
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded'
        });
      }

      const { title, description } = req.body;

      // Process the document
      const processedData = await wordProcessor.processDocument(req.file.path);

      // Create question package
      const questionPackage = await QuestionPackage.create({
        title,
        description,
        totalQuestions: processedData.questions.length,
        createdBy: req.user?.id || 'system'
      });

      // Create questions with their answers
      const questions = await Promise.all(
        processedData.questions.map(async (questionData) => {
          // Create question
          const question = await Question.create({
            packageId: questionPackage.id,
            content: questionData.content,
            type: questionData.type,
            metadata: questionData.metadata,
            assets: questionData.assets,
            orderNumber: questionData.orderNumber,
            correctAnswer: questionData.correctAnswer,
            explanation: questionData.explanation
          });

          // Create options
          if (questionData.options && questionData.options.length > 0) {
            await AnswerOption.bulkCreate(
              questionData.options.map(opt => ({
                questionId: question.id,
                optionText: opt.optionText,
                optionLetter: opt.optionLetter,
                isCorrect: opt.isCorrect
              }))
            );
          }

          return question;
        })
      );

      // Clean up uploaded file
      await fs.unlink(req.file.path);

      res.status(201).json({
        message: 'Question package uploaded successfully',
        questionPackage,
        questions,
        warnings: processedData.warnings
      });
    } catch (error) {
      // Clean up uploaded file if exists
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }

      res.status(500).json({
        error: 'Failed to process question package',
        message: error.message
      });
    }
  }
}

module.exports = {
  uploadController: new UploadController(),
  uploadMiddleware: upload.single('document')
};