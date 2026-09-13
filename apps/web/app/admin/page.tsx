"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import {
  adminFetchStudents,
  adminFetchStudentAudit,
  adminExtractQuestions,
  adminFetchDrafts,
  adminUpdateDraft,
  adminApproveDraft,
  adminRejectDraft,
} from "@/lib/api-client";
import { LatexRenderer } from "@/components/latex-renderer";
import { useAuth } from "@/lib/auth-context";

export default function AdminCommandCenterPage() {
  const queryClient = useQueryClient();
  const { user, isAdmin, loginAsAdmin, logout, isLoading: authLoading } = useAuth();
  const [adminKeyInput, setAdminKeyInput] = useState("");
  const [gateError, setGateError] = useState<string | null>(null);
  const [authenticating, setAuthenticating] = useState(false);
  const [activeTab, setActiveTab] = useState<"students" | "pipeline">("students");

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
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition ${
                  activeTab === "students"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>শিক্ষার্থী অডিট ও ওভারসাইট</span>
              </button>
              <button
                onClick={() => setActiveTab("pipeline")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition ${
                  activeTab === "pipeline"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>ফ্রি এআই প্রশ্ন এক্সট্রাকশন</span>
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
