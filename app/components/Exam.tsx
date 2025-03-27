"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';


// Utility function to capitalize first letter
const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const ExamGrid = () => {
  const [isJambModalOpen, setIsJambModalOpen] = useState(false);
  const [isWaecModalOpen, setIsWaecModalOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["English Language"]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [jambSubjects, setJambSubjects] = useState<{ id: string; name: string }[]>([]);
  const [jambYears, setJambYears] = useState<string[]>([]);
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null); // State for user data

  const waecSubjects = [
    "english language", "mathematics", "physics", "chemistry", "biology",
    "literature", "government", "economics", "geography", "accounting",
    "commerce", "agricultural science", "history", "civic education", "visual art"
  ];

  const waecYears = Array.from({ length: 20 }, (_, i) => (2024 - i).toString());
  const API_URL = "https://exam-1-iev5.onrender.com/graphql";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(localStorage.getItem('token') && { 
              'Authorization': `Bearer ${localStorage.getItem('token')}` 
            }),
          },
          body: JSON.stringify({
            query: `
              query {
                me {
                  id
                  firstName
                  lastName
                  createdAt
                  updatedAt
                }
              }
            `,
          }),
        });

        const result = await response.json();
        if (result.data && result.data.me) {
          setUser({
            firstName: result.data.me.firstName,
            lastName: result.data.me.lastName,
          });
        } else {
          toast.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("An error occurred while fetching user data");
      }
    };

    const fetchJambSubjects = async () => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          ...(localStorage.getItem('token') && { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }),
          body: JSON.stringify({
            query: `query { subjects(examType: "jamb") { id name } }`,
          }),
        });

        const result = await response.json();
        if (result.data && result.data.subjects) {
          setJambSubjects(result.data.subjects);
        } else {
          toast.error("Failed to fetch JAMB subjects");
        }
      } catch (error) {
        console.error("Error fetching JAMB subjects:", error);
        toast.error("An error occurred while fetching JAMB subjects");
      }
    };

    const fetchJambYears = async () => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          ...(localStorage.getItem('token') && { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }),
          body: JSON.stringify({
            query: `query { years(examType: "jamb", examSubject: "english language") }`,
          }),
        });

        const result = await response.json();
        if (result.data && result.data.years) {
          setJambYears(result.data.years);
        } else {
          toast.error("Failed to fetch JAMB years");
        }
      } catch (error) {
        console.error("Error fetching JAMB years:", error);
        toast.error("An error occurred while fetching JAMB years");
      }
    };

    fetchUserData(); // Fetch user data on mount
    fetchJambSubjects();
    fetchJambYears();
  }, []);

  const handleSubjectChange = (subject: string, isJamb: boolean) => {
    if (subject === "english language") return;

    setSelectedSubjects(prev => {
      const maxSubjects = isJamb ? 4 : 9;
      const currentCount = prev.length;

      if (prev.includes(subject)) {
        return prev.filter(s => s !== subject);
      } else if (currentCount < maxSubjects) {
        return [...prev, subject];
      } else {
        toast.error(`You cannot choose more than ${maxSubjects} subjects`);
        return prev;
      }
    });
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
  };

  const handleStartPractice = () => {
    if (!selectedYear) {
      toast.error("Please select a year");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Starting practice for ${selectedSubjects.map(capitalizeFirstLetter).join(", ")} - ${selectedYear}`);
    }, 2000);
  };

  return (
    
    <div className="min-h-screen bg-[#1f1f1f]">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="flex justify-center items-center text-white text-3xl mx-auto max-w-80 md:mx-auto md:max-w-6xl md:text-4xl lg:text-4xl font-bold py-20">
        {user ? (
          `HELLO ${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()} YOU CAN START YOUR PRACTICE NOW`
        ) : (
          "HELLO PROGRESS YOU CAN START YOUR PRACTICE NOW" // Fallback while loading
        )}
      </div>
      <div className="flex flex-col justify-center items-center md:flex-row space-y-6 md:space-y-0 md:space-x-8 p-4">
        <div
          className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-4 border-blue-500 w-full md:w-80 h-64 flex flex-col items-center justify-center"
          onClick={() => setIsJambModalOpen(true)}
        >
          <div className="w-16 h-16 rounded-full bg-blue-300 flex items-center justify-center mb-4">
            <Image src="/jamb.png" alt="JAMB Logo" width={60} height={60} className="object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-jamb mb-2">JAMB</h2>
          <p className="text-gray-600 text-center">Joint Admissions and Matriculation Board</p>
        </div>

        <div
          className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-4 border-green-500 w-full md:w-80 h-64 flex flex-col items-center justify-center"
          onClick={() => setIsWaecModalOpen(true)}
        >
          <div className="w-16 h-16 rounded-full bg-green-300 flex items-center justify-center mb-4">
            <Image src="/waec.png" alt="WAEC Logo" width={70} height={70} className="object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-waec mb-2">WAEC</h2>
          <p className="text-gray-600 text-center">West African Examinations Council</p>
        </div>

        <Dialog open={isJambModalOpen} onOpenChange={setIsJambModalOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-jamb">Select JAMB Subjects and Year</DialogTitle>
            </DialogHeader>
            <ScrollArea className="pr-4 max-h-[calc(90vh-180px)] scrollbar-none">
              <div className="grid gap-6 pb-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Subjects (Select 3 subjects + English)</h3>
                  {jambSubjects.length === 0 ? (
                    <p className="text-sm text-gray-500">Loading subjects...</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {jambSubjects.map((subject) => (
                        <div key={subject.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`jamb-${subject.id}`}
                            checked={selectedSubjects.includes(subject.name)}
                            onCheckedChange={() => handleSubjectChange(subject.name, true)}
                            disabled={subject.name.toLowerCase() === "english language"}
                            className={`data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 ${subject.name.toLowerCase() === "english language" ? "bg-blue-500 text-white border-blue-500" : ""}`}
                          />
                          <Label htmlFor={`jamb-${subject.id}`} className="text-sm">
                            {capitalizeFirstLetter(subject.name)}
                            {subject.name.toLowerCase() === "english language" && " (Compulsory)"}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Select Year</h3>
                  <div className="p-4 border rounded-md">
                    <div className="grid grid-cols-3 gap-2">
                      {jambYears.length === 0 ? (
                        <p className="text-sm text-gray-500">Loading years...</p>
                      ) : (
                        jambYears.map((year) => (
                          <Button
                            key={year}
                            variant="outline"
                            className={`text-sm ${selectedYear === year ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}`}
                            onClick={() => handleYearSelect(year)}
                          >
                            {year}
                          </Button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <div className="fixed bottom-4 left-0 right-0 px-6">
              <Link
                href={{
                  pathname: '/test',
                  query: {
                    subjects: JSON.stringify(selectedSubjects),
                    year: selectedYear || '',
                  },
                }}
              >
                <Button
                  className="bg-blue-500 hover:bg-blue-600 w-full"
                  disabled={isLoading || jambSubjects.length === 0 || jambYears.length === 0 || !selectedYear}
                  onClick={handleStartPractice}
                >
                  {isLoading ? 'Loading...' : 'Start Practice'}
                </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isWaecModalOpen} onOpenChange={setIsWaecModalOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-waec">Select WAEC Subjects and Year</DialogTitle>
            </DialogHeader>
            <ScrollArea className="pr-4 max-h-[calc(90vh-180px)] scrollbar-none">
              <div className="grid gap-6 pb-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Subjects (Select up to 8 subjects + English)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {waecSubjects.map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                        <Checkbox
                          id={`waec-${subject}`}
                          checked={selectedSubjects.includes(subject)}
                          onCheckedChange={() => handleSubjectChange(subject, false)}
                          disabled={subject === "english language"}
                          className={`data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 ${subject === "english language" ? "bg-green-500 text-white border-green-500" : ""}`}
                        />
                        <Label htmlFor={`waec-${subject}`} className="text-sm">
                          {capitalizeFirstLetter(subject)}
                          {subject === "english language" && " (Compulsory)"}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Select Year</h3>
                  <div className="p-4 border rounded-md">
                    <div className="grid grid-cols-3 gap-2">
                      {waecYears.map((year) => (
                        <Button
                          key={year}
                          variant="outline"
                          className={`text-sm ${selectedYear === year ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                          onClick={() => handleYearSelect(year)}
                        >
                          {year}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <div className="fixed bottom-4 left-0 right-0 px-6">
              <Link
                href={{
                  pathname: '/test',
                  query: {
                    subjects: JSON.stringify(selectedSubjects),
                    year: selectedYear || '',
                  },
                }}
              >
                <Button
                  className="bg-green-500 hover:bg-green-600 w-full"
                  disabled={isLoading || !selectedYear}
                  onClick={handleStartPractice}
                >
                  {isLoading ? 'Loading...' : 'Start Practice'}
                </Button>
              </Link>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    
  );
};

export default ExamGrid;