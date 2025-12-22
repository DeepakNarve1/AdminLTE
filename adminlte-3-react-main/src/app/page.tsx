"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@app/store/store";

export default function Home() {
  const user = useAppSelector((state) => state.auth.currentUser);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login"); // or whatever default public route
    }
  }, [user, router]);

  return null;
}
