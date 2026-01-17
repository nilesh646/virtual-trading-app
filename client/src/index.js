import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster position="top-right" />
    </AuthProvider>
  </React.StrictMode>
);

import { Toaster } from "react-hot-toast";

root.render(
  <AuthProvider>
    <Toaster position="top-right" />
    <App />
  </AuthProvider>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

