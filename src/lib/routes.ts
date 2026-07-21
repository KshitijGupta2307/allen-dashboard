import { useEffect, useState } from "react";

export type Route = "dashboard" | "scanned-by-axio" | "overall-report" | "drm";

function parseHash(hash: string): Route {
  if (hash === "#/scanned-by-axio") return "scanned-by-axio";
  if (hash === "#/overall-report") return "overall-report";
  if (hash === "#/drm") return "drm";
  return "dashboard";
}

/** ORM covers the existing Allen Submission / Scanned by Axio / Overall Report pages;
 * DRM is the separate anti-piracy data domain (its own sheet, not yet wired up). */
export type Mode = "orm" | "drm";

export function modeOf(route: Route): Mode {
  return route === "drm" ? "drm" : "orm";
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}
