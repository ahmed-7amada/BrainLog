/**
 * Jest Test Setup
 * Global configuration and mocks for all tests
 */

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const {View} = require('react-native');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

// Mock @react-native-firebase/app
jest.mock('@react-native-firebase/app', () => ({
  firebase: {
    app: jest.fn(() => ({
      auth: jest.fn(),
      database: jest.fn(),
    })),
  },
}));

// Mock @react-native-firebase/auth
jest.mock('@react-native-firebase/auth', () => () => ({
  signInWithCredential: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  currentUser: null,
}));

// Mock @react-native-firebase/database
jest.mock('@react-native-firebase/database', () => () => ({
  ref: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    once: jest.fn(),
    push: jest.fn(),
    orderByChild: jest.fn(() => ({
      equalTo: jest.fn(),
      startAt: jest.fn(),
      endAt: jest.fn(),
    })),
  })),
}));

// Mock @react-native-google-signin/google-signin
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    isSignedIn: jest.fn(),
    getCurrentUser: jest.fn(),
    getTokens: jest.fn(),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

// Mock @notifee/react-native
jest.mock('@notifee/react-native', () => ({
  requestPermission: jest.fn(),
  displayNotification: jest.fn(),
  createChannel: jest.fn(),
  cancelNotification: jest.fn(),
  cancelAllNotifications: jest.fn(),
  getInitialNotification: jest.fn(),
  onForegroundEvent: jest.fn(),
  onBackgroundEvent: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    delete: jest.fn(),
    getAllKeys: jest.fn(() => []),
    clearAll: jest.fn(),
  })),
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Global test timeout
jest.setTimeout(30000);

// Console error/warn suppressions for expected warnings
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
      args[0].includes('Warning: An update to') ||
      args[0].includes('act(...)'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Animated: `useNativeDriver`')
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};
