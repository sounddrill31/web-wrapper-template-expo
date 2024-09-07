import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme, BackHandler, Platform, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
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
  const [isBarVisible, setIsBarVisible] = useState(true);
  const barHeight = useRef(new Animated.Value(80)).current;
  const toggleButtonBottom = useRef(new Animated.Value(90)).current;

  const isDarkMode = colorScheme === 'dark';

  const theme = {
    barBackground: isDarkMode ? '#1E1E1E' : '#F5F5F5',
    buttonBackground: isDarkMode ? '#333333' : '#E0E0E0',
    iconColor: isDarkMode ? '#FFFFFF' : '#000000',
    toggleButtonBackground: isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(245, 245, 245, 0.8)',
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
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
      return true; // Indicate that we've handled the back action
    }
    return false; // Let the system handle the back action
  };

  const goHome = () => {
    if (webViewRef.current) {
      setCurrentUrl(HOME_URL);
      webViewRef.current.reload();
    }
  };

  const toggleBar = () => {
    const newIsBarVisible = !isBarVisible;
    setIsBarVisible(newIsBarVisible);
    
    Animated.parallel([
      Animated.timing(barHeight, {
        toValue: newIsBarVisible ? 80 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(toggleButtonBottom, {
        toValue: newIsBarVisible ? 90 : 10,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start();
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        return goBack();
      });

      return () => backHandler.remove();
    }
  }, [canGoBack]);

  // Force re-render when colorScheme changes
  useEffect(() => {
    // This empty dependency array ensures the effect runs only when colorScheme changes
  }, [colorScheme]);

  return (
    <View style={styles.container}>
      <View style={styles.statusBarPlaceholder} />
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      />
      <Animated.View style={[
        styles.bottomBar,
        { height: barHeight, backgroundColor: theme.barBackground }
      ]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.buttonBackground }]}
          onPress={goBack}
          disabled={!canGoBack}
        >
          <Ionicons name="arrow-back" size={28} color={canGoBack ? theme.iconColor : theme.iconColor + '66'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.buttonBackground }]}
          onPress={goHome}
        >
          <Ionicons name="home" size={28} color={theme.iconColor} />
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={[
        styles.toggleButton,
        { 
          bottom: toggleButtonBottom,
          backgroundColor: theme.toggleButtonBackground 
        }
      ]}>
        <TouchableOpacity onPress={toggleBar}>
          <Ionicons name={isBarVisible ? "chevron-down" : "chevron-up"} size={24} color={theme.iconColor} />
        </TouchableOpacity>
      </Animated.View>
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
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Account for iOS home indicator
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  button: {
    borderRadius: 30,
    padding: 16,
    margin: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  toggleButton: {
    position: 'absolute',
    right: 20,
    borderRadius: 20,
    padding: 12,
    zIndex: 1000,
  },
});