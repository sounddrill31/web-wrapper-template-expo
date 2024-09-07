import React, { useRef, useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const HOME_URL = 'https://github.com/login';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(HOME_URL);
  const colorScheme = useColorScheme();

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCurrentUrl(navState.url);
  };

  const goBack = () => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
    }
  };

  const goHome = () => {
    if (webViewRef.current) {
      setCurrentUrl(HOME_URL);
      webViewRef.current.reload();
    }
  };

  const isDarkMode = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <View style={styles.statusBarPlaceholder} />
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
      />
      <View style={[styles.bottomBar, isDarkMode ? styles.bottomBarDark : styles.bottomBarLight]}>
        <TouchableOpacity
          style={styles.button}
          onPress={goBack}
          disabled={!canGoBack}
        >
          <Ionicons name="arrow-back" size={24} color={canGoBack ? (isDarkMode ? '#fff' : '#000') : '#666'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={goHome}>
          <Ionicons name="home" size={24} color={isDarkMode ? '#fff' : '#000'} />
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
  statusBarPlaceholder: {
    height: Constants.statusBarHeight,
  },
  webview: {
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
  },
  bottomBarLight: {
    backgroundColor: '#f5f5f5',
  },
  bottomBarDark: {
    backgroundColor: '#333',
  },
  button: {
    padding: 8,
  },
});