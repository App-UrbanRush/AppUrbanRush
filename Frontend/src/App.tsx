import AppRouter from "./ui/router/AppRouter";
import { AuthProvider } from "./ui/context/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;