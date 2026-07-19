ALTER TABLE "articles" ADD COLUMN "language" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "title_en" text;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "summary_en" text;
