import { useEffect, useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { loadResumes, saveResumes, StoredResume } from "../src/storage";

export default function Resumes() {
  const [resumes, setResumeList] = useState<StoredResume[]>([]);
  useEffect(() => { void loadResumes().then(setResumeList); }, []);

  async function choose() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      copyToCacheDirectory: true
    });
    if (!result.canceled) {
      try {
        const asset = result.assets[0];
        const directory = new Directory(Paths.document, "resumes");
        directory.create({ idempotent: true, intermediates: true });
        const safeName = `${Date.now()}-${asset.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const source = new File(asset.uri);
        const destination = new File(directory, safeName);
        await source.copy(destination);

        const next: StoredResume = {
          id: `local-${Date.now()}`,
          name: asset.name.replace(/\.(pdf|docx)$/i, ""),
          originalName: asset.name,
          isDefault: resumes.length === 0,
          uri: destination.uri,
          mimeType: asset.mimeType
        };
        const updated = [...resumes, next];
        await saveResumes(updated);
        setResumeList(updated);
        Alert.alert("Résumé saved", `${asset.name} is stored privately on this phone.`);
      } catch (e) {
        Alert.alert("Could not save résumé", e instanceof Error ? e.message : String(e));
      }
    }
  }

  async function makeDefault(id: string) {
    const updated = resumes.map((resume) => ({ ...resume, isDefault: resume.id === id }));
    await saveResumes(updated);
    setResumeList(updated);
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
            {!item.isDefault ? (
              <Pressable onPress={() => void makeDefault(item.id)}>
                <Text style={styles.defaultLink}>Make default</Text>
              </Pressable>
            ) : null}
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
  defaultLink: { color: "#2563eb", fontWeight: "700", marginTop: 10 },
  empty: { textAlign: "center", color: "#64748b", marginTop: 40 }
});
