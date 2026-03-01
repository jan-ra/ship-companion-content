import { Suspense } from "react";
import CityPointsPage from "./client";

export default function Page() {
  return (
    <Suspense>
      <CityPointsPage />
    </Suspense>
  );
}
