import { createHash } from "node:crypto";
import { Job, JobSource } from "./domain.js";

export type AlertMessage = {
  from: string;
  subject: string;
  html: string;
  receivedAt: string;
};

function sourceFor(from: string): JobSource | undefined {
  const normalized = from.toLowerCase();
  if (normalized.includes("linkedin")) return "linkedin_alert";
  if (normalized.includes("indeed")) return "indeed_alert";
}

function text(html: string): string {
  return html.replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseAlert(message: AlertMessage): Job[] {
  const source = sourceFor(message.from);
  if (!source) return [];

  const links = [...message.html.matchAll(/href=["'](https?:\/\/[^"']+)["']/gi)]
    .map((match) => match[1].replace(/&amp;/g, "&"))
    .filter((url) => /linkedin\.com\/.*jobs|indeed\.com\/.*(viewjob|clk)|\/jobs?\//i.test(url));

  return [...new Set(links)].map((url, index) => {
    const externalId = createHash("sha256").update(url).digest("hex").slice(0, 20);
    const subject = message.subject.replace(/^(new jobs?|job alert)[:\s-]*/i, "").trim();
    return {
      id: `${source}-${externalId}`,
      source,
      externalId,
      title: subject || `Imported job ${index + 1}`,
      company: "Open listing for employer",
      location: "See listing",
      url,
      description: text(message.html).slice(0, 1000),
      postedAt: message.receivedAt,
      firstSeenAt: message.receivedAt,
      lastVerifiedAt: message.receivedAt,
      active: true,
      matchScore: 0
    };
  });
}
