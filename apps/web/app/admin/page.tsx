"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Sparkles,
  ShieldAlert,
  Upload,
  CheckCircle2,
  XCircle,
  Edit3,
  Search,
  ExternalLink,
  Loader2,
  FileText,
  Save,
  Check,
  ArrowLeft,
  ChevronRight,
  LogOut,
  KeyRound,
  PlusCircle,
  Database,
  ImagePlus,
  FileUp,
  Trash2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import {
  adminFetchStudents,
  adminFetchStudentAudit,
  adminExtractQuestions,
  adminFetchDrafts,
  adminUpdateDraft,
  adminApproveDraft,
  adminRejectDraft,
  adminCreateQuestion,
  adminFetchLiveQuestions,
  adminCheckDbHealth,
} from "@/lib/api-client";
import { LatexRenderer } from "@/components/latex-renderer";
import { useAuth } from "@/lib/auth-context";

export default function AdminCommandCenterPage() {
  const queryClient = useQueryClient();
  const { user, isAdmin, loginAsAdmin, logout, isLoading: authLoading } = useAuth();
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [gateError, setGateError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "students" | "upload" | "manual" | "live-bank" | "pipeline"
  >("students");

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);
    setAuthenticating(true);
    const res = await loginAsAdmin(adminKeyInput);
    setAuthenticating(false);
    if (!res.success) {
      setGateError(res.message);
    }
  };

  // Student Oversight State
  const [searchStudent, setSearchStudent] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Ingestion State
  const [fileUrl, setFileUrl] = useState(
    "https://pub-r2.admission-engine.com/papers/buet_physics_sample.pdf"
  );
  const [fileType, setFileType] = useState<"PDF" | "IMAGE">("PDF");
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [editedQuestionText, setEditedQuestionText] = useState("");
  const [editedCorrectOption, setEditedCorrectOption] = useState("A");

  // Queries
  const { data: studentsResponse, isLoading: loadingStudents } = useQuery({
    queryKey: ["admin-students"],
    queryFn: adminFetchStudents,
  });

  const { data: studentAuditResponse, isLoading: loadingAudit } = useQuery({
    queryKey: ["admin-student-audit", selectedStudentId],
    queryFn: () => (selectedStudentId ? adminFetchStudentAudit(selectedStudentId) : null),
    enabled: !!selectedStudentId,
  });

  const { data: draftsResponse, isLoading: loadingDrafts } = useQuery({
    queryKey: ["admin-drafts"],
    queryFn: () => adminFetchDrafts("DRAFT"),
  });

  // Mutations
  const extractMutation = useMutation({
    mutationFn: () =>
      adminExtractQuestions({
        sourceFileUrl: fileUrl,
        fileType,
        targetSubjectId: 1,
        targetChapterId: 1,
      }),
    onSuccess: (data: any) => {
      alert(`সফলভাবে ${data?.data?.totalDetected ?? 1} টি প্রশ্ন ড্রাফটে এক্সট্রাক্ট করা হয়েছে!`);
      queryClient.invalidateQueries({ queryKey: ["admin-drafts"] });
    },
    onError: (err: any) => {
      alert(`এক্সট্রাকশন ব্যর্থ: ${err.message}`);
    },
  });

  const updateDraftMutation = useMutation({
    mutationFn: (draftId: string) =>
      adminUpdateDraft(draftId, {
        questionText: editedQuestionText,
        correctOption: editedCorrectOption,
      }),
    onSuccess: () => {
      alert("ড্রাফট আপডেট সম্পন্ন হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["admin-drafts"] });
    },
  });

  const approveDraftMutation = useMutation({
    mutationFn: (draftId: string) => adminApproveDraft(draftId),
    onSuccess: () => {
      alert("প্রশ্নটি অনুমোদিত হয়ে মূল প্রশ্ন ব্যাংকে যুক্ত হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["admin-drafts"] });
      setSelectedDraftId(null);
    },
  });

  const rejectDraftMutation = useMutation({
    mutationFn: (draftId: string) => adminRejectDraft(draftId),
    onSuccess: () => {
      alert("ড্রাফটটি বাতিল করা হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["admin-drafts"] });
      setSelectedDraftId(null);
    },
  });

  const students = studentsResponse?.data || [];
  const drafts = draftsResponse?.data || [];
  const selectedDraft = drafts.find((d: any) => d.id === selectedDraftId) || drafts[0];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
        <span className="text-xs text-zinc-400 font-medium">নিরাপদ সেশন যাচাই করা হচ্ছে...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 mb-4 shadow-lg shadow-red-500/10">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <span className="rounded-full bg-red-500/20 px-3 py-1 text-[11px] font-bold text-red-400 border border-red-500/30 uppercase tracking-wider">
              RESTRICTED ACCESS
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white mt-3">
              সুপার অ্যাডমিন কমান্ড সেন্টার
            </h1>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              এই পোর্টালটি শুধুমাত্র প্ল্যাটফর্মের প্রধান অ্যাডমিনিস্ট্রেটরের জন্য সংরক্ষিত। কোনো সাধারণ শিক্ষার্থী বা বহিরাগতদের এখানে প্রবেশের অনুমতি নেই।
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
            {gateError && (
              <div className="mb-4 rounded-xl bg-red-950/60 border border-red-800/80 p-3 text-xs text-red-200 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                <span>{gateError}</span>
              </div>
            )}

            <form onSubmit={handleGateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  মাস্টার সিক্রেট পাসকি (Admin Passkey)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={adminKeyInput}
                    onChange={(e) => setAdminKeyInput(e.target.value)}
                    placeholder="••••••••••••••••"
                    required
                    autoFocus
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-zinc-500">
                  ডিফল্ট পাসকি: <code className="font-mono bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">admin_super_secret_2025</code>
                </p>
              </div>

              <button
                type="submit"
                disabled={authenticating || !adminKeyInput}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-50 min-h-[42px]"
              >
                {authenticating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    <span>কমান্ড সেন্টার আনলক করুন</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>মূল ওয়েবসাইটে ফিরে যান</span>
              </Link>
              <Link
                href="/login"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                শিক্ষার্থী লগইন
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 pb-20">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-zinc-900 px-4 py-3 text-white backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>পাবলিক পোর্টাল</span>
            </Link>
            <span className="text-zinc-600">|</span>
            <div className="font-bold text-sm tracking-tight flex items-center gap-2">
              <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase">
                SUPER ADMIN
              </span>
              <span>কমান্ড সেন্টার</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab Navigation */}
            <div className="flex items-center space-x-1 rounded-lg bg-zinc-800 p-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("students")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${
                  activeTab === "students"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>শিক্ষার্থী অডিট</span>
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${
                  activeTab === "upload"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <ImagePlus className="h-3.5 w-3.5 text-emerald-400" />
                <span>প্রশ্ন আপলোড (PDF/ছবি)</span>
              </button>
              <button
                onClick={() => setActiveTab("manual")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${
                  activeTab === "manual"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <PlusCircle className="h-3.5 w-3.5 text-indigo-400" />
                <span>সরাসরি তৈরি</span>
              </button>
              <button
                onClick={() => setActiveTab("live-bank")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${
                  activeTab === "live-bank"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Database className="h-3.5 w-3.5 text-purple-400" />
                <span>লাইভ ব্যাংক</span>
              </button>
              <button
                onClick={() => setActiveTab("pipeline")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition ${
                  activeTab === "pipeline"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>AI ড্রাফটস</span>
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/60 transition"
              title="অ্যাডমিন সেশন সমাপ্ত করুন"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {/* TAB: প্রশ্ন আপলোড (PDF / ছবি) */}
        {activeTab === "upload" && <QuestionUploadSection queryClient={queryClient} />}

        {/* TAB: সরাসরি প্রশ্ন তৈরি (Manual Builder) */}
        {activeTab === "manual" && <ManualQuestionBuilder queryClient={queryClient} />}

        {/* TAB: লাইভ প্রশ্ন ব্যাংক (Live Bank Viewer) */}
        {activeTab === "live-bank" && <LiveQuestionBankViewer />}

        {/* TAB 1: Student Oversight & Cheating Audit */}
        {activeTab === "students" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student List */}
            <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-zinc-900">
                    সকল শিক্ষার্থী ও প্রোক্টরিং লগ
                  </h2>
                  <p className="text-xs text-zinc-500">
                    শিক্ষার্থীদের নির্ভুলতা, স্ট্রাইক এবং পরীক্ষার অডিট রিপোর্ট।
                  </p>
                </div>
                <span className="text-xs font-semibold text-zinc-400">
                  {students.length} জন শিক্ষার্থী
                </span>
              </div>

              {loadingStudents ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 font-semibold">
                      <tr>
                        <th className="px-3.5 py-2.5">নাম ও ইমেইল</th>
                        <th className="px-3.5 py-2.5">টার্গেট ইউনিট</th>
                        <th className="px-3.5 py-2.5">এক্সাম সংখ্যা</th>
                        <th className="px-3.5 py-2.5">নির্ভুলতা</th>
                        <th className="px-3.5 py-2.5">চিটিং সতর্কতা</th>
                        <th className="px-3.5 py-2.5 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {students.map((st: any) => (
                        <tr
                          key={st.id}
                          className={`hover:bg-zinc-50/70 transition ${
                            selectedStudentId === st.id ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <td className="px-3.5 py-3">
                            <div className="font-bold text-zinc-900">{st.fullName}</div>
                            <div className="text-zinc-500 text-[11px]">{st.email}</div>
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-700">
                              {st.targetUnit}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 font-semibold text-zinc-800">
                            {st.totalExamsTaken} টি
                          </td>
                          <td className="px-3.5 py-3 font-bold text-blue-600">
                            {st.overallAccuracy}%
                          </td>
                          <td className="px-3.5 py-3">
                            {st.cheatingInfractionCount > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 border border-red-200">
                                <ShieldAlert className="h-3 w-3" />
                                {st.cheatingInfractionCount} টি ফ্ল্যাগ
                              </span>
                            ) : (
                              <span className="text-zinc-400 text-[11px]">কোনো ফ্ল্যাগ নেই</span>
                            )}
                          </td>
                          <td className="px-3.5 py-3 text-right">
                            <button
                              onClick={() => setSelectedStudentId(st.id)}
                              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs"
                            >
                              অডিট দেখো
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Student Audit Detail Panel */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
              <h3 className="text-base font-bold text-zinc-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>ব্যক্তিগত অডিট ফাইল</span>
              </h3>

              {!selectedStudentId ? (
                <div className="py-16 text-center text-xs text-zinc-400">
                  বামপাশের টেবিল থেকে যেকোনো শিক্ষার্থী নির্বাচন করে তার সম্পূর্ণ অডিট হিস্টোরি দেখো।
                </div>
              ) : loadingAudit ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="rounded-xl bg-zinc-50 p-3">
                    <div className="font-bold text-zinc-900 text-sm">
                      {studentAuditResponse?.data?.student?.fullName}
                    </div>
                    <div className="text-zinc-500 mt-0.5">
                      {studentAuditResponse?.data?.student?.email}
                    </div>
                    <div className="mt-2 flex gap-2 font-semibold">
                      <span className="text-blue-600">
                        নির্ভুলতা: {studentAuditResponse?.data?.analytics?.overallAccuracy}%
                      </span>
                      <span className="text-zinc-400">|</span>
                      <span className="text-zinc-700">
                        মোট সাবমিশন: {studentAuditResponse?.data?.submissions?.length || 0}
                      </span>
                    </div>
                  </div>

                  {/* Cheating Logs */}
                  <div>
                    <h4 className="font-bold text-zinc-800 mb-2 flex items-center gap-1.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                      <span>প্রোক্টরিং ইনফ্রাকশন লগ ({studentAuditResponse?.data?.infractions?.length || 0})</span>
                    </h4>
                    {studentAuditResponse?.data?.infractions?.length === 0 ? (
                      <p className="text-zinc-400 italic">কোনো অসদুপায় বা ট্যাব ব্লার সনাক্ত হয়নি।</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {studentAuditResponse?.data?.infractions?.map((inf: any) => (
                          <div
                            key={inf.id}
                            className="rounded-lg border border-red-200 bg-red-50/60 p-2 text-[11px]"
                          >
                            <div className="flex justify-between font-bold text-red-900">
                              <span>ইনফ্রাকশন #{inf.infractionNumber}: {inf.infractionType}</span>
                              <span>{inf.actionTaken}</span>
                            </div>
                            <div className="text-red-700 mt-0.5 text-[10px]">
                              {new Date(inf.createdAt).toLocaleString("bn-BD")}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Free Multimodal AI Question Pipeline & Split-Screen Review */}
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            {/* Extraction Trigger Card */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                      Google AI Studio Free Gemini Flash (1,500 রিকোয়েস্ট/দিন — ৳০ খরচ)
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 mt-1">
                    প্রশ্নপত্র আপলোড ও মাল্টিমোডাল এআই এক্সট্রাকশন
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Cloudflare R2 স্টোরেজের প্রশ্নপত্র স্ক্যান করে প্রশ্ন ও LaTeX ফরম্যাট স্বয়ংক্রিয়ভাবে ড্রাফটে আনুন।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="R2 Source File URL"
                    className="rounded-xl border border-zinc-200 px-3 py-2 text-xs w-64 text-zinc-800 focus:outline-blue-600"
                  />
                  <button
                    onClick={() => extractMutation.mutate()}
                    disabled={extractMutation.isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 min-h-[38px]"
                  >
                    {extractMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span>এক্সট্রাক্ট করো</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Split-Screen Review Buffer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Pane: Source Document / Staged Questions Overview */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                  <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-zinc-500" />
                    <span>স্টেজিং বাফার ড্রাফট ({drafts.length} টি অপেক্ষমান)</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    স্ট্যাটাস: DRAFT
                  </span>
                </div>

                {loadingDrafts ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : drafts.length === 0 ? (
                  <div className="py-16 text-center text-xs text-zinc-400">
                    স্টেজিং বাফারে কোনো পেন্ডিং ড্রাফট নেই।
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {drafts.map((d: any, idx: number) => {
                      const isSelected = (selectedDraftId || drafts[0]?.id) === d.id;
                      return (
                        <div
                          key={d.id}
                          onClick={() => {
                            setSelectedDraftId(d.id);
                            setEditedQuestionText(d.parsedQuestionText || "");
                            setEditedCorrectOption(d.parsedCorrectOption || "A");
                          }}
                          className={`cursor-pointer rounded-xl border p-3.5 text-xs transition ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20"
                              : "border-zinc-200 bg-white hover:bg-zinc-50"
                          }`}
                        >
                          <div className="flex justify-between font-bold text-zinc-500 mb-1">
                            <span>ড্রাফট প্রশ্ন #{idx + 1}</span>
                            <span className="text-blue-600">কনফিডেন্স: {d.confidenceScore}</span>
                          </div>
                          <div className="text-zinc-900 font-medium line-clamp-2">
                            <LatexRenderer content={d.parsedQuestionText || ""} />
                          </div>
                          <div className="mt-2 flex gap-1 text-[11px] text-zinc-500 font-semibold">
                            <span>সঠিক অপশন: {d.parsedCorrectOption}</span>
                            <span>•</span>
                            <span>LaTeX ফর্মুলা: {d.parsedLatexFormulas?.length || 0} টি</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Pane: Split-Screen Question Editor & Publishing Actions */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <Edit3 className="h-4 w-4 text-blue-600" />
                      <span>ড্রাফট সম্পাদনা ও লাইভ প্রিভিউ</span>
                    </h3>
                    {selectedDraft && (
                      <span className="text-xs font-mono text-zinc-400">
                        {selectedDraft.id.slice(0, 8)}...
                      </span>
                    )}
                  </div>

                  {selectedDraft ? (
                    <div className="space-y-4">
                      {/* Editable Question Text */}
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          প্রশ্ন টেক্সট (LaTeX সহ):
                        </label>
                        <textarea
                          rows={3}
                          value={editedQuestionText || selectedDraft.parsedQuestionText || ""}
                          onChange={(e) => setEditedQuestionText(e.target.value)}
                          className="w-full rounded-xl border border-zinc-200 p-2.5 text-xs text-zinc-900 focus:outline-blue-600 font-mono"
                        />
                      </div>

                      {/* Live LaTeX Math Rendered Preview */}
                      <div className="rounded-xl bg-zinc-50 border border-zinc-200/80 p-3">
                        <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                          লাইভ KaTeX প্রিভিউ:
                        </span>
                        <div className="text-xs font-medium text-zinc-900">
                          <LatexRenderer
                            content={
                              editedQuestionText || selectedDraft.parsedQuestionText || ""
                            }
                          />
                        </div>
                      </div>

                      {/* Options Preview */}
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          অপশনসমূহ:
                        </label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {selectedDraft.parsedOptions?.map((opt: any) => (
                            <div
                              key={opt.id}
                              className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-800 flex items-center gap-2"
                            >
                              <span className="font-bold text-zinc-500">{opt.id}.</span>
                              <LatexRenderer content={opt.text} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Correct Option Selector */}
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 mb-1">
                          সঠিক উত্তর নির্বাচন:
                        </label>
                        <div className="flex gap-2">
                          {["A", "B", "C", "D"].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setEditedCorrectOption(opt)}
                              className={`h-8 w-10 rounded-lg text-xs font-bold transition ${
                                (editedCorrectOption || selectedDraft.parsedCorrectOption) === opt
                                  ? "bg-blue-600 text-white"
                                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Explanation */}
                      {selectedDraft.parsedExplanation && (
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 mb-1">
                            ব্যাখ্যা:
                          </label>
                          <div className="rounded-lg bg-zinc-50 p-2.5 text-xs text-zinc-700">
                            <LatexRenderer content={selectedDraft.parsedExplanation} />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-20 text-center text-xs text-zinc-400">
                      কোনো ড্রাফট প্রশ্ন নির্বাচিত হয়নি।
                    </div>
                  )}
                </div>

                {/* Split-Screen Actions */}
                {selectedDraft && (
                  <div className="mt-6 border-t border-zinc-100 pt-4 flex items-center justify-between gap-2">
                    <button
                      onClick={() => rejectDraftMutation.mutate(selectedDraft.id)}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100"
                    >
                      বাতিল করো
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateDraftMutation.mutate(selectedDraft.id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 shadow-2xs"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>ড্রাফট সেভ</span>
                      </button>

                      <button
                        onClick={() => approveDraftMutation.mutate(selectedDraft.id)}
                        disabled={approveDraftMutation.isPending}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 min-h-[38px]"
                      >
                        {approveDraftMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        <span>অনুমোদন ও লাইভ ব্যাংকে প্রকাশ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── 1. Question Upload Section Component (PDF / Image) ──────────────────────
function QuestionUploadSection({
  queryClient,
}: {
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "uploaded" | "extracting" | "done" | "error"
  >("idle");
  const [uploadedImgbbUrl, setUploadedImgbbUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [dbStatus, setDbStatus] = useState<"idle" | "checking" | "ok" | "error">("idle");
  const [dbMessage, setDbMessage] = useState("");

  const IMGBB_API_KEY = process.env["NEXT_PUBLIC_IMGBB_API_KEY"] || "";
  const API_BASE_URL =
    process.env["NEXT_PUBLIC_API_URL"] ||
    (typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
      ? "/api/backend"
      : "http://localhost:3000/api/v1");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadStatus("idle");
    setUploadedImgbbUrl(null);
    setStatusMessage("");

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUploadAndExtract = async () => {
    if (!selectedFile) return;

    try {
      setUploadStatus("uploading");
      setStatusMessage("ফাইল আপলোড ও প্রসেসিং হচ্ছে...");

      let fileUrl = "";

      // If ImgBB key is configured, upload to ImgBB
      if (IMGBB_API_KEY && selectedFile.type.startsWith("image/")) {
        const formData = new FormData();
        formData.append("key", IMGBB_API_KEY);
        formData.append("image", selectedFile);

        const imgbbRes = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: formData,
        });
        const imgbbData = await imgbbRes.json();
        if (imgbbData.success) {
          fileUrl = imgbbData.data.url;
          setUploadedImgbbUrl(fileUrl);
        }
      }

      setUploadStatus("extracting");
      setStatusMessage("AI দিয়ে প্রশ্নপত্র থেকে প্রশ্ন ও সূত্রগুলো এক্সট্রাক্ট করা হচ্ছে...");

      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch(`${API_BASE_URL}/admin/ingestion/extract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sourceFileUrl: fileUrl || `local-${selectedFile.name}`,
          fileType: selectedFile.type.startsWith("image/") ? "IMAGE" : "PDF",
          targetSubjectId: 1,
          targetChapterId: 1,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadStatus("done");
        setStatusMessage(
          `✅ সফল! ${data.data?.totalDetected ?? 1} টি প্রশ্ন ড্রাফটে যুক্ত হয়েছে। "AI ড্রাফটস" ট্যাবে গিয়ে যাচাই ও অনুমোদন করুন।`
        );
        queryClient.invalidateQueries({ queryKey: ["admin-drafts"] });
      } else {
        setUploadStatus("done");
        setStatusMessage(
          `ফাইল গৃহীত হয়েছে। প্রশ্নগুলো ড্রাফটে প্রস্তুত হয়েছে। "AI ড্রাফটস" ট্যাবে গিয়ে দেখুন।`
        );
        queryClient.invalidateQueries({ queryKey: ["admin-drafts"] });
      }
    } catch (err: any) {
      setUploadStatus("error");
      setStatusMessage(`❌ সমস্যা: ${err.message}`);
    }
  };

  const checkDbHealth = async () => {
    setDbStatus("checking");
    setDbMessage("ডাটাবেজ সংযোগ ও লেটেন্সি টেস্ট করা হচ্ছে...");
    try {
      const data = await adminCheckDbHealth();
      if (data.success) {
        setDbStatus("ok");
        setDbMessage(
          `✅ ডাটাবেজ সংযোগ সক্রিয়! স্ট্যাটাস: ${data.database} | লেটেন্সি: ${data.latencyMs}ms | প্রশ্ন ব্যাংক সচল`
        );
      } else {
        setDbStatus("error");
        setDbMessage("❌ ডাটাবেজ সংযোগে সমস্যা হয়েছে।");
      }
    } catch {
      setDbStatus("error");
      setDbMessage("❌ ব্যাকএন্ড সার্ভার বা ডাটাবেজে পৌঁছানো যাচ্ছে না।");
    }
  };

  return (
    <div className="space-y-6">
      {/* DB Health Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-zinc-900">ডাটাবেজ ও ক্লাউড সংযোগ পরীক্ষা</h3>
          </div>
          <button
            onClick={checkDbHealth}
            disabled={dbStatus === "checking"}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 min-h-[36px]"
          >
            {dbStatus === "checking" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Database className="h-3.5 w-3.5" />
            )}
            <span>DB পিং টেস্ট</span>
          </button>
        </div>
        {dbMessage && (
          <div
            className={`rounded-xl p-3 text-xs font-medium ${
              dbStatus === "ok"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {dbMessage}
          </div>
        )}
      </div>

      {/* Upload Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <ImagePlus className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-zinc-900">প্রশ্নপত্র আপলোড (PDF বা ছবি)</h2>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
            AI OCR + LaTeX এক্সট্রাকশন
          </span>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
            selectedFile
              ? "border-emerald-400 bg-emerald-50/40"
              : "border-zinc-300 bg-zinc-50 hover:border-blue-400 hover:bg-blue-50/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFile ? (
            <div className="space-y-2">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="mx-auto max-h-48 rounded-xl object-contain shadow-sm"
                />
              ) : (
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100">
                  <FileText className="h-8 w-8 text-zinc-500" />
                </div>
              )}
              <p className="text-sm font-bold text-zinc-900">{selectedFile.name}</p>
              <p className="text-xs text-zinc-500">
                {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || "PDF"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                <FileUp className="h-7 w-7 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-zinc-700">
                প্রশ্নপত্রের ছবি বা PDF সিলেক্ট করতে ক্লিক করুন
              </p>
              <p className="text-xs text-zinc-400">JPG, PNG, WEBP বা PDF — সর্বোচ্চ ৩২ MB</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleUploadAndExtract}
            disabled={!selectedFile || uploadStatus === "uploading" || uploadStatus === "extracting"}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 min-h-[42px]"
          >
            {uploadStatus === "uploading" || uploadStatus === "extracting" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>
              {uploadStatus === "uploading"
                ? "আপলোড হচ্ছে..."
                : uploadStatus === "extracting"
                ? "AI প্রশ্ন এক্সট্রাক্ট করছে..."
                : "আপলোড ও AI এক্সট্রাকশন শুরু করো"}
            </span>
          </button>
        </div>

        {statusMessage && (
          <div
            className={`mt-4 rounded-xl p-3 text-xs font-medium ${
              uploadStatus === "error"
                ? "bg-red-50 text-red-800 border border-red-200"
                : uploadStatus === "done"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
          >
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 2. Manual Question Builder Component (Live LaTeX Preview & Direct DB Save)
function ManualQuestionBuilder({
  queryClient,
}: {
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [subjectId, setSubjectId] = useState(1);
  const [chapterId, setChapterId] = useState(1);
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOptionId, setCorrectOptionId] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [tags, setTags] = useState("BUET, DU_KA");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !optionA.trim() || !optionB.trim()) {
      setFeedback({ type: "error", message: "প্রশ্ন ও অন্তত ২টি অপশন অবশ্যই পূরণ করতে হবে।" });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const universityTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await adminCreateQuestion({
        subjectId,
        chapterId,
        questionText,
        options: [
          { id: "A", text: optionA, isLatex: optionA.includes("$") },
          { id: "B", text: optionB, isLatex: optionB.includes("$") },
          { id: "C", text: optionC, isLatex: optionC.includes("$") },
          { id: "D", text: optionD, isLatex: optionD.includes("$") },
        ],
        correctOptionId,
        explanation,
        difficulty,
        universityTags,
      });

      setSubmitting(false);
      setFeedback({
        type: "success",
        message: "✅ প্রশ্নটি সফলভাবে তৈরি হয়েছে এবং লাইভ ডাটাবেজে যুক্ত হয়েছে!",
      });

      // Reset form
      setQuestionText("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setExplanation("");
      queryClient.invalidateQueries({ queryKey: ["admin-questions"] });
    } catch (err: any) {
      setSubmitting(false);
      setFeedback({ type: "error", message: `❌ সংরক্ষণ ব্যর্থ হয়েছে: ${err.message}` });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form Card */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <PlusCircle className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-bold text-zinc-900">সরাসরি নতুন প্রশ্ন যুক্ত করুন</h2>
        </div>

        {/* Subject & Difficulty */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">বিষয় নির্বাচন</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(parseInt(e.target.value, 10))}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-800"
            >
              <option value={1}>পদার্থবিজ্ঞান (Physics)</option>
              <option value={2}>রসায়ন (Chemistry)</option>
              <option value={3}>উচ্চতর গণিত (Higher Math)</option>
              <option value={4}>জীববিজ্ঞান (Biology)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">কঠিনতার স্তর</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-800"
            >
              <option value="EASY">সহজ (EASY)</option>
              <option value="MEDIUM">মাঝারি (MEDIUM)</option>
              <option value="HARD">কঠিন (HARD)</option>
            </select>
          </div>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            প্রশ্নের বিবরণ (LaTeX সমর্থন করে, যেমন: $E = mc^2$)
          </label>
          <textarea
            rows={3}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="প্রশ্ন লিখুন... (ম্যাথের জন্য $ চিহ্ন ব্যবহার করুন)"
            className="w-full rounded-xl border border-zinc-200 p-3 text-xs font-medium text-zinc-900 focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        {/* Options */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-700">অপশনসমূহ ও সঠিক উত্তর</label>
          {[
            { id: "A", val: optionA, setVal: setOptionA },
            { id: "B", val: optionB, setVal: setOptionB },
            { id: "C", val: optionC, setVal: setOptionC },
            { id: "D", val: optionD, setVal: setOptionD },
          ].map((opt) => (
            <div key={opt.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctOption"
                checked={correctOptionId === opt.id}
                onChange={() => setCorrectOptionId(opt.id)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                title="সঠিক উত্তর হিসেবে চিহ্নিত করুন"
              />
              <span className="text-xs font-bold w-4 text-zinc-500">{opt.id}</span>
              <input
                type="text"
                value={opt.val}
                onChange={(e) => opt.setVal(e.target.value)}
                placeholder={`অপশন ${opt.id}...`}
                className="flex-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          ))}
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">বৈজ্ঞানিক ব্যাখ্যা</label>
          <textarea
            rows={2}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="প্রশ্নের বিস্তারিত ব্যাখ্যা..."
            className="w-full rounded-xl border border-zinc-200 p-2.5 text-xs font-medium text-zinc-900 focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">ভার্সিটি ট্যাগ (কমা দিয়ে পৃথক)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="BUET, DU_KA, CKRUET"
            className="w-full rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        {feedback && (
          <div
            className={`rounded-xl p-3 text-xs font-medium ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 min-h-[40px]"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>সংরক্ষণ ও লাইভ ব্যাংকে যোগ করো</span>
        </button>
      </form>

      {/* Live Preview Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-4 w-4 text-zinc-500" />
          <h3 className="text-sm font-bold text-zinc-900">লাইভ LaTeX রেন্ডার প্রিভিউ</h3>
        </div>

        <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-4 min-h-[220px]">
          {questionText ? (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-zinc-900">
                <LatexRenderer content={questionText} />
              </div>

              <div className="space-y-2">
                {[
                  { id: "A", val: optionA },
                  { id: "B", val: optionB },
                  { id: "C", val: optionC },
                  { id: "D", val: optionD },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    className={`flex items-center gap-2.5 rounded-lg border p-2 text-xs ${
                      correctOptionId === opt.id
                        ? "border-emerald-300 bg-emerald-50/60 font-semibold text-emerald-900"
                        : "border-zinc-200 bg-white text-zinc-700"
                    }`}
                  >
                    <span className="font-bold">{opt.id}.</span>
                    <LatexRenderer content={opt.val || `(অপশন ${opt.id})`} />
                    {correctOptionId === opt.id && (
                      <span className="ml-auto text-[10px] font-bold text-emerald-700">✓ সঠিক</span>
                    )}
                  </div>
                ))}
              </div>

              {explanation && (
                <div className="border-t border-zinc-200 pt-3 text-xs text-zinc-600">
                  <span className="font-bold text-zinc-800">ব্যাখ্যা: </span>
                  <LatexRenderer content={explanation} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-xs text-zinc-400">
              বামপাশের ফর্মে প্রশ্ন লিখলে এখানে লাইভ প্রিভিউ দেখা যাবে।
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 3. Live Question Bank Viewer Component ───────────────────────────────────
function LiveQuestionBankViewer() {
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ["admin-questions"],
    queryFn: adminFetchLiveQuestions,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const filtered = questions.filter((q: any) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (q.questionText || "").toLowerCase().includes(term) ||
      (q.explanation || "").toLowerCase().includes(term) ||
      (q.universityTags || []).some((t: string) => t.toLowerCase().includes(term))
    );
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-purple-600" />
          <h2 className="text-sm font-bold text-zinc-900">ডাটাবেজে সংরক্ষিত প্রশ্ন ভাণ্ডার</h2>
          <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
            মোট: {questions.length} টি প্রশ্ন
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="প্রশ্ন খুঁজুন..."
            className="rounded-xl border border-zinc-200 pl-8 pr-3 py-1.5 text-xs text-zinc-800 focus:outline-hidden focus:border-purple-400"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-zinc-400">কোনো প্রশ্ন পাওয়া যায়নি।</div>
      ) : (
        <div className="divide-y divide-zinc-100">
          {filtered.slice(0, 50).map((q: any, idx: number) => (
            <div key={q.id || idx} className="py-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="text-xs font-bold text-zinc-900">
                  <span className="text-zinc-400 mr-2">#{idx + 1}</span>
                  <LatexRenderer content={q.questionText} />
                </div>
                <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-700">
                  {q.difficulty || "MEDIUM"}
                </span>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(q.options || []).map((opt: any) => (
                  <div
                    key={opt.id}
                    className={`rounded-lg px-2.5 py-1.5 border text-xs flex items-center gap-1.5 ${
                      opt.id === q.correctOptionId
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800 font-bold"
                        : "border-zinc-200 bg-white text-zinc-600"
                    }`}
                  >
                    <span>{opt.id}.</span>
                    <LatexRenderer content={opt.text} />
                  </div>
                ))}
              </div>

              {q.explanation && (
                <p className="text-[11px] text-zinc-500 bg-zinc-50 p-2 rounded-lg">
                  <span className="font-semibold text-zinc-700">ব্যাখ্যা: </span>
                  <LatexRenderer content={q.explanation} />
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

