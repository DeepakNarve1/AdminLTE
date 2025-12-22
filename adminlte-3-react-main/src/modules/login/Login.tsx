"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { setCurrentUser } from "@store/reducers/auth";
import { setWindowClass } from "@app/utils/helpers";
import Checkbox from "@app/components/Checkbox";
import * as Yup from "yup";

import { useAppDispatch } from "@app/store/store";
import { API_BASE_URL } from "@app/utils/api";

const Login = () => {
  const [isAuthLoading, setAuthLoading] = useState(false);
  const [isGoogleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [isFacebookAuthLoading, setFacebookAuthLoading] = useState(false);
  const dispatch = useAppDispatch();

  const router = useRouter();
  const [t] = useTranslation();

  const login = async (email: string, password: string) => {
    try {
      setAuthLoading(true);

      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { data } = res.data;

      const { VITE_NODE_ENV } = process.env;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      dispatch(setCurrentUser(data.user));

      toast.success("Login is succeed!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setAuthLoading(false);
    }
  };

  const { handleChange, values, handleSubmit, touched, errors } = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string()
        .min(5, "Must be 5 characters or more")
        .max(30, "Must be 30 characters or less")
        .required("Required"),
    }),
    onSubmit: (values) => {
      login(values.email, values.password);
    },
  });
  useEffect(() => {
    setWindowClass("hold-transition login-page");
  }, []);

  return (
    <div className="login-box w-[360px] mx-auto mt-[10vh]">
      <div className="bg-white rounded shadow-sm border border-gray-200 border-t-[3px] border-t-blue-600">
        <div className="text-center p-4 border-b border-gray-100">
          <Link href="/" className="text-3xl font-light text-gray-800">
            <b>Admin</b>
            <span>LTE</span>
          </Link>
        </div>
        <div className="p-5">
          <p className="text-center mb-4 text-gray-600">
            {t("login.label.signIn")}
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <div className="relative flex w-full flex-wrap items-stretch">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  onChange={handleChange}
                  value={values.email}
                  className={`relative m-0 block w-[1%] min-w-0 flex-auto rounded-l border border-r-0 border-solid px-3 py-1.5 text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-3 focus:border-blue-300 focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none ${
                    touched.email && errors.email
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <span className="flex items-center whitespace-nowrap rounded-r border border-l-0 border-solid border-neutral-300 px-3 py-1 text-center text-base font-normal leading-[1.6] text-neutral-700">
                  <i className="fas fa-envelope text-gray-500" />
                </span>
                {touched.email && errors.email && (
                  <div className="w-full text-xs text-red-500 mt-1">
                    {errors.email}
                  </div>
                )}
              </div>
            </div>
            <div className="mb-3">
              <div className="relative flex w-full flex-wrap items-stretch">
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  onChange={handleChange}
                  value={values.password}
                  className={`relative m-0 block w-[1%] min-w-0 flex-auto rounded-l border border-r-0 border-solid px-3 py-1.5 text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-3 focus:border-blue-300 focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none ${
                    touched.password && errors.password
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <span className="flex items-center whitespace-nowrap rounded-r border border-l-0 border-solid border-neutral-300 px-3 py-1 text-center text-base font-normal leading-[1.6] text-neutral-700">
                  <i className="fas fa-lock text-gray-500" />
                </span>
                {touched.password && errors.password && (
                  <div className="w-full text-xs text-red-500 mt-1">
                    {errors.password}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap -mx-2 mb-2">
              <div className="w-8/12 px-2">
                <div className="flex items-center h-full">
                  <Checkbox
                    checked={false}
                    label={t("login.label.rememberMe") as string}
                  />
                </div>
              </div>
              <div className="w-4/12 px-2">
                <button
                  disabled={
                    isFacebookAuthLoading ||
                    isGoogleAuthLoading ||
                    isAuthLoading
                  }
                  onClick={handleSubmit as any}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full px-4 py-2 rounded shadow-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAuthLoading && (
                    <i className="fas fa-spinner fa-spin text-sm" />
                  )}
                  {t("login.button.signIn.label")}
                </button>
              </div>
            </div>
          </form>
          <div className="text-center mt-2 mb-3 space-y-2">
            <button
              className="bg-blue-700 hover:bg-blue-800 text-white w-full px-4 py-2 rounded shadow-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={true || isAuthLoading || isGoogleAuthLoading}
            >
              {isFacebookAuthLoading ? (
                <i className="fas fa-spinner fa-spin text-sm" />
              ) : (
                <i className="fab fa-facebook mr-2" />
              )}
              {t("login.button.signIn.social", {
                what: "Facebook",
              })}
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white w-full px-4 py-2 rounded shadow-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={
                isAuthLoading || isFacebookAuthLoading || isGoogleAuthLoading
              }
            >
              {isGoogleAuthLoading ? (
                <i className="fas fa-spinner fa-spin text-sm" />
              ) : (
                <i className="fab fa-google mr-2" />
              )}
              {t("login.button.signIn.social", { what: "Google" })}
            </button>
          </div>
          <p className="mb-1">
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-500"
            >
              {t("login.label.forgotPass")}
            </Link>
          </p>
          <p className="mb-0">
            <Link
              href="/register"
              className="text-center text-blue-600 hover:text-blue-500"
            >
              {t("login.label.registerNew")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
