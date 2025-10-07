"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Komponen Ikon ---
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;

// --- Komponen Grafik Batang ---
const PillarChartBar = ({ pillarName, percentage, color }) => (
    <div className="flex flex-col items-center h-full justify-end gap-2 text-center">
        <div className="text-sm font-bold text-slate-700">{percentage.toFixed(0)}%</div>
        <motion.div
            className="w-10 md:w-12 rounded-t-md"
            style={{ backgroundColor: color }}
            initial={{ height: 0 }}
            animate={{ height: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <div className="text-xs font-semibold text-slate-500 leading-tight">{pillarName}</div>
    </div>
);

// --- Komponen Utama ---
export default function SelfAssessmentPage({ supabase, user }) {
    const [view, setView] = useState('main'); // 'main', 'assessment'
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    
    const [currentPillar, setCurrentPillar] = useState(null);
    const [criteriaForPillar, setCriteriaForPillar] = useState([]);
    const [currentCriterionIndex, setCurrentCriterionIndex] = useState(0);

    const primaryColor = '#3f545f';
    const pillarConfig = {
        A: { name: 'Manajemen Berkelanjutan', color: '#F59E0B' },
        B: { name: 'Sosial-Ekonomi', color: '#84CC16' },
        C: { name: 'Budaya', color: '#3B82F6' },
        D: { name: 'Lingkungan', color: '#10B981' }
    };
    
    const answerOptionStyles = [
        { text: 'Belum tersedia', checked: 'bg-red-500 border-red-600 text-white', hover: 'hover:bg-red-100' },
        { text: 'Dokumen ada, belum implementasi', checked: 'bg-orange-500 border-orange-600 text-white', hover: 'hover:bg-orange-100' },
        { text: 'Diterapkan sebagian', checked: 'bg-yellow-400 border-yellow-500 text-white', hover: 'hover:bg-yellow-100' },
        { text: 'Diterapkan penuh & konsisten', checked: 'bg-green-500 border-green-600 text-white', hover: 'hover:bg-green-100' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: questionsData, error: qError } = await supabase.from('self_assessment_questions').select('*');
            const { data: answersData, error: aError } = await supabase.from('self_assessment_answers').select('question_id, answer_score').eq('destination_id', user.id);

            if (qError || aError) { console.error(qError || aError); } 
            else {
                setQuestions(questionsData);
                const answersMap = answersData.reduce((acc, ans) => {
                    const question = questionsData.find(q => q.id === ans.question_id);
                    if(question) acc[question.question_id] = ans.answer_score;
                    return acc;
                }, {});
                setAnswers(answersMap);
            }
            setLoading(false);
        };
        fetchData();
    }, [supabase, user]);

    const startAssessment = (pillar) => {
        const criteria = [...new Set(questions.filter(q => q.pillar === pillar).map(q => q.criterion_code))].sort();
        setCurrentPillar(pillar);
        setCriteriaForPillar(criteria);
        setCurrentCriterionIndex(0);
        setView('assessment');
    };

    const handleAnswerChange = async (questionId, score) => {
        const newAnswers = { ...answers, [questionId]: score };
        setAnswers(newAnswers);
        const question = questions.find(q => q.question_id === questionId);
        if(!question) return;
        await supabase.from('self_assessment_answers').upsert(
            { destination_id: user.id, question_id: question.id, answer_score: score },
            { onConflict: 'destination_id, question_id' }
        );
    };

    const navigateCriterion = (direction) => {
        const newIndex = currentCriterionIndex + direction;
        if (newIndex >= 0 && newIndex < criteriaForPillar.length) {
            setCurrentCriterionIndex(newIndex);
        } else if (newIndex >= criteriaForPillar.length) {
            setView('main');
        }
    };

    const calculateScores = () => {
        const scores = { A: 0, B: 0, C: 0, D: 0 };
        const totals = { A: 0, B: 0, C: 0, D: 0 };
        const answeredCounts = { A: 0, B: 0, C: 0, D: 0 };
        const scoreMap = [0, 1, 1, 2];

        questions.forEach(q => {
            totals[q.pillar]++;
            if (answers[q.question_id] !== undefined) {
                answeredCounts[q.pillar]++;
                scores[q.pillar] += scoreMap[answers[q.question_id]];
            }
        });

        const percentages = {};
        let totalAnswered = 0;
        let totalPossibleScore = 0;
        let totalActualScore = 0;

        for (const pillar of Object.keys(scores)) {
            // --- PERBAIKAN LOGIKA SKOR DI SINI ---
            // Pembagi sekarang adalah total pertanyaan di pilar tersebut dikali skor maksimal (2)
            const maxScoreForPillar = totals[pillar] * 2;
            percentages[pillar] = maxScoreForPillar > 0 ? (scores[pillar] / maxScoreForPillar) * 100 : 0;
            // --- END PERBAIKAN ---

            totalAnswered += answeredCounts[pillar];
            totalPossibleScore += totals[pillar] * 2;
            totalActualScore += scores[pillar];
        }
        
        const overallPercentage = totalPossibleScore > 0 ? (totalActualScore / totalPossibleScore) * 100 : 0;
        
        let priority = '-';
        if(totalAnswered > 0) {
            const sortedPillars = Object.keys(percentages).sort((a,b) => {
                if (percentages[a] === percentages[b]) return totals[b] - totals[a];
                return percentages[a] - percentages[b];
            });
            priority = pillarConfig[sortedPillars[0]].name;
        }

        return { percentages, answeredCounts, totals, overallPercentage, priority };
    };

    const { percentages, answeredCounts, totals, overallPercentage, priority } = calculateScores();

    // ... sisa kode untuk renderMainDashboard dan renderAssessmentView tidak berubah ...
    // (Kode di bawah ini sama persis seperti sebelumnya)
    const renderMainDashboard = () => (
        <div className="container mx-auto px-4 md:px-8 max-w-7xl py-8">
            <header className="py-10 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: primaryColor }}>GSTC Self-Assessment</h1>
                <p className="mt-3 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">
                    Pilih pilar di bawah untuk mulai mengisi atau melanjutkan penilaian.
                </p>
            </header>

            <section className="mb-12 bg-white p-6 md:p-8 rounded-2xl shadow-md grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                 <div className="lg:col-span-3">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Skor Kepatuhan per Pilar</h2>
                    <div className="h-64 flex items-end justify-around gap-4 px-4">
                        {Object.keys(pillarConfig).map(p => (
                            <PillarChartBar 
                                key={p}
                                pillarName={pillarConfig[p].name}
                                percentage={percentages[p]}
                                color={pillarConfig[p].color}
                            />
                        ))}
                    </div>
                 </div>
                 <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                    <div className="bg-slate-50 p-5 rounded-xl flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center"><CheckCircleIcon/></div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500">Total Kepatuhan</p>
                            <p className="text-2xl font-bold text-gray-800">{overallPercentage.toFixed(0)}%</p>
                        </div>
                    </div>
                     <div className="bg-slate-50 p-5 rounded-xl flex items-center">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><TrendingUpIcon/></div>
                        <div className="ml-4">
                            <p className="text-sm text-gray-500">Prioritas Peningkatan</p>
                            <p className="text-lg font-bold text-gray-800 truncate">{priority}</p>
                        </div>
                    </div>
                 </div>
            </section>

            <section>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {Object.keys(pillarConfig).map(p => {
                        const { name, color } = pillarConfig[p];
                        const completion = (answeredCounts[p] / (totals[p] || 1)) * 100;
                        const isDone = answeredCounts[p] === totals[p];
                        return (
                            <div key={p} className="bg-white p-6 rounded-2xl shadow-md flex flex-col justify-between" style={{ borderTop: `4px solid ${color}` }}>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Pilar {p}</p>
                                    <div className="mt-4">
                                        <div className="flex justify-between items-baseline"><span className="font-bold text-gray-700 text-sm">Progres Pengisian</span><span className="text-sm font-semibold text-gray-600">{answeredCounts[p]} / {totals[p]}</span></div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2"><div className="h-2.5 rounded-full" style={{width: `${completion}%`, backgroundColor: color}}></div></div>
                                    </div>
                                </div>
                                <div className="mt-6 text-right">
                                    <button onClick={() => startAssessment(p)} className="text-white font-bold py-2 px-6 rounded-lg transition-all active:scale-95 hover:opacity-90" style={{backgroundColor: primaryColor}}>
                                        {isDone ? 'Lihat Jawaban' : (answeredCounts[p] > 0 ? 'Lanjutkan' : 'Mulai')}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                 </div>
            </section>
        </div>
    );

    const renderAssessmentView = () => {
        if (!currentPillar) return null;
        const criterionCode = criteriaForPillar[currentCriterionIndex];
        const questionsInGroup = questions.filter(q => q.criterion_code === criterionCode);
        const firstQ = questionsInGroup[0];
        const config = pillarConfig[currentPillar];

        return (
            <div className="container mx-auto px-4 md:px-8 max-w-5xl py-8">
                <div className="flex justify-between items-center mb-6">
                    <div><h2 className="text-3xl font-bold" style={{color: config.color}}>{`Bagian ${currentPillar}: ${config.name}`}</h2></div>
                    <button onClick={() => setView('main')} className="font-semibold hover:opacity-80 whitespace-nowrap ml-4" style={{color: primaryColor}}>&larr; Kembali ke Dasbor</button>
                </div>
                
                <div className="mb-8">
                    <div className="flex justify-between mb-1"><span className="text-base font-medium" style={{color: primaryColor}}>Progres Pengisian Pilar {currentPillar}</span><span className="text-sm font-medium" style={{color: primaryColor}}>{Math.round((currentCriterionIndex / criteriaForPillar.length) * 100)}%</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="h-2.5 rounded-full" style={{width: `${(currentCriterionIndex / criteriaForPillar.length) * 100}%`, backgroundColor: config.color}}></div></div>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg">
                    <div className="flex items-start mb-6">
                        <div className="flex-shrink-0 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl" style={{backgroundColor: config.color}}>{criterionCode}</div>
                        <div className="ml-4">
                            <h3 className="text-2xl font-bold text-gray-800">{firstQ.criterion_title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{firstQ.criterion_description}</p>
                        </div>
                    </div>

                    <div className="space-y-8 mt-4">
                        {questionsInGroup.map(q => (
                            <div key={q.question_id} className="border-t pt-6">
                                <p className="font-semibold text-gray-800 text-lg">{q.question_text}</p>
                                <p className="text-sm text-gray-500 mt-2 italic"><strong className="font-semibold">Rekomendasi:</strong> {q.recommendation}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                                    {answerOptionStyles.map((opt, i) => (
                                        <div key={i} className="flex-1">
                                            <input type="radio" name={`q-${q.question_id}`} value={i} id={`q-${q.question_id}-${i}`} className="sr-only peer" checked={answers[q.question_id] === i} onChange={() => handleAnswerChange(q.question_id, i)} />
                                            <label htmlFor={`q-${q.question_id}-${i}`} className={`flex flex-col items-center justify-center text-center h-full cursor-pointer p-3 text-gray-700 border rounded-lg transition-colors duration-200 ${answers[q.question_id] === i ? opt.checked : `bg-white ${opt.hover}`}`}>
                                                <span className="text-sm font-medium">{opt.text}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-8 border-t flex justify-between items-center">
                        {currentCriterionIndex > 0 ? (
                            <button onClick={() => navigateCriterion(-1)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-xl transition-all duration-200">Kembali</button>
                        ) : (
                            <div></div>
                        )}
                        <span className="text-sm text-gray-500 font-medium">Kriteria {currentCriterionIndex + 1} dari {criteriaForPillar.length}</span>
                        <button onClick={() => navigateCriterion(1)} className="active:scale-95 transition-all duration-200 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:opacity-90" style={{backgroundColor: primaryColor}}>
                            {currentCriterionIndex === criteriaForPillar.length - 1 ? 'Selesai' : 'Lanjut'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><p>Memuat Data Asesmen...</p></div>;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                {view === 'main' ? renderMainDashboard() : renderAssessmentView()}
            </motion.div>
        </AnimatePresence>
    );
}