// // src/pages/SkillModule.js
// "use client";

// import { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import axios from "../api/axios";
// import { useAuth } from "../context/AuthContext";
// import "./SkillModule.css";

// export default function SkillModule() {
//   const { skillId, moduleId } = useParams();
//   const { user } = useAuth();

//   const [skill, setSkill] = useState(null);
//   const [module, setModule] = useState(null);
//   const [challengeDays, setChallengeDays] = useState("");
//   const [showChallengeInput, setShowChallengeInput] = useState(false);
//   const [moduleCompleted, setModuleCompleted] = useState(false);
//   const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

//   // Fetch skill and dashboard data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [skillRes, dashRes] = await Promise.all([
//           axios.get(`/skills/${skillId}`),
//           axios.get("/dashboard")
//         ]);

//         if (skillRes.data.success) {
//           const foundSkill = skillRes.data.skill;
//           setSkill(foundSkill);

//           const foundModule = foundSkill.modules.find(m => m._id === moduleId);
//           setModule(foundModule);

//           const moduleProgress = dashRes.data.dashboard.currentProgress?.modulesProgress?.find(
//             m => m.moduleId === moduleId
//           );

//           if (moduleProgress?.challengeDays) setChallengeDays(moduleProgress.challengeDays);
//           else setShowChallengeInput(true);

//           if (moduleProgress?.status === "completed") setModuleCompleted(true);

//           const completedLessons = moduleProgress?.lessonsProgress?.filter(l => l.completed) || [];
//           setCurrentLessonIndex(Math.min(completedLessons.length, foundModule.lessons.length - 1));
//         }
//       } catch (err) {
//         console.error("Failed to load module:", err);
//         alert("Failed to load module. Please refresh or check your login.");
//       }
//     };

//     fetchData();
//   }, [skillId, moduleId]);

//   // Start challenge
//   const startChallenge = async () => {
//     if (!challengeDays || challengeDays < 1) return alert("Enter a valid number of days");

//     try {
//       await axios.post("/dashboard/set-challenge", { skillId, moduleId, challengeDays: Number(challengeDays) });
//       setShowChallengeInput(false);
//       alert(`Challenge set! Finish in ${challengeDays} days.`);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to set challenge. Make sure you're logged in.");
//     }
//   };

//   // Mark lesson complete
//   const markLessonComplete = async (lessonId) => {
//     try {
//       await axios.post("/dashboard/complete-lesson", { skillId, moduleId, lessonId }, { withCredentials: true });
//       window.location.reload();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to complete lesson. Make sure you're logged in.");
//     }
//   };

//   // Mark module complete
//   const markModuleComplete = async () => {
//     try {
//       await axios.post("/dashboard/complete-module", { skillId, moduleId });
//       setModuleCompleted(true);
//       alert("Module Completed! You're incredible!");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to complete module. Make sure you're logged in.");
//     }
//   };

//   // Check if lesson is unlocked
//   const isLessonUnlocked = (lessonIndex) => {
//     if (lessonIndex === 0) return true;
//     const previousLesson = module?.lessons?.[lessonIndex - 1];
//     const isDone = user?.skillsProgress
//       ?.find(p => p.skillId === skillId)
//       ?.modulesProgress?.find(m => m.moduleId === moduleId)
//       ?.lessonsProgress?.find(l => l.lessonId === previousLesson?._id)?.completed;
//     return isDone;
//   };

//   // Render current lesson
//   const renderCurrentLesson = () => {
//     const lesson = module?.lessons?.[currentLessonIndex];
//     if (!lesson) return null;

//     const isDone = user?.skillsProgress
//       ?.find(p => p.skillId === skillId)
//       ?.modulesProgress?.find(m => m.moduleId === moduleId)
//       ?.lessonsProgress?.find(l => l.lessonId === lesson._id)?.completed;

//     const isUnlocked = isLessonUnlocked(currentLessonIndex);

//     return (
//       <div className="lesson-card">
//         <div className="lesson-header">
//           <h3 className="lesson-title">
//             Lesson {currentLessonIndex + 1}: {lesson.title}
//           </h3>
//           {isDone && <span className="completed-badge">✓ Completed</span>}
//           {!isUnlocked && <span className="locked-badge">🔒 Locked</span>}
//         </div>

