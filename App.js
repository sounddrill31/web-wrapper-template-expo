import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme, BackHandler, Platform, Animated, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as ScreenOrientation from 'expo-screen-orientation';

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
  const [orientation, setOrientation] = useState('PORTRAIT');

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
      return false;
    }
    return true;
  }, []);

  const goBack = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
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
    const subscription = ScreenOrientation.addOrientationChangeListener((event) => {
      setOrientation(event.orientationInfo.orientation);
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        return goBack();
      });

      return () => backHandler.remove();
    }
  }, [canGoBack]);

  const isLandscape = orientation === 'LANDSCAPE_LEFT' || orientation === 'LANDSCAPE_RIGHT';

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
      flexDirection: isLandscape ? 'column' : 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTopLeftRadius: isLandscape ? 0 : 25,
      borderTopRightRadius: isLandscape ? 25 : 25,
      borderBottomRightRadius: isLandscape ? 25 : 0,
      position: 'absolute',
      bottom: isLandscape ? 0 : 0,
      left: isLandscape ? undefined : 0,
      right: 0,
      top: isLandscape ? 0 : undefined,
      width: isLandscape ? 80 : '100%',
      height: isLandscape ? '100%' : 80,
      paddingBottom: Platform.OS === 'ios' && !isLandscape ? 20 : 0,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: isLandscape ? -3 : 0, height: isLandscape ? 0 : -3 },
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
      right: isLandscape ? 90 : 20,
      bottom: isLandscape ? 20 : 90,
      borderRadius: 20,
      padding: 12,
      zIndex: 1000,
    },
  });

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
        { 
          height: isLandscape ? '100%' : barHeight,
          width: isLandscape ? 80 : '100%',
          backgroundColor: theme.barBackground 
        }
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
          bottom: isLandscape ? 20 : toggleButtonBottom,
          right: isLandscape ? 90 : 20,
          backgroundColor: theme.toggleButtonBackground 
        }
      ]}>
        <TouchableOpacity onPress={toggleBar}>
          <Ionicons 
            name={isLandscape 
              ? (isBarVisible ? "chevron-back" : "chevron-forward") 
              : (isBarVisible ? "chevron-down" : "chevron-up")
            } 
            size={24} 
            color={theme.iconColor} 
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}