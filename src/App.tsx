import { useRoute } from "./lib/routes";
import { TakedownDashboard } from "./pages/TakedownDashboard";
import { ScannedByAxio } from "./pages/ScannedByAxio";

function App() {
  const route = useRoute();
  return route === "scanned-by-axio" ? <ScannedByAxio /> : <TakedownDashboard />;
}

export default App;