//         {isUnlocked ? (
//           <>
//             <div className="lesson-content">
//               {lesson.content?.text ? (
//                 <div className="content-text">{lesson.content.text}</div>
//               ) : lesson.content?.videoUrl ? (
//                 <iframe
//                   width="100%"
//                   height="450"
//                   src={lesson.content.videoUrl}
//                   className="content-video"
//                   allowFullScreen
//                 ></iframe>
//               ) : (
//                 <p className="no-content">No content available</p>
//               )}
//             </div>

//             <div className="lesson-actions">
//               {!isDone ? (
//                 <button
//                   onClick={() => markLessonComplete(lesson._id)}
//                   className="complete-lesson-btn"
//                 >
//                   Mark as Complete ✓
//                 </button>
//               ) : (
//                 <div className="lesson-completed">
//                   <span className="completed-icon">✓</span> Lesson Completed!
//                 </div>
//               )}

//               <div className="navigation-btns">
//                 {currentLessonIndex > 0 && (
//                   <button
//                     onClick={() => setCurrentLessonIndex(currentLessonIndex - 1)}
//                     className="nav-btn prev-btn"
//                   >
//                     ← Previous
//                   </button>
//                 )}
//                 {currentLessonIndex < module.lessons.length - 1 && isLessonUnlocked(currentLessonIndex + 1) && (
//                   <button
//                     onClick={() => setCurrentLessonIndex(currentLessonIndex + 1)}
//                     className="nav-btn next-btn"
//                   >
//                     Next →
//                   </button>
//                 )}
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="locked-content">
//             <div className="locked-icon">🔒</div>
//             <p>Complete the previous lesson to unlock this content</p>
//           </div>
//         )}
//       </div>
//     );
//   };

//   if (!skill || !module) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>Loading module...</p>
//       </div>
//     );
//   }

//   const expectedEnd = challengeDays
//     ? new Date(Date.now() + challengeDays * 24 * 60 * 60 * 1000).toLocaleDateString()
//     : null;

//   return (
//     <div className="skill-module-page">
//       {/* Sidebar */}
//       <aside className="module-sidebar">
//         <div className="sidebar-header">
//           <Link to={`/skills/${skillId}`} className="back-link-sidebar">
//             ← Back to {skill.name}
//           </Link>
//           <h2 className="sidebar-title">{module.title}</h2>
//           <div className="progress-bar">
//             <div
//               className="progress-fill"
//               style={{ width: `${((currentLessonIndex + 1) / module.lessons.length) * 100}%` }}
//             ></div>
//           </div>
//           <p className="progress-text">
//             {currentLessonIndex + 1} / {module.lessons.length} Lessons
//           </p>
//         </div>

//         <nav className="lessons-nav">
//           {module.lessons.map((lesson, idx) => {
//             const isDone = user?.skillsProgress
//               ?.find(p => p.skillId === skillId)
//               ?.modulesProgress?.find(m => m.moduleId === moduleId)
//               ?.lessonsProgress?.find(l => l.lessonId === lesson._id)?.completed;

//             const isUnlocked = isLessonUnlocked(idx);
//             const isCurrent = idx === currentLessonIndex;

