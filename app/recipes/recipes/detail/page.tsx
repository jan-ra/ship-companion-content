import { Suspense } from "react";
import RecipeDetailPage from "./client";

export default function Page() {
  return (
    <Suspense>
      <RecipeDetailPage />
    </Suspense>
  );
}
