"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Moon, Sun, Eye, Calculator, Edit, RotateCcw } from 'lucide-react';
import domtoimage from 'dom-to-image';
import FloatingCalculator from './FloatingCalculator';

type Scores = { [key: string]: number };
interface Question { id: number; question: string; options: string[] }

const EnhancedScoreGridModal = ({ isOpen, onClose, scores }: { isOpen: boolean, onClose: () => void, scores: Scores }) => {
  const calculateTotal = () => Object.values(scores).reduce((sum, score) => sum + score, 0);
  const calculatePercentage = () => Math.round((calculateTotal() / (Object.keys(scores).length * 100)) * 100);
  const getGradeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-blue-100 text-blue-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const handleDownload = () => {
    const scoreSection = document.getElementById('score-section');
    if (!scoreSection) return console.error('Score section not found');
    const buttons = document.getElementById('button-section');
    if (buttons) buttons.style.display = 'none';

    const padding = 20, widthScale = 1.2;
    const newWidth = scoreSection.offsetWidth * widthScale + padding * 2;
    const newHeight = scoreSection.scrollHeight + padding * 2 + 20;

    domtoimage.toPng(scoreSection, {
      quality: 1.0, bgcolor: '#ffffff', width: newWidth, height: newHeight,
      style: { padding: `${padding}px`, width: `${scoreSection.offsetWidth * widthScale}px`, height: `${scoreSection.scrollHeight}px`, margin: 'auto', 'box-sizing': 'border-box', overflow: 'visible' }
    }).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = 'jamb-exam-score.png';
      link.href = dataUrl;
      link.click();
      if (buttons) buttons.style.display = 'flex';
    }).catch((error) => {
      console.error('Error generating image:', error);
      if (buttons) buttons.style.display = 'flex';
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-10 backdrop-blur-sm">
      <div className="max-w-md w-full mx-4 bg-white/80 rounded-xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="flex-1 overflow-y-auto p-6">
          <div id="score-section">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Progress Henry, <br /> <span className='font-medium text-2xl'>2025 Jamb Score</span></h2>
              <p className="font-bold"><span className="text-red-500 font-bold">Total Score : </span><br /><span className='text-2xl'>{calculateTotal()}/400</span></p>
            </div>
            <div className="mb-6 rounded-lg overflow-hidden shadow-inner">
              <div className="grid grid-cols-12 bg-gray-800 text-white font-medium">
                <div className="col-span-6 p-3 flex items-center">Subject</div>
                <div className="col-span-6 p-3 flex items-center justify-center">Score</div>
              </div>
              {Object.entries(scores).map(([subject, score], index) => (
                <div key={subject} className={`grid grid-cols-12 border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="col-span-6 p-3 flex items-center font-medium text-gray-700">{subject}</div>
                  <div className="col-span-6 p-3 flex justify-center">
                    <div className={`px-3 py-2 border rounded-lg text-center ${getGradeColor(score)} font-semibold`}>
                      {score}<span className="ml-1 text-gray-400">/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="grid grid-cols-2 p-4">
                <div><div className="text-sm text-gray-500 mb-1">Time Spent</div><div className="text-2xl font-bold">1hr 2min 15sec</div></div>
              </div>
              <div className="px-4 pb-4"><div className="w-full bg-gray-200 rounded-full h-2.5"><div className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-green-500" style={{ width: `${calculatePercentage()}%` }}></div></div></div>
            </div>
          </div>
        </div>
        <button onClick={handleDownload} className="underline decoration-2 decoration-black h-10 font-medium mb-4">Download Result</button>
        <div id="button-section" className="p-6 pt-0 flex justify-between gap-4 shrink-0">
          <button className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 flex items-center justify-center font-medium shadow-md"><Edit size={20} className="mr-2" />Rewrite</button>
          <button onClick={onClose} className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center font-medium shadow-md"><RotateCcw size={20} className="mr-2" />Start Over</button>
        </div>
      </div>
    </div>
  );
};

const Quiz = () => {
  const searchParams = useSearchParams();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answeredQuestions, setAnsweredQuestions] = useState<{ [key: number]: string }>({});
  const [hideInstructions, setHideInstructions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeSubject, setActiveSubject] = useState<string>('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [examId, setExamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [questionsBySubject, setQuestionsBySubject] = useState<{ [key: string]: Question[] }>({});
  const [scores, setScores] = useState<Scores>({});

  const selectedSubjects = JSON.parse(searchParams.get('subjects') || '[]');
  const selectedYear = searchParams.get('year') || '2023';

  const startJambExam = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://exam-pl2x.onrender.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation StartJambExam($subjects: [String!]!, $examYear: String!) {
              startJambExam(subjects: $subjects, examYear: $examYear) {
                id
                subjects
                currentSubject
                remainingTime
              }
            }
          `,
          variables: { subjects: selectedSubjects, examYear: selectedYear },
        }),
      });

      const result = await response.json();
      console.log('StartJambExam Response:', result);

      if (result.errors) throw new Error(result.errors[0].message);

      const examData = result.data.startJambExam;
      setTimeLeft(examData.remainingTime);
      setExamId(examData.id);
      const fetchedSubjects = examData.subjects.map((s: string) => s.trim().toUpperCase());
      setSubjects(fetchedSubjects);
      setActiveSubject(examData.currentSubject.trim().toUpperCase());
      await fetchQuestions(fetchedSubjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start exam');
      console.error('StartJambExam Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (subjectsToFetch: string[]) => {
    try {
      const groupedQuestions: { [key: string]: Question[] } = {};
      for (const subject of subjectsToFetch) {
        const response = await fetch('https://exam-pl2x.onrender.com/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query FetchJambSubjectQuestions($sessionId: Int!) {
                fetchJambSubjectQuestions(sessionId: $sessionId) {
                  id
                  question
                  options
                }
              }
            `,
            variables: { sessionId: 3 },
          }),
        });

        const result = await response.json();
        console.log(`FetchJambSubjectQuestions Response for ${subject}:`, result);

        if (result.errors) throw new Error(result.errors[0].message);
        if (!result.data || !result.data.fetchJambSubjectQuestions) throw new Error(`No questions returned for ${subject}`);

        groupedQuestions[subject] = result.data.fetchJambSubjectQuestions;
      }
      setQuestionsBySubject(groupedQuestions);
      console.log('Grouped Questions:', groupedQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
      console.error('FetchQuestions Error:', err);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    const savedMode = localStorage.getItem('darkMode');
    setIsDarkMode(savedMode ? JSON.parse(savedMode) : false);
    if (selectedSubjects.length > 0) startJambExam();
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode, isMounted]);

  useEffect(() => {
    if (timeLeft === null || loading || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const currentQs = questionsBySubject[activeSubject];
      const thisQuestion = currentQs?.[currentQuestion - 1];
      if (!thisQuestion) return;
      const key = event.key;
      if ((key === 'n' || key === 'N') && currentQuestion < (currentQs?.length || 0)) setCurrentQuestion(currentQuestion + 1);
      else if ((key === 'p' || key === 'P') && currentQuestion > 1) setCurrentQuestion(currentQuestion - 1);
      else if (key === 'a' || key === 'A') handleAnswerSelect(thisQuestion.options[0]);
      else if (key === 'b' || key === 'B') handleAnswerSelect(thisQuestion.options[1]);
      else if (key === 'c' || key === 'C') handleAnswerSelect(thisQuestion.options[2]);
      else if (key === 'd' || key === 'D') handleAnswerSelect(thisQuestion.options[3]);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestion, activeSubject, questionsBySubject]);

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return 'Loading...';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (option: string) => {
    setAnsweredQuestions({ ...answeredQuestions, [currentQuestion]: option });
  };

  const goToNext = () => {
    if (currentQuestion < (questionsBySubject[activeSubject]?.length || 0)) setCurrentQuestion(currentQuestion + 1);
  };

  const goToPrev = () => {
    if (currentQuestion > 1) setCurrentQuestion(currentQuestion - 1);
  };

  const getButtonColor = (questionNum: number) => {
    if (answeredQuestions[questionNum]) return 'bg-green-500';
    if (questionNum === currentQuestion) return 'bg-blue-600';
    return 'bg-red-500';
  };

  const toggleMode = () => setIsDarkMode((prev) => !prev);
  const handleSubjectChange = (subject: string) => { setActiveSubject(subject); setCurrentQuestion(1); setAnsweredQuestions({}); };
  const handleSubmitClick = () => setIsConfirmModalOpen(true);
  const handleProceed = () => {
    setIsConfirmModalOpen(false);
    setIsScoreModalOpen(true);
    setScores(subjects.reduce((acc, subj, idx) => ({ ...acc, [subj]: [85, 78, 88, 92][idx] || 80 }), {}));
  };
  const handleCancel = () => setIsConfirmModalOpen(false);

  const currentQuestions = questionsBySubject[activeSubject] || [];
  const currentQ = currentQuestions[currentQuestion - 1];

  if (!isMounted) return null;
  if (loading) return <div>Loading exam...</div>;
  if (error) return <div>Error: {error}</div>;
  if (subjects.length === 0) return <div>No subjects selected</div>;
  if (!currentQuestions.length) return <div>No questions available for {activeSubject}</div>;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-[#191919] dark' : 'bg-gray-100'}`}>
      <div className="w-full rounded-lg p-6">
        <div className={`fixed top-3 left-0 right-0 z-10 ${isDarkMode ? 'bg-[#191919]/80' : 'bg-gray-100/80'} backdrop-blur-md`}>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 px-4 py-2">
            <div className="flex items-center w-full sm:w-auto">
              <div className="max-w-[70vw] md:max-w-full overflow-x-auto scrollbar-hide hover:overflow-x-scroll md:overflow-x-visible">
                <div className="flex space-x-4">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => handleSubjectChange(subject)}
                      className={`text-lg font-semibold whitespace-nowrap ${activeSubject === subject ? (isDarkMode ? 'text-white' : 'text-gray-700') : (isDarkMode ? 'text-gray-500' : 'text-gray-400')}`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ml-8 flex items-center h-8 w-13 px-4 rounded-lg bg-gray-200 dark:bg-gray-700 sm:ml-4">
                <button onClick={toggleMode}>{isDarkMode ? <Sun className="text-yellow-400 w-5 h-5" /> : <Moon className="text-gray-700 w-5 h-5" />}</button>
              </div>
            </div>
            <div className="flex ml-56 mt-4 md:items-center space-x-6">
              <div className="text-red-500 font-semibold mt-2 text-lg">{formatTime(timeLeft)}</div>
              <button onClick={handleSubmitClick} className="bg-[#11479b] mr-6 text-white px-4 py-2 rounded-lg">SUBMIT</button>
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
                <button onClick={handleCancel} className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700 text-white'}`}>Cancel</button>
                <button onClick={handleProceed} className="bg-[#11479b] text-white px-4 py-2 rounded-lg hover:bg-[#0d3a7d]">Proceed</button>
              </div>
            </div>
          </div>
        )}

        <EnhancedScoreGridModal isOpen={isScoreModalOpen} onClose={() => setIsScoreModalOpen(false)} scores={scores} />

        <div className="mx-auto max-w-6xl mt-32 md:max-w-4xl md:mt-10 lg:mx-auto lg:max-w-4xl lg:mt-10">
          <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-[#333333]' : 'bg-blue-100'}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className={`font-bold underline ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>instructions:</p>
                {!hideInstructions && <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>No instruction</p>}
              </div>
              <button className="text-blue-600 flex items-center dark:text-blue-400" onClick={() => setHideInstructions(!hideInstructions)}>
                <Eye className="mr-1 w-5 h-5" />{hideInstructions ? 'Show instruction' : 'Hide instruction'}
              </button>
            </div>
          </div>

          {currentQ && (
            <>
              <div className="mb-6 flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="bg-[#11479b] text-white rounded-full w-12 h-12 flex items-center justify-center mr-2 font-bold">{currentQuestion}</span>
                    <p className={isDarkMode ? 'text-white' : 'text-gray-800'}>{currentQ.question}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-2 md:gap-4 md:mb-6 lg:mb-6 lg:gap-4">
                {currentQ.options.map((option, index) => {
                  const optionLabels = ['a', 'b', 'c', 'd', 'e'];
                  const optionLabel = optionLabels[index] || '';
                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswerSelect(option)}
                      className={`border rounded-lg p-4 py-3 h-12 text-left flex items-center ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-300'
                      } ${
                        answeredQuestions[currentQuestion] === option
                          ? 'bg-blue-200 dark:bg-blue-700'
                          : isDarkMode
                          ? 'bg-gray-800'
                          : 'bg-white'
                      } ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
                    >
                      <span className="mr-2 font-semibold">{optionLabel}.</span> {option}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <FloatingCalculator />
        <div className="flex justify-between items-center mt-28">
          {/* Question Numbers Scroll Container */}
          <div className="max-w-[70vw] md:max-w-full overflow-x-auto scrollbar-hide hover:overflow-x-scroll md:overflow-x-visible">
            <div className="flex space-x-2">
              {currentQuestions.map((_, index) => (
                <button
                  key={index + 1}
                  className={`min-w-[2rem] h-8 ${getButtonColor(index + 1)} text-white rounded-full flex items-center justify-center text-sm font-medium`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="flex space-x-2 ml-6">
            <button onClick={goToPrev} disabled={currentQuestion === 1} className={`px-4 py-2 rounded-lg text-white ${currentQuestion === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#11479b]'}`}>Prev</button>
            <button onClick={goToNext} disabled={currentQuestion === currentQuestions.length} className={`px-4 py-2 rounded-lg text-white ${currentQuestion === currentQuestions.length ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#11479b]'}`}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;