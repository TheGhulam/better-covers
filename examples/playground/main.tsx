import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Gallery } from "better-covers";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
);
