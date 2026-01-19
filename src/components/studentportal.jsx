import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase'; 
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "firebase/auth";
import { 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    arrayUnion,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    query,
    orderBy
} from "firebase/firestore";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from "../assets/board/logo.png";

// === ICONS ===
const Icons = {
    Grid: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
    User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    File: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
    LogOut: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
    Check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="green" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
    Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
    Upload: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
    Download: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
    Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
    Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Alert: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
    Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    List: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
    Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
    Paperclip: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>,
    Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
};

const ADMIN_EMAIL = "admin@gece.com"; 
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const years = Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - 15 - i); 

export default function Home() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [allStudents, setAllStudents] = useState([]); 
    const [notices, setNotices] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [emailInput, setEmailInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isEditing, setIsEditing] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // === TOP LEVEL VARIABLES ===
    const total = userData?.challans?.length || 0;
    const verified = userData?.challans?.filter(c => c.status === 'Verified').length || 0;
    const pending = userData?.challans?.filter(c => c.status === 'Pending Verification').length || 0;

    const [siteConfig, setSiteConfig] = useState({ 
        collegeName: "GOVT. ELEMENTARY COLLEGE OF EDUCATION (M/W) MITHI",
        tickerText: "Welcome to Student Portal",
        heroImage: "" 
    });
    
    // Notice Modal
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const [noticeText, setNoticeText] = useState('');
    const [noticeFile, setNoticeFile] = useState(null);
    
    // Challan Modal
    const [adminChallanModal, setAdminChallanModal] = useState({ show: false, cnic: null });
    const [challanForm, setChallanForm] = useState({ part: 'Part I', batch: '2k25', status: 'Non-Hosteller' });

    // Profile & Other
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedChallanId, setSelectedChallanId] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [studentForm, setStudentForm] = useState({ prefix: 'Mr', fullName: '', surname: '', fatherName: '', email: '', gender: 'Male', mobileNo: '', zipCode: '69230', city: 'Mithi', district: 'Tharparkar', address: '' });
    const [dob, setDob] = useState({ day: '1', month: 'January', year: '2000' });
    const [saving, setSaving] = useState(false);

    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // === GROUP VERIFIED STUDENTS BY BATCH ===
    const getVerifiedStudentsByBatch = () => {
        const batchGroups = {};
        allStudents.forEach(student => {
            if(student.challans) {
                student.challans.forEach(ch => {
                    if(ch.status === 'Verified') {
                        const b = ch.batch || "Unknown";
                        if(!batchGroups[b]) batchGroups[b] = [];
                        batchGroups[b].push({ 
                            name: student.profile?.fullName || 'N/A', 
                            fname: student.profile?.fatherName || 'N/A', 
                            cnic: student.cnic, 
                            status: ch.statusType, 
                            amount: ch.amount 
                        });
                    }
                });
            }
        });
        return batchGroups;
    };

    // === NOTICE FORMATTER FUNCTION ===
    // Handles new lines (\n) and bold text (*text*)
    const renderNoticeContent = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, index) => {
            const parts = line.split('*');
            return (
                <div key={index} className={`min-h-[1.5em] ${line.trim() === '' ? 'h-4' : ''}`}>
                    {parts.map((part, i) => {
                        // Odd index means it was between asterisks -> Bold it
                        if (i % 2 === 1) {
                            return <span key={i} className="font-extrabold text-black bg-yellow-100 px-1 rounded">{part}</span>;
                        }
                        // Even index is normal text
                        return <span key={i} className="text-gray-700 font-medium">{part}</span>;
                    })}
                </div>
            );
        });
    };

    const showToast = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    const ToastPopup = () => (
        notification.show && (
            <div className={`fixed bottom-5 right-5 z-50 px-6 py-4 rounded-lg shadow-xl text-white font-bold flex items-center gap-3 animate-bounce ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <Icons.Check /> : <Icons.Alert />} {notification.message}
            </div>
        )
    );

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                setUser(currentUser);
                await fetchNotices(); 
                try {
                    const docSnap = await getDoc(doc(db, "site_config", "main"));
                    if (docSnap.exists()) setSiteConfig(docSnap.data());
                } catch (e) { }

                if (currentUser.email === ADMIN_EMAIL) {
                    setIsAdmin(true);
                    await fetchAllStudents();
                } else {
                    setIsAdmin(false);
                    const cnic = currentUser.email.split('@')[0];
                    await fetchStudentData(cnic);
                }
            } else {
                setUser(null);
                setUserData(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const compressImage = (file) => { 
        return new Promise((resolve, reject) => { 
            const reader = new FileReader(); 
            reader.readAsDataURL(file); 
            reader.onload = (event) => { 
                const img = new Image(); 
                img.src = event.target.result; 
                img.onload = () => { 
                    const canvas = document.createElement('canvas'); 
                    const MAX_WIDTH = 1600; 
                    let width = img.width;
                    let height = img.height;
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                    canvas.width = width; canvas.height = height; 
                    const ctx = canvas.getContext('2d'); 
                    ctx.drawImage(img, 0, 0, width, height); 
                    resolve(canvas.toDataURL('image/jpeg', 0.95)); 
                }; 
                img.onerror = (error) => reject(error); 
            }; 
            reader.onerror = (error) => reject(error); 
        }); 
    };

    // Helper for PDF to Base64
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const convertDriveLink = (url) => { if (!url) return null; if (url.includes('drive.google.com') && url.includes('/file/d/')) { const id = url.split('/file/d/')[1].split('/')[0]; return `https://drive.google.com/uc?export=view&id=${id}`; } return url; };
    const fetchNotices = async () => { try { const q = query(collection(db, "notices"), orderBy("createdAt", "desc")); const querySnapshot = await getDocs(q); setNotices(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); } catch (error) { } };
    const fetchAllStudents = async () => { try { const q = await getDocs(collection(db, "students")); setAllStudents(q.docs.map(doc => ({ id: doc.id, ...doc.data() }))); } catch (e) { } };
    const fetchStudentData = async (cnic) => { const d = await getDoc(doc(db, "students", cnic)); if(d.exists()) { setUserData(d.data()); if(d.data().profile) setStudentForm(d.data().profile); } else setUserData({ cnic, name: 'Student', challans: [] }); };
    
    // Actions
    const handleLogin = async (e) => { e.preventDefault(); let email = emailInput.trim(); if(!email.includes('@')) email += '@gecemithi.pk'; try { await signInWithEmailAndPassword(auth, email, passwordInput); showToast("Success!"); } catch { if(!email.includes("admin")) { await createUserWithEmailAndPassword(auth, email, passwordInput); await setDoc(doc(db, "students", emailInput.trim()), { cnic: emailInput.trim(), challans: [] }); showToast("Account Created!"); } else showToast("Login Failed", "error"); } };
    
    const addNotice = async (e) => { 
        e.preventDefault(); 
        try { 
            let fileData = null; 
            let fileType = null; 
            if (noticeFile) { 
                if (noticeFile.type !== 'application/pdf') { showToast("Only PDF files are allowed", "error"); return; } 
                if (noticeFile.size > 2 * 1024 * 1024) { showToast("PDF too large (Max 2MB)", "error"); return; } 
                fileData = await fileToBase64(noticeFile); 
                fileType = 'application/pdf'; 
            } 
            await addDoc(collection(db, "notices"), { 
                text: noticeText, 
                fileUrl: fileData, 
                fileType: fileType, 
                fileName: noticeFile ? noticeFile.name : null, 
                createdAt: new Date().toISOString(), 
                date: new Date().toLocaleDateString() 
            }); 
            setShowNoticeModal(false); 
            setNoticeText(''); 
            setNoticeFile(null); 
            fetchNotices(); 
            showToast("Notice Posted!", "success"); 
        } catch (err) { 
            showToast("Error posting notice", "error"); 
        } 
    };

    const deleteNotice = async (id) => { if(!window.confirm("Delete?")) return; try { await deleteDoc(doc(db, "notices", id)); fetchNotices(); showToast("Deleted!"); } catch { showToast("Error", "error"); } };
    
    const verifyChallan = async (cnic, id) => { 
        const s = allStudents.find(x => x.cnic === cnic); 
        if(!s) return; 
        const upd = s.challans.map(c => c.id === id ? { ...c, status: "Verified", receipt: null } : c); 
        await updateDoc(doc(db, "students", cnic), { challans: upd }); 
        fetchAllStudents(); 
        showToast("Verified & Receipt Removed!"); 
    };

    const deleteChallan = async (cnic, id) => { if(!window.confirm("Delete?")) return; const s = allStudents.find(x => x.cnic === cnic); const upd = s.challans.filter(c => c.id !== id); await updateDoc(doc(db, "students", cnic), { challans: upd }); fetchAllStudents(); showToast("Deleted!"); };
    const adminAddChallan = async (e) => { e.preventDefault(); const newC = { id: Date.now(), challanNo: `CH-${challanForm.batch}-${Math.floor(Math.random()*9000)+1000}`, part: challanForm.part, batch: challanForm.batch, amount: challanForm.status === 'Hosteller' ? 1300 : 900, status: "Not Paid", statusType: challanForm.status, date: new Date().toLocaleDateString() }; await updateDoc(doc(db, "students", adminChallanModal.cnic), { challans: arrayUnion(newC) }); fetchAllStudents(); setAdminChallanModal({show:false, cnic:null}); showToast("Added!"); };
    const generateChallan = async (e) => { e.preventDefault(); const newC = { id: Date.now(), challanNo: `CH-${challanForm.batch}-${Math.floor(Math.random()*9000)+1000}`, part: challanForm.part, batch: challanForm.batch, amount: challanForm.status === 'Hosteller' ? 1300 : 900, status: "Not Paid", statusType: challanForm.status, date: new Date().toLocaleDateString() }; await updateDoc(doc(db, "students", userData.cnic), { challans: arrayUnion(newC) }); fetchStudentData(userData.cnic); setActiveTab('dashboard'); showToast("Generated!"); };
    const handleSaveProfile = async (e) => { e.preventDefault(); const cnic = userData?.cnic; try { await setDoc(doc(db, "students", cnic), { profile: { ...studentForm, dobString: `${dob.day} ${dob.month} ${dob.year}` }, name: studentForm.fullName, cnic }, { merge: true }); fetchStudentData(cnic); setIsEditing(false); showToast("Saved!"); } catch { showToast("Error", "error"); } };
    const openUploadModal = (id) => { setSelectedChallanId(id); setUploadFile(null); setShowUploadModal(true); };
    const handleFileChange = (e) => { const f = e.target.files[0]; if(f && f.size < 10*1024*1024) setUploadFile(f); else showToast("Too large", "error"); };
    const submitReceipt = async () => { if(!uploadFile) return; setUploading(true); try { const b64 = await compressImage(uploadFile); const upd = userData.challans.map(c => c.id === selectedChallanId ? { ...c, status: "Pending Verification", receipt: b64, uploadedAt: new Date().toLocaleDateString() } : c); await updateDoc(doc(db, "students", userData.cnic), { challans: upd }); fetchStudentData(userData.cnic); setShowUploadModal(false); showToast("Uploaded!"); } catch { showToast("Error", "error"); } finally { setUploading(false); } };
    
    // === CHALLAN PDF (SINGLE PAGE, LANDSCAPE, 3 COPIES, STRETCHED) ===
    const downloadPDF = (challan, profileData) => { 
        const doc = new jsPDF('landscape', 'mm', 'a4'); 
        const pageWidth = 297; 
        const pageHeight = 210;
        const colWidth = pageWidth / 3; 
        const isHosteller = challan.statusType === 'Hosteller'; 
        const roomRent = isHosteller ? '400' : '---'; 
        const subTotalA = isHosteller ? '700' : '300'; 
        const totalAmount = isHosteller ? '1300' : '900'; 
        const drawCopy = (xOffset, copyTitle) => { 
            const centerX = xOffset + (colWidth / 2); 
            doc.setFont("helvetica", "bold"); 
            doc.setFontSize(9); 
            doc.text("GOVT. ELEMENTARY COLLEGE OF", centerX, 10, { align: "center" }); 
            doc.text("EDUCATION (M/W) MITHI", centerX, 15, { align: "center" }); 
            doc.setFontSize(8); 
            doc.text(`Challan No: ${challan.challanNo}`, xOffset + 5, 23); 
            doc.setFontSize(6); 
            doc.text("NBP MITHI ACCOUNT NO... 9223-7", xOffset + 93, 23, { align: "right" }); 
            doc.text("Date: ______________", xOffset + 93, 28, { align: "right" }); 
            doc.setFillColor(0, 0, 0); 
            doc.rect(xOffset + 5, 26, 25, 5, 'F'); 
            doc.setTextColor(255, 255, 255); 
            doc.setFontSize(7); 
            doc.text(copyTitle, xOffset + 17.5, 29.5, { align: "center" }); 
            doc.setTextColor(0, 0, 0); 
            let y = 40; 
            doc.setFont("helvetica", "normal"); 
            doc.setFontSize(9); 
            doc.text(`Name: ${profileData?.fullName || ''}`, xOffset + 5, y); y += 7; 
            doc.text(`F/Name: ${profileData?.fatherName || ''}`, xOffset + 5, y); y += 7; 
            doc.text(`Class: ADE/B.Ed(Hons) ${challan.part}`, xOffset + 5, y); y += 7; 
            doc.text(`Batch: ${challan.batch}`, xOffset + 5, y); 
            doc.text(`Status: ${challan.statusType}`, xOffset + 93, y, { align: "right" }); y += 10; 
            doc.setFont("helvetica", "bold"); 
            doc.text("DETAILS OF CHARGES", centerX, y, { align: "center" }); y += 4; 
            autoTable(doc, { 
                startY: y, margin: { left: xOffset + 4 }, tableWidth: colWidth - 8, theme: 'grid', pageBreak: 'avoid',
                head: [['Sr', 'Nature of Dues', 'Amount']], 
                body: [[{ content: 'A) Fee structure per Semester', colSpan: 3, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }], ['1', 'Tuition Fee', '200'], ['2', 'Admission Fee', '100'], ['3', 'Hostel Room Rent', roomRent], [{ content: 'Sub-Total (A)', colSpan: 2, styles: { fontStyle: 'bold' } }, { content: subTotalA, styles: { fontStyle: 'bold' } }], [{ content: 'B) College-Hostel Dues/Sem', colSpan: 3, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }], ['1', 'Library/Dev/Utility Funds', '300'], ['2', 'Sports/Welfare/Exam Funds', '300'], [{ content: 'Grand Total (A+B)', colSpan: 2, styles: { fontStyle: 'bold', fontSize: 10 } }, { content: totalAmount, styles: { fontStyle: 'bold', fontSize: 10 } }]], 
                styles: { fontSize: 8, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.1, textColor: 0, font: "helvetica" }, 
                headStyles: { fillColor: [255, 255, 255], textColor: 0, fontStyle: 'bold', lineWidth: 0.1, lineColor: [0, 0, 0], halign: 'center' }, 
                columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 20, halign: 'center' } } 
            }); 
            const footerY = pageHeight - 25;
            doc.setFont("helvetica", "normal"); 
            doc.setFontSize(7); 
            doc.text("Rupees in words: _________________________________", xOffset + 5, footerY); 
            const sigY = footerY + 12; 
            doc.text("Cashier", xOffset + 5, sigY); 
            doc.text("Officer", xOffset + 45, sigY); 
            doc.text("Candidate", xOffset + 80, sigY); 
            doc.setDrawColor(0,0,0);
            doc.setLineWidth(0.1);
            doc.setLineDash([],0);
            doc.rect(xOffset + 2, 5, colWidth - 4, pageHeight - 10);
        }; 
        drawCopy(0, "BANK COPY"); drawCopy(colWidth, "COLLEGE COPY"); drawCopy(colWidth * 2, "STUDENT COPY"); 
        doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.1); doc.setLineDash([2, 2], 0); 
        doc.line(colWidth, 5, colWidth, pageHeight - 5); doc.line(colWidth * 2, 5, colWidth * 2, pageHeight - 5); 
        doc.save(`Challan_${challan.challanNo}.pdf`); 
        showToast("Downloaded!", "success"); 
    };
    
    // === VERIFIED LIST PDF ===
    const downloadBatchPDF = (batchName, studentsList) => { 
        const doc = new jsPDF(); 
        const pageWidth = doc.internal.pageSize.width;
        doc.setFontSize(14);
        doc.text("GOVT. ELEMENTARY COLLEGE OF EDUCATION (M/W) MITHI", pageWidth / 2, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`Batch: ${batchName}`, pageWidth / 2, 22, { align: 'center' });
        autoTable(doc, { startY: 30, head: [['Sr', 'Name', 'F/Name', 'CNIC', 'Status', 'Paid']], body: studentsList.map((r, i) => [i+1, r.name, r.fname, r.cnic, r.status, `Rs. ${r.amount}`]), theme: 'grid', headStyles: { fillColor: [0, 77, 0], halign: 'center' }, bodyStyles: { halign: 'center' }, styles: { halign: 'center' } }); 
        doc.save(`${batchName}_Verified_List.pdf`); showToast(`Downloaded ${batchName} List!`); 
    };

    // === LOGIN SCREEN ===
    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] font-sans px-4">
            <ToastPopup />
            <div className="bg-white w-full max-w-[450px] rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                <div className="bg-[#004d00] p-10 text-center relative">
                    <div className="flex justify-center mb-4"><img src={logo}  alt="Logo" className="h-24 w-auto object-contain drop-shadow-lg" /></div>
                    <h2 className="text-xl font-extrabold text-white tracking-wide leading-tight">{siteConfig.collegeName}</h2>
                    <p className="text-[10px] text-green-100 mt-3 font-medium tracking-wider uppercase">Education & Literacy Dept, Govt. of Sindh</p>
                </div>
                <div className="p-10">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">CNIC / Admin User / Email</label><input type="text" placeholder="e.g. 44303..." className="w-full p-3.5 border border-gray-200 rounded-lg text-gray-700 text-sm focus:border-[#004d00] focus:ring-1 focus:ring-[#004d00] outline-none transition bg-gray-50" onChange={(e) => setEmailInput(e.target.value)} required /></div>
                        <div><label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label><input type="password" placeholder="••••••••" className="w-full p-3.5 border border-gray-200 rounded-lg text-gray-700 text-sm focus:border-[#004d00] focus:ring-1 focus:ring-[#004d00] outline-none transition bg-gray-50" onChange={(e) => setPasswordInput(e.target.value)} required /></div>
                        <button className="w-full bg-[#004d00] text-white font-bold py-3.5 rounded-lg shadow-lg hover:bg-green-900 transition transform active:scale-[0.98] uppercase tracking-wide text-sm">Sign In</button>
                    </form>
                </div>
            </div>
        </div>
    );

    // === ADMIN DASHBOARD ===
    if (isAdmin) {
        const verifiedBatches = getVerifiedStudentsByBatch();
        const batchKeys = Object.keys(verifiedBatches).sort();

        return (
            <div className="flex flex-col md:flex-row min-h-screen bg-[#f8f9fa] font-sans">
                <ToastPopup />
                {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
                <aside className={`fixed inset-y-0 left-0 w-64 bg-[#004d00] text-white flex flex-col shadow-2xl z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <div className="p-6 text-center border-b border-green-800 flex justify-between items-center md:block">
                        <div className="w-full"><div className="mb-3 flex justify-center"><img src={logo}  alt="Logo" className="h-16 w-auto object-contain" /></div><h2 className="text-lg font-bold">ADMIN PANEL</h2><p className="text-xs text-green-200">GECE MITHI</p></div>
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white"><Icons.Close /></button>
                    </div>
                    <div className="flex-1 p-4 space-y-2">
                        <button onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} className={`flex items-center w-full px-4 py-3 font-bold rounded shadow ${activeTab === 'dashboard' ? 'bg-white text-[#004d00]' : 'text-green-100 hover:bg-[#005a00]'}`}><Icons.Grid /> <span className="ml-3">ALL STUDENTS</span></button>
                        <button onClick={() => { setActiveTab('verifiedList'); setIsSidebarOpen(false); }} className={`flex items-center w-full px-4 py-3 font-bold rounded shadow ${activeTab === 'verifiedList' ? 'bg-white text-[#004d00]' : 'text-green-100 hover:bg-[#005a00]'}`}><Icons.List /> <span className="ml-3">VERIFIED LIST</span></button>
                        <button onClick={() => { setActiveTab('noticeBoard'); setIsSidebarOpen(false); }} className={`flex items-center w-full px-4 py-3 font-bold rounded shadow ${activeTab === 'noticeBoard' ? 'bg-white text-[#004d00]' : 'text-green-100 hover:bg-[#005a00]'}`}><Icons.Bell /> <span className="ml-3">NOTICE BOARD</span></button>
                    </div>
                    <div className="p-4 border-t border-green-800"><button onClick={() => signOut(auth)} className="flex items-center w-full justify-center text-red-200 hover:text-white font-bold"><Icons.LogOut /> <span className="ml-2">LOGOUT</span></button></div>
                </aside>
                <main className="flex-1 flex flex-col min-h-screen w-full">
                    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-600"><Icons.Menu /></button>
                            <h2 className="text-sm md:text-lg font-bold text-[#004d00] uppercase tracking-wide">{activeTab.replace(/([A-Z])/g, ' $1').trim()}</h2>
                        </div>
                        <div className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full hidden sm:block">{currentDate}</div>
                    </header>
                    <div className="flex-1 p-4 md:p-8">
                        {activeTab === 'dashboard' && (
                            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                                {allStudents.map((student) => (
                                    <div key={student.cnic} className="border-b border-gray-100 last:border-0">
                                        <div className="bg-gray-50 px-4 md:px-6 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 hover:bg-gray-100"><div><h3 className="font-bold text-gray-800 uppercase">{student.profile?.fullName || "Unknown Name"}</h3><p className="text-xs text-gray-500 font-mono">CNIC: {student.cnic}</p></div><div className="flex items-center gap-3"><button onClick={() => setAdminChallanModal({show: true, cnic: student.cnic})} className="text-xs bg-[#004d00] text-white px-3 py-1.5 rounded flex items-center hover:bg-green-800"><Icons.Plus /> Add</button><span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded">{student.challans?.length || 0} Records</span></div></div>
                                        {student.challans && student.challans.length > 0 && (<div className="px-4 md:px-6 py-4 bg-white overflow-x-auto"><table className="w-full text-sm text-left min-w-[600px]"><thead className="bg-[#004d00] text-white"><tr><th className="py-2 px-2">Challan No</th><th className="py-2 px-2">Amount</th><th className="py-2 px-2">Date</th><th className="py-2 px-2">Receipt</th><th className="py-2 px-2">Status</th><th className="py-2 px-2 text-right">Actions</th></tr></thead><tbody>{student.challans.map((ch) => (<tr key={ch.id} className="border-b last:border-0 hover:bg-gray-50"><td className="py-3 px-2 font-mono text-gray-800 text-xs">{ch.challanNo}</td><td className="py-3 px-2 font-bold text-gray-800">Rs.{ch.amount}</td><td className="py-3 px-2 text-gray-500">{ch.date}</td><td className="py-3 px-2">{ch.receipt ? (<a href={ch.receipt} download={`Receipt_${ch.challanNo}`} className="text-blue-600 hover:underline flex items-center"><Icons.Eye /> View</a>) : <span className="text-gray-400">-</span>}</td><td className="py-3 px-2"><span className={`px-2 py-1 rounded text-xs font-bold ${ch.status === 'Verified' ? 'bg-green-100 text-green-700' : ch.status === 'Pending Verification' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>{ch.status}</span></td><td className="py-3 px-2 text-right flex justify-end gap-2">{ch.status !== 'Verified' && (<button onClick={() => verifyChallan(student.cnic, ch.id)} title="Verify" className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"><Icons.Check /></button>)}<button onClick={() => deleteChallan(student.cnic, ch.id)} title="Delete" className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"><Icons.Trash /></button><button onClick={() => downloadPDF(ch, student.profile)} title="Download PDF" className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"><Icons.Download /></button></td></tr>))}</tbody></table></div>)}
                                    </div>
                                ))}
                            </div>
                        )}
                        {activeTab === 'verifiedList' && (
                            <>
                                {batchKeys.length === 0 ? (<div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-gray-300 text-gray-400"><Icons.File /><p className="mt-3">No verified batches yet.</p></div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{batchKeys.map(batch => (<div key={batch} className="bg-white rounded-lg shadow-md p-6 border-t-4 border-[#004d00] hover:shadow-lg transition"><h3 className="text-xl font-bold text-gray-800 mb-2">{batch}</h3><p className="text-sm text-gray-500 mb-4">Total Verified: <span className="font-bold text-[#004d00]">{verifiedBatches[batch].length}</span></p><button onClick={() => downloadBatchPDF(batch, verifiedBatches[batch])} className="w-full bg-[#004d00] text-white py-2 rounded font-bold text-sm flex items-center justify-center hover:bg-green-800 transition"><Icons.Download /> <span className="ml-2">Download List</span></button></div>))}</div>)}
                            </>
                        )}
                        {activeTab === 'noticeBoard' && (
                            <div className="space-y-4">
                                <div className="flex justify-end">
                                    <button onClick={() => setShowNoticeModal(true)} className="bg-[#004d00] text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center shadow-md hover:bg-green-800 transition transform active:scale-95">
                                        <Icons.Plus /> <span className="ml-2 uppercase tracking-wide">Add Notice</span>
                                    </button>
                                </div>
                                <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded border border-gray-200 text-center">
                                    Tip: Use <b>Enter</b> for new lines. Wrap text in <b>*stars*</b> to make it <b>*BOLD*</b> (e.g. *Warning*).
                                </div>
                                {notices.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300 text-gray-400">
                                        <div className="flex justify-center mb-2"><Icons.Bell /></div>
                                        <p>No notices posted yet.</p>
                                    </div>
                                ) : (
                                    notices.map((n) => (
                                        <div key={n.id} className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-[#004d00] flex justify-between items-start animate-fade-in">
                                            <div className="w-full">
                                                <div className="text-sm md:text-base leading-relaxed mb-2">
                                                    {renderNoticeContent(n.text)}
                                                </div>
                                                <div className="flex items-center gap-3 mt-3 border-t border-gray-100 pt-2">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1"><Icons.Grid /> {n.date}</p>
                                                    {n.fileUrl && <a href={n.fileUrl} download={n.fileName} className="inline-flex items-center text-[10px] font-bold text-white bg-blue-600 px-2 py-1 rounded hover:bg-blue-700 transition"><Icons.Paperclip /> <span className="ml-1">Attachment</span></a>}
                                                </div>
                                            </div>
                                            <button onClick={() => deleteNotice(n.id)} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition ml-4 shrink-0"><Icons.Trash /></button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </main>
                {adminChallanModal.show && (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"><div className="bg-white w-full max-w-sm rounded-lg p-6"><h3 className="text-lg font-bold mb-4 text-[#004d00]">Add Challan</h3><form onSubmit={adminAddChallan} className="space-y-4"><select className="w-full border p-2 rounded text-gray-800" value={challanForm.part} onChange={e => setChallanForm({...challanForm, part: e.target.value})}><option>Part I</option><option>Part II</option><option>Part III</option><option>Part IV</option></select><select className="w-full border p-2 rounded text-gray-800" value={challanForm.batch} onChange={e => setChallanForm({...challanForm, batch: e.target.value})}><option>2k23</option><option>2k24</option><option>2k25</option><option>2k26</option></select><select className="w-full border p-2 rounded text-gray-800" value={challanForm.status} onChange={e => setChallanForm({...challanForm, status: e.target.value})}><option>Non-Hosteller</option><option>Hosteller</option></select><div className="flex gap-2 justify-end"><button type="button" onClick={() => setAdminChallanModal({show:false, cnic:null})} className="px-4 py-2 text-gray-500">Cancel</button><button type="submit" className="px-4 py-2 bg-[#004d00] text-white rounded font-bold">Add</button></div></form></div></div>)}
                {showNoticeModal && (<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"><div className="bg-white w-full max-w-sm rounded-lg p-6"><h3 className="text-lg font-bold mb-4 text-[#004d00]">Add Notice</h3><form onSubmit={addNotice} className="space-y-4"><textarea className="w-full border p-2 rounded h-24 text-gray-800" placeholder="Type notice..." value={noticeText} onChange={e => setNoticeText(e.target.value)} required></textarea><div><label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-1"><Icons.Paperclip /> Attach File (PDF Only)</label><input type="file" accept="application/pdf" onChange={(e) => setNoticeFile(e.target.files[0])} className="w-full border p-2 rounded text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-100" /><p className="text-[10px] text-gray-400 mt-1">PDF max 2MB.</p></div><div className="flex gap-2 justify-end"><button type="button" onClick={() => setShowNoticeModal(false)} className="px-4 py-2 text-gray-500">Cancel</button><button type="submit" className="px-4 py-2 bg-[#004d00] text-white rounded font-bold">Post</button></div></form></div></div>)}
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[#f8f9fa] font-sans">
            <ToastPopup />
            {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
            <aside className={`fixed inset-y-0 left-0 w-72 bg-[#004d00] text-white flex flex-col shadow-2xl z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="p-8 text-center border-b border-green-800 mb-4"><div className="bg-white w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center shadow-lg p-2"><img src={logo}  alt="GECE Logo" className="w-full h-full object-contain" /></div><h2 className="text-[11px] font-bold text-white tracking-widest leading-tight">{siteConfig.collegeName}</h2></div>
                <nav className="flex-1 px-4 space-y-3">
                    <button onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} className={`flex items-center w-full px-5 py-3.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-white text-[#004d00] shadow-lg' : 'text-green-100 hover:bg-[#005a00] hover:text-white'}`}><Icons.Grid /> <span className="ml-3 uppercase tracking-wide">DASHBOARD</span></button>
                    <button onClick={() => { setActiveTab('profile'); setIsEditing(false); setIsSidebarOpen(false); }} className={`flex items-center w-full px-5 py-3.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'profile' ? 'bg-white text-[#004d00] shadow-lg' : 'text-green-100 hover:bg-[#005a00] hover:text-white'}`}><Icons.User /> <span className="ml-3 uppercase tracking-wide">MY PROFILE</span></button>
                    <button onClick={() => { setActiveTab('challan'); setIsSidebarOpen(false); }} className={`flex items-center w-full px-5 py-3.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'challan' ? 'bg-white text-[#004d00] shadow-lg' : 'text-green-100 hover:bg-[#005a00] hover:text-white'}`}><Icons.File /> <span className="ml-3 uppercase tracking-wide">EXAM CHALLAN</span></button>
                </nav>
                <div className="p-6 border-t border-green-800"><button onClick={() => signOut(auth)} className="flex items-center text-xs font-bold text-green-200 hover:text-white transition-colors w-full justify-center"><Icons.LogOut /> <span className="ml-2 uppercase tracking-wide">LOGOUT</span></button></div>
            </aside>
            <main className="flex-1 flex flex-col min-h-screen w-full">
                <header className="h-16 bg-[#004d00] flex items-center justify-between px-6 shadow-md z-10 shrink-0 sticky top-0">
                    <div className="flex items-center gap-4"><button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-white"><Icons.Menu /></button><h2 className="text-sm font-bold text-white uppercase tracking-wider">{activeTab.replace('_', ' ')}</h2></div>
                    <div className="overflow-hidden w-40 md:w-64 h-6 relative"><p className="absolute whitespace-nowrap text-[10px] text-yellow-300 font-bold uppercase tracking-wide animate-marquee">{siteConfig.tickerText}</p></div>
                    <span className="text-[10px] text-green-200 font-bold uppercase tracking-wide hidden sm:block">{currentDate}</span>
                </header>
                <div className="flex-1 p-4 md:p-8">
                    {activeTab === 'dashboard' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-between border border-gray-100"><div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Challans</p><h3 className="text-3xl font-bold text-gray-800">{total}</h3></div><div className="p-3 bg-green-50 text-green-700 rounded-lg"><Icons.File /></div></div>
                                <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-between border border-gray-100"><div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Pending</p><h3 className="text-3xl font-bold text-orange-500">{pending}</h3></div><div className="p-3 bg-orange-50 text-orange-500 rounded-lg"><Icons.Upload /></div></div>
                                <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-between border border-gray-100"><div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Verified</p><h3 className="text-3xl font-bold text-green-500">{verified}</h3></div><div className="p-3 bg-green-50 text-green-600 rounded-lg"><Icons.Eye /></div></div>
                            </div>
                            {siteConfig.heroImage && (<div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-6 shadow-lg relative border-4 border-white ring-1 ring-gray-200"><img src={convertDriveLink(siteConfig.heroImage) || siteConfig.heroImage} alt="College Slide" className="w-full h-full object-cover" /></div>)}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100"><h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Recent Activity</h3></div>{(!userData?.challans || userData.challans.length === 0) ? (<div className="p-8 text-center text-gray-400 text-sm">No recent activity found.</div>) : (<div className="divide-y divide-gray-50">{userData.challans.map((challan) => (<div key={challan.id} className="grid grid-cols-1 md:grid-cols-12 px-6 py-5 items-start md:items-center hover:bg-gray-50 transition gap-4 md:gap-0"><div className="md:col-span-5"><h4 className="text-xs font-bold text-gray-800 uppercase">{challan.part} EXAM FEE</h4><p className="text-[10px] text-gray-400 mt-1 uppercase font-mono">{challan.challanNo} | {challan.statusType} | {challan.batch}</p></div><div className="md:col-span-2"><span className="text-xs font-bold text-gray-700">Rs.{challan.amount}</span></div><div className="md:col-span-2">{challan.status === 'Verified' ? (<span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase">Verified</span>) : challan.status === 'Pending Verification' ? (<span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded uppercase">Pending</span>) : (<span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded uppercase">Not Paid</span>)}</div><div className="md:col-span-3 flex items-center gap-4"><button onClick={() => downloadPDF(challan, userData.profile)} className="flex items-center text-[10px] font-bold text-gray-500 hover:text-[#004d00]"><Icons.Download /> <span className="ml-1">PDF</span></button>{challan.status === 'Verified' || challan.status === 'Pending Verification' ? (<span className="text-[10px] font-bold text-gray-400 flex items-center"><Icons.Eye /> Sent</span>) : (<button onClick={() => openUploadModal(challan.id)} className="flex items-center bg-[#004d00] text-white px-3 py-1.5 rounded text-[10px] font-bold hover:bg-green-900 transition shadow-sm"><Icons.Upload /> <span className="ml-2 uppercase tracking-wide">UPLOAD</span></button>)}</div></div>))}</div>)}</div>
                        </>
                    )}
                    {activeTab === 'challan' && (<div className="max-w-lg mx-auto bg-white rounded-lg shadow-sm border border-gray-200 mt-10"><div className="px-8 py-6 border-b border-gray-100"><h3 className="text-lg font-bold text-[#004d00] uppercase tracking-wide">Generate Exam Challan</h3><p className="text-xs text-gray-500 mt-1">Select your details to generate fee voucher.</p></div><form onSubmit={generateChallan} className="p-8 space-y-6"><div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Select Part</label><select className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-3 rounded text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" value={challanForm.part} onChange={(e) => setChallanForm({...challanForm, part: e.target.value})}><option value="Part I">Part I (First Year)</option><option value="Part II">Part II (Second Year)</option><option value="Part III">Part III (Third Year)</option><option value="Part IV">Part IV (Fourth Year)</option></select></div><div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Select Batch</label><select className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-3 rounded text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" value={challanForm.batch} onChange={(e) => setChallanForm({...challanForm, batch: e.target.value})}><option value="2k23">2k23</option><option value="2k24">2k24</option><option value="2k25">2k25</option><option value="2k26">2k26</option></select></div><div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Select Status</label><select className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-3 rounded text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" value={challanForm.status} onChange={(e) => setChallanForm({...challanForm, status: e.target.value})}><option value="Non-Hosteller">Non-Hosteller (Day Scholar) - Rs. 900</option><option value="Hosteller">Hosteller (Boarder) - Rs. 1300</option></select></div><div className="pt-4"><button type="submit" className="w-full bg-[#004d00] text-white py-3 rounded-lg text-sm font-bold uppercase tracking-wide hover:bg-green-900 transition shadow-lg flex items-center justify-center"><span className="mr-2"><Icons.File /></span> Generate Challan</button></div></form></div>)}
                    {showUploadModal && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 animate-fade-in"><div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-gray-800">Upload Receipt</h3><button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-red-500"><Icons.Close /></button></div><div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition mb-4"><input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="fileInput" /><label htmlFor="fileInput" className="cursor-pointer"><div className="text-green-600 mb-2 flex justify-center"><Icons.Upload /></div><p className="text-sm font-bold text-gray-600">{uploadFile ? uploadFile.name : "Click to Select Image"}</p><p className="text-[10px] text-gray-400 mt-1">Max Size: 1MB (JPG/PNG)</p></label></div><button onClick={submitReceipt} disabled={uploading} className="w-full bg-[#004d00] text-white font-bold py-3 rounded-lg hover:bg-green-900 transition shadow-md flex justify-center">{uploading ? "Uploading..." : "SUBMIT RECEIPT"}</button></div></div>)}
                    {activeTab === 'profile' && !isEditing && (<div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[500px] relative"><div className="absolute top-4 right-4 border border-gray-300 rounded px-2 py-1 text-[10px] font-bold text-gray-400">ID: {userData?.cnic}</div><div className="flex flex-col items-center pt-16 pb-10"><h2 className="text-2xl md:text-4xl font-bold text-[#004d00] uppercase tracking-wide text-center">{userData?.profile?.fullName || "Student Name"}</h2><p className="text-sm text-gray-500 mt-3 font-mono bg-gray-100 px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">{userData?.cnic}</p></div><div className="px-6 md:px-12 py-8 border-t border-gray-100"><h3 className="text-xs font-bold text-[#004d00] uppercase mb-6 tracking-wider">Personal Details</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12"><div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Full Name</p><p className="text-sm font-bold text-gray-800 uppercase">{userData?.profile?.fullName || "-"}</p></div><div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Mobile No</p><p className="text-sm font-bold text-gray-800 uppercase">{userData?.profile?.mobileNo || "-"}</p></div><div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Father Name</p><p className="text-sm font-bold text-gray-800 uppercase">{userData?.profile?.fatherName || "-"}</p></div><div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Email Address</p><p className="text-sm font-bold text-[#004d00] lowercase">{userData?.profile?.email || "-"}</p></div><div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Date of Birth</p><p className="text-sm font-bold text-gray-800 uppercase">{userData?.profile?.dobString || "-"}</p></div><div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">City / District</p><p className="text-sm font-bold text-gray-800 uppercase">{userData?.profile?.city} / {userData?.profile?.district}</p></div><div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Gender</p><p className="text-sm font-bold text-gray-800 uppercase">{userData?.profile?.gender || "-"}</p></div><div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Address</p><p className="text-xs font-bold text-gray-700 uppercase leading-relaxed">{userData?.profile?.address || "-"}</p></div></div><div className="mt-12 flex justify-center gap-4"><button onClick={() => setIsEditing(true)} className="bg-[#004d00] text-white px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wide hover:bg-green-900 transition flex items-center"><span className="mr-2"><Icons.Edit /></span> Edit Profile</button></div></div></div>)}
                    {activeTab === 'profile' && isEditing && (<div className="bg-white rounded-lg shadow-sm border border-gray-200"><div className="px-6 md:px-8 py-6 border-b border-gray-100 flex justify-between items-center"><h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Edit Profile</h3><span className="border border-gray-300 rounded px-2 py-1 text-[10px] font-bold text-gray-400">ID: {userData?.cnic}</span></div><div className="p-6 md:p-8"><form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"><div><label className="text-[10px] font-bold text-gray-400 uppercase">Prefix</label><select value={studentForm.prefix} onChange={e=>setStudentForm({...studentForm, prefix:e.target.value})} className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-2.5 rounded text-sm mt-1 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"><option>Mr</option><option>Ms</option></select></div><div><label className="text-[10px] font-bold text-gray-400 uppercase">Full Name</label><input type="text" value={studentForm.fullName} onChange={e=>setStudentForm({...studentForm, fullName:e.target.value})} className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-2.5 rounded text-sm mt-1 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" /></div><div><label className="text-[10px] font-bold text-gray-400 uppercase">Surname</label><input type="text" value={studentForm.surname} onChange={e=>setStudentForm({...studentForm, surname:e.target.value})} className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-2.5 rounded text-sm mt-1 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" /></div><div><label className="text-[10px] font-bold text-gray-400 uppercase">Father Name</label><input type="text" value={studentForm.fatherName} onChange={e=>setStudentForm({...studentForm, fatherName:e.target.value})} className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-2.5 rounded text-sm mt-1 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" /></div><div className="md:col-span-2"><label className="text-[10px] font-bold text-gray-400 uppercase">Email Address</label><input type="email" value={studentForm.email} onChange={e=>setStudentForm({...studentForm, email:e.target.value})} className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-2.5 rounded text-sm mt-1 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" /></div><div className="md:col-span-2"><label className="text-[10px] font-bold text-gray-400 uppercase">Date of Birth</label><div className="grid grid-cols-3 gap-2 mt-1"><select value={dob.day} onChange={e=>setDob({...dob, day:e.target.value})} className="border border-gray-300 bg-gray-50 text-gray-900 p-2.5 rounded text-sm outline-none focus:border-green-600">{days.map(d=><option key={d} value={d}>{d}</option>)}</select><select value={dob.month} onChange={e=>setDob({...dob, month:e.target.value})} className="border border-gray-300 bg-gray-50 text-gray-900 p-2.5 rounded text-sm outline-none focus:border-green-600">{months.map(m=><option key={m} value={m}>{m}</option>)}</select><select value={dob.year} onChange={e=>setDob({...dob, year:e.target.value})} className="border border-gray-300 bg-gray-50 text-gray-900 p-2.5 rounded text-sm outline-none focus:border-green-600">{years.map(y=><option key={y} value={y}>{y}</option>)}</select></div></div><div><label className="text-[10px] font-bold text-gray-400 uppercase">Gender</label><select value={studentForm.gender} onChange={e=>setStudentForm({...studentForm, gender:e.target.value})} className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-2.5 rounded text-sm mt-1 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"><option>Male</option><option>Female</option></select></div><div><label className="text-[10px] font-bold text-gray-400 uppercase">Mobile No</label><input type="text" value={studentForm.mobileNo} onChange={e=>setStudentForm({...studentForm, mobileNo:e.target.value})} className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-2.5 rounded text-sm mt-1 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" /></div><div><label className="text-[10px] font-bold text-gray-400 uppercase">Zip Code</label><input type="text" value={studentForm.zipCode} onChange={e=>setStudentForm({...studentForm, zipCode:e.target.value})} className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-2.5 rounded text-sm mt-1 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600" /></div><div><label className="text-[10px] font-bold text-gray-400 uppercase">City</label><select value={studentForm.city} onChange={e=>setStudentForm({...studentForm, city:e.target.value})} className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-2.5 rounded text-sm mt-1 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"><option>Mithi</option><option>Islamkot</option><option>Chachro</option><option>Diplo</option><option>Nagarparkar</option></select></div><div><label className="text-[10px] font-bold text-gray-400 uppercase">District</label><select value={studentForm.district} onChange={e=>setStudentForm({...studentForm, district:e.target.value})} className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-2.5 rounded text-sm mt-1 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"><option>Tharparkar</option><option>Umerkot</option><option>Mirpurkhas</option></select></div><div className="md:col-span-2"><label className="text-[10px] font-bold text-gray-400 uppercase">Postal Address</label><textarea rows="3" value={studentForm.address} onChange={e=>setStudentForm({...studentForm, address:e.target.value})} className="w-full border border-gray-300 bg-gray-50 text-gray-900 p-2.5 rounded text-sm mt-1 outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"></textarea></div><div className="md:col-span-2 flex justify-end gap-3 mt-4"><button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 rounded text-xs font-bold uppercase text-gray-500 hover:bg-gray-100 transition">Cancel</button><button type="submit" disabled={saving} className="bg-[#004d00] text-white px-6 py-2 rounded text-xs font-bold uppercase tracking-wide hover:bg-green-900 transition">{saving ? "Saving..." : "Save Changes"}</button></div></form></div></div>)}
                </div>
            </main>
        </div>
    );
}