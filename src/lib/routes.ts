import { useEffect, useState } from "react";

export type Route = "dashboard" | "scanned-by-axio" | "overall-report";

function parseHash(hash: string): Route {
  if (hash === "#/scanned-by-axio") return "scanned-by-axio";
  if (hash === "#/overall-report") return "overall-report";
  return "dashboard";
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
