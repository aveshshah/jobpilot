import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { api, Job } from "../../src/api";
import { loadResumes, StoredResume } from "../../src/storage";

export default function JobDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job>();
  const [resumes, setResumes] = useState<StoredResume[]>([]);
  const [resumeId, setResumeId] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.job(id), loadResumes()]).then(([j, r]) => {
      setJob(j.job);
      setResumes(r);
      setResumeId(r.find((x) => x.isDefault)?.id ?? r[0]?.id);
    }).catch((e) => Alert.alert("Unable to load", String(e)));
  }, [id]);

  async function apply() {
    setSubmitting(true);
    try {
      const result = await api.apply(id, resumeId);
      if (result.status === "blocked") {
        Alert.alert("Input required", result.reason ?? "This form needs your attention.");
      } else {
        Alert.alert("Application submitted", `Tracking ID: ${result.applicationId}`);
      }
    } catch (e) {
      Alert.alert("Application failed", e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (!job) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>{job.title}</Text>
      <Text style={styles.company}>{job.company}</Text>
      <Text style={styles.meta}>{job.location} · Match {job.matchScore}%</Text>
      <Text style={styles.heading}>Résumé</Text>
      <View style={styles.choices}>
        {resumes.map((resume) => (
          <Pressable
            key={resume.id}
            onPress={() => setResumeId(resume.id)}
            style={[styles.choice, resumeId === resume.id && styles.selected]}
          >
            <Text>{resume.name}{resume.isDefault ? " · Default" : ""}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.heading}>Description</Text>
      <Text style={styles.body}>{job.description || "Open the original listing for its complete description."}</Text>
      <Pressable disabled={submitting || !resumeId} onPress={apply} style={styles.apply}>
        <Text style={styles.applyText}>{submitting ? "Applying…" : "Apply now"}</Text>
      </Pressable>
      <Text style={styles.note}>
        Your selected résumé must be synchronized with the server before submission. Automatic submission stops when CAPTCHA, consent, sensitive disclosure, or an unknown required question is detected.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: "#f8fafc", flexGrow: 1 },
  title: { fontSize: 25, fontWeight: "800", color: "#0f172a" },
  company: { fontSize: 17, marginTop: 8, color: "#334155" },
  meta: { marginTop: 4, color: "#64748b" },
  heading: { marginTop: 24, marginBottom: 8, fontWeight: "800", fontSize: 16 },
  choices: { gap: 8 },
  choice: { padding: 13, backgroundColor: "white", borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  selected: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  body: { color: "#334155", lineHeight: 22 },
  apply: { marginTop: 28, padding: 16, borderRadius: 12, backgroundColor: "#2563eb", alignItems: "center" },
  applyText: { color: "white", fontSize: 17, fontWeight: "800" },
  note: { marginTop: 12, color: "#64748b", fontSize: 12, lineHeight: 17 }
});
