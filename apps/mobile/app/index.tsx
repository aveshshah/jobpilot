import { useCallback, useEffect, useState } from "react";
import { Link, useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from "react-native";
import { api, Job } from "../src/api";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const result = await api.jobs();
      setJobs(result.jobs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load jobs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => void load(), [load]);
  useFocusEffect(useCallback(() => void load(), [load]));

  if (loading) return <ActivityIndicator style={styles.center} size="large" />;

  return (
    <View style={styles.page}>
      <View style={styles.toolbar}>
        <Link href="/profile" style={styles.link}>Profile</Link>
        <Link href="/resumes" style={styles.link}>Résumés</Link>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No imported jobs yet. Connect Gmail and enable LinkedIn and Indeed email alerts.
          </Text>
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: "/job/[id]", params: { id: item.id } }} asChild>
            <Pressable style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.score}>{item.matchScore}%</Text>
              </View>
              <Text style={styles.company}>{item.company}</Text>
              <Text style={styles.meta}>{item.location} · {item.source.replace("_alert", "")}</Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: "#f8fafc" },
  center: { flex: 1 },
  toolbar: { flexDirection: "row", justifyContent: "flex-end", gap: 20, marginBottom: 14 },
  link: { color: "#2563eb", fontWeight: "700" },
  card: { padding: 16, borderRadius: 14, backgroundColor: "white", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  title: { flex: 1, fontSize: 17, fontWeight: "700", color: "#0f172a" },
  score: { color: "#166534", fontWeight: "800" },
  company: { marginTop: 6, color: "#334155", fontWeight: "600" },
  meta: { marginTop: 4, color: "#64748b" },
  error: { color: "#b91c1c", marginBottom: 12 },
  empty: { color: "#64748b", textAlign: "center", marginTop: 60, lineHeight: 22 }
});
