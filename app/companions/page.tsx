import CompanionCard from "@/components/CompanionCard";
import SearchInput from "@/components/SearchInput";
import SubjectFilter from "@/components/SubjectFilter";
import {
  getAllCompanions,
  getBookmarkedCompanions,
} from "@/lib/actions/companion.actions";
import { currentUser } from "@clerk/nextjs/server";
import { getSubjectColor } from "@/lib/utils";
import { Companion, SearchParams, Subject } from "@/types/companions";

const CompanionsLibrary = async ({ searchParams }: SearchParams) => {
  try {
    const filters = await searchParams;
    const subjectFilter = Array.isArray(filters.subject)
      ? filters.subject[0]
      : filters.subject;
    const subject = Object.values(Subject).includes(subjectFilter as Subject)
      ? (subjectFilter as Subject)
      : undefined;
    const topic = Array.isArray(filters.topic)
      ? filters.topic[0]
      : filters.topic || "";

    const [companionList, user] = await Promise.all([
      getAllCompanions({ subject, topic }),
      currentUser(),
    ]).catch((error) => {
      console.error("Failed to fetch data:", error);
      throw error;
    });

    const bookmarkedCompanions = user
      ? await getBookmarkedCompanions(user.id)
      : [];
    const bookmarkedCompanionIds = new Set(
      bookmarkedCompanions.map((c: Companion) => c.id)
    );

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
  } catch (error) {
    console.error("Error in CompanionsLibrary:", error);
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
          <p>
            An error occurred while loading companions. Please try again later.
          </p>
        </div>
      </main>
    );
  }
};

export default CompanionsLibrary;
