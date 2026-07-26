import Fastify from "fastify";
import { z } from "zod";
import { DemoAdapter, submitApplication } from "./application-engine.js";
import { store } from "./store.js";

export const app = Fastify({
  logger: process.env.DISABLE_API_LOGGER !== "true"
});

app.get("/health", async () => ({ ok: true }));
app.get("/jobs", async () => ({ jobs: store.listJobs() }));
app.get("/jobs/:id", async (request, reply) => {
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const job = store.getJob(id);
  if (!job) return reply.code(404).send({ error: "Job not found" });
  return { job };
});
app.get("/resumes", async () => ({ resumes: store.listResumes() }));
app.put("/profile", async (request) => {
  const profile = z.object({
    fullName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    authorizedInUS: z.boolean().optional(),
    requiresSponsorship: z.boolean().optional(),
    answers: z.record(z.string(), z.union([z.string(), z.boolean(), z.number()])).optional()
  }).parse(request.body);
  store.saveProfile(profile);
  return { saved: true as const };
});
app.post("/applications", async (request, reply) => {
  const input = z.object({
    jobId: z.string(),
    resumeId: z.string().optional(),
    mode: z.literal("immediate")
  }).parse(request.body);
  const job = store.getJob(input.jobId);
  if (!job) return reply.code(404).send({ error: "Job not found" });
  const resume = input.resumeId
    ? store.getResume(input.resumeId)
    : store.listResumes().find((item) => item.isDefault);
  const application = await submitApplication({
    job,
    resume,
    profile: store.getProfile(),
    adapters: [new DemoAdapter()],
    allowRealSubmission: process.env.ENABLE_REAL_SUBMISSION === "true"
  });
  store.saveApplication(application);
  return {
    applicationId: application.id,
    status: application.status,
    reason: application.reason
  };
});

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT ?? 4000);
  await app.listen({ port, host: process.env.API_HOST ?? "0.0.0.0" });
}
