"use client";

import CompanionCard from "@/components/CompanionCard";
import SearchInput from "@/components/SearchInput";
import SubjectFilter from "@/components/SubjectFilter";
import {
  getAllCompanions,
  getBookmarkedCompanions,
} from "@/lib/actions/companion.actions";
import { useUser, SignInButton } from "@clerk/nextjs"; // Use useUser for client components
import { getSubjectColor } from "@/lib/utils";
import { Companion, Subject } from "@/types/companions";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const CompanionsClientPage = () => {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { userId } = useAuth();
  const [companionList, setCompanionList] = useState<Companion[]>([]);
  const [bookmarkedCompanionIds, setBookmarkedCompanionIds] = useState<
    Set<string>
  >(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const subjectFilter = searchParams.get("subject");
        const subject = Object.values(Subject).includes(
          subjectFilter as Subject
        )
          ? (subjectFilter as Subject)
          : undefined;
        const topic = searchParams.get("topic") || "";

        const fetchedCompanions = await getAllCompanions({ subject, topic });
        setCompanionList(fetchedCompanions);

        if (user) {
          const bookmarked = await getBookmarkedCompanions(user.id);
          setBookmarkedCompanionIds(
            new Set(bookmarked.map((c: Companion) => c.id))
          );
        }
      } catch (err) {
        console.error("Error in CompanionsClientPage:", err);
        setError(
          "An error occurred while loading companions. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, user]);

  // Clear client-side state when user logs out
  useEffect(() => {
    if (!userId) {
      // User has logged out, clear all client-side state
      setCompanionList([]);
      setBookmarkedCompanionIds(new Set());
      setError(null);
      setLoading(false);
    }
  }, [userId]);

  // Show authentication prompt for logged-out users
  if (!userId) {
    return (
      <main>
        <section className="flex justify-between gap-4 max-sm:flex-col">
          <h1>Companion Library</h1>
          <div className="flex gap-4">
            <SearchInput />
            <SubjectFilter />
          </div>
        </section>
        <div className="mt-8 text-center">
          <div className="max-w-md mx-auto flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">
              Sign In to Access Companions
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to view and interact with our AI companions
              library.
            </p>
            <SignInButton>
              <button className="btn-signin">Sign In to Continue</button>
            </SignInButton>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main>
        <section className="flex justify-between gap-4 max-sm:flex-col">
          <h1>Companion Library</h1>
          <div className="flex gap-4">
            <SearchInput />
            <SubjectFilter />
          </div>
        </section>
        <div className="mt-8 text-center">
          <p>Loading companions...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <section className="flex justify-between gap-4 max-sm:flex-col">
          <h1>Companion Library</h1>
          <div className="flex gap-4">
            <SearchInput />
            <SubjectFilter />
          </div>
        </section>
        <div className="mt-8 text-center text-red-600">
          <p>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <section className="flex justify-between gap-4 max-sm:flex-col">
        <h1>Companion Library</h1>
        <div className="flex gap-4">
          <SearchInput />
          <SubjectFilter />
        </div>
      </section>
      {companionList.length === 0 ? (
        <div className="mt-8 text-center">
          <p>No companions found matching your criteria.</p>
        </div>
      ) : (
        <section className="companions-grid">
          {companionList.map((companion: Companion) => (
            <CompanionCard
              key={companion.id}
              {...companion}
              color={getSubjectColor(companion.subject)}
              bookmarked={bookmarkedCompanionIds.has(companion.id)}
            />
          ))}
        </section>
      )}
    </main>
  );
};

export default CompanionsClientPage;
