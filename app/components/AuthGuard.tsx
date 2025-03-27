"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      router.push("/auth/login"); // Redirect if no token
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // Prevent rendering until authentication status is determined
  if (isAuthenticated === null) return null;

  return <>{children}</>;
};

export default AuthGuard;
