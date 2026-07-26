import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { DemoAdapter, submitApplication } from "./application-engine.js";
import { store } from "./store.js";

const server = new McpServer({
  name: "jobpilot",
  version: "0.1.0"
});

server.registerTool("search_jobs", {
  description: "List active jobs imported from approved LinkedIn and Indeed email alerts",
  inputSchema: { query: z.string().optional() }
}, async ({ query }) => {
  const normalized = query?.toLowerCase();
  const jobs = store.listJobs().filter((job) =>
    !normalized || `${job.title} ${job.company} ${job.location}`.toLowerCase().includes(normalized)
  );
  return { content: [{ type: "text", text: JSON.stringify(jobs) }] };
});

server.registerTool("list_resumes", {
  description: "List résumé versions available for applications"
}, async () => ({
  content: [{ type: "text", text: JSON.stringify(store.listResumes()) }]
}));

server.registerTool("submit_application", {
  description: "Submit a job application after deterministic preflight validation",
  inputSchema: {
    jobId: z.string(),
    resumeId: z.string()
  }
}, async ({ jobId, resumeId }) => {
  const job = store.getJob(jobId);
  const resume = store.getResume(resumeId);
  if (!job) throw new Error("Job not found");
  const result = await submitApplication({
    job,
    resume,
    profile: store.getProfile(),
    adapters: [new DemoAdapter()],
    allowRealSubmission: process.env.ENABLE_REAL_SUBMISSION === "true"
  });
  store.saveApplication(result);
  return { content: [{ type: "text", text: JSON.stringify(result) }] };
});

await server.connect(new StdioServerTransport());
