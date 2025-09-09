"use client";

import { useEffect, useState, useCallback } from "react";
import { vapi } from "@/lib/vapi.sdk";
import { configureAssistant } from "@/lib/utils";
import { addToSessionHistory } from "@/lib/actions/companion.actions";
import { CallStatus, SavedMessage } from "./types";
import type { VapiMessage } from "@vapi-ai/web";

export const useCompanion = ({
  companionId,
  voice,
  style = "",
}: {
  companionId: string;
  voice: string;
  style?: string;
  topic: string;
  subject: string;
}) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startCall = useCallback(async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);
      await configureAssistant(voice, style);
      setCallStatus(CallStatus.ACTIVE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start call");
      setCallStatus(CallStatus.INACTIVE);
    }
  }, [voice, style]);

  const endCall = useCallback(() => {
    try {
      setCallStatus(CallStatus.FINISHED);
      addToSessionHistory(companionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end call");
    }
  }, [companionId]);

  const toggleMute = useCallback(() => {
    try {
      const currentMuted = vapi.isMuted();
      const newMuted = !currentMuted;
      vapi.setMuted(newMuted);
      setIsMuted(newMuted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle mute");
    }
  }, []);

  const handleMessage = useCallback((message: VapiMessage) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        content: message.content,
        role: message.role,
        timestamp: Date.now(),
      },
    ]);
    setIsSpeaking(true);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const handleCallStart = () => {
      if (isSubscribed) {
        setCallStatus(CallStatus.ACTIVE);
      }
    };

    const handleCallEnd = () => {
      if (isSubscribed) {
        endCall();
      }
    };

    const handleSpeakingStart = () => {
      if (isSubscribed) {
        setIsSpeaking(true);
      }
    };

    const handleSpeakingEnd = () => {
      if (isSubscribed) {
        setIsSpeaking(false);
      }
    };

    const handleError = (error: Error) => {
      if (isSubscribed) {
        setError(error.message);
      }
    };

    // Set up event listeners with type-safe event names
    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("message", (data) => {
      if (typeof data === "object" && data !== null && "type" in data) {
        handleMessage(data as VapiMessage);
      }
    });
    vapi.on("speech-start", handleSpeakingStart);
    vapi.on("speech-end", handleSpeakingEnd);
    vapi.on("error", (data) => {
      if (data instanceof Error) {
        handleError(data);
      } else {
        handleError(new Error(String(data)));
      }
    });

    return () => {
      isSubscribed = false;
      // Remove event listeners
      vapi.off("call-start", handleCallStart);
      vapi.off("call-end", handleCallEnd);
      vapi.off("message", handleMessage);
      vapi.off("speech-start", handleSpeakingStart);
      vapi.off("speech-end", handleSpeakingEnd);
      vapi.off("error", handleError);
    };
  }, [endCall, handleMessage]);

  return {
    callStatus,
    isSpeaking,
    isMuted,
    messages,
    error,
    actions: {
      startCall,
      endCall,
      toggleMute,
      clearError,
    },
  };
};
