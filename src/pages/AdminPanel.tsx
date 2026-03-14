import { useState, useEffect } from "react";
import {
    Lock, User, LayoutDashboard, ClipboardCheck, GraduationCap,
    Settings, LogOut, Search, Trash2, Edit3, Save, ChevronRight,
    TrendingUp, Users, CheckCircle, Clock, Eye, X, Filter,
    Download, RefreshCcw, ShieldCheck, AlertCircle, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import CryptoJS from "crypto-js";
import axios from "axios";

const ADMIN_CREDENTIALS = {
    user: "system_admin",
    salt: "baustBAUSTbaust",
    passwordHash: "3ec8aa18e83cf4b7c8696e538dcbbff0321b351048c71ec7386a69ed3e1a287b"
};

const BASE_URL = "http://localhost:3001/assessment";

const AdminPanel = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Details View
    const [selectedSub, setSelectedSub] = useState<any>(null);
    const [showDetails, setShowDetails] = useState(false);

    // Answer Key View
    const [showKeyEditor, setShowKeyEditor] = useState(false);
    const [keyCourseCode, setKeyCourseCode] = useState("CSE 4215");
    const [keyCtNumber, setKeyCtNumber] = useState("CT 1");
    const [keyData, setKeyData] = useState<any>({
        mcqAnswers: {},
        gridSelect6: [],
        multiSelect7: [],
        matching: {},
        gridSelect9: [],
        trueFalse: {}
    });

    useEffect(() => {
        const auth = localStorage.getItem("baust_admin_auth");
        if (auth === "true") setIsAuthenticated(true);
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchSubmissions();
        }
    }, [isAuthenticated]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/submissions`);
            setSubmissions(res.data);
        } catch (err) {
            toast.error("Endpoint unreachable. Verify Engine status.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const hash = CryptoJS.SHA256(password + ADMIN_CREDENTIALS.salt).toString();
        if (username === ADMIN_CREDENTIALS.user && hash === ADMIN_CREDENTIALS.passwordHash) {
            setIsAuthenticated(true);
            localStorage.setItem("baust_admin_auth", "true");
            toast.success("Security clearance granted.");
        } else {
            toast.error("Authentication failed.");
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem("baust_admin_auth");
    };

    const deleteSubmission = async (id: string) => {
        if (!confirm("Are you sure? This action is irreversible.")) return;
        try {
            await axios.delete(`${BASE_URL}/submissions/${id}`);
            setSubmissions(submissions.filter((s: any) => s._id !== id));
            toast.success("Record purged.");
        } catch (err) {
            toast.error("Operation failed.");
        }
    };

    const fetchKey = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/answer-key`, {
                params: { courseCode: keyCourseCode, ctNumber: keyCtNumber }
            });
            if (res.data) setKeyData(res.data.correctAnswers);
            else {
                setKeyData({
                    mcqAnswers: {},
                    gridSelect6: [],
                    multiSelect7: [],
                    matching: {},
                    gridSelect9: [],
                    trueFalse: {}
                });
            }
        } catch (err) {
            toast.error("Failed to fetch key meta-data");
        }
    };

    const saveAnswerKey = async () => {
        try {
            await axios.post(`${BASE_URL}/answer-key`, {
                courseCode: keyCourseCode,
                ctNumber: keyCtNumber,
                correctAnswers: keyData
            });
            toast.success("Assessment logic updated.");
            setShowKeyEditor(false);
        } catch (err) {
            toast.error("Update failed.");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                <Card className="w-full max-w-md border-white/5 bg-slate-900 shadow-2xl rounded-3xl overflow-hidden relative transition-all hover:shadow-primary/5">
                    <div className="bg-gradient-to-br from-primary to-accent-foreground p-12 text-center text-white relative">
                        <div className="mx-auto w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 border border-white/20 shadow-xl">
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-display font-black tracking-tight mb-2">BAUST Admin</h2>
                        <p className="text-white/60 text-sm font-medium">Restricted Personnel Only</p>
                    </div>
                    <CardContent className="p-10">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Universal ID</label>
                                <Input
                                    placeholder="Username"
                                    className="h-14 bg-slate-800/50 border-white/5 text-white rounded-2xl focus:ring-primary/50"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Passkey</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-14 bg-slate-800/50 border-white/5 text-white rounded-2xl focus:ring-primary/50"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 rounded-2xl shadow-xl shadow-primary/20 mt-4">
                                Log In
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col shadow-sm sticky top-0 h-screen">
                <div className="p-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-200">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-display font-black text-2xl text-slate-900 tracking-tighter">Engine</span>
                    </div>

                    <nav className="space-y-3">
                        <Button variant="ghost" className="w-full justify-start gap-4 h-14 rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-200">
                            <Users className="w-5 h-5" /> Submissions
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => { setShowKeyEditor(true); fetchKey(); }}
                            className="w-full justify-start gap-4 h-14 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold"
                        >
                            <ClipboardCheck className="w-5 h-5" /> Master Keys
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-4 h-14 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all font-bold">
                            <TrendingUp className="w-5 h-5" /> Grading
                        </Button>
                    </nav>
                </div>

                <div className="mt-auto p-10 border-t border-slate-100">
                    <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-4 h-12 text-rose-500 hover:bg-rose-50 rounded-xl font-bold">
                        <LogOut className="w-5 h-5" /> Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                <header className="h-28 bg-white/80 backdrop-blur-md border-b border-slate-200 px-12 flex items-center justify-between sticky top-0 z-40">
                    <div>
                        <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">Archives</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Database Terminal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={fetchSubmissions} disabled={loading} className="rounded-2xl h-12 px-6 border-slate-200 font-bold gap-3 text-slate-600">
                            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync
                        </Button>
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-primary font-black">AD</div>
                    </div>
                </header>

                <div className="p-12 space-y-12 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { label: "Synced Submissions", val: submissions.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                            { label: "Average Performance", val: submissions.length > 0 ? (submissions.reduce((a, b: any) => a + (b.score || 0), 0) / submissions.length).toFixed(1) : "0.0", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
                            { label: "Latest Record", val: submissions.length > 0 ? new Date((submissions[0] as any).createdAt).toLocaleDateString() : "None", icon: Clock, color: "text-purple-600", bg: "bg-purple-50" }
                        ].map((stat, i) => (
                            <div key={i} className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-[24px] ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <p className="text-3xl font-display font-black text-slate-900">{stat.val}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[48px] overflow-hidden bg-white">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                            <div className="relative group">
                                <Search className="absolute left-5 top-4.5 w-5 h-5 text-slate-400" />
                                <Input placeholder="Search students..." className="pl-14 h-14 w-96 bg-slate-50 border-none rounded-[24px] text-lg focus-visible:ring-primary/20" />
                            </div>
                            <Button className="rounded-[24px] h-14 px-8 bg-slate-900 text-white font-black text-md shadow-xl shadow-slate-900/10">
                                Generate Export
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="px-12 py-8">Candidate Profile</th>
                                        <th className="px-12 py-8">Evaluation Data</th>
                                        <th className="px-12 py-8">Final Score</th>
                                        <th className="px-12 py-8 text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {submissions.map((sub: any) => (
                                        <tr key={sub._id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-12 py-10">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center font-display font-black text-slate-400 text-xl">
                                                        {sub.studentName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 text-xl tracking-tight">{sub.studentName}</div>
                                                        <div className="text-xs font-mono font-bold text-slate-400 mt-1 uppercase tracking-tighter">UID: {sub.studentId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-12 py-10">
                                                <div className="text-md font-black text-slate-700">{sub.courseCode}</div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] px-3 py-1 rounded-full uppercase">{sub.ctNumber}</Badge>
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Synchronized At {new Date(sub.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-12 py-10">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-4xl font-display font-black text-slate-900">{sub.score ?? '--'}</span>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency</div>
                                                        <div className={`text-xs font-black ${(sub.score || 0) >= 10 ? 'text-emerald-500' : 'text-primary'}`}>{Math.round(((sub.score || 0) / 15) * 100)}%</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-12 py-10 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="w-12 h-12 rounded-2xl border-slate-200 text-slate-400 hover:text-primary hover:border-primary/50"
                                                        onClick={() => { setSelectedSub(sub); setShowDetails(true); }}
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="w-12 h-12 rounded-2xl border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50"
                                                        onClick={() => deleteSubmission(sub._id)}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {submissions.length === 0 && (
                                <div className="py-40 text-center bg-white rounded-b-[48px]">
                                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-[40px] bg-slate-50 text-slate-200 mb-8 border border-slate-100">
                                        <Search className="w-16 h-16" />
                                    </div>
                                    <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight">System Empty</h3>
                                    <p className="text-slate-400 font-medium mt-3">Ready for new assessment data streams.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Submission Details Dialog */}
                <Dialog open={showDetails} onOpenChange={setShowDetails}>
                    <DialogContent className="max-w-4xl p-0 border-none rounded-[48px] shadow-2xl overflow-hidden" hideClose>
                        <div className="p-12 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-[32px] bg-primary flex items-center justify-center shadow-2xl shadow-primary/40">
                                    <GraduationCap className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-display font-black tracking-tight">{selectedSub?.studentName}</h3>
                                    <p className="text-slate-400 font-mono text-sm tracking-widest mt-1">TELEMETRY ID: {selectedSub?._id}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setShowDetails(false)} className="text-white hover:bg-white/10 rounded-2xl w-14 h-14">
                                <X className="w-8 h-8" />
                            </Button>
                        </div>

                        <div className="p-16 bg-[#f8fafc] grid grid-cols-2 gap-12">
                            <div className="space-y-10">
                                <div className="p-10 bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block">Candidate Outcome</label>
                                    <div className="flex items-end gap-4">
                                        <span className="text-7xl font-display font-black text-slate-900">{selectedSub?.score ?? '0'}</span>
                                        <span className="text-2xl font-display font-black text-slate-300 mb-2">/ 15</span>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                            <p className="text-emerald-500 font-black text-lg">PROCESSED</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
                                            <p className="text-slate-900 font-black text-lg">{Math.round(((selectedSub?.score || 0) / 15) * 100)}%</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block">Technical Info</label>
                                    <div className="space-y-5">
                                        {[
                                            { k: "Course Code", v: selectedSub?.courseCode },
                                            { k: "Unit Assessment", v: selectedSub?.ctNumber },
                                            { k: "Sync Node", v: "local-baust-01" },
                                            { k: "Time Finalized", v: new Date(selectedSub?.createdAt).toLocaleString() }
                                        ].map(item => (
                                            <div key={item.k} className="flex justify-between items-center text-sm">
                                                <span className="text-slate-400 font-bold">{item.k}</span>
                                                <span className="text-slate-900 font-black tracking-tight">{item.v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/20">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 block">Module Performance Breakdown</label>
                                <div className="space-y-4">
                                    {selectedSub?.scoreBreakdown && Object.entries(selectedSub.scoreBreakdown).map(([q, s]: any) => (
                                        <div key={q} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-3 h-3 rounded-full ${s > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{q}</span>
                                            </div>
                                            <span className={`text-md font-black ${s > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{s.toFixed(1)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Answer Key Editor Dialog */}
                <Dialog open={showKeyEditor} onOpenChange={setShowKeyEditor}>
                    <DialogContent className="max-w-2xl p-0 border-none rounded-[48px] shadow-2xl overflow-hidden" hideClose>
                        <div className="p-16 bg-slate-900 text-white">
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h3 className="text-4xl font-display font-black tracking-tight">Master Logic</h3>
                                    <p className="text-slate-400 font-medium mt-1">Configure automated evaluation matrices</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowKeyEditor(false)} className="text-white hover:bg-white/10 rounded-2xl w-14 h-14">
                                    <X className="w-8 h-8" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-white/30 ml-2 tracking-widest">Course Selector</label>
                                    <Input value={keyCourseCode} onChange={e => setKeyCourseCode(e.target.value)} className="bg-white/5 border-white/10 h-16 text-white font-black text-lg rounded-3xl px-8 focus:ring-primary" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-white/30 ml-2 tracking-widest">Unit Filter</label>
                                    <Input value={keyCtNumber} onChange={e => setKeyCtNumber(e.target.value)} className="bg-white/5 border-white/10 h-16 text-white font-black text-lg rounded-3xl px-8 focus:ring-primary" />
                                </div>
                            </div>
                        </div>
                        <div className="p-16 bg-white">
                            <div className="space-y-10">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block ml-2">Section A: Objective Indexing (Q1 - Q5)</label>
                                    <div className="grid grid-cols-5 gap-4">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-300 ml-1 text-center block">Q{i}</label>
                                                <Input
                                                    placeholder="Idx"
                                                    value={keyData.mcqAnswers[i] !== undefined ? keyData.mcqAnswers[i] : ""}
                                                    onChange={e => setKeyData({ ...keyData, mcqAnswers: { ...keyData.mcqAnswers, [i]: e.target.value === "" ? "" : Number(e.target.value) } })}
                                                    className="h-14 text-center font-black bg-slate-50 border-slate-100 rounded-2xl text-lg focus:ring-primary/20"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-4 ml-2 font-bold uppercase tracking-widest opacity-50">Note: Use zero-based indexing (0, 1, 2, 3) for Mcq options.</p>
                                </div>

                                <Button onClick={saveAnswerKey} className="w-full h-20 bg-slate-900 text-white font-black text-xl rounded-[32px] shadow-2xl shadow-slate-900/20 transform hover:scale-[1.01] transition-all flex gap-4">
                                    <Plus className="w-6 h-6" /> Deploy Master Key
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
};

export default AdminPanel;
