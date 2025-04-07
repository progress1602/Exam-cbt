"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, Sun, Eye, Calculator, Edit, RotateCcw, X } from 'lucide-react';
import domtoimage from 'dom-to-image';
import FloatingCalculator from './FloatingCalculator';
import SkeletonLoader from './SkeletonLoader';
import Loading from './Loading';
import { BlockMath, InlineMath } from "react-katex"; 
import "katex/dist/katex.min.css";
import Link from 'next/link';

type Scores = { [key: string]: number };
interface Question { id: string; question: string; options: string[]; imageUrl?: string }
interface SubjectScore { examSubject: string; score: number }
interface FinishExamResponse {
  sessionId: number;
  subjectScores: SubjectScore[];
  totalScore: number;
  isCompleted: boolean;
  timeSpent: string;
  questionDetails: QuestionDetails[];
}

interface QuestionDetails {
  questionId?: string;
  correctAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
}

const normalizeSubjectName = (subject: string) => subject.trim().toUpperCase();
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const EnhancedScoreGridModal = ({
  isOpen,
  onClose,
  subjectScores,
  totalScore,
  timeSpent,
  selectedSubjects,
  startJambExam,
  resetQuizState,
  setIsCorrections,
}: {
  isOpen: boolean;
  onClose: () => void;
  subjectScores: SubjectScore[];
  totalScore: number;
  timeSpent: string;
  selectedSubjects: string[];
  startJambExam: () => Promise<void>;
  resetQuizState: () => void;
  setIsCorrections: (value: boolean) => void;
}) => {
  const router = useRouter();
  const [userName, setUserName] = useState(''); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        };

        const response = await fetch(API_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query: `
              query GetMe {
                me {
                  firstName
                  lastName
                }
              }
            `,
          }),
        });

        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);
        const { firstName, lastName } = result.data.me;
        setUserName(`${firstName.toUpperCase()} ${lastName.toUpperCase()}`);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserName('USER'); 
      }
    };

    if (isOpen) fetchUserData();
  }, [isOpen]);

  const calculatePercentage = () => Math.round((totalScore / (subjectScores.length * 100)) * 100);
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

  const handleRewrite = async () => {
    resetQuizState();
    await startJambExam();
    onClose();
  };

  const handleStartOver = () => {
    router.push('/');
  };

  const handleCorrection = () => {
    setIsCorrections(true);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-10 backdrop-blur-sm">
      <div className="max-w-md w-full mx-4 bg-white/80 rounded-xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="flex-1 overflow-y-auto p-6">
          <div id="score-section">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{userName}, <br /> <span className='font-medium text-2xl'>2025 Jamb Score</span></h2>
              <p className="font-bold"><span className="text-red-500 font-bold">Total Score : </span><br /><span className='text-2xl'>{totalScore}/400</span></p>
            </div>
            <div className="mb-6 rounded-lg overflow-hidden shadow-inner">
              <div className="grid grid-cols-12 bg-gray-800 text-white font-medium">
                <div className="col-span-6 p-3 flex items-center">Subject</div>
                <div className="col-span-6 p-3 flex items-center justify-center">Score</div>
              </div>
              {subjectScores && subjectScores.map(({ examSubject, score }, index) => (
                <div key={examSubject} className={`grid grid-cols-12 border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="col-span-6 p-3 flex items-center font-medium text-gray-700">{normalizeSubjectName(examSubject)}</div>
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
                <div><div className="text-sm text-gray-500 mb-1">Time Spent</div><div className="text-2xl font-bold">{timeSpent}</div></div>
              </div>
              <div className="px-4 pb-4"><div className="w-full bg-gray-200 rounded-full h-2.5"><div className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-green-500" style={{ width: `${calculatePercentage()}%` }}></div></div></div>
            </div>
          </div>
        </div>
        <button onClick={handleDownload} className="underline decoration-2 decoration-black h-10 font-medium mb-4">Download Result</button>
        <div id="button-section" className="p-6 pt-0 flex justify-between gap-4 shrink-0">
          <button onClick={handleRewrite} className="flex-1 bg bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 flex items-center justify-center font-medium shadow-md"><Edit size={20} className="mr-2" />Rewrite</button>
          <button onClick={handleStartOver} className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 flex items-center justify-center font-medium shadow-md"><RotateCcw size={20} className="mr-2" />Start Over</button>
        </div>
        <button onClick={handleCorrection} className='mx-auto max-w-72 md:max-w-4xl font-medium shadow-md hover:bg-red-600 bg-red-500 rounded-2xl w-96 text-white py-2 px-2 mb-2'>Correction</button>
      </div>
    </div>
  );
};

const Quiz = ({yearParam, subjectsParam,compParam}:{yearParam: string | string[] | undefined, subjectsParam: string | string[] | undefined,compParam:string | string[] | undefined}) => {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<string>("01:30:00");
  const [corrections, setCorrections] = useState<QuestionDetails[]>([]);
  const [isCorrections, setIsCorrections] = useState(false);
  const [currentQuestionsBySubject, setCurrentQuestionsBySubject] = useState<{ [key: string]: number }>({});
  const [selectedAnswers, setSelectedAnswers] = useState<{ [subject: string]: { [questionId: string]: string } }>({}); // New state for per-subject answers
  const [storedAnswers, setStoredAnswers] = useState<{ questionId: string; answer: string }[]>([]);
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
  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [timeSpent, setTimeSpent] = useState<string>('');
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for submission loading

  const selectedSubjects = JSON.parse(subjectsParam as string || '[]').map(normalizeSubjectName);
  const selectedYear = yearParam || '2023';
  const isCompetition = compParam || false; 

  const startJambExam = async (isCompetition?:boolean) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: `
            mutation StartJambExam($subjects: [String!]!, $examYear: String, $isCompetition: Boolean) {
              startJambExam(subjects: $subjects, examYear: $examYear, isCompetition: $isCompetition) {
                id
                subjects
                remainingTime
              }
            }
          `,
          variables: { subjects: selectedSubjects, examYear: selectedYear || String(new Date().getFullYear()), isCompetition: isCompetition || false },
        }),
      });

      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);

      const examData = result.data.startJambExam;
      setTimeLeft("01:30:00");
      setExamId(examData.id);
      const fetchedSubjects = examData.subjects.map(normalizeSubjectName);
      setSubjects(fetchedSubjects);
      
      const defaultActiveSubject = fetchedSubjects[0] || '';
      setActiveSubject(defaultActiveSubject);

      await fetchQuestions(fetchedSubjects, examData.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start exam');
      console.error('StartJambExam Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (subjectsToFetch: string[], sessionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const groupedQuestions: { [key: string]: Question[] } = {};
      for (const subject of subjectsToFetch) {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query: `
              query FetchJambSubjectQuestions($sessionId: Int!) {
                fetchJambSubjectQuestions(sessionId: $sessionId) {
                  subject
                  questions {
                    id
                    question
                    options
                    imageUrl
            
                  }
                }
              }
            `,
            variables: { sessionId: parseInt(sessionId) },
          }),
        });

        const result = await response.json();
        if (result.errors) throw new Error(result.errors[0].message);
        if (!result.data || !result.data.fetchJambSubjectQuestions) throw new Error(`No questions returned for ${subject}`);

        const subjectData = result.data.fetchJambSubjectQuestions.find((item: any) => normalizeSubjectName(item.subject) === subject);
        groupedQuestions[subject] = subjectData?.questions || [];
        if (!subjectData?.questions?.length) {
          console.warn(`No questions found for subject: ${subject}`);
        }
      }
      setQuestionsBySubject(groupedQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
      console.error('FetchQuestions Error:', err);
    }
  };

  const finishJambExam = async (sessionId: string, answers: { questionId: string; answer: string }[],questionIds:string[]) => {
    // console.log(' questionIds:', questionIds);
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: `
            mutation FinishJambExam($sessionId: Int!, $answers: [AnswerInput!]!,$questionIds:[String!]!) {
              finishJambExam(sessionId: $sessionId, answers: $answers, questionIds: $questionIds) {
                sessionId
                subjectScores { examSubject, score }
                totalScore
                isCompleted
                timeSpent
                		questionDetails{
                    questionId
                  correctAnswer
                  studentAnswer
                  isCorrect
                } 
              }
            }
          `,
          variables: {
            sessionId: parseInt(sessionId),
            answers: answers.map(({ questionId, answer }) => ({
              questionId,
              answer: answer.toLowerCase(),
            })),
            questionIds: questionIds.map((id) => id.toLowerCase()),
          },
        }),
      });

      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);

      const examResult: FinishExamResponse = result.data.finishJambExam;
      setSubjectScores(
        examResult.subjectScores.map((score) => ({
          ...score,
          examSubject: normalizeSubjectName(score.examSubject),
        })) || []
      );
      setTotalScore(examResult.totalScore);
      setTimeSpent(examResult.timeSpent);
      setCorrections(examResult.questionDetails);
      return examResult.isCompleted;
    } catch (err) {
      console.error('FinishJambExam Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to finish exam');
      return false;
    }
  };

  const normalizeTime = (time: string): string => {
    if (!time || !time.includes(':')) return "00:00:00";
    const parts = time.split(':').map(part => part.padStart(2, '0'));
    while (parts.length < 3) parts.unshift('00');
    const [hours, minutes, seconds] = parts;
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    setIsMounted(true);
    const savedMode = localStorage.getItem('darkMode');
    setIsDarkMode(savedMode ? JSON.parse(savedMode) : false);
    const savedAnswers = localStorage.getItem('quizAnswers');
    if (savedAnswers) setStoredAnswers(JSON.parse(savedAnswers));
    
    setTimeLeft("01:30:00");

    if (selectedSubjects.length > 0) {
      if(isCompetition === 'true') {
        startJambExam(true);
      }else{
        startJambExam();
      }
    }  
     
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
      localStorage.setItem('quizAnswers', JSON.stringify(storedAnswers));
    }
  }, [isDarkMode, isMounted, storedAnswers]);

  useEffect(() => {
    if (timeLeft === null || loading || timeLeft === "00:00:00") {
      if (timeLeft === "00:00:00" && examId) {
        let questionIds = Object.values(questionsBySubject).flat().map(q => q.id);
        finishJambExam(examId, storedAnswers,questionIds).then((isCompleted) => {
          if (isCompleted) {
            setIsScoreModalOpen(true);
            localStorage.removeItem('quizAnswers');
            setStoredAnswers([]);
          } else {
            setError('Failed to complete the exam');
          }
        });
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (!prev || prev === "00:00:00") {
          clearInterval(timer);
          return "00:00:00";
        }
        const [hours, minutes, seconds] = prev.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
          console.error('Invalid time format:', prev);
          clearInterval(timer);
          return "00:00:00";
        }
        let totalSeconds = hours * 3600 + minutes * 60 + seconds;
        if (totalSeconds <= 0) {
          clearInterval(timer);
          return "00:00:00";
        }
        totalSeconds -= 1;
        const newHours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const newMinutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const newSeconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${newHours}:${newMinutes}:${newSeconds}`;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, examId, storedAnswers]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if(isCorrections) return;
      const currentQs = questionsBySubject[activeSubject] || [];
      const currentQNum = currentQuestionsBySubject[activeSubject] || 1;
      const thisQuestion = currentQs[currentQNum - 1];
      if (!thisQuestion) return;
      const key = event.key;
      if ((key === 'n' || key === 'N') && currentQNum < currentQs.length) {
        setCurrentQuestionsBySubject(prev => ({
          ...prev,
          [activeSubject]: currentQNum + 1
        }));
      } else if ((key === 'p' || key === 'P') && currentQNum > 1) {
        setCurrentQuestionsBySubject(prev => ({
          ...prev,
          [activeSubject]: currentQNum - 1
        }));
      } else if (key === 'a' || key === 'A') handleAnswerSelect(thisQuestion.options[0], thisQuestion.id);
      else if (key === 'b' || key === 'B') handleAnswerSelect(thisQuestion.options[1], thisQuestion.id);
      else if (key === 'c' || key === 'C') handleAnswerSelect(thisQuestion.options[2], thisQuestion.id);
      else if (key === 'd' || key === 'D') handleAnswerSelect(thisQuestion.options[3], thisQuestion.id);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeSubject, questionsBySubject]);

  const formatTime = (time: string | null) => {
    if (time === null) return 'Loading...';
    return time;
  };

  const handleAnswerSelect = (option: string, questionId: string) => {
    if(isCorrections) return;
    const optionIndex = currentQ.options.indexOf(option);
    const answerLabel = ['a', 'b', 'c', 'd', 'e'][optionIndex];
    const currentQNum = currentQuestionsBySubject[activeSubject] || 1;

    // Update selectedAnswers for the current subject
    setSelectedAnswers(prev => ({
      ...prev,
      [activeSubject]: {
        ...(prev[activeSubject] || {}),
        [questionId]: option,
      },
    }));

    // Update storedAnswers for submission
    setStoredAnswers(prev => {
      const newAnswers = prev.filter(ans => ans.questionId !== questionId);
      return [...newAnswers, { questionId, answer: answerLabel }];
    });

    const currentQs = questionsBySubject[activeSubject] || [];
    if (currentQNum < currentQs.length) {
      // Add 0.2-second delay before moving to next question
      setTimeout(() => {
        setCurrentQuestionsBySubject(prev => ({
          ...prev,
          [activeSubject]: currentQNum + 1
        }));
      }, 200); // 200 milliseconds = 0.2 second
    }
  };

  const goToNext = () => {
    const currentQs = questionsBySubject[activeSubject] || [];
    const currentQNum = currentQuestionsBySubject[activeSubject] || 1;
    if (currentQNum < currentQs.length) {
      setCurrentQuestionsBySubject(prev => ({
        ...prev,
        [activeSubject]: currentQNum + 1
      }));
    }
  };

  const goToPrev = () => {
    const currentQNum = currentQuestionsBySubject[activeSubject] || 1;
    if (currentQNum > 1) {
      setCurrentQuestionsBySubject(prev => ({
        ...prev,
        [activeSubject]: currentQNum - 1
      }));
    }
  };

  const getButtonColor = (questionNum: number) => {
    const currentQNum = currentQuestionsBySubject[activeSubject] || 1;
    const currentQs = questionsBySubject[activeSubject] || [];
    const questionId = currentQs[questionNum - 1]?.id;
    if (selectedAnswers[activeSubject]?.[questionId]) return 'bg-green-500';
    if (questionNum === currentQNum) return 'bg-blue-600';
    return 'bg-red-500';
  };

  // LaTeX parsing function
  const parseLatexQuestion = (text: string) => {
    const inlineRegex = /\\\((.*?)\\\)/g; // Matches \( ... \)
    const blockRegex = /\\\[(.*?)\\\]/g;  // Matches \[ ... \]
    const generalRegex = /(\\begin{.*?}.*?\\end{.*?}|\\frac{.*?}{.*?})/g; // Matches complex LaTeX

    if (text.match(blockRegex)) {
      const parts = text.split(blockRegex).filter(Boolean);
      return parts.map((part, index) => {
        if (part.match(blockRegex)) {
          const mathContent = part.replace(/\\\[(.*?)\\\]/, "$1").trim();
          return <BlockMath key={index} math={mathContent} />;
        }
        return parseInlineLatex(part, index);
      });
    }

    return parseInlineLatex(text, 0);
  };

  const parseInlineLatex = (text: string, baseIndex: number) => {
    const inlineRegex = /\\\((.*?)\\\)/g;
    const generalRegex = /(\\begin{.*?}.*?\\end{.*?}|\\frac{.*?}{.*?})/g;
    const parts = text.split(inlineRegex).filter(Boolean);
    return parts.map((part, index) => {
      if (part.match(inlineRegex)) {
        const mathContent = part.replace(/\\\((.*?)\\\)/, "$1").trim();
        return <InlineMath key={`${baseIndex}-${index}`} math={mathContent} />;
      }
      if (part.match(generalRegex)) {
        return <InlineMath key={`${baseIndex}-${index}`} math={part.trim()} />;
      }
      return <span key={`${baseIndex}-${index}`}>{part} </span>;
    });
  };

  const toggleMode = () => setIsDarkMode((prev) => !prev);
  const handleSubjectChange = (subject: string) => { 
    setActiveSubject(subject); 
    setCurrentQuestionsBySubject(prev => ({
      ...prev,
      [subject]: prev[subject] || 1
    })); 
  };
  const handleSubmitClick = () => {
    if(isCorrections) {
      return
    }
    setIsCalculatorVisible(false); 
    setIsConfirmModalOpen(true);
  };

  const handleProceed = async () => {
    if (!examId) {
      console.error('No exam ID available');
      return;
    }
    setIsConfirmModalOpen(false);
    setIsSubmitting(true); // Show loader when submission starts
    let questionIds = Object.values(questionsBySubject).flat().map(q => q.id);
    const isCompleted = await finishJambExam(examId, storedAnswers, questionIds);
    if (isCompleted) {
      setIsScoreModalOpen(true);
      localStorage.removeItem('quizAnswers');
      setStoredAnswers([]);
      setSelectedAnswers({}); // Reset selected answers on submission
    } else {
      setError('Failed to complete the exam');
    }
    setIsSubmitting(false); // Hide loader when submission is complete
  };

  const handleCancel = () => setIsConfirmModalOpen(false);

  const resetQuizState = () => {
    setLoading(true);
    setSelectedAnswers({});
    setStoredAnswers([]);
    setCurrentQuestionsBySubject({});
    setExamId(null);
    setSubjectScores([]);
    setTotalScore(0);
    setTimeSpent('');
    setQuestionsBySubject({});
    localStorage.removeItem('quizAnswers');
    setLoading(false);
  };

  const handleQuestionClick = (questionNum: number) => {
    setCurrentQuestionsBySubject(prev => ({
      ...prev,
      [activeSubject]: questionNum
    }));
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageUrl(null);
  };

  const currentQuestions = questionsBySubject[activeSubject] || [];
  const currentQ = currentQuestions[(currentQuestionsBySubject[activeSubject] || 1) - 1];

  // Dynamic question number splitting
  const totalQuestions = currentQuestions.length;
  const questionsPerLine = Math.ceil(totalQuestions / 2); // Split into two equal (or nearly equal) lines

  if (!isMounted) return null;
  if (loading || !Object.keys(questionsBySubject).length) return <div className='min-h-screen w-full'><SkeletonLoader isDarkMode={false}/></div>;
  if (error) return <div>Error: {error}</div>;
  if (subjects.length === 0) return <div>No subjects selected</div>;
  if (!currentQuestions.length) return <div>No questions available for {activeSubject}</div>;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-[#191919] dark' : 'bg-gray-100'}`}>
      {/* Show SkeletonLoader during submission */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 backdrop-blur-sm">
          <Loading />
        </div>
      )}
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
            <div className="flex ml-40 mt-4 md:items-center space-x-6">
             {!isCorrections && <div className="text-red-500 font-semibold mt-2 text-lg">{formatTime(timeLeft)}</div>}
             {!isCorrections && <button onClick={handleSubmitClick} className="bg-[#11479b] mr-6 text-white px-4 py-2 rounded-bl-md">SUBMIT</button>}
             <Link href="/">
             {isCorrections && <button className='bg-[#11479b] mr-6 text-white px-4 py-2 rounded-lg'>Home</button>}
              </Link>
            </div>
          </div>
          <div className={`w-full border-t mb-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
        </div>

        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs bg-opacity-30">
            <div className={`rounded-lg p-6 ${isDarkMode ? 'bg-[#333333] text-white' : 'bg-white text-gray-800'} w-96 shadow-xl`}>
              <h2 className="text-xl font-bold mb-4">Confirm Submission</h2>
              <p className="mb-6">Do you want to submit your exam now? Are you sure all subjects are answered completely</p>
              <div className="flex justify-end space-x-4">
                <button onClick={handleCancel} className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600 text-white'}`}>Cancel</button>
                <button onClick={handleProceed} className="bg-[#11479b] text-white px-4 py-2 rounded-lg hover:bg-[#0d3a7d]">Proceed</button>
              </div>
            </div>
          </div>
        )}

        <EnhancedScoreGridModal
          isOpen={isScoreModalOpen}
          onClose={() => setIsScoreModalOpen(false)}
          subjectScores={subjectScores}
          totalScore={totalScore}
          timeSpent={timeSpent}
          selectedSubjects={selectedSubjects}
          startJambExam={startJambExam}
          resetQuizState={resetQuizState}
          setIsCorrections={setIsCorrections}
        />

        {isImageModalOpen && selectedImageUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70 backdrop-blur-sm">
            <div className={`relative rounded-lg p-6 ${isDarkMode ? 'bg-[#333333]' : 'bg-gray-200'} max-w-3xl w-full mx-4 shadow-2xl transform transition-all duration-300 scale-100 hover:scale-[1.02]`}>
              <button
                onClick={handleCloseImageModal}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors z-10 bg-white/80 dark:bg-gray-800/80 rounded-full p-1"
              >
                <X size={24} />
              </button>
              <div className="flex items-center justify-center min-h-[50vh] max-h-[80vh] p-4">
                <img
                  src={selectedImageUrl}
                  alt="Expanded Question Image"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-6xl mt-32 md:max-w-4xl md:mt-20 lg:mx-auto lg:max-w-4xl lg:mt-10">
          <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-[#333333]' : 'bg-blue-100'}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className={`font-bold underline ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>instructions:</p>
                {!hideInstructions && <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>All questions with images click on them to see full view</p>}
              </div>
              <button className="text-blue-600 flex items-center dark:text-blue-400" onClick={() => setHideInstructions(!hideInstructions)}>
                <Eye className="mr-1 w-5 h-5" />{hideInstructions ? 'Show instruction' : 'Hide instruction'}
              </button>
            </div>
          </div>

          {currentQuestions.length > 0 && (
            <div className={`flex ${currentQuestions.length === 2 ? 'flex-row gap-6' : 'flex-col'}`}>
              {currentQuestions.map((question, qIndex) => {
                const currentQNum = currentQuestionsBySubject[activeSubject] || 1;
                const isCurrent = qIndex + 1 === currentQNum;

                if (!isCurrent && currentQuestions.length !== 2) return null;

                return (
                  <div key={question.id} className={currentQuestions.length === 2 ? 'flex-1' : 'w-full'}>
                    <div className="mb-6 flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="bg-[#11479b] text-white rounded-full w-12 h-12 flex items-center justify-center mr-2 font-bold shrink-0">{qIndex + 1}</span>
                          <div className={isDarkMode ? 'text-white' : 'text-gray-800'}>
                            <p className="flex flex-col items-start">{parseLatexQuestion(question.question)}</p>
                          </div>
                        </div>
                        {question.imageUrl && (
                          <div className="flex justify-center">
                            <div
                              className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer"
                              onClick={() => handleImageClick(question.imageUrl!)}
                            >
                              <img
                                src={question.imageUrl}
                                alt="Question Image"
                                className="object-cover w-full h-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {!isCorrections? (<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-2 md:gap-4 md:mb-6 lg:mb-6 lg:gap-4">
                      {question.options.map((option, index) => {
                        // const optionLabels = ['a', 'b', 'c', 'd', 'e'];
                        // const optionLabel = optionLabels[index] || '';
                        const isSelected = selectedAnswers[activeSubject]?.[question.id] === option;
                        return (
                          <button
                            key={option}
                            onClick={() => handleAnswerSelect(option, question.id)}
                            className={`border rounded-lg p-4 py-3 h-12 text-left flex items-center ${
                              isDarkMode ? 'border-gray-700' : 'border-gray-300'
                            } ${
                              isSelected
                                ? 'bg-blue-200 dark:bg-blue-700'
                                : isDarkMode
                                ? 'bg-gray-800'
                                : 'bg-white'
                            } ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
                          >
                            {/* <span className="mr-2 font-semibold">{optionLabel}.</span> */}
                            <span>{parseLatexQuestion(option)}</span>
                          </button>
                        );
                      })}
                    </div>):(
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-2 md:gap-4 md:mb-6 lg:mb-6 lg:gap-4">
                    {question.options.map((option, index) => {
                      // Find correction for current question if it exists
                      const correction = corrections.find(c => c.questionId === question.id);
                      
                      // Check if this option is the student's answer or the correct answer
                      // Use only the first index of studentAnswer if it exists and is an array
                      const isStudentAnswer = correction?.studentAnswer 
                        ? (Array.isArray(correction.studentAnswer) 
                            ? correction.studentAnswer[0]?.toLowerCase() === option.toLowerCase()
                            : correction.studentAnswer.toLowerCase() === option.toLowerCase())
                        : false;
                      
                      const isCorrectAnswer = correction?.correctAnswer 
                        ? correction.correctAnswer.toLowerCase() === option.toLowerCase()
                        : false;
                      
                      // Determine the background color based on conditions
                      let bgColorClass = '';
                      if (correction) {
                        // We're in review mode (corrections exist)
                        if(option.split(".")[0].toLowerCase() == correction?.studentAnswer) {
                            bgColorClass =  correction?.studentAnswer !== correction?.correctAnswer.split(".")[0].toLowerCase() ? "bg-red-600" : ""

                            if(correction.correctAnswer.split(".")[0].toLowerCase() == correction.studentAnswer) {
                              bgColorClass = "bg-green-600"
                            }
                        } 
                          
                        // } else if (isStudentAnswer && !isCorrectAnswer) {
                        //   // Student chose this but it's wrong - red
                        //   bgColorClass = isDarkMode ? 'bg-red-600' : 'bg-red-200';

                        else if (isStudentAnswer && isCorrectAnswer) {
                          // Student answered correctly - green
                          bgColorClass = isDarkMode ? 'bg-green-700' : 'bg-green-200';
                        // } else if (isStudentAnswer && !isCorrectAnswer) {
                         
                        } else if (isCorrectAnswer) {
                          // This is the correct answer (but student chose something else) - green
                          bgColorClass = isDarkMode ? 'bg-green-600' : 'bg-green-100';
                        } else {
                          // Regular unselected option in review mode
                          bgColorClass = isDarkMode ? 'bg-gray-800' : 'bg-white';
                        }
                      } else {
                        // We're in question answering mode (no corrections yet)
                        const isSelected = selectedAnswers[activeSubject]?.[question.id] === option;
                        bgColorClass = isSelected
                          ? (isDarkMode ? 'bg-blue-700' : 'bg-blue-200')
                          : (isDarkMode ? 'bg-gray-800' : 'bg-white');
                      }
                      
                      
                      return (
                        <button
                          key={option}
                          onClick={() => handleAnswerSelect(option, question.id)}
                          className={`border rounded-lg p-4 py-3 h-12 text-left flex items-center ${
                            isDarkMode ? 'border-gray-700' : 'border-gray-300'
                          } ${bgColorClass} ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-200`}
                        >
                          <span>{parseLatexQuestion(option)}</span>
                        </button>
                      );
                    })}
                  </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {isCalculatorVisible && <FloatingCalculator />}
        <div className="mt-20 md:">
          <div className="relative">
            {/* Question Numbers Container */}
            <div className="max-w-[100vw] overflow-x-auto scrollbar-hide md:max-w-full md:overflow-x-visible lg:max-w-full lg:overflow-x-visible">
              <div className="flex flex-col gap-y-2">
                {/* First Line */}
                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(totalQuestions, questionsPerLine) }, (_, index) => index + 1).map((questionNum) => (
                    <button
                      key={questionNum}
                      onClick={() => handleQuestionClick(questionNum)}
                      className={`min-w-[2rem] h-8 ${getButtonColor(questionNum)} text-white rounded-full flex items-center justify-center text-sm font-medium`}
                    >
                      {questionNum}
                    </button>
                  ))}
                </div>
                {/* Second Line */}
                {totalQuestions > questionsPerLine && (
                  <div className="flex space-x-2">
                    {Array.from({ length: totalQuestions - questionsPerLine }, (_, index) => index + questionsPerLine + 1).map((questionNum) => (
                      <button
                        key={questionNum}
                        onClick={() => handleQuestionClick(questionNum)}
                        className={`min-w-[2rem] h-8 ${getButtonColor(questionNum)} text-white rounded-full flex items-center justify-center text-sm font-medium`}
                      >
                        {questionNum}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prev/Next Buttons */}
          <div className="flex justify-center md:justify-end space-x-2 mt-4">
            <button 
              onClick={goToPrev} 
              disabled={(currentQuestionsBySubject[activeSubject] || 1) === 1} 
              className={`px-4 py-2 rounded-lg text-white ${currentQuestionsBySubject[activeSubject] === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#11479b]'}`}
            >
              Prev
            </button>
            <button 
              onClick={goToNext} 
              disabled={(currentQuestionsBySubject[activeSubject] || 1) === currentQuestions.length} 
              className={`px-4 py-2 rounded-lg text-white ${(currentQuestionsBySubject[activeSubject] || 1) === currentQuestions.length ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#11479b]'}`}
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