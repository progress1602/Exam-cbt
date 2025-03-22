"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';


const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleonClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#E9EDF0] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden flex">
        {/* Left side - Image */}
        <div className="hidden md:block md:w-1/2 md:h-96 relative">
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
            <div className="mb-8 ">
              <h1 className="text-3xl font-bold text-gray-800 mb-1">Exam Practice With Ease</h1>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:flex md:items-center md:justify-center">Sign in to your account.</h2>

             <input type="text" placeholder='Email' className='w-full h-10 px-4 rounded-xl border border-gray-400'/>
             <input type="text" placeholder='Password' className='w-full h-10 px-4 mt-6 rounded-xl border border-gray-400'/>
            </div>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <Link href="/exam">
                <button
                  type="button" 
                  // onClick={handleonClick}
                  // disabled={isLoading} 
                  className={`w-full bg-black flex items-center justify-center gap-2 text-white rounded-lg py-2 px-4 text-sm font-medium ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                  }`}
                >
                  {isLoading ? (
                    'Loading...' 
                  ) : (
                    <>
                      Login With <Image src="/logo.png" alt="Login Icon" width={120} height={120} />
                    </>
                  )}
                </button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;