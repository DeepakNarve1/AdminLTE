"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@app/store/store";
import { setCurrentUser } from "@store/reducers/auth";
import Main from "@modules/main/Main";
import axios from "axios";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAppSelector((state) => state.auth.currentUser);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const fetchUserWithPermissions = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      // Fetch fresh user data with populated role and permissions
      const response = await axios.get(`http://localhost:5000/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data.data;

      // Update Redux store with fresh data
      dispatch(setCurrentUser(userData));
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Don't log out immediately on error (network blip), but maybe handle it
    }
  };

  useEffect(() => {
    fetchUserWithPermissions();

    // Poll every 10 seconds to keep permissions fresh
    const interval = setInterval(fetchUserWithPermissions, 10000);
    return () => clearInterval(interval);
  }, [dispatch, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00563B] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <Main>{children}</Main>;
}
