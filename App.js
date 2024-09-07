import React, { useRef, useState, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';

const HOME_URL = 'https://github.com/login';
const HOME_DOMAIN = 'github.com';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(HOME_URL);
  const colorScheme = useColorScheme();

  const isDarkMode = colorScheme === 'dark';

  const theme = {
    background: isDarkMode ? '#121212' : '#FFFFFF',
    surface: isDarkMode ? '#1E1E1E' : '#F5F5F5',
    primary: isDarkMode ? '#BB86FC' : '#6200EE',
    onSurface: isDarkMode ? '#FFFFFF' : '#000000',
  };

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCurrentUrl(navState.url);
  };

  const getDomainFromUrl = (url) => {
    const matches = url.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
    return matches && matches[1];
  };

  const handleShouldStartLoadWithRequest = useCallback((event) => {
    const domain = getDomainFromUrl(event.url);
    if (domain && domain.toLowerCase() !== HOME_DOMAIN) {
      Linking.openURL(event.url);
      return false; // Prevent WebView from loading the URL
    }
    return true; // Allow WebView to load the URL
  }, []);

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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="auto" />
      <View style={styles.statusBarPlaceholder} />
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      />
      <View style={[styles.bottomBar, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={goBack}
          disabled={!canGoBack}
        >
          <Ionicons name="arrow-back" size={24} color={canGoBack ? theme.onSurface : theme.onSurface + '66'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={goHome}>
          <Ionicons name="home" size={24} color={theme.onSurface} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    padding: 8,
  },
});