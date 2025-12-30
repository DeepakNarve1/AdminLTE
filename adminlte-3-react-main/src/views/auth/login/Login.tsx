"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";

import { Card } from "@app/components/ui/card";
import { Input } from "@app/components/ui/input";
import { Button } from "@app/components/ui/button";
import { Label } from "@app/components/ui/label";

import { Mail, Lock, Loader2 } from "lucide-react";

// Redux imports
import { useAppDispatch } from "@app/store/store";
import { setCurrentUser } from "@store/reducers/auth";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = { email: "", password: "" };
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 5)
      newErrors.password = "Password must be at least 5 characters";

    setErrors(newErrors);
    return Object.values(newErrors).every((e) => e === "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = res.data.data;

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Dispatch to Redux store (IMPORTANT for protected routes)
      dispatch(setCurrentUser(user));

      toast.success("Login successful!");

      // Small delay to ensure Redux state is updated
      setTimeout(() => {
        router.push("/");
      }, 100);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <div className="text-center py-8 px-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800">
            <span className="text-[#00563B]">Admin</span>LTE
          </h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 ${errors.password ? "border-red-500 focus:ring-red-500" : ""}`}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00563B] hover:bg-[#368F8B] text-white py-6 text-lg font-medium shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleOAuthProvider
                clientId={process.env.GOOGLE_CLIENT_ID || ""}
              >
                <GoogleLogin
                  onSuccess={async (credentialResponse: any) => {
                    try {
                      setLoading(true);
                      const { credential } = credentialResponse;
                      const res = await axios.post(
                        "http://localhost:5000/api/auth/google-login",
                        {
                          token: credential,
                        }
                      );

                      const { token, user } = res.data.data;
                      localStorage.setItem("token", token);
                      localStorage.setItem("user", JSON.stringify(user));
                      dispatch(setCurrentUser(user));
                      toast.success("Login successful!");
                      router.push("/");
                    } catch (error: any) {
                      toast.error(
                        error.response?.data?.message || "Google Login failed"
                      );
                    } finally {
                      setLoading(false);
                    }
                  }}
                  onError={() => {
                    toast.error("Google Login Failed");
                  }}
                />
              </GoogleOAuthProvider>
            </div>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              href="/forgot-password"
              className="text-sm text-[#00563B] hover:underline"
            >
              Forgot your password?
            </Link>
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-[#00563B] font-medium hover:underline"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
