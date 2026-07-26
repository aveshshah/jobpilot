import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { api } from "../src/api";

export default function Profile() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    authorizedInUS: true,
    requiresSponsorship: false
  });

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
    try {
      await api.saveProfile(form);
      Alert.alert("Saved", "Your application profile was saved.");
    } catch (e) {
      Alert.alert("Could not save", String(e));
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
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
      <Pressable onPress={save} style={styles.button}><Text style={styles.buttonText}>Save profile</Text></Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20, gap: 14, backgroundColor: "#f8fafc", flexGrow: 1 },
  field: { gap: 6 },
  label: { fontWeight: "700", color: "#334155" },
  input: { backgroundColor: "white", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 10, padding: 12 },
  toggle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, paddingVertical: 8 },
  button: { backgroundColor: "#2563eb", borderRadius: 12, padding: 15, alignItems: "center", marginTop: 10 },
  buttonText: { color: "white", fontWeight: "800" }
});
