import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { api } from "../src/api";
import {
  CandidateProfile,
  EMPTY_PROFILE,
  loadApiUrl,
  loadProfile,
  saveApiUrl,
  saveProfile
} from "../src/storage";

export default function Profile() {
  const [form, setForm] = useState<CandidateProfile>(EMPTY_PROFILE);
  const [apiUrl, setApiUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([loadProfile(), loadApiUrl()])
      .then(([profile, server]) => {
        setForm(profile);
        setApiUrl(server);
      })
      .finally(() => setLoading(false));
  }, []);

  const field = (key: keyof typeof form, label: string) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={String(form[key] ?? "")}
        onChangeText={(value) => setForm({ ...form, [key]: value })}
        style={styles.input}
      />
    </View>
  );

  async function save() {
    setSaving(true);
    try {
      const server = await saveApiUrl(apiUrl);
      await saveProfile(form);

      if (!server) {
        Alert.alert(
          "Saved on this phone",
          "Your application profile is saved. Add a JobPilot server address when you are ready to import jobs."
        );
        return;
      }

      try {
        await api.saveProfile(form);
        Alert.alert("Saved", "Your profile was saved on this phone and synchronized with the JobPilot server.");
      } catch (syncError) {
        Alert.alert(
          "Saved on this phone",
          `The profile is safe on this phone, but the server could not be reached.\n\n${syncError instanceof Error ? syncError.message : String(syncError)}`
        );
      }
    } catch (e) {
      Alert.alert("Could not save", String(e));
    } finally {
      setSaving(false);
    }
  }

  async function testServer() {
    try {
      await saveApiUrl(apiUrl);
      await api.health();
      Alert.alert("Connected", "The JobPilot server is reachable.");
    } catch (e) {
      Alert.alert("Could not connect", e instanceof Error ? e.message : String(e));
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.sectionTitle}>Application details</Text>
      {field("fullName", "Legal name")}
      {field("email", "Email")}
      {field("phone", "Phone")}
      {field("city", "City")}
      <View style={styles.toggle}>
        <Text>Authorized to work in the United States</Text>
        <Switch value={form.authorizedInUS} onValueChange={(v) => setForm({ ...form, authorizedInUS: v })} />
      </View>
      <View style={styles.toggle}>
        <Text>Will require employer sponsorship</Text>
        <Switch value={form.requiresSponsorship} onValueChange={(v) => setForm({ ...form, requiresSponsorship: v })} />
      </View>
      <Text style={styles.sectionTitle}>Server connection</Text>
      <Text style={styles.help}>
        Use the HTTPS address of your deployed JobPilot API. For a server running on a computer on the same Wi-Fi, use its LAN address, for example http://192.168.1.25:4000.
      </Text>
      <TextInput
        value={apiUrl}
        onChangeText={setApiUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        placeholder="https://your-jobpilot-api.example.com"
        style={styles.input}
      />
      <Pressable onPress={testServer} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Test server</Text>
      </Pressable>
      <Pressable disabled={saving} onPress={save} style={[styles.button, saving && styles.disabled]}>
        <Text style={styles.buttonText}>{saving ? "Saving…" : "Save profile"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, gap: 14, backgroundColor: "#f8fafc", flexGrow: 1 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a", marginTop: 4 },
  help: { color: "#64748b", lineHeight: 20 },
  field: { gap: 6 },
  label: { fontWeight: "700", color: "#334155" },
  input: { backgroundColor: "white", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, padding: 12 },
  toggle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, paddingVertical: 8 },
  button: { backgroundColor: "#2563eb", borderRadius: 12, padding: 15, alignItems: "center", marginTop: 10 },
  buttonText: { color: "white", fontWeight: "800" },
  secondaryButton: { borderWidth: 1, borderColor: "#2563eb", borderRadius: 12, padding: 13, alignItems: "center" },
  secondaryButtonText: { color: "#2563eb", fontWeight: "800" },
  disabled: { opacity: 0.6 }
});
