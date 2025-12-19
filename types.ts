
export type SectionType = 'text' | 'stats' | 'chart' | 'list' | 'gallery';

export interface StatItem {
  label: string;
  value: string;
  trend?: string;
  icon?: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface GalleryItem {
  title: string;
  description: string;
  imageUrl?: string;
  isGenerating?: boolean;
  type?: 'diagram' | 'photo' | 'chart' | 'table';
  generationPrompt?: string;
}

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  content?: string;
  stats?: StatItem[];
  chartType?: 'bar' | 'line' | 'pie';
  chartData?: ChartData[];
  listItems?: string[];
  galleryItems?: GalleryItem[];
}

export interface AnalysisResult {
  title: string;
  subtitle: string;
  summary: string;
  sections: Section[];
}
