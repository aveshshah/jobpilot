import { useEffect, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { api, Resume } from "../src/api";

export default function Resumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  useEffect(() => { api.resumes().then((r) => setResumes(r.resumes)); }, []);

  async function choose() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      copyToCacheDirectory: true
    });
    if (!result.canceled) {
      Alert.alert("Upload endpoint ready", `Selected ${result.assets[0].name}. Connect production object storage before uploading personal files.`);
    }
  }

  return (
    <View style={styles.page}>
      <Pressable onPress={choose} style={styles.button}><Text style={styles.buttonText}>Upload résumé</Text></Pressable>
      <FlatList
        data={resumes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No résumés uploaded.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.originalName}{item.isDefault ? " · Default" : ""}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 20, backgroundColor: "#f8fafc" },
  button: { backgroundColor: "#2563eb", padding: 15, borderRadius: 12, alignItems: "center", marginBottom: 18 },
  buttonText: { color: "white", fontWeight: "800" },
  card: { padding: 15, borderRadius: 12, backgroundColor: "white", marginBottom: 10 },
  name: { fontWeight: "800", color: "#0f172a" },
  meta: { color: "#64748b", marginTop: 4 },
  empty: { textAlign: "center", color: "#64748b", marginTop: 40 }
});
