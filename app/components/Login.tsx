"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner"; // Use this if you added `npx shadcn@latest add toast`

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

  // ✅ Redirect to / if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
  
    const query = `
      mutation LoginStudent($input: LoginInput!) {
        loginStudent(input: $input) {
          success
          message
          token
          student {
            id
            userName
            email
          }
        }
      }
    `;
  
    const variables = {
      input: {
        identifier: email,
        password: password,
      },
    };
  
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
      });
  
      const result = await response.json();
      const data = result.data?.loginStudent;
  
      if (data?.success) {
        localStorage.setItem("token", data.token);
        router.push("/");
      } else {
        toast(data?.message || "Login failed");
        setIsLoading(false); // Stop loading on failure
      }
    } catch (error) {
      console.error("An error occurred during login:", error);
      toast("An unexpected error occurred. Please try again.");
      setIsLoading(false); //  Stop loading on error
    }
  };
  

  if (checkingAuth) return null;

  return (
    <div className="min-h-screen bg-[#E9EDF0] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden flex">
        {/* Left side - Image */}
        <div className="hidden md:block md:w-1/2 md:h-[28rem] relative">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <Image
            src="/login.jpg"
            alt="Student working on laptop"
            layout="fill"
            objectFit="cover"
            className="h-full w-full object-cover"
            priority
          />
        </div>

        {/* Right side - Login form */}
        <div className="w-full md:w-1/2 p-8">
          <div className="h-full flex flex-col justify-center">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
               Practice With Ease
              </h1>
              <h2 className="text-2xl gap-1 font-semibold flex text-gray-800 mb-4 md:flex md:items-start md:justify-start ">
                Powered by <Image src="/logo.png" alt="Logo" width={110} height={50}  className='mt-1'/>
              </h2>           

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="mb-2 ml-1 block text-gray-700">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    className="w-full h-10 px-4 rounded-xl border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 ml-1 block text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="w-full h-10 px-4 pr-10 rounded-xl border border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-black flex items-center justify-center gap-2 text-white rounded-lg py-2 px-4 text-sm font-medium ${
                    isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
                  }`}
                >
                  {isLoading ? "Loading..." : "Login"}
                </button>
              </form>

              <div className="flex items-center justify-center mt-4 text-sm">
                <p>
                  Don’t have an account?{" "}
                  <a href="/signup" className="text-gray-500 hover:underline">
                    Signup
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
