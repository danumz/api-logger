import mammoth from 'mammoth';
import { ContentType, QuestionContent, TableData, MediaType } from '../types';
import { Media } from '../models';
import path from 'path';
import fs from 'fs';

export interface ProcessedQuestion {
  text: string;
  contentType: ContentType;
  content: QuestionContent;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface ProcessedDocument {
  questions: ProcessedQuestion[];
  mediaFiles: Array<{
    filename: string;
    buffer: Buffer;
    mimeType: string;
  }>;
}

export class DocumentProcessor {
  /**
   * Process a Word document and extract questions
   */
  static async processWordDocument(filePath: string): Promise<ProcessedDocument> {
    try {
      const result = await mammoth.convertToHtml(
        { path: filePath },
        {
          convertImage: mammoth.images.imgElement((image) => {
            return image.read('base64').then((imageBuffer: string) => {
              // Store image data for later processing
              return {
                src: `data:${image.contentType};base64,${imageBuffer}`,
              };
            });
          }),
        }
      );

      const html = result.value;
      const messages = result.messages;

      // Log any warnings or errors from mammoth
      if (messages.length > 0) {
        console.log('Mammoth conversion messages:', messages);
      }

      // Parse the HTML to extract questions
      const questions = this.parseQuestionsFromHtml(html);
      
      // Extract images from the document
      const mediaFiles = await this.extractMediaFromDocument(filePath);

      return {
        questions,
        mediaFiles,
      };
    } catch (error) {
      throw new Error(`Failed to process Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse questions from HTML content
   * Expects questions to be separated by headings or specific markers
   */
  private static parseQuestionsFromHtml(html: string): ProcessedQuestion[] {
    const questions: ProcessedQuestion[] = [];

    // Split by paragraphs and headings
    const lines = html.split(/<\/?(?:p|h[1-6])[^>]*>/gi).filter(line => line.trim());

    let currentQuestion: Partial<ProcessedQuestion> | null = null;
    let collectingAnswer = false;
    let collectingExplanation = false;

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // Remove HTML tags for text processing
      const cleanLine = line.replace(/<[^>]*>/g, '').trim();

      // Detect question markers (Q1, Q2, Question 1, etc.)
      const questionMatch = cleanLine.match(/^(?:Q|Question)\s*(\d+)[:\.\)]?\s*(.*)/i);
      
      if (questionMatch) {
        // Save previous question if exists
        if (currentQuestion && currentQuestion.text) {
          questions.push(this.finalizeQuestion(currentQuestion));
        }

        // Start new question
        currentQuestion = {
          text: questionMatch[2] || '',
          contentType: ContentType.TEXT,
          content: { type: ContentType.TEXT, text: questionMatch[2] || '' },
          tags: [],
        };
        collectingAnswer = false;
        collectingExplanation = false;
      }
      // Detect answer markers
      else if (cleanLine.match(/^(?:Answer|Correct Answer)[:\.\)]?\s*/i)) {
        const answerText = cleanLine.replace(/^(?:Answer|Correct Answer)[:\.\)]?\s*/i, '');
        if (currentQuestion) {
          currentQuestion.correctAnswer = answerText;
        }
        collectingAnswer = true;
        collectingExplanation = false;
      }
      // Detect explanation markers
      else if (cleanLine.match(/^(?:Explanation|Explain)[:\.\)]?\s*/i)) {
        const explanationText = cleanLine.replace(/^(?:Explanation|Explain)[:\.\)]?\s*/i, '');
        if (currentQuestion) {
          currentQuestion.explanation = explanationText;
        }
        collectingAnswer = false;
        collectingExplanation = true;
      }
      // Detect difficulty markers
      else if (cleanLine.match(/^(?:Difficulty|Level)[:\.\)]?\s*(easy|medium|hard)/i)) {
        const difficultyMatch = cleanLine.match(/^(?:Difficulty|Level)[:\.\)]?\s*(easy|medium|hard)/i);
        if (currentQuestion && difficultyMatch) {
          currentQuestion.difficulty = difficultyMatch[1].toLowerCase() as 'easy' | 'medium' | 'hard';
        }
      }
      // Detect options (A, B, C, D or 1, 2, 3, 4)
      else if (cleanLine.match(/^(?:[A-D]|[1-4])[:\.\)]\s+/)) {
        if (currentQuestion) {
          if (!currentQuestion.options) {
            currentQuestion.options = [];
          }
          const optionText = cleanLine.replace(/^(?:[A-D]|[1-4])[:\.\)]\s+/, '');
          currentQuestion.options.push(optionText);
        }
      }
      // Continue collecting text for current section
      else if (currentQuestion) {
        if (collectingAnswer && currentQuestion.correctAnswer) {
          currentQuestion.correctAnswer += ' ' + cleanLine;
        } else if (collectingExplanation && currentQuestion.explanation) {
          currentQuestion.explanation += ' ' + cleanLine;
        } else if (!collectingAnswer && !collectingExplanation) {
          currentQuestion.text += ' ' + cleanLine;
          if (currentQuestion.content && currentQuestion.content.text) {
            currentQuestion.content.text += ' ' + cleanLine;
          }
        }
      }

      // Check for tables in the line
      if (line.includes('<table')) {
        const tableData = this.extractTableFromHtml(line);
        if (currentQuestion && tableData) {
          currentQuestion.contentType = ContentType.TABLE;
          currentQuestion.content = {
            type: ContentType.TABLE,
            tableData,
          };
        }
      }

      // Check for equations (simple detection)
      if (cleanLine.match(/[∫∑∏√∂∇±×÷≤≥≠≈∞]|x\^2|[a-z]\^\d/)) {
        if (currentQuestion) {
          currentQuestion.contentType = ContentType.EQUATION;
          currentQuestion.content = {
            type: ContentType.EQUATION,
            equation: cleanLine,
          };
        }
      }
    }

    // Add the last question
    if (currentQuestion && currentQuestion.text) {
      questions.push(this.finalizeQuestion(currentQuestion));
    }

    return questions;
  }

  /**
   * Finalize a question object
   */
  private static finalizeQuestion(question: Partial<ProcessedQuestion>): ProcessedQuestion {
    return {
      text: question.text?.trim() || '',
      contentType: question.contentType || ContentType.TEXT,
      content: question.content || { type: ContentType.TEXT, text: question.text?.trim() || '' },
      options: question.options,
      correctAnswer: question.correctAnswer?.trim(),
      explanation: question.explanation?.trim(),
      difficulty: question.difficulty,
      tags: question.tags || [],
    };
  }

  /**
   * Extract table data from HTML table
   */
  private static extractTableFromHtml(html: string): TableData | null {
    try {
      const tableMatch = html.match(/<table[^>]*>(.*?)<\/table>/is);
      if (!tableMatch) return null;

      const tableHtml = tableMatch[1];
      
      // Extract headers
      const headerMatch = tableHtml.match(/<thead[^>]*>(.*?)<\/thead>/is);
      const headers: string[] = [];
      
      if (headerMatch) {
        const thMatches = headerMatch[1].matchAll(/<th[^>]*>(.*?)<\/th>/gis);
        for (const match of thMatches) {
          headers.push(match[1].replace(/<[^>]*>/g, '').trim());
        }
      }

      // Extract rows
      const rows: string[][] = [];
      const trMatches = tableHtml.matchAll(/<tr[^>]*>(.*?)<\/tr>/gis);
      
      for (const trMatch of trMatches) {
        const row: string[] = [];
        const tdMatches = trMatch[1].matchAll(/<td[^>]*>(.*?)<\/td>/gis);
        
        for (const tdMatch of tdMatches) {
          row.push(tdMatch[1].replace(/<[^>]*>/g, '').trim());
        }
        
        if (row.length > 0) {
          rows.push(row);
        }
      }

      if (headers.length > 0 || rows.length > 0) {
        return {
          headers: headers.length > 0 ? headers : rows.length > 0 ? rows[0].map((_, i) => `Column ${i + 1}`) : [],
          rows: headers.length > 0 ? rows : rows.slice(1),
        };
      }

      return null;
    } catch (error) {
      console.error('Error extracting table:', error);
      return null;
    }
  }

  /**
   * Extract media files (images) from the document
   */
  private static async extractMediaFromDocument(filePath: string): Promise<Array<{ filename: string; buffer: Buffer; mimeType: string }>> {
    const mediaFiles: Array<{ filename: string; buffer: Buffer; mimeType: string }> = [];

    try {
      // Note: Mammoth's image extraction is handled during the main conversion
      // This method is a placeholder for future enhancements
      return mediaFiles;
    } catch (error) {
      console.error('Error extracting media from document:', error);
      return [];
    }
  }

  /**
   * Save extracted media files to the uploads directory
   */
  static async saveMediaFiles(
    mediaFiles: Array<{ filename: string; buffer: Buffer; mimeType: string }>,
    uploadDir: string
  ): Promise<Media[]> {
    const savedMedia: Media[] = [];

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (const mediaFile of mediaFiles) {
      try {
        const filePath = path.join(uploadDir, mediaFile.filename);
        fs.writeFileSync(filePath, mediaFile.buffer);

        // Determine media type from MIME type
        let mediaType: MediaType = MediaType.IMAGE;
        if (mediaFile.mimeType.startsWith('image/')) mediaType = MediaType.IMAGE;
        else if (mediaFile.mimeType.startsWith('video/')) mediaType = MediaType.VIDEO;
        else if (mediaFile.mimeType.startsWith('audio/')) mediaType = MediaType.AUDIO;
        else mediaType = MediaType.DOCUMENT;

        const media = await Media.create({
          filename: mediaFile.filename,
          originalName: mediaFile.filename,
          mimeType: mediaFile.mimeType,
          size: mediaFile.buffer.length,
          path: filePath,
          mediaType,
        });

        savedMedia.push(media);
      } catch (error) {
        console.error(`Error saving media file ${mediaFile.filename}:`, error);
      }
    }

    return savedMedia;
  }
}
