"use client";
import { useEffect } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { setWindowClass } from "@app/utils/helpers";
import { useFormik } from "formik";
import * as Yup from "yup";

const RecoverPassword = () => {
  const [t] = useTranslation();

  const { handleChange, values, handleSubmit, touched, errors } = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(5, "Must be 5 characters or more")
        .max(30, "Must be 30 characters or less")
        .required("Required"),
      confirmPassword: Yup.string()
        .min(5, "Must be 5 characters or more")
        .max(30, "Must be 30 characters or less")
        .required("Required"),
    }),
    onSubmit: (values) => {
      toast.warn("Not yet functional");
      console.log("values", values);
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
            {t("recover.oneStepAway")}
          </p>
          <form onSubmit={handleSubmit}>
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
            <div className="mb-3">
              <div className="relative flex w-full flex-wrap items-stretch">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  onChange={handleChange}
                  value={values.confirmPassword}
                  className={`relative m-0 block w-[1%] min-w-0 flex-auto rounded-l border border-r-0 border-solid px-3 py-1.5 text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-3 focus:border-blue-300 focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none ${
                    touched.confirmPassword && errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <span className="flex items-center whitespace-nowrap rounded-r border border-l-0 border-solid border-neutral-300 px-3 py-1 text-center text-base font-normal leading-[1.6] text-neutral-700">
                  <i className="fas fa-lock text-gray-500" />
                </span>
                {touched.confirmPassword && errors.confirmPassword && (
                  <div className="w-full text-xs text-red-500 mt-1">
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            </div>
            <div className="w-full">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow-sm border-0 transition-colors"
              >
                {t("recover.changePassword")}
              </button>
            </div>
          </form>
          <p className="mt-4 mb-0 text-center">
            <Link href="/login" className="text-blue-600 hover:text-blue-500">
              {t("login.button.signIn.label")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecoverPassword;