//             return (
//               <button
//                 key={lesson._id}
//                 onClick={() => isUnlocked && setCurrentLessonIndex(idx)}
//                 className={`lesson-nav-item ${isDone ? 'completed' : ''} ${isCurrent ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}
//                 disabled={!isUnlocked}
//               >
//                 <span className="lesson-number">{idx + 1}</span>
//                 <span className="lesson-nav-title">{lesson.title}</span>
//                 {isDone && <span className="check-icon">✓</span>}
//                 {!isUnlocked && <span className="lock-icon">🔒</span>}
//               </button>
//             );
//           })}
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className="module-content">
//         <div className="content-container">
//           {/* Challenge Input */}
//           {showChallengeInput && (
//             <div className="challenge-card">
//               <h3 className="challenge-title">Set Your Challenge! 🎯</h3>
//               <p className="challenge-subtitle">How many days do you need to complete this module?</p>
//               <div className="challenge-input-group">
//                 <input
//                   type="number"
//                   min="1"
//                   value={challengeDays}
//                   onChange={(e) => setChallengeDays(e.target.value)}
//                   className="challenge-input"
//                   placeholder="7"
//                 />
//                 <span className="challenge-label">days</span>
//                 <button onClick={startChallenge} className="challenge-btn">
//                   Start Challenge!
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Active Challenge */}
//           {challengeDays && !moduleCompleted && (
//             <div className="active-challenge">
//               <div className="challenge-icon">⏱️</div>
//               <div>
//                 <h3 className="active-challenge-title">
//                   {challengeDays}-Day Challenge Active!
//                 </h3>
//                 <p className="active-challenge-date">
//                   Finish by: <strong>{expectedEnd}</strong>
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Module Completed */}
//           {moduleCompleted && (
//             <div className="completion-card">
//               <div className="completion-icon">🏆</div>
//               <h2 className="completion-title">MODULE COMPLETED!</h2>
//               <p className="completion-subtitle">Congratulations! You've mastered this module.</p>
//               <button
//                 onClick={async () => {
//                   try {
//                     const res = await axios.post("/dashboard/generate-certificate", { skillId }, { responseType: "blob" });
//                     const url = window.URL.createObjectURL(new Blob([res.data]));
//                     const link = document.createElement("a");
//                     link.href = url;
//                     link.setAttribute("download", `${user.username}-${skill.name}-Certificate.pdf`);
//                     document.body.appendChild(link);
//                     link.click();
//                     link.remove();
//                   } catch (err) {
//                     console.error(err);
//                     alert("Certificate not ready yet. Complete the skill first!");
//                   }
//                 }}
//                 className="certificate-btn"
//               >
//                 📜 Download Certificate
//               </button>
//             </div>
//           )}

//           {/* Render current lesson */}
//           {!moduleCompleted && renderCurrentLesson()}

//           {/* Complete Module Button */}
//           {!moduleCompleted && module.lessons.every((_, idx) => {
//             const lesson = module.lessons[idx];
//             return user?.skillsProgress
//               ?.find(p => p.skillId === skillId)
//               ?.modulesProgress?.find(m => m.moduleId === moduleId)
//               ?.lessonsProgress?.find(l => l.lessonId === lesson._id)?.completed;
//           }) && (
//             <div className="complete-module-section">
//               <button
//                 onClick={markModuleComplete}
//                 className="complete-module-btn"
//               >
//                 🎉 Complete This Module
//               </button>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }
// import { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import axios from "../api/axios"; // Ensure this is configured with baseURL: `${process.env.REACT_APP_API_URL}/api/`
// import { useAuth } from "../context/AuthContext";
// import "./SkillModule.css";

// export default function SkillModule() {
//   const { skillId, moduleId } = useParams();
//   const { user } = useAuth();

//   const [skill, setSkill] = useState(null);
//   const [module, setModule] = useState(null);
//   const [challengeDays, setChallengeDays] = useState("");
//   const [showChallengeInput, setShowChallengeInput] = useState(false);
//   const [moduleCompleted, setModuleCompleted] = useState(false);
//   const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
//   const [loading, setLoading] = useState(true);

//   // Fetch skill and dashboard data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [skillRes, dashRes] = await Promise.all([
//           axios.get(`/skills/${skillId}`),
//           axios.get("/dashboard")
//         ]);

//         if (skillRes.data.success) {
//           const foundSkill = skillRes.data.skill;
//           setSkill(foundSkill);

//           const foundModule = foundSkill.modules.find(m => m._id === moduleId);
//           setModule(foundModule);

//           // Find progress for this specific module
//           const moduleProgress = dashRes.data.dashboard.currentProgress?.modulesProgress?.find(
//             m => m.moduleId === moduleId
//           );

//           // Set challenge state
//           if (moduleProgress?.challengeDays) {
//             setChallengeDays(moduleProgress.challengeDays);
//           } else {
//             setShowChallengeInput(true);
//           }

//           // Set completion state
//           if (moduleProgress?.status === "completed") {
//             setModuleCompleted(true);
//           }

