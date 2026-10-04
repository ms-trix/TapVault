import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

/** B1.1 shell only — Soft Keepsake screens land in B1.2 */
export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>TapVault</Text>
      <Text style={styles.sub}>touch to open</Text>
      <Text style={styles.meta}>Expo shell ready · next: Soft Keepsake screens</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf6eb',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  brand: {
    fontFamily: 'Georgia',
    fontSize: 42,
    color: '#3f392c',
    letterSpacing: -0.5,
  },
  sub: {
    marginTop: 8,
    fontSize: 12,
    color: '#8a8170',
    letterSpacing: 1.2,
  },
  meta: {
    marginTop: 28,
    fontSize: 13,
    color: '#6f6756',
    textAlign: 'center',
  },
});
