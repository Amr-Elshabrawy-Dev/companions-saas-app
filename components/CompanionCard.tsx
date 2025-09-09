"use client";

import Image from "next/image";
import Link from "next/link";
import { addBookmark, removeBookmark } from "@/lib/actions/companion.actions";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CompanionWithBookmark } from "@/types/companions";

interface CompanionCardProps extends CompanionWithBookmark {
  color: string;
}

const CompanionCard = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
  bookmarked,
}: CompanionCardProps) => {
  const pathname = usePathname();
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);

  const handleBookmark = async () => {
    if (isBookmarked) {
      await removeBookmark(id, pathname);
      setIsBookmarked(false);
    } else {
      await addBookmark(id, pathname);
      setIsBookmarked(true);
    }
  };
  return (
    <article className="companion-card" style={{ backgroundColor: color }}>
      <div className="flex justify-between items-center ">
        <div className="subject-badge">{subject}</div>
        <button
          className="companion-bookmark"
          onClick={handleBookmark}
          title="bookmark"
          aria-label="Bookmark companion"
        >
          <Image
            src={
              isBookmarked
                ? "/icons/bookmark-filled.svg"
                : "/icons/bookmark.svg"
            }
            alt="bookmark"
            width={12.5}
            height={15}
          />
        </button>
      </div>
      <h2 className="text-2xl font-bold">{name}</h2>
      <p className="text-sm">{topic}</p>
      <div className="flex items-center gap-2">
        <Image
          src="/icons/clock.svg"
          alt="duration"
          width={13.5}
          height={13.5}
        />
        <p className="text-sm">{duration} mins</p>
      </div>
      <Link
        href={`/companions/${id}`}
        className="btn-primary w-full justify-center"
      >
        Launch Lesson
      </Link>
    </article>
  );
};
export default CompanionCard;