//           // Determine which lesson to show
//           const completedLessons = moduleProgress?.lessonsProgress?.filter(l => l.completed) || [];

//           // If module is not complete, show the first incomplete lesson (or the last completed + 1)
//           // If module is complete, show the last lesson or keep at 0
//           if (foundModule && foundModule.lessons) {
//              // Default to first lesson
//             let nextIndex = 0;

//             // If we have completed lessons, try to go to the next one
//             if (completedLessons.length > 0) {
//               nextIndex = Math.min(completedLessons.length, foundModule.lessons.length - 1);
//             }

//             setCurrentLessonIndex(nextIndex);
//           }
//         }
//       } catch (err) {
//         console.error("Failed to load module:", err);
//         // Optional: Add a toast notification here instead of alert for better UX
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [skillId, moduleId]);

//   // Start challenge
//   const startChallenge = async () => {
//     if (!challengeDays || challengeDays < 1) return alert("Enter a valid number of days");

//     try {
//       await axios.post("/dashboard/set-challenge", { skillId, moduleId, challengeDays: Number(challengeDays) });
//       setShowChallengeInput(false);
//       alert(`Challenge set! Finish in ${challengeDays} days.`);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to set challenge. Make sure you're logged in.");
//     }
//   };

//   // Mark lesson complete
//   const markLessonComplete = async (lessonId) => {
//     try {
//       // UPDATED: Now sending all 3 IDs as required by the backend
//       await axios.post("/dashboard/complete-lesson", 
//         { 
//           skillId, 
//           moduleId, 
//           lessonId 
//         }, 
//         { withCredentials: true }
//       );

//       // Reload to sync points and progress from backend
//       window.location.reload();
//     } catch (err) {
//       console.error("Completion Error:", err);
//       alert("Failed to complete lesson. Please try again.");
//     }
//   };

//   // Mark module complete
//   const markModuleComplete = async () => {
//     try {
//       await axios.post("/dashboard/complete-module", { skillId, moduleId });
//       setModuleCompleted(true);
//       alert("Module Completed! You're incredible!");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to complete module. Make sure you're logged in.");
//     }
//   };

//   // Check if lesson is unlocked
//   const isLessonUnlocked = (lessonIndex) => {
//     if (lessonIndex === 0) return true;
//     const previousLesson = module?.lessons?.[lessonIndex - 1];

//     // Check backend data for completion status
//     const isDone = user?.skillsProgress
//       ?.find(p => p.skillId === skillId)
//       ?.modulesProgress?.find(m => m.moduleId === moduleId)
//       ?.lessonsProgress?.find(l => l.lessonId === previousLesson?._id)?.completed;

//     return isDone;
//   };

//   // Render current lesson
//   const renderCurrentLesson = () => {
//     const lesson = module?.lessons?.[currentLessonIndex];
//     if (!lesson) return null;

//     const isDone = user?.skillsProgress
//       ?.find(p => p.skillId === skillId)
//       ?.modulesProgress?.find(m => m.moduleId === moduleId)
//       ?.lessonsProgress?.find(l => l.lessonId === lesson._id)?.completed;

//     const isUnlocked = isLessonUnlocked(currentLessonIndex);

//     return (
//       <div className="lesson-card">
//         <div className="lesson-header">
//           <h3 className="lesson-title">
//             Lesson {currentLessonIndex + 1}: {lesson.title}
//           </h3>
//           {isDone && <span className="completed-badge">✓ Completed</span>}
//           {!isUnlocked && <span className="locked-badge">🔒 Locked</span>}
//         </div>

//         {isUnlocked ? (
//           <>
//             <div className="lesson-content">
//               {lesson.content?.text ? (
//                 <div className="content-text">{lesson.content.text}</div>
//               ) : lesson.content?.videoUrl ? (
//                 <div className="video-container">
//                     <iframe
//                     width="100%"
//                     height="450"
//                     src={lesson.content.videoUrl}
//                     className="content-video"
//                     title={lesson.title}
//                     allowFullScreen
//                     ></iframe>
//                 </div>
//               ) : (
//                 <p className="no-content">No content available</p>
//               )}
//             </div>

