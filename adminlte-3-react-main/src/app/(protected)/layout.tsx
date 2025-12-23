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

  // Fetch user with populated role and permissions
  useEffect(() => {
    const fetchUserWithPermissions = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
          router.push("/login");
          return;
        }

        const parsedUser = JSON.parse(storedUser);

        // Fetch fresh user data with populated role and permissions
        const response = await axios.get(
          `http://localhost:5000/api/auth/users/${parsedUser._id || parsedUser.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const userData = response.data.data;

        // Update Redux store with fresh data
        dispatch(setCurrentUser(userData));
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    if (!user) {
      fetchUserWithPermissions();
    } else {
      setLoading(false);
    }
  }, [user, dispatch, router]);

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
