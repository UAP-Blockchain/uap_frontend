import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Spin } from "antd";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  adminRoutes,
  studentPortalRoutes,
  teacherRoutes,
  publicPortalRoutes,
} from "./config/appRoutes";

// Lazy load auth pages
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));

// Loading fallback component
const PageLoader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
    }}
  >
    <Spin size="large" tip="Đang tải..." />
  </div>
);

// Helper function to wrap route element with Suspense
const wrapWithSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{element}</Suspense>
);

// Helper function to process route config and add Suspense
const processRoute = (route: any): any => {
  const processedRoute = {
    ...route,
    element: route.element ? wrapWithSuspense(route.element) : undefined,
  };

  if (route.children) {
    processedRoute.children = route.children.map(processRoute);
  }

  return processedRoute;
};

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: wrapWithSuspense(<Login />),
    },
    {
      path: "/login",
      element: wrapWithSuspense(<Login />),
    },
    {
      path: "/forgot-password",
      element: wrapWithSuspense(<ForgotPassword />),
    },
    {
      path: "/change-password",
      element: wrapWithSuspense(<ChangePassword />),
    },
    // Process all route configs with Suspense
    processRoute(studentPortalRoutes),
    processRoute(adminRoutes),
    processRoute(teacherRoutes),
    processRoute(publicPortalRoutes),
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
