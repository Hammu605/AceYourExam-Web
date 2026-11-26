import React, { useState, useEffect } from 'react';
import { 
  School, 
  Code, 
  Landmark,
  GraduationCap,
  Cpu,
  BookOpen,
  ChevronRight,
  Sparkles,
  Lock,
  Unlock,
  Flame,
  ArrowRight,
  TrendingUp,
  Award,
  Bell,
  Clock,
  FileCheck2,
  Target,
  PlayCircle,
  Star
} from 'lucide-react';

const GOAL_TABS = [
  { id: 'COMPETITIVE', label: 'Competitive', icon: Landmark },
  { id: 'SCHOOL', label: 'School', icon: School },
  { id: 'SKILLS', label: 'Skills', icon: Cpu },
  { id: 'UNIVERSITY', label: 'University', icon: GraduationCap },
];

const SKILL_TRACKS = [
  { id: 'st_web', title: 'Full-Stack Web Dev', category: 'Engineering', desc: 'HTML, CSS, React & Node.js', badge: 'Job Ready', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'st_python', title: 'Python & Data Science', category: 'Data & AI', desc: 'Python 3, Pandas, NumPy', badge: 'Beginner to Pro', color: '#059669', bg: '#ECFDF5' },
  { id: 'st_cloud', title: 'Cloud & DevOps (AWS/GCP)', category: 'Infrastructure', desc: 'Linux, Docker, CI/CD', badge: 'Certification', color: '#D97706', bg: '#FFFBEB' },
  { id: 'st_cyber', title: 'Cyber Security', category: 'Security', desc: 'Network Security, Ethical Hacking', badge: 'Advanced', color: '#DC2626', bg: '#FEF2F2' },
  { id: 'st_mobile', title: 'Android App Dev', category: 'Mobile Engineering', desc: 'Kotlin, Jetpack Compose, APIs', badge: 'Industry Std', color: '#7C3AED', bg: '#FAF5FF' },
  { id: 'st_ai', title: 'AI & Machine Learning', category: 'Artificial Intelligence', desc: 'ML Models, Prompting, PyTorch', badge: 'Cutting Edge', color: '#0D9488', bg: '#F0FDFA' }
];

const UNIVERSITY_PROGRAMS = [
  { id: 'uni_btech', title: 'B.Tech / B.E.', stream: 'Engineering & Tech', level: 'Undergraduate', duration: '8 Semesters', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'uni_bsc', title: 'B.Sc / M.Sc', stream: 'Sciences & Math', level: 'UG / PG', duration: '6 Semesters', color: '#059669', bg: '#ECFDF5' },
  { id: 'uni_bcom', title: 'B.Com / M.Com', stream: 'Commerce & Finance', level: 'UG / PG', duration: '6 Semesters', color: '#D97706', bg: '#FFFBEB' },
  { id: 'uni_ba', title: 'B.A. / M.A.', stream: 'Humanities & Arts', level: 'UG / PG', duration: '6 Semesters', color: '#7C3AED', bg: '#FAF5FF' },
  { id: 'uni_bca', title: 'BCA / MCA', stream: 'Computer Apps', level: 'UG / PG', duration: '6 Semesters', color: '#0D9488', bg: '#F0FDFA' },
  { id: 'uni_bba', title: 'BBA / MBA', stream: 'Management', level: 'UG / PG', duration: '4-6 Semesters', color: '#EA580C', bg: '#FFF7ED' }
];

const SCHOOL_CLASSES = [
  { id: 'sch_6', title: 'Class 6', board: 'CBSE & ICSE', desc: 'Foundational Maths & Science' },
  { id: 'sch_7', title: 'Class 7', board: 'CBSE & ICSE', desc: 'Integrated Subject Concepts' },
  { id: 'sch_8', title: 'Class 8', board: 'CBSE & ICSE', desc: 'Middle School Excellence' },
  { id: 'sch_9', title: 'Class 9', board: 'CBSE & ICSE', desc: 'Pre-Board Preparation' },
  { id: 'sch_10', title: 'Class 10', board: 'CBSE Board', desc: 'Secondary School Board Exam Mocks' },
  { id: 'sch_11', title: 'Class 11', board: 'CBSE / State', desc: 'Stream Mastery: Science, Commerce, Arts' },
  { id: 'sch_12', title: 'Class 12', board: 'Senior Secondary', desc: 'Class 12 Board Exam & CUET Prep' }
];

