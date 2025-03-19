"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image'; // Added for image handling in Next.js

const ExamGrid = () => {
  const [isJambModalOpen, setIsJambModalOpen] = useState(false);
  const [isWaecModalOpen, setIsWaecModalOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["English Language"]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const jambSubjects = [
    "English Language", 
    "Mathematics", 
    "Physics", 
    "Chemistry", 
    "Biology", 
    "Literature", 
    "Government", 
    "Economics", 
    "Geography", 
    "Accounting", 
    "Commerce"
  ];

  const waecSubjects = [
    "English Language", 
    "Mathematics", 
    "Physics", 
    "Chemistry", 
    "Biology", 
    "Literature", 
    "Government", 
    "Economics", 
    "Geography", 
    "Accounting", 
    "Commerce",
    "Agricultural Science",
    "History",
    "Civic Education",
    "Visual Art"
  ];

  const examYears = Array.from({ length: 20 }, (_, i) => (2024 - i).toString());

  const handleSubjectChange = (subject: string, isJamb: boolean) => {
    if (subject === "English Language") return;
    
    setSelectedSubjects(prev => {
      const maxSubjects = isJamb ? 4 : 9;
      const currentCount = prev.length;

      if (prev.includes(subject)) {
        return prev.filter(s => s !== subject);
      } else if (currentCount < maxSubjects) {
        return [...prev, subject];
      } else {
        toast.error(`You cannot choose more than ${maxSubjects} subjects`, {
          position: 'top-right',
          duration: 3000,
        });
        return prev;
      }
    });
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
  };

  const handleStartPractice = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f]">
      <Toaster />
      <div className="flex justify-center items-center text-white text-4xl font-bold py-20">
        HELLO PROGRESS YOU CAN START YOUR PRACTICE NOW
      </div>
      <div className="flex flex-col justify-center items-center md:flex-row space-y-6 md:space-y-0 md:space-x-8 p-4">
        {/* JAMB Grid */}
        <div 
          className="bg-white rounded-xl  shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-4 border-blue-500 w-full md:w-80 h-64 flex flex-col items-center justify-center"
          onClick={() => setIsJambModalOpen(true)}
        >
          <div className="w-16 h-16 rounded-full bg-blue-300 flex items-center justify-center mb-4">
            <Image 
              src="/jamb.png" 
              alt="JAMB Logo" 
              width={60} 
              height={60} 
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-jamb mb-2">JAMB</h2>
          <p className="text-gray-600 text-center">Joint Admissions and Matriculation Board</p>
        </div>

        {/* WAEC Grid */}
        <div 
          className="bg-white rounded-xl  shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border-4 border-green-500 w-full md:w-80 h-64 flex flex-col items-center justify-center"
          onClick={() => setIsWaecModalOpen(true)}
        >
          <div className="w-16 h-16 rounded-full bg-green-300 flex items-center justify-center mb-4">
            <Image 
              src="/waec.png" 
              alt="WAEC Logo" 
              width={70} 
              height={70} 
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-waec mb-2">WAEC</h2>
          <p className="text-gray-600 text-center">West African Examinations Council</p>
        </div>

        {/* JAMB Part */}
        <Dialog open={isJambModalOpen} onOpenChange={setIsJambModalOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-jamb">Select JAMB Subjects and Year</DialogTitle>
            </DialogHeader>
            <ScrollArea className="pr-4 max-h-[calc(90vh-120px)] scrollbar-none">
              <div className="grid gap-6 pb-4">
                <div>
                  <h3 className="text-sm font-medium mb-3">Subjects (Select 3 subjects + English)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {jambSubjects.map((subject) => (
                      <div key={subject} className="flex items-center space-x-2">
                       <Checkbox 
                         id={`jamb-${subject}`} 
                         checked={selectedSubjects.includes(subject)}
                         onCheckedChange={() => handleSubjectChange(subject, true)}
                         disabled={subject === "English Language"}
                         className={`data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 ${subject === "English Language" ? "bg-blue-500 text-white border-blue-500" : ""}`}
                        />
                        <Label htmlFor={`jamb-${subject}`} className="text-sm">
                          {subject}
                          {subject === "English Language" && " (Compulsory)"}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-3">Select Year</h3>
                  <ScrollArea className="h-40 rounded-md border scrollbar-none">
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-2">
                        {examYears.map((year) => (
                          <Button
                            key={year}
                            variant="outline"
                            className={`text-sm ${selectedYear === year ? 'bg-blue-500 hover:bg-blue-600 text-white' : ''}`}
                            onClick={() => handleYearSelect(year)}
                          >
                            {year}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
                <Link href="/test">
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600 w-full" 
                    disabled={isLoading}
                    onClick={handleStartPractice}
                  >
                    {isLoading ? 'Loading...' : 'Start Practice'}
                  </Button>
                </Link>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* WAEC Part */}
        <Dialog open={isWaecModalOpen} onOpenChange={setIsWaecModalOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-waec">Select WAEC Subjects and Year</DialogTitle>
            </DialogHeader>
            <ScrollArea className="pr-4 max-h-[calc(90vh-120px)] scrollbar-none">
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
                         disabled={subject === "English Language"}
                         className={`data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 ${subject === "English Language" ? "bg-green-500 text-white border-green-500" : ""}`}
                        />
                        <Label htmlFor={`waec-${subject}`} className="text-sm">
                          {subject}
                          {subject === "English Language" && " (Compulsory)"}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-3">Select Year</h3>
                  <ScrollArea className="h-40 rounded-md border scrollbar-none">
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-2">
                        {examYears.map((year) => (
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
                  </ScrollArea>
                </div>
                <Link href="/test">
                  <Button 
                    className="bg-green-500 hover:bg-green-600 w-full"
                    disabled={isLoading}
                    onClick={handleStartPractice}
                  >
                    {isLoading ? 'Loading...' : 'Start Practice'}
                  </Button>
                </Link>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ExamGrid;