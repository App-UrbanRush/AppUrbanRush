import { Toaster } from "react-hot-toast";
import AppRouter from "./ui/router/AppRouter";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 600,
            padding: "12px 16px",
          },
        }}
      />
      <AppRouter />
    </>
  );
}

export default App;