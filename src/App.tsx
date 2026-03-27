import Calendar from "./components/Calendar";
import { useIPGuard } from "./hooks/useIPGuard";
import ErrorImg from "./assets/error-message.png";
import "./index.css";

const BlockedScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center p-8 px-20 bg-white rounded-2xl shadow-lg max-w-md">
      <img src={ErrorImg} alt="LYG" className="h-20 mx-auto mb-2" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Cannot access</h1>
      <p className="text-gray-500 text-sm">
        You can't access to this system.
        <br />
        Please contact to the Administrator.
      </p>
    </div>
  </div>
);

const IPCheckingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
      <p className="text-gray-500 text-sm">Authenticating...</p>
    </div>
  </div>
);

function App() {
  const { mode } = useIPGuard();

  if (mode === "loading") return <IPCheckingScreen />;
  if (mode === "blocked") return <BlockedScreen />;

  return <Calendar isFixed={mode === "fixed"} />;
}

export default App;
