"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Star } from 'lucide-react';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    email: '',
    phoneNumber: '',
    password: '',
    studentType: '',
  });
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async () => {
    setIsLoading(true);
    setError(null);
    setShowToast(false);

    const [firstName, ...lastNameParts] = formData.fullName.split(' ');
    const lastName = lastNameParts.join(' ') || ' ';
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

    const mutation = `
      mutation {
        registerStudent(input: {
          firstName: "${firstName}"
          lastName: "${lastName}"
          userName: "${formData.userName}"
          email: "${formData.email}"
          phoneNumber: "${formData.phoneNumber}"
          password: "${formData.password}"
          studentType: "${formData.studentType}"
        }) {
          id
          firstName
          lastName
          userName
          email
          phoneNumber
          studentType
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: mutation }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message || 'Signup failed');
      }

      setShowToast(true);
      console.log('Signup successful:', result.data.registerStudent);
      
      setFormData({
        fullName: '',
        userName: '',
        email: '',
        phoneNumber: '',
        password: '',
        studentType: '',
      });
      
      setTimeout(() => {
        setShowToast(false);
        router.push('/login');
      }, 3000);
      
    } catch (err) {
      setError((err as any).message);
      setIsLoading(false); 
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#E9EDF0] flex items-center justify-center p-4">
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in duration-300">
          Signup successful!
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in duration-300">
          {error}
        </div>
      )}

      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden flex">
        <div className="hidden md:block md:w-1/2 md:h-[38rem] relative">
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
        
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <div className="mb-4 overflow-y-auto scrollbar-hide">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Practice With Ease</h1>
            <div className="space-y-3">
              <h2 className="text-2xl gap-1 font-semibold flex text-gray-800 mb-4 md:flex md:items-start md:justify-start sm:static">
                Powered by <Image src="/logo.png" alt="Logo" width={110} height={50}  className='mt-1'/>
              </h2>
              
              <form className="space-y-3 max-h-[400px] " onSubmit={(e) => e.preventDefault()}>
                <div>
                  <p className='mb-2 ml-1 flex'>Full Name <p className='text-red-800 h-4 w-4 mt- ml-1'>*</p> </p>   
                  <input 
                    type="text" 
                    name="fullName"
                    placeholder='Full Name' 
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className='w-full h-10 px-4 rounded-xl border border-gray-400'
                  />
                </div>

                <div className='mt-2'>
                  <p className='mb-2 ml-1 flex'>Username <p className='text-red-800 h-4 w-4 mt- ml-1'>*</p></p>
                  <input 
                    type="text" 
                    name="userName"
                    placeholder='User Name' 
                    value={formData.userName}
                    onChange={handleInputChange}
                    required
                    className='w-full h-10 px-4 rounded-xl border border-gray-400'
                  />
                </div>

                <div className='mt-2'>
                  <p className='mb-2 ml-1 flex'>Password <p className='text-red-800 h-4 w-4 mt- ml-1'>*</p></p>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder='*****' 
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className='w-full h-10 px-4 pr-10 rounded-xl border border-gray-400'
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

                <div className='flex flex-col-reverse mt-2'>
                  <input 
                    type="email" 
                    name="email"
                    placeholder='user@example.com' 
                    value={formData.email}
                    onChange={handleInputChange}
                    className='w-full h-10 px-4 rounded-xl border border-gray-400'
                  />
                  <p className='mb-2 ml-1'>Email ( optional )</p>
                </div>

                <div className='flex flex-col-reverse mt-2'>
                  <input 
                    type="tel" 
                    name="phoneNumber"
                    placeholder='' 
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className='w-full h-10 px-4 rounded-xl border border-gray-400'
                  />
                  <p className='mb-2 ml-1'>Phone Number ( optional )</p>
                </div>

                <div className='flex flex-col-reverse mt-2'>
                  <select 
                    name="studentType"
                    value={formData.studentType}
                    onChange={handleInputChange}
                    className='w-full h-10 px-4 rounded-xl border border-gray-400'
                  >
                    <option value="" disabled>Select Course</option>
                    <option value="SCIENCE">Science</option>
                    <option value="ART">Art</option>
                  </select>
                  <p className='mb-2 ml-1'>Course</p>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleSignup}
                    disabled={isLoading}
                    className={`bg-black flex items-center justify-center gap-2 w-full text-white rounded-lg py-2 px-4 text-sm font-medium ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                    }`}
                  >
                    {isLoading ? (
                      'Loading...'
                    ) : (
                      <>
                        Signup
                      </>
                    )}
                  </button>
                </div>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </form>
            </div>
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
  );
};

export default LoginPage;