"use client";

import { cn, getSubjectColor } from "@/lib/utils";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import Image from "next/image";
import { useRef } from "react";
import soundwaves from "@/constants/soundwaves.json";
import { CompanionErrorBoundary } from "./ErrorBoundary";
import { useCompanion } from "./useCompanion";
import { CallStatus, CompanionComponentProps } from "./types";

export const CompanionComponent = ({
  name,
  subject,
  topic,
  companionId,
  userName,
  userImage,
  style,
  voice,
}: CompanionComponentProps) => {
  const {
    callStatus,
    isSpeaking,
    isMuted,
    messages,
    error,
    actions: { startCall, endCall, toggleMute, clearError },
  } = useCompanion({ companionId, voice, style, topic, subject });

  const lottieRef = useRef<LottieRefCurrentProps>(null);

  // Handle animation
  if (lottieRef.current) {
    if (isSpeaking) {
      lottieRef.current.play();
    } else {
      lottieRef.current.stop();
    }
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <p className="text-red-600">{error}</p>
        <button
          onClick={clearError}
          className="mt-2 px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-100"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <CompanionErrorBoundary>
      <div className={cn("companion-container", style)}>
        <div className="companion-header">
          <div className="flex items-center gap-2">
            <div
              className="size-12 flex items-center justify-center rounded-lg"
              style={{ backgroundColor: getSubjectColor(subject) }}
            >
              <Image
                src={`/icons/${subject}.svg`}
                alt={subject}
                width={24}
                height={24}
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{name}</h2>
              <p className="text-sm text-muted">{topic}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {callStatus !== CallStatus.INACTIVE && (
              <button
                onClick={toggleMute}
                className="icon-button"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                <Image
                  src={`/icons/mic-${isMuted ? "off" : "on"}.svg`}
                  alt={isMuted ? "Unmute" : "Mute"}
                  width={24}
                  height={24}
                />
              </button>
            )}

            <button
              onClick={callStatus === CallStatus.INACTIVE ? startCall : endCall}
              className={cn(
                "call-button",
                callStatus === CallStatus.ACTIVE && "active"
              )}
            >
              {callStatus === CallStatus.INACTIVE ? "Start Call" : "End Call"}
            </button>
          </div>
        </div>

        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "message",
                message.role === "user" ? "user" : "assistant"
              )}
            >
              {message.role === "user" ? (
                <Image
                  src={userImage}
                  alt={userName}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div
                  className="size-8 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: getSubjectColor(subject) }}
                >
                  <Image
                    src={`/icons/${subject}.svg`}
                    alt={subject}
                    width={16}
                    height={16}
                  />
                </div>
              )}
              <p>{message.content}</p>
            </div>
          ))}
        </div>

        {isSpeaking && (
          <div className="soundwave-container">
            <Lottie
              lottieRef={lottieRef}
              animationData={soundwaves}
              loop
              autoplay={false}
            />
          </div>
        )}
      </div>
    </CompanionErrorBoundary>
  );
};
