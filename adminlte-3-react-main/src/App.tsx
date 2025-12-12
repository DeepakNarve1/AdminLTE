import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Main from "@modules/main/Main";
import Login from "@modules/login/Login";
import Register from "@modules/register/Register";
import ForgetPassword from "@modules/forgot-password/ForgotPassword";
import RecoverPassword from "@modules/recover-password/RecoverPassword";
import { useWindowSize } from "@app/hooks/useWindowSize";
import { calculateWindowSize } from "@app/utils/helpers";
import { setWindowSize } from "@app/store/reducers/ui";
import ReactGA from "react-ga4";

import Dashboard from "@pages/Dashboard";
import SubMenu from "@pages/SubMenu";
import Profile from "@pages/profile/Profile";

import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";
import { setCurrentUser } from "./store/reducers/auth";

import { useAppDispatch, useAppSelector } from "./store/store";
import { Loading } from "./components/Loading";
import Users from "./pages/users";
import CreateUser from "./pages/users/CreateUser";
import EditUser from "./pages/users/EditUser";
import ViewUser from "./pages/users/ViewUser";
import RoleList from "./pages/roles";
import CreateRoles from "./pages/roles/CreateRoles";
import Review from "./pages/review";
import Report from "./pages/report";
import Setting from "./pages/setting";
import PermissionsPage from "./pages/permissions";
import PlaceholderPage from "./pages/shared/PlaceholderPage";

const { VITE_NODE_ENV } = import.meta.env;

const App = () => {
  const windowSize = useWindowSize();
  const screenSize = useAppSelector((state) => state.ui.screenSize);
  const dispatch = useAppDispatch();
  const location = useLocation();

  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        dispatch(setCurrentUser(JSON.parse(storedUser)));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        dispatch(setCurrentUser(null));
      }
    } else {
      dispatch(setCurrentUser(null));
    }

    setIsAppLoading(false);
  }, [dispatch]);

  useEffect(() => {
    const size = calculateWindowSize(windowSize.width);
    if (screenSize !== size) {
      dispatch(setWindowSize(size));
    }
  }, [windowSize]);

  useEffect(() => {
    if (location && location.pathname && VITE_NODE_ENV === "production") {
      ReactGA.send({
        hitType: "pageview",
        page: location.pathname,
      });
    }
  }, [location]);

  if (isAppLoading) {
    return <Loading />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<PublicRoute />}>
          <Route path="/" element={<Login />} />
        </Route>
        <Route path="/register" element={<PublicRoute />}>
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/forgot-password" element={<PublicRoute />}>
          <Route path="/forgot-password" element={<ForgetPassword />} />
        </Route>
        <Route path="/recover-password" element={<PublicRoute />}>
          <Route path="/recover-password" element={<RecoverPassword />} />
        </Route>
        <Route path="/" element={<PrivateRoute />}>
          <Route path="/" element={<Main />}>
            <Route path="/users" element={<Users />} />
            <Route path="/users/create" element={<CreateUser />} />
            <Route path="/users/:id/edit" element={<EditUser />} />
            <Route path="/users/:id/view" element={<ViewUser />} />
            <Route path="/roles" element={<RoleList />} />
            <Route path="/review" element={<Review />} />
            <Route path="/report" element={<Report />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/permissions" element={<PermissionsPage />} />
            <Route path="/roles/create" element={<CreateRoles />} />
            <Route path="/sub-menu-1" element={<SubMenu />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/user-count"
              element={<PlaceholderPage title="User Count" />}
            />
            <Route
              path="/member-list"
              element={<PlaceholderPage title="Member List" />}
            />
            <Route
              path="/mp-public-problem"
              element={<PlaceholderPage title="MP Public Problem" />}
            />
            <Route
              path="/assembly-issue"
              element={<PlaceholderPage title="Assembly Issue" />}
            />
            <Route
              path="/vidhansabha-samiti"
              element={<PlaceholderPage title="Vidhansabha Samiti" />}
            />
            <Route
              path="/project-summary"
              element={<PlaceholderPage title="Project Summary" />}
            />
            <Route
              path="/visitors"
              element={<PlaceholderPage title="Visitors" />}
            />
            <Route
              path="/events"
              element={<PlaceholderPage title="Events" />}
            />
            <Route path="/voter" element={<PlaceholderPage title="Voter" />} />
            <Route
              path="/samiti"
              element={<PlaceholderPage title="Samiti" />}
            />
            <Route
              path="/district"
              element={<PlaceholderPage title="District" />}
            />
            <Route
              path="/vidhan-sabha"
              element={<PlaceholderPage title="Vidhan Sabha" />}
            />
            <Route path="/block" element={<PlaceholderPage title="Block" />} />
            <Route path="/booth" element={<PlaceholderPage title="Booth" />} />
            <Route
              path="/panchayat"
              element={<PlaceholderPage title="Panchayat" />}
            />
            <Route
              path="/village"
              element={<PlaceholderPage title="Village" />}
            />
            <Route path="/party" element={<PlaceholderPage title="Party" />} />
            <Route
              path="/department"
              element={<PlaceholderPage title="Department" />}
            />
            <Route
              path="/worktype"
              element={<PlaceholderPage title="Worktype" />}
            />
            <Route
              path="/subtype-of-work"
              element={<PlaceholderPage title="Subtype Of Work" />}
            />
            <Route
              path="/phone-directory"
              element={<PlaceholderPage title="Phone Directory" />}
            />
            <Route
              path="/dispatch-register"
              element={<PlaceholderPage title="Dispatch Register" />}
            />
            <Route
              path="/call-management"
              element={<PlaceholderPage title="Call Management" />}
            />
            <Route
              path="/in-docs"
              element={<PlaceholderPage title="In Docs" />}
            />
            <Route
              path="/inward-register"
              element={<PlaceholderPage title="Inward Register" />}
            />
            <Route
              path="/activity-management"
              element={<PlaceholderPage title="Activity Management" />}
            />
          </Route>
        </Route>
      </Routes>
      <ToastContainer
        autoClose={3000}
        draggable={false}
        position="top-right"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnHover
      />
    </>
  );
};

export default App;