//             <div className="lesson-actions">
//               {!isDone ? (
//                 <button
//                   onClick={() => markLessonComplete(lesson._id)}
//                   className="complete-lesson-btn"
//                 >
//                   Mark as Complete ✓
//                 </button>
//               ) : (
//                 <div className="lesson-completed">
//                   <span className="completed-icon">✓</span> Lesson Completed!
//                 </div>
//               )}

//               <div className="navigation-btns">
//                 {currentLessonIndex > 0 && (
//                   <button
//                     onClick={() => setCurrentLessonIndex(currentLessonIndex - 1)}
//                     className="nav-btn prev-btn"
//                   >
//                     ← Previous
//                   </button>
//                 )}
//                 {/* Only show Next if next lesson exists and is unlocked */}
//                 {currentLessonIndex < module.lessons.length - 1 && isLessonUnlocked(currentLessonIndex + 1) && (
//                   <button
//                     onClick={() => setCurrentLessonIndex(currentLessonIndex + 1)}
//                     className="nav-btn next-btn"
//                   >
//                     Next →
//                   </button>
//                 )}
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="locked-content">
//             <div className="locked-icon">🔒</div>
//             <p>Complete the previous lesson to unlock this content</p>
//           </div>
//         )}
//       </div>
//     );
//   };

//   if (loading || !skill || !module) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>Loading module...</p>
//       </div>
//     );
//   }

//   const expectedEnd = challengeDays
//     ? new Date(Date.now() + challengeDays * 24 * 60 * 60 * 1000).toLocaleDateString()
//     : null;

//   return (
//     <div className="skill-module-page">
//       {/* Sidebar */}
//       <aside className="module-sidebar">
//         <div className="sidebar-header">
//           <Link to={`/skills/${skillId}`} className="back-link-sidebar">
//             ← Back to {skill.name}
//           </Link>
//           <h2 className="sidebar-title">{module.title}</h2>
//           <div className="progress-bar">
//             <div
//               className="progress-fill"
//               style={{ width: `${((currentLessonIndex + 1) / module.lessons.length) * 100}%` }}
//             ></div>
//           </div>
//           <p className="progress-text">
//             {currentLessonIndex + 1} / {module.lessons.length} Lessons
//           </p>
//         </div>

//         <nav className="lessons-nav">
//           {module.lessons.map((lesson, idx) => {
//             const isDone = user?.skillsProgress
//               ?.find(p => p.skillId === skillId)
//               ?.modulesProgress?.find(m => m.moduleId === moduleId)
//               ?.lessonsProgress?.find(l => l.lessonId === lesson._id)?.completed;

//             const isUnlocked = isLessonUnlocked(idx);
//             const isCurrent = idx === currentLessonIndex;

//             return (
//               <button
//                 key={lesson._id}
//                 onClick={() => isUnlocked && setCurrentLessonIndex(idx)}
//                 className={`lesson-nav-item ${isDone ? 'completed' : ''} ${isCurrent ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}
//                 disabled={!isUnlocked}
//               >
//                 <span className="lesson-number">{idx + 1}</span>
//                 <span className="lesson-nav-title">{lesson.title}</span>
//                 {isDone && <span className="check-icon">✓</span>}
//                 {!isUnlocked && <span className="lock-icon">🔒</span>}
//               </button>
//             );
//           })}
//         </nav>
//       </aside>

