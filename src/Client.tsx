import App from "./App";
import { hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";

export default function Client() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  );
}

console.log("start hydration");
hydrateRoot(document.getElementById("root") as HTMLDivElement, <Client />);
