"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';

// --- Komponen-komponen ---

// Komponen Gauge Chart Kecil untuk Dasbor Ringkasan
const PillarGauge = ({ score = 0, color, pillarName }) => {
    const progress = useMotionValue(0);
    const count = useMotionValue(0);
    const rounded = useTransform(count, latest => Math.round(latest));

    useEffect(() => {
        const controls = animate(count, score, {
            duration: 1,
            ease: "easeOut",
            onUpdate: latest => progress.set(latest / 100)
        });
        return () => controls.stop();
    }, [score, count, progress]);

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e6e6e6" strokeWidth="12" />
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke={color}
                        strokeWidth="12"
                        strokeLinecap="round"
                        pathLength="1"
                        strokeDasharray="1"
                        strokeDashoffset={useTransform(progress, v => 1 - v)}
                        transform="rotate(-90 50 50)"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.span className="text-2xl font-bold text-slate-700">{rounded}</motion.span>
                    <span className="text-sm font-bold text-slate-500">%</span>
                </div>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-600 text-center">{pillarName}</p>
        </div>
    );
};


// Komponen Kartu Pilar di Dasbor Utama
const PillarAssessmentCard = ({ pillar, config, progress, score, status, onStart, onViewResults }) => {
    const getStatusInfo = () => {
        if (status === 'submitted') {
            if (score >= 90) return { text: 'Excellent', color: 'text-green-600' };
            if (score >= 75) return { text: 'Good', color: 'text-blue-600' };
            if (score >= 50) return { text: 'Fair', color: 'text-yellow-600' };
            return { text: 'Poor', color: 'text-red-600' };
        }
        if (status === 'in_progress') return { text: 'On Progress', color: 'text-slate-600' };
        return { text: 'Belum Dinilai', color: 'text-slate-500' };
    };

    const statusInfo = getStatusInfo();
    const isSubmitted = status === 'submitted';
    const buttonText = isSubmitted ? 'Lihat Hasil' : (status === 'in_progress' ? 'Lanjutkan' : 'Mulai Penilaian');

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col justify-between transition-all hover:shadow-xl hover:-translate-y-1">
            <div>
                <h3 className="text-xl font-bold text-slate-800">{config.name}</h3>
                <p className="text-sm text-slate-500 mt-1">Pilar {pillar}</p>

                <div className="mt-6 space-y-4">
                    <div>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="font-bold text-gray-700 text-sm">Skor Kepatuhan</span>
                            <span className={`text-sm font-bold ${statusInfo.color}`}>{statusInfo.text}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <motion.div
                                className="h-3 rounded-full"
                                style={{ backgroundColor: isSubmitted ? config.color : '#E2E8F0' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${isSubmitted ? score : 0}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </div>
                         {isSubmitted && <div className="text-right text-lg font-bold mt-1" style={{color: config.color}}>{score.toFixed(0)}%</div>}
                    </div>
                    <div>
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="font-bold text-gray-700 text-sm">Progres Pengisian</span>
                            <span className="text-sm font-semibold text-gray-600">{progress.answered} / {progress.total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                             <motion.div
                                className="h-3 rounded-full"
                                style={{ backgroundColor: config.color, opacity: 0.6 }}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress.total > 0 ? (progress.answered / progress.total) * 100 : 0}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-8 text-right">
                <button
                    onClick={() => isSubmitted ? onViewResults(pillar) : onStart(pillar)}
                    className="text-white font-bold py-2 px-6 rounded-lg transition-all active:scale-95 hover:opacity-90 shadow-lg"
                    style={{ backgroundColor: '#1c3d52' }}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

// Komponen untuk Summary View
const SummaryGauge = ({ value, color }) => {
    const progress = useMotionValue(0);
    const count = useMotionValue(0);
    const rounded = useTransform(count, latest => Math.round(latest));

    useEffect(() => {
        const controls = animate(count, value, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate: latest => progress.set(latest / 100)
        });
        return () => controls.stop();
    }, [value, count, progress]);

    return (
        <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#e6e6e6" strokeWidth="20" />
                <motion.circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={color}
                    strokeWidth="20"
                    strokeLinecap="round"
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset={useTransform(progress, v => 1 - v)}
                    transform="rotate(-90 100 100)"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span className="text-5xl font-bold text-slate-800">{rounded}</motion.span>
                <span className="text-sm text-slate-500">dari 100</span>
            </div>
        </div>
    );
};

const CriterionProgressBar = ({ title, score, color }) => (
    <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-4 text-sm font-semibold text-slate-700">{title}</div>
        <div className="col-span-7">
            <div className="w-full bg-gray-200 rounded-full h-4">
                <motion.div
                    className="h-4 rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                />
            </div>
        </div>
        <div className="col-span-1 text-sm font-bold text-slate-800 text-right">
            {score.toFixed(0)}%
        </div>
    </div>
);


// --- Komponen Utama Halaman Self-Assessment ---
export default function SelfAssessmentPage({ supabase, user }) {
    const [view, setView] = useState('main'); // 'main', 'assessment', atau 'summary'
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [pillarAssessments, setPillarAssessments] = useState({});

    const [currentPillar, setCurrentPillar] = useState(null);
    const [criteriaForPillar, setCriteriaForPillar] = useState([]);
    const [currentCriterionIndex, setCurrentCriterionIndex] = useState(0);

    const primaryColor = '#1c3d52';
    const pillarConfig = {
        A: { name: 'Manajemen', color: '#F59E0B' },
        B: { name: 'Sosial-Ekonomi', color: '#84CC16' },
        C: { name: 'Budaya', color: '#3B82F6' },
        D: { name: 'Lingkungan', color: '#10B981' }
    };

    const answerOptionStyles = [
        { text: 'Belum tersedia', score: 0, checked: 'bg-red-700 border-red-800 text-white', hover: 'hover:bg-red-100' },
        { text: 'Dokumen ada, belum implementasi', score: 1, checked: 'bg-orange-600 border-orange-700 text-white', hover: 'hover:bg-orange-100' },
        { text: 'Diterapkan sebagian', score: 2, checked: 'bg-yellow-500 border-yellow-600 text-white', hover: 'hover:bg-yellow-100' },
        { text: 'Diterapkan penuh & konsisten', score: 3, checked: 'bg-green-600 border-green-700 text-white', hover: 'hover:bg-green-100' }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [{ data: questionsData, error: qError }, { data: answersData, error: aError }, { data: assessmentsData, error: pError }] = await Promise.all([
                    supabase.from('self_assessment_questions').select('*').order('id'),
                    supabase.from('self_assessment_answers').select('question_id, answer_score').eq('destination_id', user.id),
                    supabase.from('pillar_assessments').select('pillar, status, score').eq('destination_id', user.id)
                ]);
                if (qError) throw qError;
                if (aError) throw aError;
                if (pError) throw pError;
                setQuestions(questionsData || []);
                const answersMap = (answersData || []).reduce((acc, ans) => { acc[ans.question_id] = ans.answer_score; return acc; }, {});
                setAnswers(answersMap);
                const assessmentsMap = (assessmentsData || []).reduce((acc, p) => { acc[p.pillar] = { status: p.status, score: p.score }; return acc; }, {});
                setPillarAssessments(assessmentsMap);
            } catch (error) {
                console.error("Gagal memuat data asesmen:", { message: error.message, details: error.details, code: error.code });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [supabase, user]);

    const startAssessment = (pillar) => {
        const criteria = [...new Set(questions.filter(q => q.pillar === pillar).map(q => q.criterion_code))]
            .sort((a, b) => {
                const numA = parseInt(a.split('.')[1]);
                const numB = parseInt(b.split('.')[1]);
                return numA - numB;
            });

        setCurrentPillar(pillar);
        setCriteriaForPillar(criteria);
        setCurrentCriterionIndex(0);
        setView('assessment');
    };

    const viewResults = (pillar) => {
        setCurrentPillar(pillar);
        setView('summary');
    };

    const handleAnswerChange = async (questionId, score) => {
        const newAnswers = { ...answers, [questionId]: score };
        setAnswers(newAnswers);
        if (pillarAssessments[currentPillar]?.status !== 'in_progress') {
            const newAssessments = { ...pillarAssessments, [currentPillar]: { status: 'in_progress', score: 0 } };
            setPillarAssessments(newAssessments);
            await supabase.from('pillar_assessments').upsert({ destination_id: user.id, pillar: currentPillar, status: 'in_progress' }, { onConflict: 'destination_id, pillar' });
        }
        await supabase.from('self_assessment_answers').upsert({ destination_id: user.id, question_id: questionId, answer_score: score }, { onConflict: 'destination_id, question_id' });
    };

    const areCurrentCriterionQuestionsAnswered = () => {
        const criterionCode = criteriaForPillar[currentCriterionIndex];
        const questionsInGroup = questions.filter(q => q.criterion_code === criterionCode);
        return questionsInGroup.every(q => answers[q.id] !== undefined);
    };

    const navigateCriterion = (direction) => {
        if (direction > 0 && !areCurrentCriterionQuestionsAnswered()) {
            alert("Harap jawab semua pertanyaan di kriteria ini sebelum melanjutkan.");
            return;
        }
        const newIndex = currentCriterionIndex + direction;
        if (newIndex >= 0 && newIndex < criteriaForPillar.length) {
            setCurrentCriterionIndex(newIndex);
        }
    };

    const handleSubmitPillar = async () => {
        if (!areCurrentCriterionQuestionsAnswered()) {
            alert("Harap jawab semua pertanyaan di kriteria terakhir ini sebelum menyelesaikan.");
            return;
        }
        const confirmation = window.confirm("Apakah Anda yakin ingin menyelesaikan dan mengunci jawaban untuk pilar ini?\n\nSetelah disubmit, jawaban tidak dapat diubah lagi dan akan menjadi bahan pertimbangan konsultan dalam mengambil keputusan.");
        if (confirmation) {
            setLoading(true);
            const scoreMap = [0, 1, 1, 2];
            let totalActualScore = 0;
            const questionsInPillar = questions.filter(q => q.pillar === currentPillar);
            questionsInPillar.forEach(q => { if (answers[q.id] !== undefined) { totalActualScore += scoreMap[answers[q.id]]; } });
            const maxPossibleScore = questionsInPillar.length * 2;
            const complianceScore = maxPossibleScore > 0 ? (totalActualScore / maxPossibleScore) * 100 : 0;
            const { error } = await supabase.from('pillar_assessments').update({ status: 'submitted', score: complianceScore }).match({ destination_id: user.id, pillar: currentPillar });
            if (error) {
                console.error("Gagal submit pilar:", error);
                alert("Terjadi kesalahan saat menyimpan hasil. Silakan coba lagi.");
            } else {
                setPillarAssessments(prev => ({ ...prev, [currentPillar]: { status: 'submitted', score: complianceScore } }));
                setView('main');
            }
            setLoading(false);
        }
    };

    const calculateProgressForPillar = (pillar) => {
        const questionsInPillar = questions.filter(q => q.pillar === pillar);
        const answeredCount = questionsInPillar.filter(q => answers[q.id] !== undefined).length;
        return { answered: answeredCount, total: questionsInPillar.length };
    };

    const calculateScoresForSummary = (pillar) => {
        const overallScore = pillarAssessments[pillar]?.score || 0;
        const scoreMap = [0, 1, 1, 2];
        const criteriaInPillar = [...new Set(questions.filter(q => q.pillar === pillar).map(q => q.criterion_code))].sort((a, b) => {
            const numA = parseInt(a.split('.')[1]);
            const numB = parseInt(b.split('.')[1]);
            return numA - numB;
        });
        const criteriaScores = criteriaInPillar.map(code => {
            const questionsInCriterion = questions.filter(q => q.criterion_code === code);
            let totalActualScore = 0;
            questionsInCriterion.forEach(q => { if (answers[q.id] !== undefined) { totalActualScore += scoreMap[answers[q.id]]; } });
            const maxPossibleScore = questionsInCriterion.length * 2;
            const score = maxPossibleScore > 0 ? (totalActualScore / maxPossibleScore) * 100 : 0;
            return { title: questionsInCriterion[0].criterion_title, score: score };
        });
        return { overallScore, criteriaScores };
    };

    const submittedPillars = Object.values(pillarAssessments).filter(p => p.status === 'submitted');
    const allPillarsSubmitted = submittedPillars.length === 4;

    let overallComplianceScore = 0;
    let priorityPillar = { name: '-', score: 101 };

    if (allPillarsSubmitted) {
        let totalScore = 0;
        Object.entries(pillarAssessments).forEach(([pillar, data]) => {
            totalScore += data.score;
            if (data.score < priorityPillar.score) {
                priorityPillar = { name: pillarConfig[pillar].name, score: data.score };
            }
        });
        overallComplianceScore = totalScore / 4;
    }

    const renderMainDashboard = () => (
        <div className="container mx-auto px-4 md:px-8 max-w-7xl py-8">
            <header className="py-10 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: primaryColor }}>GSTC Self-Assessment</h1>
                <p className="mt-3 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto">Evaluasi kepatuhan destinasi Anda terhadap standar pariwisata berkelanjutan global.</p>
            </header>

            <section className="mb-16 bg-white p-6 md:p-8 rounded-2xl shadow-lg border grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                 <div className="lg:col-span-3">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center lg:text-left">Kinerja Destinasi per Pilar GSTC</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.keys(pillarConfig).map(p => (
                            <PillarGauge
                                key={p}
                                score={pillarAssessments[p]?.status === 'submitted' ? pillarAssessments[p].score : 0}
                                color={pillarConfig[p].color}
                                pillarName={pillarConfig[p].name}
                            />
                        ))}
                    </div>
                 </div>
                 <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                    {allPillarsSubmitted ? (
                        <>
                            <div className="bg-slate-50 p-5 rounded-xl flex items-center">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-500">Capaian Kepatuhan GSTC</p>
                                    <p className="text-2xl font-bold text-gray-800">{overallComplianceScore.toFixed(0)}%</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-xl flex items-center">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm text-gray-500">Prioritas Peningkatan</p>
                                    <p className="text-lg font-bold text-gray-800 truncate">{priorityPillar.name}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-slate-50 p-5 rounded-xl text-center col-span-1 sm:col-span-2 lg:col-span-1">
                            <p className="text-slate-600">Selesaikan asesmen untuk semua pilar untuk melihat ringkasan capaian dan prioritas peningkatan Anda.</p>
                        </div>
                    )}
                 </div>
            </section>

            <section>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {Object.keys(pillarConfig).map(p => (
                        <PillarAssessmentCard
                            key={p}
                            pillar={p}
                            config={pillarConfig[p]}
                            progress={calculateProgressForPillar(p)}
                            score={pillarAssessments[p]?.score || 0}
                            status={pillarAssessments[p]?.status || 'not_started'}
                            onStart={startAssessment}
                            onViewResults={viewResults}
                        />
                    ))}
                 </div>
            </section>
        </div>
    );

    const renderAssessmentView = () => {
        if (!currentPillar) return null;
        const criterionCode = criteriaForPillar[currentCriterionIndex];
        
        // --- PERBAIKAN UTAMA DI SINI ---
        const questionsInGroup = questions
            .filter(q => q.criterion_code === criterionCode)
            .sort((a, b) => {
                // Mengurutkan berdasarkan 'question_id' secara alami
                return a.question_id.localeCompare(b.question_id, undefined, { numeric: true, sensitivity: 'base' });
            });
        // --- AKHIR PERBAIKAN ---
        
        const firstQ = questionsInGroup[0];
        const config = pillarConfig[currentPillar];

        return (
            <div className="container mx-auto px-4 md:px-8 max-w-5xl py-8">
                <div className="flex justify-between items-center mb-6">
                    <div><h2 className="text-3xl font-bold" style={{color: config.color}}>{`Pilar ${currentPillar}: ${config.name}`}</h2></div>
                    <button onClick={() => setView('main')} className="font-semibold hover:opacity-80 whitespace-nowrap ml-4" style={{color: primaryColor}}>&larr; Kembali ke Dasbor</button>
                </div>

                <div className="mb-8">
                    <div className="flex justify-between mb-1"><span className="text-base font-medium" style={{color: primaryColor}}>Progres Kriteria</span><span className="text-sm font-medium" style={{color: primaryColor}}>{currentCriterionIndex + 1} / {criteriaForPillar.length}</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <motion.div
                            className="h-2.5 rounded-full"
                            style={{ backgroundColor: config.color }}
                            animate={{ width: `${((currentCriterionIndex + 1) / criteriaForPillar.length) * 100}%` }}
                        />
                    </div>
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
                            <div key={q.id} className="border-t pt-6">
                                <p className="font-semibold text-gray-800 text-lg">{q.question_text}</p>
                                <p className="text-sm text-gray-500 mt-2 italic"><strong className="font-semibold">Contoh Bukti Dukung:</strong> {q.example_evidence}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                                    {answerOptionStyles.map((opt) => (
                                        <div key={opt.score} className="flex-1">
                                            <input type="radio" name={`q-${q.id}`} value={opt.score} id={`q-${q.id}-${opt.score}`} className="sr-only peer" checked={answers[q.id] === opt.score} onChange={() => handleAnswerChange(q.id, opt.score)} />
                                            <label htmlFor={`q-${q.id}-${opt.score}`} className={`flex flex-col items-center justify-center text-center h-full cursor-pointer p-3 text-gray-700 border rounded-lg transition-colors duration-200 ${answers[q.id] === opt.score ? opt.checked : `bg-white ${opt.hover}`}`}>
                                                <span className="text-sm font-medium">{opt.text}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-8 border-t flex justify-between items-center">
                        <button onClick={() => navigateCriterion(-1)} disabled={currentCriterionIndex === 0} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">Kembali</button>

                        {currentCriterionIndex < criteriaForPillar.length - 1 ? (
                            <button onClick={() => navigateCriterion(1)} className="active:scale-95 transition-all duration-200 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:opacity-90" style={{backgroundColor: primaryColor}}>
                                Lanjut
                            </button>
                        ) : (
                            <button onClick={handleSubmitPillar} className="active:scale-95 transition-all duration-200 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:opacity-90 bg-green-600 hover:bg-green-700">
                                Selesai & Kunci Jawaban
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderSummaryView = () => {
        if (!currentPillar) return null;
        const config = pillarConfig[currentPillar];
        const { overallScore, criteriaScores } = calculateScoresForSummary(currentPillar);

        return (
            <div className="container mx-auto px-4 md:px-8 max-w-4xl py-8">
                <button onClick={() => setView('main')} className="font-semibold hover:opacity-80 whitespace-nowrap ml-4 mb-6" style={{color: primaryColor}}>
                    &larr; Kembali ke Dasbor
                </button>
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border">
                    <h2 className="text-3xl font-bold text-slate-800 text-center">Rincian Kriteria Bagian {currentPillar}: {config.name}</h2>
                    <div className="my-8">
                        <SummaryGauge value={overallScore} color={config.color} />
                    </div>
                    <p className="text-center text-slate-600 max-w-md mx-auto mb-10">Evaluasi celah antara kinerja saat ini dan hasil yang diinginkan untuk mengidentifikasi area yang perlu ditingkatkan.</p>

                    <div className="space-y-6">
                        <div className="grid grid-cols-12 gap-4 items-center border-b pb-2">
                            <h4 className="col-span-4 text-sm font-bold text-slate-500 uppercase">Kriteria</h4>
                            <h4 className="col-span-8 text-sm font-bold text-slate-500 uppercase">Penyelesaian Kriteria</h4>
                        </div>
                        {criteriaScores.map(criterion => (
                            <CriterionProgressBar key={criterion.title} title={criterion.title} score={criterion.score} color={config.color} />
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // --- Render Utama ---
    if (loading) {
        return <div className="flex items-center justify-center h-screen"><p>Memuat Data Asesmen...</p></div>;
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                {view === 'main' && renderMainDashboard()}
                {view === 'assessment' && renderAssessmentView()}
                {view === 'summary' && renderSummaryView()}
            </motion.div>
        </AnimatePresence>
    );
}