//       {/* Main Content */}
//       <main className="module-content">
//         <div className="content-container">
//           {/* Challenge Input */}
//           {showChallengeInput && (
//             <div className="challenge-card">
//               <h3 className="challenge-title">Set Your Challenge! 🎯</h3>
//               <p className="challenge-subtitle">How many days do you need to complete this module?</p>
//               <div className="challenge-input-group">
//                 <input
//                   type="number"
//                   min="1"
//                   value={challengeDays}
//                   onChange={(e) => setChallengeDays(e.target.value)}
//                   className="challenge-input"
//                   placeholder="7"
//                 />
//                 <span className="challenge-label">days</span>
//                 <button onClick={startChallenge} className="challenge-btn">
//                   Start Challenge!
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Active Challenge */}
//           {challengeDays && !moduleCompleted && (
//             <div className="active-challenge">
//               <div className="challenge-icon">⏱️</div>
//               <div>
//                 <h3 className="active-challenge-title">
//                   {challengeDays}-Day Challenge Active!
//                 </h3>
//                 <p className="active-challenge-date">
//                   Finish by: <strong>{expectedEnd}</strong>
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Module Completed */}
//           {moduleCompleted && (
//             <div className="completion-card">
//               <div className="completion-icon">🏆</div>
//               <h2 className="completion-title">MODULE COMPLETED!</h2>
//               <p className="completion-subtitle">Congratulations! You've mastered this module.</p>
//               <button
//                 onClick={async () => {
//                   try {
//                     const res = await axios.post("/dashboard/generate-certificate", { skillId }, { responseType: "blob" });
//                     const url = window.URL.createObjectURL(new Blob([res.data]));
//                     const link = document.createElement("a");
//                     link.href = url;
//                     link.setAttribute("download", `${user.username}-${skill.name}-Certificate.pdf`);
//                     document.body.appendChild(link);
//                     link.click();
//                     link.remove();
//                   } catch (err) {
//                     console.error(err);
//                     alert("Certificate not ready yet. Complete the skill first!");
//                   }
//                 }}
//                 className="certificate-btn"
//               >
//                 📜 Download Certificate
//               </button>
//             </div>
//           )}

//           {/* Render current lesson */}
//           {!moduleCompleted && renderCurrentLesson()}

//           {/* Complete Module Button */}
//           {!moduleCompleted && module.lessons.every((_, idx) => {
//             const lesson = module.lessons[idx];
//             return user?.skillsProgress
//               ?.find(p => p.skillId === skillId)
//               ?.modulesProgress?.find(m => m.moduleId === moduleId)
//               ?.lessonsProgress?.find(l => l.lessonId === lesson._id)?.completed;
//           }) && (
//             <div className="complete-module-section">
//               <button
//                 onClick={markModuleComplete}
//                 className="complete-module-btn"
//               >
//                 🎉 Complete This Module
//               </button>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }
import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./SkillModule.css";

