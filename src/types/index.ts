export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  EQUATION = 'equation',
  TABLE = 'table',
  GRAPH = 'graph',
  MIXED = 'mixed'
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document'
}

export interface QuestionContent {
  type: ContentType;
  text?: string;
  imageId?: number;
  equation?: string;
  tableData?: TableData;
  graphData?: GraphData;
  mixedContent?: MixedContent[];
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface GraphData {
  type: 'line' | 'bar' | 'pie' | 'scatter';
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface MixedContent {
  type: 'text' | 'image' | 'equation';
  content: string;
  imageId?: number;
}

export interface QuestionPackageUpload {
  title: string;
  description?: string;
  questions: QuestionData[];
}

export interface QuestionData {
  text: string;
  contentType: ContentType;
  content: QuestionContent;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}
