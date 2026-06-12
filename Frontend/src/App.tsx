import { Toaster } from "react-hot-toast";
import AppRouter from "./ui/router/AppRouter";

function App() {
  return (
    <>
      <AppRouter />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            borderRadius: "12px",
            background: "#1f232b",
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          },
          success: {
            iconTheme: { primary: "#ff6a00", secondary: "#fff" },
          },
        }}
      />
    </>
  );
}

export default App;
