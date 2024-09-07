import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
  };

  const goBack = () => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
    }
  };

  const goHome = () => {
    if (webViewRef.current) {
      webViewRef.current.loadUrl('https://github.com/login');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://github.com/login' }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
      />
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.button}
          onPress={goBack}
          disabled={!canGoBack}
        >
          <Ionicons name="arrow-back" size={24} color={canGoBack ? '#000' : '#ccc'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={goHome}>
          <Ionicons name="home" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    elevation: 4,
  },
  button: {
    padding: 8,
  },
});