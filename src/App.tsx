import { Suspense, lazy, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
  Outlet,
} from "react-router-dom";
import { Spin, Button } from "antd";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  adminRoutes,
  studentPortalRoutes,
  teacherRoutes,
  type RouteConfig,
} from "./config/appRoutes";
import { setNavigate } from "./utils/navigation";
import PublicPortalLayout from "./layout/PublicPortalLayout";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load auth pages
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const PublicHome = lazy(() => import("./pages/PublicPortal/Home"));
const VerificationPortal = lazy(
  () => import("./pages/PublicPortal/VerificationPortal")
);
const VerificationResults = lazy(
  () => import("./pages/PublicPortal/VerificationResults")
);
const AboutHelp = lazy(() => import("./pages/PublicPortal/AboutHelp"));

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

// Error element for routes
const ErrorElement = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      flexDirection: "column",
      gap: 16,
    }}
  >
    <h2>404 - Trang không tìm thấy</h2>
    <p>Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
    <Button
      type="primary"
      onClick={() => window.location.href = "/admin/subjects"}
    >
      Quay lại trang quản lý môn học
    </Button>
  </div>
);

// Helper function to convert RouteConfig to React Router format
const convertRouteConfig = (route: RouteConfig): any => {
  const converted: any = {
    path: route.path,
    element: route.element ? wrapWithSuspense(route.element) : undefined,
    errorElement: route.errorElement || <ErrorElement />,
  };

  if (route.children) {
    converted.children = route.children.map(convertRouteConfig);
  }

  return converted;
};

// Helper function to process route config and add Suspense (kept for backward compatibility)
const processRoute = (route: RouteConfig): any => {
  return convertRouteConfig(route);
};

// Root component to initialize navigation utility
const Root = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return <Outlet />;
};

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      children: [
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
        // Public Portal Routes with Layout
        {
          path: "/",
          element: <PublicPortalLayout />,
          children: [
            {
              index: true,
              element: wrapWithSuspense(<PublicHome />),
            },
            {
              path: "home",
              element: wrapWithSuspense(<PublicHome />),
            },
            {
              path: "verify",
              element: wrapWithSuspense(<VerificationPortal />),
            },
            {
              path: "results",
              element: wrapWithSuspense(<VerificationResults />),
            },
            {
              path: "certificates/verify/:credentialId",
              element: wrapWithSuspense(<VerificationResults />),
            },
            {
              path: "help",
              element: wrapWithSuspense(<AboutHelp />),
            },
          ],
        },
        // Process all route configs with Suspense
        processRoute(studentPortalRoutes),
        processRoute(adminRoutes),
        processRoute(teacherRoutes),
      ],
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
