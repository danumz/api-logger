import { ContentType, QuestionContent, TableData, GraphData } from '../types';
import { Media } from '../models';
import { MediaType } from '../types';

export class ContentHandler {
  /**
   * Process image content
   */
  static async processImage(mediaId: number): Promise<QuestionContent> {
    const media = await Media.findByPk(mediaId);
    if (!media) {
      throw new Error('Media not found');
    }

    return {
      type: ContentType.IMAGE,
      imageId: mediaId,
    };
  }

  /**
   * Process equation content
   * Supports LaTeX format
   */
  static processEquation(equation: string): QuestionContent {
    // Basic validation for LaTeX equations
    if (!equation || typeof equation !== 'string') {
      throw new Error('Invalid equation format');
    }

    return {
      type: ContentType.EQUATION,
      equation: equation.trim(),
    };
  }

  /**
   * Process table data
   */
  static processTable(tableData: TableData): QuestionContent {
    if (!tableData.headers || !Array.isArray(tableData.headers)) {
      throw new Error('Table headers are required');
    }

    if (!tableData.rows || !Array.isArray(tableData.rows)) {
      throw new Error('Table rows are required');
    }

    // Validate that all rows have the same number of columns as headers
    const headerCount = tableData.headers.length;
    for (const row of tableData.rows) {
      if (!Array.isArray(row) || row.length !== headerCount) {
        throw new Error('All rows must have the same number of columns as headers');
      }
    }

    return {
      type: ContentType.TABLE,
      tableData,
    };
  }

  /**
   * Process graph data
   */
  static processGraph(graphData: GraphData): QuestionContent {
    if (!graphData.type || !['line', 'bar', 'pie', 'scatter'].includes(graphData.type)) {
      throw new Error('Invalid graph type');
    }

    if (!graphData.labels || !Array.isArray(graphData.labels)) {
      throw new Error('Graph labels are required');
    }

    if (!graphData.datasets || !Array.isArray(graphData.datasets)) {
      throw new Error('Graph datasets are required');
    }

    // Validate datasets
    for (const dataset of graphData.datasets) {
      if (!dataset.label || !dataset.data || !Array.isArray(dataset.data)) {
        throw new Error('Each dataset must have a label and data array');
      }
    }

    return {
      type: ContentType.GRAPH,
      graphData,
    };
  }

  /**
   * Process mixed content (text, images, equations)
   */
  static async processMixed(mixedContent: any[]): Promise<QuestionContent> {
    if (!Array.isArray(mixedContent) || mixedContent.length === 0) {
      throw new Error('Mixed content must be a non-empty array');
    }

    const processed = [];
    for (const item of mixedContent) {
      if (!item.type || !['text', 'image', 'equation'].includes(item.type)) {
        throw new Error('Invalid mixed content item type');
      }

      if (item.type === 'image' && item.imageId) {
        const media = await Media.findByPk(item.imageId);
        if (!media) {
          throw new Error(`Media with id ${item.imageId} not found`);
        }
      }

      processed.push(item);
    }

    return {
      type: ContentType.MIXED,
      mixedContent: processed,
    };
  }

  /**
   * Determine media type from MIME type
   */
  static getMediaType(mimeType: string): MediaType {
    if (mimeType.startsWith('image/')) {
      return MediaType.IMAGE;
    } else if (mimeType.startsWith('video/')) {
      return MediaType.VIDEO;
    } else if (mimeType.startsWith('audio/')) {
      return MediaType.AUDIO;
    } else {
      return MediaType.DOCUMENT;
    }
  }
}
