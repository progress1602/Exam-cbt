"use client";
import React from 'react';

// import Login from "./components/Login";
// import Testpart from "./components/Testpart";
import Exam from "./components/Exam";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/login");
  }, []);

  return (
    <div>
      {/* <Login />   */}
      {/* <Testpart /> */}
      <Exam />
    </div>
  );
  return null; // Or a loading spinner
}




