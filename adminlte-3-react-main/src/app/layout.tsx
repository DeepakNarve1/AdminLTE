import { Providers } from "./providers";
import AuthLoader from "./auth-loader";
import { ToastContainer } from "react-toastify";
import "@app/index.css";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "AdminLTE 3 React",
  description: "AdminLTE 3 React Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </head>
      <body className="sidebar-mini layout-fixed layout-navbar-fixed layout-footer-fixed">
        <Providers>
          <AuthLoader>
            {children}
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
          </AuthLoader>
        </Providers>
      </body>
    </html>
  );
}
