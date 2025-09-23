import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import AdminLayout from "./components/layoutAdmin";
import ManagerProduct from "./pages/admin/products";
import StudentPortal from "./pages/hoang/StudentPortal";
import PublicPortal from "./pages/hoang/PublicPortal";
import Dashboard from "./pages/hoang/StudentPortal/Dashboard";
import MyCredentials from "./pages/hoang/StudentPortal/MyCredentials";
import CredentialDetail from "./pages/hoang/StudentPortal/CredentialDetail";
import SharePortal from "./pages/hoang/StudentPortal/SharePortal";
import Profile from "./pages/hoang/StudentPortal/Profile";
import PublicHome from "./pages/hoang/PublicPortal/Home";
import VerificationPortal from "./pages/hoang/PublicPortal/VerificationPortal";
import VerificationResults from "./pages/hoang/PublicPortal/VerificationResults";
import VerificationHistory from "./pages/hoang/PublicPortal/VerificationHistory";
import AboutHelp from "./pages/hoang/PublicPortal/AboutHelp";
import WeeklyTimetable from "./pages/hoang/StudentPortal/WeeklyTimetable";
import ActivityDetail from "./pages/hoang/StudentPortal/ActivityDetail";
import InstructorDetail from "./pages/hoang/StudentPortal/InstructorDetail";
import ClassStudentList from "./pages/hoang/StudentPortal/ClassStudentList";
import AttendanceReport from "./pages/hoang/StudentPortal/AttendanceReport";
import GradeReport from "./pages/hoang/StudentPortal/GradeReport";


function App() {
  const router = createBrowserRouter([
    // {
    //   path: "/",
    //   element: <Layout />,
    //   children: [
    //     {
    //       path: "/",
    //       element: <Home />,
    //     },
    //   ],
    // },
    {
      path: "/student-portal",
      element: <StudentPortal />,
      children: [
        {
          path: "",
          element: <Dashboard />,
        },
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "credentials",
          element: <MyCredentials />,
        },
        {
          path: "credentials/:id",
          element: <CredentialDetail />,
        },
        {
          path: "share",
          element: <SharePortal />,
        },
        {
          path: "profile",
          element: <Profile />,
        },
        {
          path: "timetable",
          element: <WeeklyTimetable />,
        },
        {
          path: "activity/:id",
          element: <ActivityDetail />,
        },
        {
          path: "instructor/:code",
          element: <InstructorDetail />,
        },
        {
          path: "class-list/:courseCode",
          element: <ClassStudentList />,
        },
        {
          path: "attendance-report",
          element: <AttendanceReport />,
        },
        {
          path: "grade-report",
          element: <GradeReport />,
        },
      ],
    },
    {
      path: "/public-portal",
      element: <PublicPortal />,
      children: [
        {
          path: "",
          element: <PublicHome />,
        },
        {
          path: "home",
          element: <PublicHome />,
        },
        {
          path: "verify",
          element: <VerificationPortal />,
        },
        {
          path: "results",
          element: <VerificationResults />,
        },
        {
          path: "history",
          element: <VerificationHistory />,
        },
        {
          path: "help",
          element: <AboutHelp />,
        },
      ],
    },
    {
      path: "/admin",
      element: (
        <AdminLayout>
          <Outlet />
        </AdminLayout>
      ),
      children: [
        {
          path: "/admin/quan-ly-san-pham",
          element: <ManagerProduct />,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
