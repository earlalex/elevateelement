export const elevateElementConfig = {
    devMode: true, // <-- Turn auditing on/off easily
    // --- Framework Configuration ---
    framework: {
        useShadowDOM: false, // Set to false to disable Shadow DOM by default
        shadowDOMMode: 'open', // 'open' or 'closed' when Shadow DOM is enabled
    },
    // --- Project Overview ---
    projectName: '', // Optional: A name for the overall project (e.g., "Client X Digital Overhaul")
  
    // --- Basic Business Information (Shared) ---
    businessInfo: {
      name: 'Test Company', // Official business name
      dba: 'DBA Test', // Doing Business As (if applicable)
      address: {
        street: '',
        city: '',
        state: '', // e.g., AZ
        zip: '',
        country: 'USA', // Default or specify
      },
      phone: '000-000-00000', // Primary contact phone number
      email: 'test@email.com', // Primary contact email address
      hours: '', // Business hours (e.g., "M-F 9am-5pm MST")
      purposeStatement: '',
      missionStatement: '',
      values: {
        1:'',
        2:'',
        3:'',
        4:'',
        5:'',
        6:'',
        7:'',
        8:'',
        9:'',
      },
      kpi: {
        1:{
          category: '',
          metric: ''
        },
        2:{
          category: '',
          metric: ''
        },
        3:{
          category: '',
          metric: ''
        },
        4:{
          category: '',
          metric: ''
        },
        5:{
          category: '',
          metric: ''
        },
        6:{
          category: '',
          metric: ''
        },
        7:{
          category: '',
          metric: ''
        },
        8:{
          category: '',
          metric: ''
        },
        9:{
          category: '',
          metric: ''
        },
        10:{
          category: '',
          metric: ''
        },
        11:{
          category: '',
          metric: ''
        },
        12:{
          category: '',
          metric: ''
        }
      },
      usp: '', // Unique Selling Proposition - what makes them different?
    },

    // --- Overall Digital Presence Goals (Web & App) ---
    digitalPresenceGoals: {
      primaryPurposeWeb: '', // e.g., 'Lead Generation', 'E-commerce Sales', 'Info Hub'
      primaryPurposeApp: '', // e.g., 'Companion Experience', 'On-the-Go Access', 'Specific Tool'
      targetAudience: '', // Description of their ideal user (covers both web & app)
      kpisWeb: [], // Key Performance Indicators for Website (Array of strings)
      kpisApp: [], // Key Performance Indicators for App (Array of strings)
      competitorsWeb: [ /* URLs */ ],
      competitorsApps: [ /* App Store links or names */ ],
    },
  
    // --- Branding & Design (Shared) ---
    branding: {
      logoUrl: '', // URL/Path to high-resolution logo file
      appIconUrl: '', // URL/Path to app icon file (often needs specific sizes)
      colorPalette: {
        primary: '', // Hex code (e.g., '#FF5733')
        secondary: '', // Hex code
        accent: '', // Hex code
        // Add more if needed
      },
      fonts: {
        primary: '', // Font family name (e.g., 'Montserrat')
        secondary: '', // Font family name
      },
      brandVoice: '', // Keywords describing tone (e.g., 'Friendly', 'Professional')
      styleInspirationUrlsWeb: [ /* URLs */ ],
      styleInspirationApps: [ /* App Store links or names */ ],
    },
  
    // --- Website Specific Details ---
    websiteInfo: {
      content: {
        sitemap: [ /* 'Home', 'About', 'Services', 'Blog', 'Contact' */ ],
        willProvideCopy: null, // boolean
        willProvideImages: null, // boolean
        willProvideVideo: null, // boolean
        mainCallToAction: '', // e.g., 'Request a Quote'
        testimonials: [ /* { quote:'', author:'', company:''} */ ],
      },
      features: {
        requiredFeatures: [ /* 'Contact Form', 'Blog', 'E-commerce', 'Gallery' */ ],
        contactFormFields: [ /* 'Name', 'Email', 'Message' */ ],
        ecommerce: {
          needed: false,
          paymentGateways: [],
          shippingInfo: '',
          taxInfo: '',
        },
        integrations: [ /* 'Google Analytics', 'Mailchimp', 'CRM' */ ],
      },
      technical: {
        domain: {
          name: '',
          owned: null,
          registrarLoginProvided: false,
        },
        hosting: {
          provider: '',
          owned: null,
          loginProvided: false,
        },
        emailProvider: '',
      },
      legal: {
        privacyPolicyRequired: true,
        termsConditionsRequired: false,
        cookieConsentRequired: true,
      },
    },
  
    // --- Mobile App Specific Details ---
    mobileApp: {
      needed: true, // Set to false if only website is being built
      appName: '', // Name as it should appear in app stores
      platforms: [], // Target platforms: ['iOS', 'Android']
      developmentApproach: '', // e.g., 'Native iOS', 'Native Android', 'React Native', 'Flutter', 'Web View Wrapper'
      coreFunctionality: '', // High-level description of what the app does
      keyFeatures: [ // List specific app features
          // 'Offline Data Access', 'Push Notifications', 'Camera Integration', 'Location Services'
      ],
      content: { // App-specific content needs
        willSyncWithWebsite: null, // boolean: Does content need to mirror website?
        appSpecificScreens: [], // List screens unique to the app
        willProvideCopy: null, // boolean (can differ from web)
        willProvideAssets: null, // boolean (specific images/icons for app)
      },
      userAccounts: {
        required: false, // boolean: Does the app need user login?
        sharedWithWeb: null, // boolean: Use the same accounts as website?
        loginMethods: [], // e.g., ['Email/Password', 'Google Sign-In', 'Apple Sign-In']
      },
      monetization: {
        strategy: 'Free', // 'Free', 'Paid Download', 'In-App Purchases', 'Subscription', 'Advertisements'
        details: '', // Specifics on pricing, ad networks, etc.
      },
      technical: {
        apiRequired: null, // boolean: Does the app need to communicate with a backend API?
        apiDetails: '', // URL or documentation link if exists, or "Needs building"
        offlineSupport: false, // boolean: Does it need to function without internet?
        pushNotifications: false, // boolean: Will it send push notifications?
        pushNotificationTypes: '', // Description (e.g., 'Marketing alerts', 'New content updates')
      },
      distribution: {
        // Info needed for App Store / Google Play submission
        iosDevAccountReady: null, // boolean: Client has Apple Developer Account?
        androidDevAccountReady: null, // boolean: Client has Google Play Developer Account?
        appStoreInfo: { // Placeholder for store listing text
            shortDescription: '',
            longDescription: '',
            keywords: [], // Array of strings
            category: '', // e.g., 'Business', 'Utilities', 'Entertainment'
            initialScreenshotsProvided: false, // boolean
        },
      },
      legal: { // App-specific legal needs
          privacyPolicyUrl: '', // Often same as web, but needs to be accessible in-app/store listing
          termsConditionsUrl: '', // If applicable
          eulaRequired: false, // End User License Agreement needed?
      }
    },
  };