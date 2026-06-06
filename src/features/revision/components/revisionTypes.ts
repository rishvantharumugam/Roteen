export interface Playlist {
  id: string;
  title: string;
  videoCount: number;
  date: string;
  isPinned: boolean;
  category?: string;
  gradient?: string;
  icon?: string;
}

export interface NewPlaylistDraft {
  title: string;
}

export const CATEGORIES = [
  "General",
  "Programming",
  "Science",
  "Concepts"
];

export const GRADIENTS = [
  "linear-gradient(135deg, #5B21B6 0%, #9333EA 100%)",      // Purple
  "linear-gradient(135deg, #4C1D95 0%, #8B5CF6 100%)",      // Blue replaced with Violet
  "linear-gradient(135deg, #065F46 0%, #10B981 100%)",      // Green
  "linear-gradient(135deg, #0D47A1 0%, #1E88E5 100%)",      // Dark Blue
  "linear-gradient(135deg, #B45309 0%, #F59E0B 100%)",      // Orange
  "linear-gradient(135deg, #831843 0%, #EC4899 100%)",      // Pink
  "linear-gradient(135deg, #1F2937 0%, #4B5563 100%)",      // Gray
  "linear-gradient(135deg, #1E293B 0%, #334155 100%)",      // Slate
];

export const ICONS = [
  "📋", "💻", "⚛️", "🧬", "📊", "🧠", "🌍", "🧪"
];
