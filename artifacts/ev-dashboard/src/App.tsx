import { ThemeProvider } from "@/context/ThemeContext";
import { ApiProvider } from "@/context/ApiContext";
import Dashboard from "@/pages/Dashboard";

function App() {
  return (
    <ApiProvider>
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    </ApiProvider>
  );
}

export default App;
