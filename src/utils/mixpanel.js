import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
let isInitialized = false;

export const initMixpanel = () => {
  if (!MIXPANEL_TOKEN) {
    console.warn('Mixpanel token is missing! Check your .env.local file.');
    return;
  }

  if (isInitialized) {
    return; // Already initialized
  }

  const config = {
    debug: process.env.NODE_ENV === 'development',
    autocapture: true,
    track_pageview: true,
    persistence: 'localStorage',
    record_sessions_percent: 100, // Record all sessions since we have low traffic
    record_idle_timeout_ms: 1800000, // End recording after 30 mins of inactivity
    record_collect_fonts: true, // Collect fonts for better replay fidelity
    record_block_selector: "img, video", // Block media content by default
    record_min_ms: 5000, // Only keep recordings longer than 5 seconds
    record_mask_text_selector: ""
  };

  mixpanel.init(MIXPANEL_TOKEN, config);
  isInitialized = true;
};

// Helper function to check if Mixpanel is ready
const isMixpanelReady = () => {
  return MIXPANEL_TOKEN && isInitialized && mixpanel && typeof mixpanel.track === 'function';
};

export const trackPageView = (url) => {
  if (!isMixpanelReady()) {
    console.warn('Mixpanel not ready for trackPageView');
    return;
  }
  
  mixpanel.track('Page View', {
    page: url,
    timestamp: new Date().toISOString()
  });
};

export const trackEvent = (eventName, properties = {}) => {
  if (!isMixpanelReady()) {
    console.warn('Mixpanel not ready for trackEvent:', eventName);
    return;
  }
  
  mixpanel.track(eventName, {
    ...properties,
    timestamp: new Date().toISOString()
  });
};

export const identify = (userId, userProperties = {}) => {
  if (!isMixpanelReady()) {
    console.warn('Mixpanel not ready for identify');
    return;
  }
  
  mixpanel.identify(userId);
  if (Object.keys(userProperties).length > 0) {
    mixpanel.people.set(userProperties);
  }
};

export const trackAuth = {
  login: (method = 'unknown') => trackEvent('User Login', { method }),
  logout: () => trackEvent('User Logout'),
  signUp: (method = 'unknown') => trackEvent('User Sign Up', { method }),
  authError: (error, method = 'unknown') => trackEvent('Auth Error', { error: error.message, method })
};

export const trackDiscovery = {
  pageView: () => trackEvent('Discovery Page View'),
  sessionClick: (sessionId, sessionType) => trackEvent('Discovery Session Clicked', { sessionId, sessionType }),
  filterUsed: (filterType, filterValue) => trackEvent('Discovery Filter Used', { filterType, filterValue })
};

export const trackSettings = {
  pageView: () => trackEvent('Settings Page View'),
  settingChanged: (settingName, newValue) => trackEvent('Setting Changed', { settingName, newValue }),
  profileUpdated: () => trackEvent('Profile Updated')
};

export const trackSession = {
  pageView: (sessionId, sessionType) => trackEvent('Session Page View', { sessionId, sessionType }),
  messageExpanded: (messageIndex) => trackEvent('Session Message Expanded', { messageIndex }),
  exported: (sessionId, format) => trackEvent('Session Exported', { sessionId, format })
};

export default mixpanel;