import React from "react";
import ReactDOM from "react-dom/client"; // React 18 Import
import App from "./App";
import "./App.css"; // Ensure correct styling

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
