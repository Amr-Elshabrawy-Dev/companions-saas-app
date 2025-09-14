import { Suspense } from "react";
import CompanionsClientPage from "./CompanionsClientPage";

const CompanionsLibrary = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompanionsClientPage />
    </Suspense>
  );
};

export default CompanionsLibrary;
