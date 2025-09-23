import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./global.scss";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import AOS from 'aos';
import 'aos/dist/aos.css';

// Khởi tạo AOS
AOS.init({
  duration: 1000,
  once: true,
  offset: 100
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
