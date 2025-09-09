import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionsList";
import CTA from "@/components/CTA";
import {
  getAllCompanions,
  getRecentSessions,
} from "@/lib/actions/companion.actions";
import { getSubjectColor } from "@/lib/utils";
import { getBookmarkedCompanions } from "@/lib/actions/companion.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  const companions = await getAllCompanions({ limit: 3 });
  const recentSessionsCompanions = await getRecentSessions(10);
  const bookmarkedCompanions = user ? await getBookmarkedCompanions(user.id) : [];
  const bookmarkedCompanionIds = new Set(bookmarkedCompanions.map(c => c.id));

  return (
    <main>
      <h1 className="text-2xl">Popular Companions</h1>
      <section className="home-section">
        {companions.map((companion) => (
          <CompanionCard
            key={companion.id}
            {...companion}
            color={getSubjectColor(companion.subject)}
            bookmarked={bookmarkedCompanionIds.has(companion.id)}
          />
        ))}
      </section>
      <section className="home-section">
        <CompanionsList
          title="Recently completed sessions"
          companions={recentSessionsCompanions}
          classNames="w-2/3 max-lg:w-full"
        />
        <CTA />
      </section>
    </main>
  );
};

export default Page;
