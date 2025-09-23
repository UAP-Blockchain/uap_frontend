import { Outlet } from "react-router-dom";
import Footer from "../footer";
import Header from "../header";

function Layout() {
  return (
    <div style={{ overflow: "hidden" }}>
      <Header />
      <div style={{ marginTop: "80px" }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
