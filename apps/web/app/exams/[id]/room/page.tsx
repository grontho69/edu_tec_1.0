"use client";

import React, { use } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const DynamicExamHall = dynamic(
  () => import("@/components/exam-hall").then((mod) => mod.ExamHall),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-600">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-sm font-medium">পরীক্ষা হল প্রস্তুত হচ্ছে...</span>
      </div>
    ),
  }
);

interface ExamRoomProps {
  params: Promise<{ id: string }>;
}

export default function ExamRoomPage({ params }: ExamRoomProps) {
  const { id: examId } = use(params);

  return <DynamicExamHall examId={examId} />;
}
