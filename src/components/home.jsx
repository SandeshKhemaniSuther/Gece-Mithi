import React, { useState, useEffect } from 'react';
import { Icon } from './uicomponents';
import { db, auth } from '../firebase'; 
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import Group from '../assets/slide.jpg';


const Home = ({ setContentType }) => {
    
    // --- STATE ---
    const [user, setUser] = useState(null); 
    const [notices, setNotices] = useState([]); 
    const [showLogin, setShowLogin] = useState(false); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // --- USE EFFECT ---
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            const noticesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotices(noticesData);
        });

        return () => {
            unsubscribeAuth();
            unsubscribeSnapshot();
        };
    }, []);

    // --- FUNCTIONS ---
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setShowLogin(false);
        } catch (error) {
            alert("Login Failed: " + error.message);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    const handleAdd = async () => {
        const newText = prompt("Enter Notice Text:");
        if (newText) {
            try {
                await addDoc(collection(db, "notices"), {
                    text: newText,
                    time: new Date().toLocaleDateString(),
                    createdAt: serverTimestamp()
                });
            } catch (error) {
                alert("Error adding notice: " + error.message);
            }
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Delete this notice permanently?")) {
            try {
                await deleteDoc(doc(db, "notices", id));
            } catch (error) {
                alert("Error deleting: " + error.message);
            }
        }
    };

    return (
        <div className="content-entry-animation w-full">
            
            {/* --- ANIMATION STYLE --- */}
            <style>{`
                @keyframes scrollVertical {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
                .news-ticker {
                    animation: scrollVertical 20s linear infinite;
                }
                .news-ticker:hover {
                    animation-play-state: paused;
                }
            `}</style>
            
            {/* --- TOP BAR: Teacher Login --- */}
            <div className="flex justify-end mb-4">
                <div className="relative">
                    {user ? (
                        <button onClick={handleLogout} className="bg-red-600 text-white text-[10px] px-3 py-1 rounded-full font-bold shadow hover:bg-red-700 flex items-center gap-1">
                            🚪 Logout
                        </button>
                    ) : (
                        <button onClick={() => setShowLogin(!showLogin)} className="bg-gray-200 text-gray-600 text-[10px] px-3 py-1 rounded-full font-bold shadow hover:bg-gray-300 flex items-center gap-1">
                            🔐 Teacher Login
                        </button>
                    )}

                    {/* Login Modal */}
                    {showLogin && !user && (
                        <div className="absolute top-8 right-0 bg-white p-3 shadow-xl rounded-xl border border-gray-200 z-30 w-56">
                            <h3 className="font-bold text-[#004d00] mb-2 text-sm">Admin Access</h3>
                            <form onSubmit={handleLogin} className="space-y-2">
                                <input type="email" placeholder="Email" className="w-full text-xs border p-2 rounded text-gray-900 bg-white" onChange={(e) => setEmail(e.target.value)} />
                                <input type="password" placeholder="Password" className="w-full text-xs border p-2 rounded text-gray-900 bg-white" onChange={(e) => setPassword(e.target.value)} />
                                <button type="submit" className="w-full bg-[#004d00] text-white py-1.5 rounded text-xs font-bold hover:bg-[#003d00]">Login</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* --- HERO IMAGE CARD (Text Removed) --- */}
            <div className="w-full h-48 md:h-64 lg:h-80 bg-[#004d00] rounded-2xl overflow-hidden mb-6 shadow-lg relative group border-4 border-white ring-1 ring-gray-200">
                <img 
                    src={Group}
                    alt="College Campus" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
            </div>

            {/* --- NEW: HERO TEXT SECTION (Below Image) --- */}
            <div className="text-center mb-10">
                <span className="block text-[#004d00] font-bold tracking-widest uppercase text-xs md:text-sm mb-2">
                    Govt. Elementary College of Education
                </span>
                <h2 className="text-2xl md:text-2xl font-extrabold text-yellow-500 tracking-tight">
                    Empowering Future Educators
                </h2>
            </div>

            {/* --- MAIN GRID (Welcome + Notice Board) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
                
                {/* Left Side: Welcome */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border-l-4 border-[#004d00] flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-2xl font-bold text-yellow-500 mb-2">Welcome, <span className='text-green-800'>Student! </span>👋</h1>
                        <p className="text-gray-600 mb-4 text-sm max-w-lg leading-relaxed">
                            Official resource portal for <strong>GECE Mithi</strong>. Access B.Ed (Hons) & ADE materials here.
                        </p>
                        <div className="flex flex-wrap gap-3 mb-4">
                            <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-100 flex-1 min-w-[80px] text-center">
                                <span className="block text-lg font-bold text-[#004d00]">46+</span>
                                <span className="text-[10px] text-gray-500 uppercase">Subjects</span>
                            </div>
                            <div className="bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-100 flex-1 min-w-[80px] text-center">
                                <span className="block text-lg font-bold text-yellow-700">100+</span>
                                <span className="text-[10px] text-gray-500 uppercase">Notes</span>
                            </div>
                            <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 flex-1 min-w-[80px] text-center">
                                <span className="block text-lg font-bold text-blue-700">8</span>
                                <span className="text-[10px] text-gray-500 uppercase">Semesters</span>
                            </div>
                        </div>
                        <button onClick={() => setContentType('notes')} className="bg-[#004d00] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#003300] transition flex items-center w-fit">
                            <Icon path="M12 6.5v11m4-7H8M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4 mr-2"/>
                            Find My Notes
                        </button>
                    </div>
                </div>

                {/* --- RIGHT SIDE: NOTICE BOARD --- */}
                <div className="lg:col-span-1 bg-[#004d00] text-white rounded-xl p-5 shadow-2xl border-2 border-[#FFD700] flex flex-col h-full max-h-[350px]">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2 border-b border-green-700 pb-2 z-10 bg-[#004d00]">
                        <h3 className="text-base font-bold text-[#FFD700] flex items-center tracking-wide uppercase">
                            <span className="mr-2 animate-pulse">🔴</span> Updates
                        </h3>
                        {user && (
                            <button onClick={handleAdd} className="bg-white hover:bg-gray-100 text-[#004d00] text-[10px] px-3 py-1 rounded-full font-bold transition">
                                + Add
                            </button>
                        )}
                    </div>
                    
                    {/* Scroll Container */}
                    <div className="relative overflow-hidden flex-grow mask-image-gradient">
                        {notices.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-green-200 opacity-50">
                                <span className="text-3xl mb-2">📭</span>
                                <p className="text-xs italic">No notices posted yet.</p>
                            </div>
                        ) : (
                            <div className="news-ticker">
                                {/* LIST 1 */}
                                <div className="space-y-3 pb-3">
                                    {notices.map((notice) => (
                                        <NoticeItem key={notice.id} notice={notice} user={user} handleDelete={handleDelete} />
                                    ))}
                                </div>
                                {/* LIST 2 */}
                                <div className="space-y-3 pb-3">
                                    {notices.map((notice) => (
                                        <NoticeItem key={`${notice.id}-dup`} notice={notice} user={user} handleDelete={handleDelete} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="pt-2 text-center border-t border-green-700 z-10 bg-[#004d00]">
                         <span className="text-[14px] text-green-200 font-extrabold tracking-widest uppercase">GECE Mithi Updates</span>
                    </div>
                </div>
            </div>

            {/* Quick Access Cards */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Browse Resources</h2>
                <div className="h-0.5 flex-grow bg-gray-200 ml-4 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                 <QuickCard title="Course Outlines" desc="Syllabus (All Semesters)" icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" color="bg-red-50 text-[#004d00]" onClick={() => setContentType('outline')} />
                 <QuickCard title="Lecture Notes" desc="Chapter-wise PDFs" icon="M12 6.5v11m4-7H8M21 12a9 9 0 11-18 0 9 9 0 0118 0z" color="bg-yellow-50 text-yellow-600" onClick={() => setContentType('notes')} />
                 <QuickCard title="Past Papers" desc="5 Years Solved" icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" color="bg-green-50 text-green-600" onClick={() => setContentType('pastPaper')} />
                 <QuickCard title="Portfolios" desc="Templates & Guides" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 2.388-8 5v1h16v-1c0-2.612-3.582-5-8-5z" color="bg-purple-50 text-purple-600" onClick={() => setContentType('portfolio')} />
                 <QuickCard title="Teacher's Tools" desc="Lesson Plans" icon="M7 21h10a2 2 0 002-2V9.586a1 1 0 00-.293-.707l-5.586-5.586A1 1 0 0011.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" color="bg-blue-50 text-blue-600" onClick={() => setContentType('tools')} />
                 
                 <div onClick={() => setContentType('about')} className="group bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200 cursor-pointer hover:bg-white hover:shadow-md hover:border-[#004d00] transition-all duration-300 flex flex-col justify-center items-center text-center h-full">
                    <h3 className="text-base font-bold text-gray-800">About GECE</h3>
                    <p className="text-gray-500 text-xs mt-0.5 mb-1">History & Admin</p>
                    <span className="text-[#004d00] font-bold text-[10px] group-hover:underline">Read More &rarr;</span>
                </div>
            </div>
        </div>
    );
};

// --- HELPER COMPONENTS ---
const NoticeItem = ({ notice, user, handleDelete }) => (
    <div className="group relative bg-white/10 hover:bg-white/20 p-3 rounded-lg border border-white/50 border-l-4 border-l-[#FFD700] transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-white leading-snug mb-2 font-[Inter] w-full break-words">{notice.text}</p>
            {user && (
                <button onClick={(e) => { e.stopPropagation(); handleDelete(notice.id); }} className="text-green-300 hover:text-red-400 transition-colors ml-2 p-1 flex-shrink-0" title="Delete">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            )}
        </div>
        <div className="flex items-center gap-2 border-t border-white/20 pt-2 mt-1">
            <span className="text-[10px] text-[#FFD700] bg-[#003d00] px-2 py-0.5 rounded border border-white/20">📅 {notice.time}</span>
        </div>
    </div>
);

const QuickCard = ({ title, desc, icon, color, onClick }) => (
    <div onClick={onClick} className="group bg-[#004d00] p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-[#004d00] transition-all duration-300 flex items-center">
        <div className={`w-12 h-12 ${color.split(' ')[0]} ${color.split(' ')[1]} rounded-lg flex items-center justify-center text-2xl mr-3 transition-colors`}>
            <Icon path={icon} />
        </div>
        <div><h3 className="text-base font-bold text-white">{title}</h3><p className="text-gray-500 text-xs mt-0.5">{desc}</p></div>
    </div>
);

export default Home;