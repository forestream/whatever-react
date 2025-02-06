import App from "./App";
import { createRoot, render } from "@/react/jsx-runtime";

const root = document.getElementById("root");
createRoot(root!);
render(<App />);
