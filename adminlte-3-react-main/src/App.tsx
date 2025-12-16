import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import axios from "axios";
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
import PlaceholderPage from "./pages/shared/PlaceholderPage";
import EditRole from "./pages/roles/EditRoles";

const { VITE_NODE_ENV } = import.meta.env;

const App = () => {
  const windowSize = useWindowSize();
  const screenSize = useAppSelector((state) => state.ui.screenSize);
  const dispatch = useAppDispatch();
  const location = useLocation();

  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        try {
          const parsedUser = JSON.parse(storedUser);

          // If role is missing (old stored user shape), refresh from backend
          if (!parsedUser.role && parsedUser._id) {
            try {
              const res = await axios.get(
                `http://localhost:5000/api/auth/users/${parsedUser._id}`,
                {
                  headers: {
                    Authorization: `Bearer ${storedToken}`,
                  },
                }
              );

              const freshUser = res.data?.data || parsedUser;

              // #region agent log
              fetch(
                "http://127.0.0.1:7242/ingest/105f93a2-9fac-4818-ba68-806d6a51ed9a",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sessionId: "debug-session",
                    runId: "post-fix",
                    hypothesisId: "H5",
                    location: "App.tsx:initAuth",
                    message: "Refreshed user from backend",
                    data: {
                      hasUser: !!freshUser,
                      hasRole: !!freshUser?.role,
                      roleType: freshUser ? typeof freshUser.role : null,
                    },
                    timestamp: Date.now(),
                  }),
                }
              ).catch(() => {});
              // #endregion

              localStorage.setItem("user", JSON.stringify(freshUser));
              dispatch(setCurrentUser(freshUser));
            } catch (err) {
              console.error("Failed to refresh user from backend", err);
              dispatch(setCurrentUser(parsedUser));
            }
          } else {
            dispatch(setCurrentUser(parsedUser));
          }
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
    };

    initAuth();
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
            <Route path="/roles/:id/edit" element={<EditRole />} />
            <Route path="/review" element={<Review />} />
            <Route path="/report" element={<Report />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/roles/create" element={<CreateRoles />} />
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

            <Route path="/party" element={<PlaceholderPage title="Party" />} />
            <Route
              path="/department"
              element={<PlaceholderPage title="Department" />}
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
