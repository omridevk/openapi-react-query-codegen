import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { prefetchUseDefaultServiceFindPets } from "../openapi/queries/prefetch";
import { queryClient } from "./queryClient";

async function PrefetchData() {
  await prefetchUseDefaultServiceFindPets(queryClient);
}

PrefetchData().then(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>,
  );
});
