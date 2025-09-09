import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

declare module "@vapi-ai/web" {
  export type VapiEventName =
    | "call-start"
    | "call-end"
    | "message"
    | "speech-start"
    | "speech-end"
    | "error";

  export type VapiEventMap = {
    "call-start": () => void;
    "call-end": () => void;
    message: (message: VapiMessage) => void;
    "speech-start": () => void;
    "speech-end": () => void;
    error: (error: Error) => void;
  };

  export interface VapiMessage {
    type: "add-message";
    content: string;
    role: "user" | "assistant";
  }

  export default class Vapi {
    constructor(token: string);

    on(event: "start", callback: () => void): void;
    on(event: "end", callback: () => void): void;
    on(event: "message", callback: (message: VapiMessage) => void): void;
    on(event: "speakingStart", callback: () => void): void;
    on(event: "speakingEnd", callback: () => void): void;
    on(event: "error", callback: (error: Error) => void): void;

    off(event: "start", callback: () => void): void;
    off(event: "end", callback: () => void): void;
    off(event: "message", callback: (message: VapiMessage) => void): void;
    off(event: "speakingStart", callback: () => void): void;
    off(event: "speakingEnd", callback: () => void): void;
    off(event: "error", callback: (error: Error) => void): void;

    // Audio control methods
    isMuted(): boolean;
    setMuted(muted: boolean): void;

    // Call control methods
    createAssistant(config: CreateAssistantDTO): Promise<void>;
    connect(): Promise<void>;
    disconnect(): void;
    off(event: "speakingEnd", callback: () => void): void;
    off(event: "error", callback: (error: Error) => void): void;

    mute(): void;
    unmute(): void;

    createAssistant(config: CreateAssistantDTO): Promise<void>;
    connect(): Promise<void>;
    disconnect(): void;
  }
}
