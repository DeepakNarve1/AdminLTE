"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@app/store/store";
import { setCurrentUser } from "@store/reducers/auth";
import Main from "@modules/main/Main";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAppSelector((state) => state.auth.currentUser);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Check localStorage on mount to restore session
  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          dispatch(setCurrentUser(parsedUser));
        } catch (error) {
          console.error("Failed to parse stored user:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [user, dispatch, router]);

  if (!user) {
    return null; // or a loading spinner
  }

  return <Main>{children}</Main>;
}
