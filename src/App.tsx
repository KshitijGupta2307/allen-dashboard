import { useRoute } from "./lib/routes";
import { TakedownDashboard } from "./pages/TakedownDashboard";
import { ScannedByAxio } from "./pages/ScannedByAxio";
import { OverallReport } from "./pages/OverallReport";
import { Drm } from "./pages/Drm";
import { DrmReport } from "./pages/DrmReport";

function App() {
  const route = useRoute();
  if (route === "scanned-by-axio") return <ScannedByAxio />;
  if (route === "overall-report") return <OverallReport />;
  if (route === "drm-report") return <DrmReport />;
  if (route === "drm") return <Drm />;
  return <TakedownDashboard />;
}

export default App;
