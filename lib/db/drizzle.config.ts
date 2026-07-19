import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// drizzle-kit resolves `schema` as a glob, which needs forward slashes even
// on Windows — path.join's backslashes silently match zero files there.
const toGlob = (p: string) => p.split(path.sep).join("/");

export default defineConfig({
  schema: toGlob(path.join(__dirname, "./src/schema/index.ts")),
  out: toGlob(path.join(__dirname, "./drizzle")),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
