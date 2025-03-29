"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Exam from "./components/Exam";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsAuthenticated(true);
    } else {
      router.push("/login");
    }

    setLoading(false);
  }, []);

  if (loading) return null; // or show a spinner

  return (
    <>
      {isAuthenticated ? <Exam /> : null}
    </>
  );
}