export default function SkillModule() {
  const { skillId, moduleId } = useParams();
  const { user, setUser } = useAuth();

  const [skill, setSkill] = useState(null);
  const [module, setModule] = useState(null);
  const [challengeDays, setChallengeDays] = useState("");
  const [showChallengeInput, setShowChallengeInput] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Memoized lesson IDs to use safely in dependency array
  const lessonIds = useMemo(() => module?.lessons?.map(l => l._id).filter(Boolean) || [], [module?.lessons]);

  // Fetch skill and dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillRes, dashRes] = await Promise.all([
          axios.get(`/skills/${skillId}`),
          axios.get("/dashboard", { withCredentials: true })
        ]);

        if (skillRes.data.success) {
          const foundSkill = skillRes.data.skill;
          setSkill(foundSkill);

          const foundModule = foundSkill.modules.find(m => m._id === moduleId);
          setModule(foundModule);

          // Find progress for this specific module
          const moduleProgress = dashRes.data.dashboard.currentProgress?.modulesProgress?.find(
            m => m.moduleId === moduleId
          );

          // Set challenge state
          if (moduleProgress?.challengeDays) {
            setChallengeDays(moduleProgress.challengeDays);
          } else {
            setShowChallengeInput(true);
          }

          // Set completion state
          if (moduleProgress?.status === "completed") {
            setModuleCompleted(true);
          }

          // Determine which lesson to show
          const completedLessons = moduleProgress?.lessonsProgress?.filter(l => l.completed) || [];

          if (foundModule && foundModule.lessons) {
            let nextIndex = 0;
            if (completedLessons.length > 0) {
              nextIndex = Math.min(completedLessons.length, foundModule.lessons.length - 1);
            }
            setCurrentLessonIndex(nextIndex);
          }
        }
      } catch (err) {
        console.error("Failed to load module:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [skillId, moduleId, lessonIds.join(",")]); // safe dependency

  // Start challenge
  const startChallenge = async () => {
    if (!challengeDays || challengeDays < 1) return alert("Enter a valid number of days");

    try {
      await axios.post("/dashboard/set-challenge",
        { skillId, moduleId, challengeDays: Number(challengeDays) },
        { withCredentials: true }
      );
      setShowChallengeInput(false);
      alert(`Challenge set! Finish in ${challengeDays} days.`);
    } catch (err) {
      console.error(err);
      alert("Failed to set challenge. Make sure you're logged in.");
    }
  };

  // Mark lesson complete
  const markLessonComplete = async (lessonId) => {
    try {
      const res = await axios.post("/dashboard/complete-lesson",
        { skillId, moduleId, lessonId },
        { withCredentials: true }
      );
      const updatedUser = res.data.user;
      setUser(updatedUser);

      // Move to next lesson automatically
      setCurrentLessonIndex(i => Math.min(i + 1, module.lessons.length - 1));
    } catch (err) {
      console.error("Completion Error:", err);
      alert("Failed to complete lesson. Please try again.");
    }
  };

  // Mark module complete
  const markModuleComplete = async () => {
    try {
      await axios.post("/dashboard/complete-module",
        { skillId, moduleId },
        { withCredentials: true }
      );
      setModuleCompleted(true);
      alert("Module Completed! You're incredible!");
    } catch (err) {
      console.error(err);
      alert("Failed to complete module. Make sure you're logged in.");
    }
  };

  // Check if lesson is unlocked
  const isLessonUnlocked = (lessonIndex) => {
    if (lessonIndex === 0) return true;
    const previousLesson = module?.lessons?.[lessonIndex - 1];

    const isDone = user?.skillsProgress
      ?.find(p => p.skillId === skillId)
      ?.modulesProgress?.find(m => m.moduleId === moduleId)
      ?.lessonsProgress?.find(l => l.lessonId === previousLesson?._id)?.completed;

    return isDone;
  };

  // Render current lesson
  const renderCurrentLesson = () => {
    const lesson = module?.lessons?.[currentLessonIndex];
    if (!lesson) return null;

    const isDone = user?.skillsProgress
      ?.find(p => p.skillId === skillId)
      ?.modulesProgress?.find(m => m.moduleId === moduleId)
      ?.lessonsProgress?.find(l => l.lessonId === lesson._id)?.completed;

    const isUnlocked = isLessonUnlocked(currentLessonIndex);

    return (
      <div className="lesson-card">
        <div className="lesson-header">
          <h3 className="lesson-title">
            Lesson {currentLessonIndex + 1}: {lesson.title}
          </h3>
          {isDone && <span className="completed-badge">✓ Completed</span>}
          {!isUnlocked && <span className="locked-badge">🔒 Locked</span>}
        </div>

        {isUnlocked ? (
          <>
            <div className="lesson-content">
              {lesson.content?.text ? (
                <div className="content-text">{lesson.content.text}</div>
              ) : lesson.content?.videoUrl ? (
                <div className="video-container">
                  <iframe
                    width="100%"
                    height="450"
                    src={lesson.content.videoUrl}
                    className="content-video"
                    title={lesson.title}
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <p className="no-content">No content available</p>
              )}
            </div>

            <div className="lesson-actions">
              {!isDone ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    markLessonComplete(lesson._id);
                  }}
                  className="complete-lesson-btn"
                >
                  Mark as Complete ✓
                </button>
              ) : (
                <div className="lesson-completed">
                  <span className="completed-icon">✓</span> Lesson Completed!
                </div>
              )}

              <div className="navigation-btns">
                {currentLessonIndex > 0 && (
                  <button
                    onClick={() => setCurrentLessonIndex(currentLessonIndex - 1)}
                    className="nav-btn prev-btn"
                  >
                    ← Previous
                  </button>
                )}
                {currentLessonIndex < module.lessons.length - 1 && isLessonUnlocked(currentLessonIndex + 1) && (
                  <button
                    onClick={() => setCurrentLessonIndex(currentLessonIndex + 1)}
                    className="nav-btn next-btn"
                  >
                    Next → 
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="locked-content">
            <div className="locked-icon">🔒</div>
            <p>Complete the previous lesson to unlock this content</p>
          </div>
        )}
      </div>
    );
  };

  if (loading || !skill || !module) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading module...</p>
      </div>
    );
  }

  const expectedEnd = challengeDays
    ? new Date(Date.now() + challengeDays * 24 * 60 * 60 * 1000).toLocaleDateString()
    : null;

  return (
    <div className="skill-module-page">
      {/* Sidebar */}
      <aside className="module-sidebar">
        <div className="sidebar-header">
          <Link to={`/skills/${skillId}`} className="back-link-sidebar">
            ← Back to {skill.name}
          </Link>
          <h2 className="sidebar-title">{module.title}</h2>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${((currentLessonIndex + 1) / module.lessons.length) * 100}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {currentLessonIndex + 1} / {module.lessons.length} Lessons
          </p>
        </div>

        <nav className="lessons-nav">
          {module.lessons.map((lesson, idx) => {
            const isDone = user?.skillsProgress
              ?.find(p => p.skillId === skillId)
              ?.modulesProgress?.find(m => m.moduleId === moduleId)
              ?.lessonsProgress?.find(l => l.lessonId === lesson._id)?.completed;

            const isUnlocked = isLessonUnlocked(idx);
            const isCurrent = idx === currentLessonIndex;

            return (
              <button
                key={lesson._id}
                onClick={() => isUnlocked && setCurrentLessonIndex(idx)}
                className={`lesson-nav-item ${isDone ? 'completed' : ''} ${isCurrent ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}
                disabled={!isUnlocked}
              >
                <span className="lesson-number">{idx + 1}</span>
                <span className="lesson-nav-title">{lesson.title}</span>
                {isDone && <span className="check-icon">✓</span>}
                {!isUnlocked && <span className="lock-icon">🔒</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="module-content">
        <div className="content-container">
          {/* Challenge Input */}
          {showChallengeInput && (
            <div className="challenge-card">
              <h3 className="challenge-title">Set Your Challenge! 🎯</h3>
              <p className="challenge-subtitle">How many days do you need to complete this module?</p>
              <div className="challenge-input-group">
                <input
                  type="number"
                  min="1"
                  value={challengeDays}
                  onChange={(e) => setChallengeDays(e.target.value)}
                  className="challenge-input"
                  placeholder="7"
                />
                <span className="challenge-label">days</span>
                <button onClick={startChallenge} className="challenge-btn">
                  Start Challenge!
                </button>
              </div>
            </div>
          )}

          {/* Active Challenge */}
          {challengeDays && !moduleCompleted && (
            <div className="active-challenge">
              <div className="challenge-icon">⏱️</div>
              <div>
                <h3 className="active-challenge-title">
                  {challengeDays}-Day Challenge Active!
                </h3>
                <p className="active-challenge-date">
                  Finish by: <strong>{expectedEnd}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Module Completed */}
          {moduleCompleted && (
            <div className="completion-card">
              <div className="completion-icon">🏆</div>
              <h2 className="completion-title">MODULE COMPLETED!</h2>
              <p className="completion-subtitle">Congratulations! You've mastered this module.</p>
              <button
                onClick={async () => {
                  try {
                    const res = await axios.post("/dashboard/generate-certificate",
                      { skillId },
                      { responseType: "blob", withCredentials: true }
                    );
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", `${user.username}-${skill.name}-Certificate.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  } catch (err) {
                    console.error(err);
                    alert("Certificate not ready yet. Complete the skill first!");
                  }
                }}
                className="certificate-btn"
              >
                📜 Download Certificate
              </button>
            </div>
          )}

          {/* Render current lesson */}
          {!moduleCompleted && renderCurrentLesson()}

          {/* Complete Module Button */}
          {!moduleCompleted && module.lessons.every((_, idx) => {
            const lesson = module.lessons[idx];
            return user?.skillsProgress
              ?.find(p => p.skillId === skillId)
              ?.modulesProgress?.find(m => m.moduleId === moduleId)
              ?.lessonsProgress?.find(l => l.lessonId === lesson._id)?.completed;
          }) && (
            <div className="complete-module-section">
              <button
                onClick={markModuleComplete}
                className="complete-module-btn"
              >
                🎉 Complete This Module
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
