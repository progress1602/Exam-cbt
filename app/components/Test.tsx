"use client";

import React, { useState, useEffect, JSX } from 'react';
import { Moon, Sun, Eye, Calculator, Dna, Atom, FlaskConical, Edit, RotateCcw } from 'lucide-react';

type Scores = {
  [key: string]: number;
};

const EnhancedScoreGridModal = ({ isOpen, onClose, scores }: { isOpen: boolean, onClose: () => void, scores: Scores }) => {
  const calculateTotal = () => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0);
  };

  const calculatePercentage = () => {
    const total = calculateTotal();
    const maxPossible = Object.keys(scores).length * 100;
    return Math.round((total / maxPossible) * 100);
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-blue-100 text-blue-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const handleRewrite = () => {
   
  };

  const handleStartOver = () => {
   
    onClose();
  };

  const subjectIcons: { [key: string]: JSX.Element } = {
    Mathematics: <FlaskConical size={20} />,
    Biology: <FlaskConical size={20} />,
    Physics: <FlaskConical size={20} />,
    Chemistry: <FlaskConical size={20} />
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-10 backdrop-blur-sm">
      <div className="max-w-md w-full mx-4 p-6 bg-white/80 rounded-xl shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Jamb Exam Score</h2>
          <p className='font-bold'> <span className='text-red-500 font-bold'>Time spent  :</span> {40} min</p>
        </div>
        
        
        <div className="mb-6 rounded-lg overflow-hidden shadow-inner">
          <div className="grid grid-cols-12 bg-gray-800 text-white font-medium">
            <div className="col-span-6 p-3 flex items-center">Subject</div>
            <div className="col-span-6 p-3 flex items-center justify-center">Score</div>
          </div>
          
          {Object.entries(scores).map(([subject, score], index) => (
            <div 
              key={subject} 
              className={`grid grid-cols-12 border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
            >
              <div className="col-span-6 p-3 flex items-center font-medium text-gray-700">
                <span className="mr-2 text-gray-500">{subjectIcons[subject]}</span>
                {subject}
              </div>
              <div className="col-span-6 p-3 flex justify-center">
                <div className={`px-3 py-2 border rounded-lg text-center ${getGradeColor(score)} font-semibold`}>
                  {score}
                  <span className="ml-1 text-gray-400">/100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-2 p-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Score</div>
              <div className="text-2xl font-bold">{calculateTotal()}<span className="text-sm text-gray-400 ml-1">/{Object.keys(scores).length * 100}</span></div>
            </div>
            <div className="flex flex-col items-end justify-center">
              <div className="text-sm text-gray-500 mb-1">Average</div>
              <div className="text-xl font-semibold">
                {calculateTotal() / Object.keys(scores).length}%
              </div>
            </div>
          </div>
          
          <div className="px-4 pb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="h-2.5 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-500 to-green-500"
                style={{ width: `${calculatePercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between gap-4">
          <button 
            onClick={handleRewrite} 
            className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center font-medium shadow-md"
          >
            <Edit size={20} className="mr-2" />
            Rewrite
          </button>
          <button 
            onClick={handleStartOver} 
            className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center font-medium shadow-md"
          >
            <RotateCcw size={20} className="mr-2" />
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
};

const Quiz = () => {
  const [timeLeft, setTimeLeft] = useState(1800);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answeredQuestions, setAnsweredQuestions] = useState<{ [key: number]: string }>({});
  const [hideInstructions, setHideInstructions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [activeSubject, setActiveSubject] = useState<'ENGLISH' | 'BIOLOGY' | 'CHEMISTRY' | 'PHYSICS'>('ENGLISH');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const totalQuestions = 5;
  const subjects: Array<'ENGLISH' | 'BIOLOGY' | 'CHEMISTRY' | 'PHYSICS'> = ['ENGLISH', 'BIOLOGY', 'CHEMISTRY', 'PHYSICS'];

  const scores = {
    Mathematics: 85,
    Biology: 92,
    Physics: 78,
    Chemistry: 88
  };

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  type QuestionsBySubject = {
    [key in 'ENGLISH' | 'BIOLOGY' | 'CHEMISTRY' | 'PHYSICS']: {
      id: number;
      question: string;
      sentence: string;
      options: string[];
    }[];
  };

  const questionsBySubject: QuestionsBySubject = {
    ENGLISH: [
      { id: 1, question: "Identify the adjective in the sentence", sentence: "She was caught playing in the rain", options: ["A. Rain", "B. Playing", "C. She", "D. Was"] },
      { id: 2, question: "Find the adverb in this sentence", sentence: "He runs very quickly every morning", options: ["A. Runs", "B. Very", "C. Morning", "D. He"] },
      { id: 3, question: "Which word is a noun?", sentence: "The bright sun shines daily", options: ["A. Bright", "B. Shines", "C. Sun", "D. Daily"] },
      { id: 4, question: "Pick the verb in the sentence", sentence: "They danced gracefully at the party", options: ["A. They", "B. Danced", "C. Gracefully", "D. Party"] },
      { id: 5, question: "Identify the preposition", sentence: "The cat slept under the table", options: ["A. Slept", "B. Cat", "C. Under", "D. Table"] },
    ],
    BIOLOGY: [
      { id: 1, question: "What is the powerhouse of the cell?", sentence: "The cell has various organelles", options: ["A. Nucleus", "B. Mitochondria", "C. Ribosome", "D. Golgi"] },
      { id: 2, question: "Which gas do plants primarily use for photosynthesis?", sentence: "Plants produce oxygen as a byproduct", options: ["A. Oxygen", "B. Nitrogen", "C. Carbon Dioxide", "D. Hydrogen"] },
      { id: 3, question: "What is the basic unit of heredity?", sentence: "Traits are passed from parents to offspring", options: ["A. Cell", "B. Gene", "C. Protein", "D. Enzyme"] },
      { id: 4, question: "Which organ pumps blood throughout the body?", sentence: "Circulation is vital for survival", options: ["A. Liver", "B. Brain", "C. Heart", "D. Lungs"] },
      { id: 5, question: "What molecule stores energy in cells?", sentence: "Energy is required for cellular processes", options: ["A. DNA", "B. ATP", "C. RNA", "D. Glucose"] },
    ],
    CHEMISTRY: [
      { id: 1, question: "What is the atomic number of Carbon?", sentence: "Elements have unique atomic numbers", options: ["A. 6", "B. 8", "C. 12", "D. 14"] },
      { id: 2, question: "Which element is the most abundant in Earth's atmosphere?", sentence: "The atmosphere contains various gases", options: ["A. Oxygen", "B. Nitrogen", "C. Carbon Dioxide", "D. Argon"] },
      { id: 3, question: "What is the chemical symbol for gold?", sentence: "Metals have unique symbols", options: ["A. Ag", "B. Au", "C. Fe", "D. Cu"] },
      { id: 4, question: "What type of bond involves sharing electrons?", sentence: "Atoms combine to form molecules", options: ["A. Ionic", "B. Covalent", "C. Metallic", "D. Hydrogen"] },
      { id: 5, question: "Which gas is colorless, odorless, and highly reactive?", sentence: "Gases have distinct properties", options: ["A. Nitrogen", "B. Oxygen", "C. Helium", "D. Neon"] },
    ],
    PHYSICS: [
      { id: 1, question: "What is the SI unit of force?", sentence: "Force causes objects to accelerate", options: ["A. Joule", "B. Watt", "C. Newton", "D. Pascal"] },
      { id: 2, question: "Which law states that an object at rest stays at rest?", sentence: "Motion is governed by specific laws", options: ["A. Newton's First Law", "B. Newton's Second Law", "C. Newton's Third Law", "D. Law of Gravitation"] },
      { id: 3, question: "What is the speed of light in a vacuum?", sentence: "Light travels at a constant speed", options: ["A. 300 m/s", "B. 3,000 km/s", "C. 300,000 km/s", "D. 30,000 km/s"] },
      { id: 4, question: "Which type of energy is stored in an object due to its position?", sentence: "Energy comes in different forms", options: ["A. Kinetic", "B. Potential", "C. Thermal", "D. Chemical"] },
      { id: 5, question: "What phenomenon bends light as it passes through a medium?", sentence: "Light behaves differently in various substances", options: ["A. Reflection", "B. Refraction", "C. Diffraction", "D. Dispersion"] },
    ],
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {  
      const currentQs = questionsBySubject[activeSubject];
      const thisQuestion = currentQs[currentQuestion - 1];
      const key = event.key; 
      if (key === 'n' || key === 'N') {
        if (currentQuestion < totalQuestions) setCurrentQuestion(currentQuestion + 1);
      }
      else if (key === 'p' || key === 'P') {
        if (currentQuestion > 1) setCurrentQuestion(currentQuestion - 1);
      }
      else if (key === 'a' || key === 'A') handleAnswerSelect(thisQuestion.options[0]);
      else if (key === 'b' || key === 'B') handleAnswerSelect(thisQuestion.options[1]);
      else if (key === 'c' || key === 'C') handleAnswerSelect(thisQuestion.options[2]);
      else if (key === 'd' || key === 'D') handleAnswerSelect(thisQuestion.options[3]);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestion, activeSubject]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (option: string) => {
    setAnsweredQuestions({
      ...answeredQuestions,
      [currentQuestion]: option,
    });
  };

  const goToNext = () => {
    if (currentQuestion < totalQuestions) setCurrentQuestion(currentQuestion + 1);
  };

  const goToPrev = () => {
    if (currentQuestion > 1) setCurrentQuestion(currentQuestion - 1);
  };

  const getButtonColor = (questionNum: number) => {
    if (answeredQuestions[questionNum]) return 'bg-green-500';
    if (questionNum === currentQuestion) return 'bg-blue-600';
    return 'bg-red-500';
  };

  const toggleMode = () => {
    setIsDarkMode((prevMode: boolean) => !prevMode);
  };

  const handleSubjectChange = (subject: 'ENGLISH' | 'BIOLOGY' | 'CHEMISTRY' | 'PHYSICS') => {
    setActiveSubject(subject);
    setCurrentQuestion(1);
    setAnsweredQuestions({});
  };

  const handleSubmitClick = () => {
    setIsConfirmModalOpen(true);
  };

  const handleProceed = () => {
    setIsConfirmModalOpen(false);
    setIsScoreModalOpen(true);
  };

  const handleCancel = () => {
    setIsConfirmModalOpen(false);
  };

  const currentQuestions = questionsBySubject[activeSubject];
  const currentQ = currentQuestions[currentQuestion - 1];

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-[#191919] dark' : 'bg-gray-100'}`}>
      <div className="w-full rounded-lg p-6">
        <div className={`fixed top-3 left-0 right-0 z-10 ${isDarkMode ? 'bg-[#191919]/80' : 'bg-gray-100/80'} backdrop-blur-md`}>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 px-4 py-2">
            <div className="flex items-center w-full sm:w-auto">
              <div className="flex overflow-x-auto scrollbar-hide space-x-4 w-full sm:w-auto">
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => handleSubjectChange(subject)}
                    className={`text-lg font-semibold whitespace-nowrap ${
                      activeSubject === subject
                        ? isDarkMode
                          ? 'text-white'
                          : 'text-gray-700'
                        : isDarkMode
                          ? 'text-gray-500'
                          : 'text-gray-400'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
              <div className="ml-2 flex items-center h-8 w-13 px-4 rounded-lg bg-gray-200 dark:bg-gray-700 sm:ml-4">
                <button onClick={toggleMode}>
                  {isDarkMode ? (
                    <Sun className="text-yellow-400 w-5 h-5" />
                  ) : (
                    <Moon className="text-gray-700 w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <div className="text-red-500 font-semibold text-lg">{formatTime(timeLeft)}</div>
              <button 
                onClick={handleSubmitClick}
                className="bg-[#11479b] text-white px-4 py-2 rounded-lg"
              >
                SUBMIT
              </button>
            </div>
          </div>
          <div className={`w-full border-t mb-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
        </div>

        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs bg-opacity-30">
            <div className={`rounded-lg p-6 ${isDarkMode ? 'bg-[#333333] text-white' : 'bg-white text-gray-800'} w-96 shadow-xl`}>
              <h2 className="text-xl font-bold mb-4">Confirm Submission</h2>
              <p className="mb-6">Do you want to submit your exam now?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCancel}
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceed}
                  className="bg-[#11479b] text-white px-4 py-2 rounded-lg hover:bg-[#0d3a7d]"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        )}

        <EnhancedScoreGridModal 
          isOpen={isScoreModalOpen} 
          onClose={() => setIsScoreModalOpen(false)} 
          scores={scores} 
        />

        <div className="mx-auto max-w-6xl mt-32 md:max-w-4xl md:mt-10 lg:mx-auto lg:max-w-4xl lg:mt-10">
          <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-[#333333]' : 'bg-blue-100'}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className={`font-bold underline ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  instructions:
                </p>
                {!hideInstructions && (
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>No instruction</p>
                )}
              </div>
              <button
                className="text-blue-600 flex items-center dark:text-blue-400"
                onClick={() => setHideInstructions(!hideInstructions)}
              >
                <Eye className="mr-1 w-5 h-5" />
                {hideInstructions ? 'Show instruction' : 'Hide instruction'}
              </button>
            </div>
          </div>

          <div className="mb-6 flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="bg-[#11479b] text-white rounded-full w-12 h-12 flex items-center justify-center mr-2 font-bold">
                  {currentQuestion}
                </span>
                <p className={isDarkMode ? 'text-white' : 'text-gray-800'}>{currentQ.question}</p>
              </div>
              <p className={isDarkMode ? 'text-white' : 'text-gray-800'}>{currentQ.sentence}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 mb-32 md:gap-4 md:mb-6 lg:mb-6 lg:gap-4">
            {currentQ.options.map((option) => (
              <button
                key={option}
                onClick={() => handleAnswerSelect(option)}
                className={`border rounded-lg p-4 py-3 h-12 text-left ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-300'
                } ${
                  answeredQuestions[currentQuestion] === option
                    ? 'bg-blue-200 dark:bg-blue-700'
                    : isDarkMode
                    ? 'bg-gray-800'
                    : 'bg-white'
                } ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mt-28">
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                className={`w-8 h-8 ${getButtonColor(num)} text-white rounded-full flex items-center justify-center`}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex space-x-2 ml-6">
            <button
              onClick={goToPrev}
              disabled={currentQuestion === 1}
              className={`px-4 py-2 rounded-lg text-white ${
                currentQuestion === 1
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#11479b]'
              }`}
            >
              Prev
            </button>
            <button
              onClick={goToNext}
              disabled={currentQuestion === totalQuestions}
              className={`px-4 py-2 rounded-lg text-white ${
                currentQuestion === totalQuestions
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#11479b]'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;