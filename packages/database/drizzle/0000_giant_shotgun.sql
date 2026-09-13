CREATE TYPE "public"."tenant_status" AS ENUM('ACTIVE', 'SUSPENDED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('STUDENT', 'SUPER_ADMIN');--> statement-breakpoint
CREATE TYPE "public"."difficulty_level" AS ENUM('EASY', 'MEDIUM', 'HARD');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('MCQ', 'NUMERICAL');--> statement-breakpoint
CREATE TYPE "public"."ingestion_file_type" AS ENUM('PDF', 'IMAGE');--> statement-breakpoint
CREATE TYPE "public"."ingestion_job_status" AS ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."question_draft_status" AS ENUM('DRAFT', 'APPROVED', 'REJECTED', 'FAILED_PARSE');--> statement-breakpoint
CREATE TYPE "public"."exam_type" AS ENUM('PRACTICE', 'LIVE_MODEL_TEST', 'TOPIC_QUIZ');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('IN_PROGRESS', 'SUBMITTED', 'EVALUATED');--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"status" "tenant_status" DEFAULT 'ACTIVE' NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar(64) DEFAULT 'DIRECT_B2C' NOT NULL,
	"role" "user_role" DEFAULT 'STUDENT' NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"avatar_url" text,
	"phone" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "chapters" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"chapter_number" integer NOT NULL,
	"slug" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(50) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"icon_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subjects_code_unique" UNIQUE("code"),
	CONSTRAINT "subjects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"chapter_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar(64) DEFAULT 'DIRECT_B2C' NOT NULL,
	"topic_id" integer,
	"subject_id" integer,
	"chapter_id" integer,
	"question_text" text NOT NULL,
	"question_type" "question_type" DEFAULT 'MCQ' NOT NULL,
	"options" jsonb NOT NULL,
	"correct_option_id" varchar(10) NOT NULL,
	"explanation" text,
	"latex_formulas" text[] DEFAULT '{}' NOT NULL,
	"marks" numeric(6, 2) DEFAULT '1.00' NOT NULL,
	"negative_marks" numeric(4, 2) DEFAULT '0.25' NOT NULL,
	"difficulty" "difficulty_level" DEFAULT 'MEDIUM' NOT NULL,
	"university_tags" text[] DEFAULT '{}' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_jobs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"admin_id" uuid NOT NULL,
	"source_file_url" text NOT NULL,
	"file_type" "ingestion_file_type" NOT NULL,
	"target_subject_id" integer NOT NULL,
	"target_chapter_id" integer NOT NULL,
	"status" "ingestion_job_status" DEFAULT 'PROCESSING' NOT NULL,
	"total_detected" integer DEFAULT 0 NOT NULL,
	"approved_count" integer DEFAULT 0 NOT NULL,
	"rejected_count" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" varchar(64) NOT NULL,
	"raw_image_url" text,
	"parsed_question_text" text,
	"parsed_options" jsonb,
	"parsed_correct_option" varchar(10),
	"parsed_explanation" text,
	"parsed_latex_formulas" text[] DEFAULT '{}' NOT NULL,
	"raw_response" text,
	"status" "question_draft_status" DEFAULT 'DRAFT' NOT NULL,
	"target_topic_id" integer,
	"university_tags" text[] DEFAULT '{}' NOT NULL,
	"confidence_score" numeric(4, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" varchar(64) DEFAULT 'DIRECT_B2C' NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"exam_type" "exam_type" DEFAULT 'PRACTICE' NOT NULL,
	"duration_minutes" integer NOT NULL,
	"total_marks" numeric(6, 2) DEFAULT '100.00' NOT NULL,
	"pass_marks" numeric(6, 2) DEFAULT '40.00' NOT NULL,
	"negative_marking_rate" numeric(4, 2) DEFAULT '0.25' NOT NULL,
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"total_score" numeric(6, 2) DEFAULT '0.00' NOT NULL,
	"total_attempted" integer DEFAULT 0 NOT NULL,
	"total_correct" integer DEFAULT 0 NOT NULL,
	"total_wrong" integer DEFAULT 0 NOT NULL,
	"total_unanswered" integer DEFAULT 0 NOT NULL,
	"accuracy_rate" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"time_taken_seconds" integer DEFAULT 0 NOT NULL,
	"status" "submission_status" DEFAULT 'SUBMITTED' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_option_id" varchar(10),
	"is_correct" boolean DEFAULT false NOT NULL,
	"marks_awarded" numeric(6, 2) DEFAULT '0.00' NOT NULL,
	"time_spent_seconds" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mistake_book" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"mistake_count" integer DEFAULT 1 NOT NULL,
	"is_mastered" boolean DEFAULT false NOT NULL,
	"last_attempted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mistake_book_user_question_unique" UNIQUE("user_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "user_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"total_exams_taken" integer DEFAULT 0 NOT NULL,
	"total_questions_attempted" integer DEFAULT 0 NOT NULL,
	"total_questions_correct" integer DEFAULT 0 NOT NULL,
	"overall_accuracy" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"total_study_time_seconds" integer DEFAULT 0 NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"last_active_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_analytics_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_analytics_accuracy_check" CHECK ("user_analytics"."overall_accuracy" >= 0.00 AND "user_analytics"."overall_accuracy" <= 100.00)
);
--> statement-breakpoint
CREATE TABLE "user_topic_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"topic_id" integer NOT NULL,
	"total_attempted" integer DEFAULT 0 NOT NULL,
	"total_correct" integer DEFAULT 0 NOT NULL,
	"accuracy_rate" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"mastery_score" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"last_attempted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_topic_metrics_user_topic_unique" UNIQUE("user_id","topic_id"),
	CONSTRAINT "user_topic_metrics_accuracy_check" CHECK ("user_topic_metrics"."accuracy_rate" >= 0.00 AND "user_topic_metrics"."accuracy_rate" <= 100.00),
	CONSTRAINT "user_topic_metrics_mastery_check" CHECK ("user_topic_metrics"."mastery_score" >= 0.00 AND "user_topic_metrics"."mastery_score" <= 100.00)
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_chapter_id_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_jobs" ADD CONSTRAINT "ingestion_jobs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_jobs" ADD CONSTRAINT "ingestion_jobs_target_subject_id_subjects_id_fk" FOREIGN KEY ("target_subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_jobs" ADD CONSTRAINT "ingestion_jobs_target_chapter_id_chapters_id_fk" FOREIGN KEY ("target_chapter_id") REFERENCES "public"."chapters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_drafts" ADD CONSTRAINT "question_drafts_job_id_ingestion_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."ingestion_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_drafts" ADD CONSTRAINT "question_drafts_target_topic_id_topics_id_fk" FOREIGN KEY ("target_topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_submissions" ADD CONSTRAINT "exam_submissions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_submissions" ADD CONSTRAINT "exam_submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_answers" ADD CONSTRAINT "submission_answers_submission_id_exam_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."exam_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_answers" ADD CONSTRAINT "submission_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mistake_book" ADD CONSTRAINT "mistake_book_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mistake_book" ADD CONSTRAINT "mistake_book_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_analytics" ADD CONSTRAINT "user_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_topic_metrics" ADD CONSTRAINT "user_topic_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_topic_metrics" ADD CONSTRAINT "user_topic_metrics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "questions_university_tags_gin_idx" ON "questions" USING gin ("university_tags");--> statement-breakpoint
CREATE INDEX "questions_subject_chapter_topic_idx" ON "questions" USING btree ("subject_id","chapter_id","topic_id");--> statement-breakpoint
CREATE INDEX "question_drafts_job_id_idx" ON "question_drafts" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "question_drafts_status_idx" ON "question_drafts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "exam_submissions_leaderboard_idx" ON "exam_submissions" USING btree ("exam_id","total_score" DESC NULLS LAST,"time_taken_seconds");--> statement-breakpoint
CREATE INDEX "exam_submissions_user_id_idx" ON "exam_submissions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "submission_answers_submission_id_idx" ON "submission_answers" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "submission_answers_question_id_idx" ON "submission_answers" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "mistake_book_user_mastered_last_attempt_idx" ON "mistake_book" USING btree ("user_id","is_mastered","last_attempted_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "user_topic_metrics_user_topic_idx" ON "user_topic_metrics" USING btree ("user_id","topic_id");