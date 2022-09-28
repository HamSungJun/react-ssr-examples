import App from "./App";
import { hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./components/ErrorFallback";
declare global {
  interface Window {
    __REACT_QUERY_STATE__: string;
  }
}

export default function Client() {
  const [queryClient] = useState(() => new QueryClient());
  const dehydratedState = window.__REACT_QUERY_STATE__ ?? {
    mutations: [],
    queries: [],
  };
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={dehydratedState}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Hydrate>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

console.log("start hydration");
hydrateRoot(document.getElementById("root") as HTMLDivElement, <Client />);
