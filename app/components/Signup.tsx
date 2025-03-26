"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); 

  const handleonClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  const nextStep = () => setStep(2);
  const prevStep = () => setStep(1);

  return (
    <div className="min-h-screen bg-[#E9EDF0] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden flex">
        {/* Left side - Image */}
        <div className="hidden md:block md:w-1/2 md:h-[35rem] relative">
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
              <h1 className="text-3xl font-bold text-gray-800 mb-1">Exam Practice With Ease</h1>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:flex md:items-center md:justify-center">
                Sign up to your account.
              </h2>

              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                {step === 1 && (
                  <>
                    <div>
                      <p className='mb-2 ml-1'>Full Name</p>   
                      <input type="text" placeholder='Full Name' className='w-full h-10 px-4 rounded-xl border border-gray-400'/>
                    </div>

                    <div className='flex flex-col-reverse mt-2'>
                      <input type="text" placeholder='User Name' className='w-full h-10 px-4 rounded-xl border border-gray-400'/>
                      <p className='mb-2 ml-1'>Username</p>
                    </div>

                    <div className='flex flex-col-reverse mt-2'>
                      <input type="email" placeholder='user@example.com' className='w-full h-10 px-4 rounded-xl border border-gray-400'/>
                      <p className='mb-2 ml-1'>Email</p>
                    </div>

                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={nextStep}
                        className=" text-gray-600 rounded-lg text-sm font-medium hover:underline"
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div className='flex flex-col-reverse mt-2'>
                      <input type="tel" placeholder='+234***18' className='w-full h-10 px-4 rounded-xl border border-gray-400'/>
                      <p className='mb-2 ml-1'>Phone Number</p>
                    </div>

                    <div className='flex flex-col-reverse mt-2'>
                      <input type="password" placeholder='*****' className='w-full h-10 px-4 rounded-xl border border-gray-400'/>
                      <p className='mb-2 ml-1'>Password</p>
                    </div>

                    <div className='flex flex-col-reverse mt-2'>
                      <select className='w-full h-10 px-4 rounded-xl border border-gray-400'>
                        <option value="" disabled selected>Select Course</option>
                        <option value="science">Science</option>
                        <option value="art">Art</option>
                      </select>
                      <p className='mb-2 ml-1'>Course</p>
                    </div>

                    <button
                        type="button"
                        onClick={prevStep}
                        className=" text-gray-800 rounded-lg  text-sm font-medium hover:underline"
                      >
                        Previous
                      </button>

                    <div className="mt-2">
                     
                      <Link href="/exam">
                        <button
                          type="button"
                          onClick={handleonClick}
                          disabled={isLoading}
                          className={`bg-black flex items-center justify-center gap-2 w-full text-white rounded-lg py-2 px-4 text-sm font-medium ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                          }`}
                        >
                          {isLoading ? (
                            'Loading...'
                          ) : (
                            <>
                              Signup with <Image src="/logo.png" alt="Login Icon" width={120} height={120} />
                            </>
                          )}
                        </button>
                      </Link>
                    </div>
                  </>
                )}
              </form>
            </div>

            <div className='flex items-center justify-center mb-2 font-normal'>
              Already have an account?{' '}
              <span className='ml-1 text-gray-500 hover:underline'>
                <a href="/login">Login</a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;