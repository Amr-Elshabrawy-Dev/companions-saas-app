export enum Subject {
  maths = "maths",
  language = "language",
  science = "science",
  history = "history",
  coding = "coding",
  geography = "geography",
  economics = "economics",
  finance = "finance",
  business = "business",
}

export type Companion = {
  id: string;
  name: string;
  subject: Subject;
  topic: string;
  duration: number;
  voice: string;
  style: string;
  author: string;
  created_at: string;
};

export interface CompanionWithBookmark extends Companion {
  bookmarked: boolean;
}

export interface CreateCompanion {
  name: string;
  subject: Subject;
  topic: string;
  voice: string;
  style: string;
  duration: number;
}

export interface GetAllCompanions {
  limit?: number;
  page?: number;
  subject?: Subject;
  topic?: string;
}

export interface SearchParams {
  searchParams: Record<string, string | string[] | undefined>;
}
