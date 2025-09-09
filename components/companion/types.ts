export enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

export interface CompanionComponentProps {
  name: string;
  subject: string;
  topic: string;
  companionId: string;
  userName: string;
  userImage: string;
  style?: string;
  voice: string;
}

export interface Message {
  content: string;
  role: "user" | "assistant";
  timestamp: number;
}

export interface SavedMessage extends Message {
  id: string;
}