export default function HomeScreen({ 
  onSelectExam, 
  allFolders = [], 
  allTests = [],
  homeBanners = [],
  diamonds = 100,
  onQuickAction
}) {
  const [selectedGoal, setSelectedGoal] = useState('COMPETITIVE');
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  const defaultBanners = [
    {
      id: 1,
      title: 'SSC CGL & CHSL 2026 Live Series',
      subtitle: 'Full Mocks, Sectional Tests & Free Demo Papers Available Now',
      tag: 'NEW LAUNCH',
      bgGradient: 'from-[#0F4739] to-[#16A34A]'
    },
    {
      id: 2,
      title: 'UPSC Civil Services Prelims 2026',
      subtitle: 'Comprehensive General Studies Paper 1 & CSAT Practice Tests',
      tag: 'TRENDING',
      bgGradient: 'from-[#1e3a8a] to-[#2563eb]'
    },
    {
      id: 3,
      title: 'Daily Diamond Rewards & Focus Miner',
      subtitle: 'Complete 25 min study sessions & earn free diamonds daily!',
      tag: 'EARN DIAMONDS',
      bgGradient: 'from-[#7c2d12] to-[#ea580c]'
    }
  ];

  const promoBanners = homeBanners.length > 0
    ? homeBanners.map((b, i) => ({
        id: b.id || i,
        title: b.title || b.heading || 'AceYourExam Update',
        subtitle: b.subtitle || b.description || '',
        tag: b.tag || 'FEATURED',
        bgGradient: i % 3 === 0 ? 'from-[#0F4739] to-[#16A34A]' : i % 3 === 1 ? 'from-[#1e3a8a] to-[#2563eb]' : 'from-[#7c2d12] to-[#ea580c]'
      }))
    : defaultBanners;

  // Auto scroll banners
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIdx(prev => (prev + 1) % promoBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [promoBanners.length]);

  // Extract Competitive Exams from app_directory
  const competitiveExams = allFolders.filter(f => {
    const sType = (f.sectionType || '').toUpperCase();
    const isRoot = f.depth === 0 || !f.parentPath;
    return isRoot && (sType.includes('COMP') || sType.includes('GOVT') || !sType);
  });

  // Extract Subject-wise Matrix from app_directory
  const subjectExams = allFolders.filter(f => {
    const sType = (f.sectionType || '').toUpperCase();
    return sType.includes('SUBJ') || sType.includes('STUDY');
  });

  // Fallback defaults if cloud docs are loading
  const displayCompExams = competitiveExams.length > 0 ? competitiveExams : [
    { id: 'ssc', title: 'SSC Exams (CGL, CHSL, MTS, CPO)', name: 'SSC Exams', isLocked: false },
    { id: 'upsc', title: 'UPSC Civil Services (IAS/IPS)', name: 'UPSC Civil Services', isLocked: false },
    { id: 'banking', title: 'Banking (IBPS, SBI, RBI PO/Clerk)', name: 'Banking Exams', isLocked: false },
    { id: 'railways', title: 'Railways (RRB NTPC, Group D)', name: 'Railway Exams', isLocked: false },
    { id: 'defence', title: 'Defence (NDA, CDS, AFCAT)', name: 'Defence Exams', isLocked: false },
    { id: 'teaching', title: 'Teaching Exams (CTET, State TET)', name: 'Teaching Exams', isLocked: false }
  ];

  const displaySubjects = subjectExams.length > 0 ? subjectExams : [
    { id: 'hist', title: 'Ancient, Medieval & Modern History', name: 'History' },
    { id: 'polity', title: 'Indian Polity & Constitution', name: 'Indian Polity' },
    { id: 'geo', title: 'Physical, World & Indian Geography', name: 'Geography' },
    { id: 'econ', title: 'Indian Economy & Macroeconomics', name: 'Economics' },
    { id: 'science', title: 'General Science (PCB)', name: 'General Science' },
    { id: 'quant', title: 'Quantitative Aptitude & Mathematics', name: 'Quantitative Aptitude' },
    { id: 'reasoning', title: 'Logical & Analytical Reasoning', name: 'Reasoning' },
    { id: 'english', title: 'General English & Comprehension', name: 'English Language' }
  ];

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-5xl mx-auto space-y-5">
      
      {/* 1. HERO BANNER CAROUSEL */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm">
        <div 
          className={`bg-gradient-to-r ${promoBanners[activeBannerIdx].bgGradient} text-white p-6 sm:p-7 transition-all duration-500`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-md text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider text-amber-300 border border-white/20">
              {promoBanners[activeBannerIdx].tag}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug mb-1">
            {promoBanners[activeBannerIdx].title}
          </h2>
          <p className="text-xs sm:text-sm text-white/90 max-w-lg">
            {promoBanners[activeBannerIdx].subtitle}
          </p>
        </div>

        {/* Carousel Page Dots */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
          {promoBanners.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeBannerIdx === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* QUICK ACCESS FEATURE STRIP (Matching Android LessonScreen) */}
      {onQuickAction && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { id: 'notice_board', label: 'Notices', icon: Bell, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
            { id: 'focus', label: 'Focus', icon: Clock, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
            { id: 'attempted_tests', label: 'Attempted', icon: FileCheck2, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40' },
            { id: 'set_target', label: 'Set Target', icon: Target, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
            { id: 'video_sessions', label: 'Videos', icon: PlayCircle, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' },
            { id: 'bookmarks', label: 'Saved Qs', icon: Star, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' }
          ].map(item => {
            const QIcon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onQuickAction(item.id)}
                className="bouncy-tap bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-2.5 flex flex-col items-center gap-1.5 shadow-xs hover:border-ace-green/50"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                  <QIcon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-200 truncate w-full text-center">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. THE 4 GOAL SELECTOR TABS (Matching Android LessonScreen.kt) */}
      <div className="bg-[#F8FAFC] dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between gap-1">
        {GOAL_TABS.map((tab) => {
          const isSelected = selectedGoal === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedGoal(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer active:scale-95 ${
                isSelected 
                  ? 'bg-[#0F4739] text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE GOAL CONTENT */}
      {selectedGoal === 'COMPETITIVE' && (
        <div className="space-y-6">
          
          {/* Government & Competitive Exams Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] dark:bg-emerald-950/60 text-[#0F4739] dark:text-emerald-400 flex items-center justify-center font-bold">
                  🏆
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                    Government & Competitive Exams
                  </h3>
                  <p className="text-[11px] text-slate-500">Live mock test series with instant analytics & rank</p>
                </div>
              </div>
            </div>

            {/* 2-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayCompExams.map((exam) => (
                <div
                  key={exam.id || exam.title}
                  onClick={() => onSelectExam(exam)}
                  className="group bg-[#F8FAFC] dark:bg-slate-800/60 hover:bg-[#E8F5E9]/50 dark:hover:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-[#16A34A]/50 transition-all duration-200 cursor-pointer flex items-center justify-between active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-xs border border-slate-200/80 dark:border-slate-600 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
                      🏛️
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-[#0F4739] dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {exam.title || exam.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Explore mock tests & papers
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-[#16A34A] dark:text-emerald-400 font-bold text-xs group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Wise Study Matrix Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                  📚
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                    Subject Wise Study Matrix
                  </h3>
                  <p className="text-[11px] text-slate-500">Chapter & Topic-wise practice tests with solutions</p>
                </div>
              </div>
            </div>

            {/* 2-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displaySubjects.map((subj) => (
                <div
                  key={subj.id || subj.title}
                  onClick={() => onSelectExam(subj)}
                  className="group bg-[#F8FAFC] dark:bg-slate-800/60 hover:bg-amber-50/50 dark:hover:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-400/50 transition-all duration-200 cursor-pointer flex items-center justify-between active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 shadow-xs border border-slate-200/80 dark:border-slate-600 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
                      📖
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                        {subj.title || subj.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Chapterwise practice
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-amber-600 dark:text-amber-400 font-bold text-xs group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SCHOOL TAB CONTENT */}
      {selectedGoal === 'SCHOOL' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight mb-1">
            School Education & Board Exams
          </h3>
          <p className="text-xs text-slate-500 mb-4">Classes 6 to 12 CBSE, ICSE & Olympiads practice</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCHOOL_CLASSES.map((cls) => (
              <div
                key={cls.id}
                onClick={() => onSelectExam({ id: cls.id, title: cls.title, name: cls.title })}
                className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-[#F8FAFC] dark:bg-slate-800/60 hover:bg-emerald-50/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block">{cls.board}</span>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{cls.title}</h4>
                  <p className="text-xs text-slate-500">{cls.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SKILLS TAB CONTENT */}
      {selectedGoal === 'SKILLS' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight mb-1">
            Industry Skill Tracks & Engineering
          </h3>
          <p className="text-xs text-slate-500 mb-4">Master modern tech and job-ready technical assessments</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SKILL_TRACKS.map((st) => (
              <div
                key={st.id}
                onClick={() => onSelectExam({ id: st.id, title: st.title, name: st.title })}
                className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-[#F8FAFC] dark:bg-slate-800/60 hover:bg-blue-50/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 inline-block mb-1">{st.badge}</span>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{st.title}</h4>
                  <p className="text-xs text-slate-500">{st.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-600" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UNIVERSITY TAB CONTENT */}
      {selectedGoal === 'UNIVERSITY' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight mb-1">
            University & College Degree Programs
          </h3>
          <p className="text-xs text-slate-500 mb-4">Semester papers, university syllabus & degree tests</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {UNIVERSITY_PROGRAMS.map((uni) => (
              <div
                key={uni.id}
                onClick={() => onSelectExam({ id: uni.id, title: uni.title, name: uni.title })}
                className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-[#F8FAFC] dark:bg-slate-800/60 hover:bg-orange-50/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-orange-700 dark:text-orange-400 block">{uni.level} • {uni.duration}</span>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{uni.title}</h4>
                  <p className="text-xs text-slate-500">{uni.stream}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-orange-600" />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
