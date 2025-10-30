
export enum View {
  LOBBY = 'LOBBY',
  PLAY = 'PLAY',
  LEADERBOARD = 'LEADERBOARD',
  ADMIN = 'ADMIN',
}

export enum Role {
  PLAYER = 'PLAYER',
  ADMIN = 'ADMIN',
}

export enum TargetState {
  IDLE = 'IDLE',
  SCORING = 'SCORING',
  SCORED = 'SCORED',
  ERROR = 'ERROR',
}

export interface Target {
  id: number;
  title: string;
  imageUrl: string;
  groundTruthPrompt: string;
}

export interface Attempt {
  targetId: number;
  userPrompt: string;
  score: number;
  feedback: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  averageScore: number;
  scores: (number | null)[];
}

export interface Round {
  id: string;
  name: string;
  deadline: string;
  targets: Target[];
  leaderboard: LeaderboardEntry[];
  isFinished: boolean;
}
