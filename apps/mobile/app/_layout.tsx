import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Layout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: "#f8fafc" } }}>
        <Stack.Screen name="index" options={{ title: "JobPilot" }} />
        <Stack.Screen name="profile" options={{ title: "Application profile" }} />
        <Stack.Screen name="resumes" options={{ title: "Résumés" }} />
        <Stack.Screen name="job/[id]" options={{ title: "Job details" }} />
      </Stack>
    </>
  );
}
