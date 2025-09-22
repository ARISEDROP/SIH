export const translations: { [key: string]: any } = {
  'en-US': {
    // Login Screen
    login: {
      continueWith: 'Or continue with',
      selectRole: 'Select your role:',
      villager: 'Villager',
      healthWorker: 'Health Worker',
      loginButton: 'Login',
      noAccount: 'No account?',
      signUp: 'Sign up',
      emailPlaceholder: 'Email',
      passwordPlaceholder: 'Password',
    },
    // Header
    header: {
      villagerDashboard: 'Villager Dashboard',
      healthWorkerDashboard: 'Health Worker Dashboard',
      tagline: 'Aqua Guardian Project',
      editProfile: 'Edit Profile',
      appGuide: 'App Guide',
      deviceHealth: 'Device Health',
      storageManager: 'Storage Manager',
      hardwareSettings: 'Hardware Settings',
      hardwareManual: 'Hardware Manual',
      aboutAqua: 'About Aqua',
      logout: 'Logout',
      reportMissingData: 'Report Missing Data',
    },
    // Modals
    modals: {
      // About
      aboutTitle: 'About Aqua Guardian',
      aboutHeader: 'Smart Health Water Alert',
      aboutTagline: "Your Community's Guardian",
      ourMission: 'Our Mission',
      missionText: "To empower villagers and health workers in rural Northeast India with accessible, real-time data about water quality. We aim to prevent water-borne diseases, improve public health outcomes, and foster a proactive approach to community well-being through technology.",
      ourTeam: 'Our Team',
      teamText: "This application is a prototype developed by the Civic Tech Initiative in collaboration with regional health partners and community leaders. It represents a commitment to using technology for social good.",
      learnMore: 'Learn More About Water Safety',
      // App Guide
      appGuideTitle: 'How to Use the App',
      villagerGuideTitle: 'Villager Guide',
      healthWorkerGuideTitle: 'Health Worker Guide',
      villagerGuide: [
        { title: '1. Check Water Quality', description: "Use the 'AI Water Scanner' on your dashboard. You can run a simulated test or upload a photo of a water sample for an AI-powered analysis." },
        { title: '2. Report Symptoms', description: "If you feel unwell, tap 'Report Symptoms'. Select what you're feeling and add notes. This alerts local health workers." },
        { title: '3. Learn Safety Tips', description: "Browse the 'Safety Guides' section for essential health information, like how to boil water correctly or wash hands properly." },
        { title: '4. Ask the AI Assistant', description: "Tap the purple sparkle button to chat with Aqua, our AI. Ask questions about water safety, but always consult a health worker for medical advice." },
      ],
      healthWorkerGuide: [
        { title: '1. Monitor Villages', description: "Your dashboard shows the real-time water status for all villages. Use the list or map view to quickly assess the situation." },
        { title: '2. Manage Health Logs', description: "Review and resolve symptom reports from villagers in the 'Community Health Log'. You can also export this data for your records." },
        { title: '3. Connect Hardware', description: "Use 'OneTap Connect' to link with Bluetooth water sensors for live data streaming directly to your dashboard." },
        { title: '4. Update Safety Guides', description: "You can add, edit, or delete the safety tips that villagers see. Tap 'Manage Quick Action Tips' to keep the information current." },
      ],
      aboutProject: 'About This Project',
      // Chatbot
      askAqua: 'Ask Aqua AI',
      chatbotPlaceholder: 'Ask about water safety...',
      chatbotHello: "Hello! I'm Aqua, your personal water quality assistant. How can I help you today?",
      // Device Health
      deviceHealthTitle: 'Device Health & System Info',
      deviceHealthDescription: "This provides an overview of your device's current status based on information available to the browser. This can be useful for field operations.",
      cpu: 'CPU',
      cpuCores: 'Logical Cores',
      memory: 'Device Memory',
      ram: 'GB RAM',
      battery: 'Battery',
      charging: 'Charging',
      discharging: 'Discharging',
      storage: 'Browser Storage',
      network: 'Network',
      appStorage: 'App Storage',
      reportsQueued: 'reports queued for sync',
      notAvailable: 'Not Available',
      // Guide
      readAloud: 'Read guide aloud',
      // Hardware
      oneTapConnect: 'OneTap Connect',
      // Hardware Manual
      hardwareManualTitle: 'Hardware Manual',
      requiredSensors: 'Required Sensors',
      sensorsDescription: "To build a complete water quality monitoring unit, you will need the following key sensors connected to a microcontroller like an ESP32 or Arduino.",
      connectionSteps: 'Connection Steps',
      manualStep1: { title: 'Power On Your Sensor Unit', description: "Ensure your assembled water quality sensor unit is turned on, fully charged, and has its Bluetooth module in 'discoverable' or 'pairing' mode." },
      manualStep2: { title: 'Enable Device Bluetooth', description: "Make sure Bluetooth is enabled on the device running this app (your phone or tablet). You can usually find this in your device's settings or control center." },
      manualStep3: { title: 'Start Scanning in the App', description: "Open Hardware Settings from the user menu and tap the 'Scan for Devices' button. This will open your browser's Bluetooth device picker." },
      manualStep4: { title: 'Select and Pair Your Sensor', description: "A pop-up will appear listing nearby Bluetooth devices. Find your sensor's name (e.g., 'AquaSensor-01'), select it, and tap 'Pair' or 'Connect' to establish a connection." },
      manualFooter: "If you encounter issues, ensure no other devices are currently connected to your sensor and check the power supply.",
      // Profile
      editProfileTitle: 'Edit Profile',
      fullName: 'Full Name',
      village: 'Village',
      changeProfilePic: 'Change profile picture',
      cancel: 'Cancel',
      saveChanges: 'Save Changes',
      // Scanner Animation
      analyzing: 'ANALYSING WATER SAMPLE...',
      // Storage Manager
      storageManagerTitle: 'Storage & Data Manager',
      estimatedUsage: 'Estimated App Storage Used',
      exportJson: 'Export Log as JSON',
      exportJsonDesc: 'Save a JSON file of all symptom reports.',
      exportPdf: 'Export PDF Report',
      exportPdfDesc: 'Generate a printable PDF of the health log.',
      restoreJson: 'Restore Log from JSON',
      restoreJsonDesc: 'Load reports from a previously exported file.',
      clearData: 'Clear All Local Data',
      clearDataDesc: 'Delete all symptom reports and offline data from this device.',
      clearConfirmTitle: 'Are you sure?',
      clearConfirmText: 'This will permanently delete all symptom reports and offline data. This action cannot be undone.',
      yesClear: 'Yes, Clear Data',
      clearing: 'Clearing...',
      // Symptoms Form
      reportSymptomsTitle: 'Report Symptoms',
      whichSymptoms: 'Which symptoms are you experiencing? (Optional if notes are added)',
      additionalNotes: 'Additional Notes',
      notesPlaceholder: 'e.g., Noticed cloudy water from the community well...',
      uploadPhoto: 'Upload Photo (Optional)',
      addPhoto: 'Add Photo Evidence',
      submitReport: 'Submit Report',
      saving: 'Saving...',
      reportSaved: 'Report Saved!',
      reportSavedDesc: "Your report has been saved and will be sent when you're online.",
      // Tip Editor
      editTipTitle: 'Edit Tip',
      addTipTitle: 'Add New Tip',
      icon: 'Icon (Emoji)',
      title: 'Title',
      description: 'Description',
      steps: 'Steps (one per line)',
      saveTip: 'Save Tip',
      // Water Scan Result
      scanResultTitle: 'AI Water Quality Report',
      reportFor: 'Report for',
      on: 'on',
      confidence: 'CONFIDENCE',
      imageQualityFeedback: 'Image Quality Feedback',
      recommendations: 'Recommended Actions',
      logConcern: 'Log as Health Concern',
      close: 'Close',
      // Hardware Integration
      hwErrorTitle: "An Error Occurred",
      hwErrorGeneric: "Connection failed. Ensure the device is in range and powered on.",
      hwErrorBluetooth: "Web Bluetooth is not supported on this browser or device.",
      hwErrorPermission: "Bluetooth permission was denied. Please allow access in your browser settings.",
      hwErrorTroubleshoot: "Still having trouble? Consult the hardware manual for troubleshooting steps.",
      tryAgain: "Try Again",
      openManual: "Open Manual",
      scanningTitle: "Scanning for Devices...",
      scanningDesc: "Please select your sensor from the browser pop-up.",
      connectingTitle: "Connecting to",
      connectingDesc: "Establishing secure connection...",
      connectedTitle: "Successfully Connected!",
      connectedDesc: "Connected to",
      connectedLive: "Live data is now streaming to your dashboard.",
      safeEject: "Safe Eject",
      ejecting: "Ejecting...",
      disconnect: "Disconnect",
      connectSensorTitle: "Connect a Hardware Sensor",
      connectSensorDesc: "Use Web Bluetooth to find and stream data from a real device.",
      scanForDevices: "Scan for Devices",
      // Missing Data Report
      reportMissingDataTitle: 'Report Missing Data',
      missingDataType: 'Type of Missing Data',
      selectDataType: 'Select a data type...',
      selectDataTypeError: 'Please select a data type.',
      waterQualitySensorData: 'Water Quality Sensor Data',
      symptomReport: 'Symptom Report',
      other: 'Other',
      briefNote: 'Brief Note (Optional)',
      notePlaceholder: 'e.g., The sensor has been offline for 3 days.',
      submitting: 'Submitting...',
      reportSubmitted: 'Report Submitted',
      reportSubmittedDesc: 'Thank you. Your report has been logged locally.',
      locationError: 'Could not get your location. Report saved without location data.',
    },
    // Villager Dashboard
    villager: {
      highThreatAlert: 'High Threat Alert',
      highThreatText: 'High alert for {diseaseName} in your area. Please ensure water is boiled before consumption and wash hands frequently.',
      aiScanner: 'AI Water Scanner',
      aiScannerDesc: 'A guided process to analyze your water sample.',
      forMe: 'For Me',
      forSomeoneElse: 'For Someone Else',
      enterNamePlaceholder: 'Enter person\'s name',
      imageSourceHint: 'Select an image source below',
      takePhoto: 'Take Photo',
      fromGallery: 'From Gallery',
      runSimulatedScan: 'Run Simulated Scan',
      analyzePhoto: 'Analyze Photo Sample',
      reportSymptoms: 'Report Symptoms',
      reportSymptomsDesc: 'Feeling unwell? Log your symptoms for a health worker.',
      logSymptoms: 'Log Symptoms',
      safetyGuides: 'Safety Guides',
      openAIChat: 'Open AI Chatbot',
    },
    // Health Worker Dashboard
    healthWorker: {
      liveSensorFeed: 'Live Sensor Feed',
      sensorDiagnostics: 'Sensor Diagnostics',
      aiInterpretation: 'AI Interpretation',
      sensorHealth: 'Sensor Health',
      noSensor: 'No Sensor Connected',
      noSensorDesc: 'Connect a device to stream live water quality data.',
      connectSensor: 'Connect Sensor',
      regionalMap: 'Regional Water Quality Map',
      all: 'All',
      safe: 'Safe',
      caution: 'Caution',
      unsafe: 'Unsafe',
      list: 'List',
      map: 'Map',
      communityLog: 'Community Health Log',
      manageTips: 'Manage Quick Action Tips',
      addTip: 'Add Tip',
      confirmDeleteTitle: 'Confirm Deletion',
      confirmDeleteText: 'Are you sure you want to delete this tip? This action cannot be undone.',
      delete: 'Delete',
      confirmResolveTitle: 'Confirm Resolution',
      confirmResolveText: 'Are you sure you want to mark this symptom report as resolved?',
      confirm: 'Confirm',
      village: 'Village',
      status: 'Status',
      lastChecked: 'Last Checked',
      downloadList: 'Download list data',
      viewDetailsFor: 'View details for {villageName}',
      villageDetails: '{villageName} Details',
      currentStatus: 'Current Status',
      locationData: 'Location Data',
      kmAway: 'Approx. {distance} km away',
      history: 'Recent Quality History',
    },
    // PDF Report
    pdf: {
      reportTitle: 'Community Health Log Report',
      generatedOn: 'Generated on',
      summary: 'Overall Summary',
      totalReports: 'Total Reports',
      resolved: 'Resolved',
      unresolved: 'Unresolved',
      detailedLog: 'Detailed Log',
      reportedBy: 'Reported by',
      reported: 'Reported',
      symptoms: 'Symptoms',
      notes: 'Notes',
      originalReport: 'Original Report',
      englishTranslation: 'English Translation',
      page: 'Page',
      of: 'of',
    },
    // Tips (from constants)
    tips: {
      tip1: {
        title: 'Boil Water Guide',
        description: 'The safest way to purify water from harmful germs.',
        steps: [
          "Filter cloudy water through a clean cloth or let it settle.",
          "Bring the clear water to a rolling boil.",
          "Keep it boiling for at least 1 full minute.",
          "Let the water cool down on its own before drinking.",
          "Store the boiled water in a clean, covered container."
        ]
      },
      tip2: {
        title: 'Hand Washing Steps',
        description: 'Prevent illness with proper hand hygiene.',
        steps: [
          "Wet your hands with clean, running water.",
          "Lather your hands by rubbing them together with soap.",
          "Scrub all surfaces, including backs of hands, wrists, between fingers, and under nails.",
          "Continue scrubbing for at least 20 seconds.",
          "Rinse hands well under clean, running water.",
          "Dry your hands using a clean towel."
        ]
      },
      tip3: {
        title: 'Safe Food Prep',
        description: 'Keep your food safe from contamination.',
        steps: [
          "Wash fruits and vegetables thoroughly with safe, clean water.",
          "Use separate cutting boards and utensils for raw meat and other foods.",
          "Cook food to the proper temperature to kill any harmful bacteria.",
          "Keep food covered to protect it from flies and pests.",
          "Store perishable food in a cool place or refrigerator if available."
        ]
      },
      tip4: {
        title: 'Safe Water Storage',
        description: 'How to keep clean water safe from re-contamination.',
        steps: [
          "Use clean, covered containers with a narrow opening.",
          "Do not dip hands or dirty cups into stored water; use a long-handled ladle.",
          "Store water in a cool, dark place away from sunlight and animals.",
          "Clean storage containers regularly with soap and safe water."
        ]
      },
      tip5: {
        title: 'Spotting Unsafe Water',
        description: 'Signs that your water might be contaminated.',
        steps: [
          "Look for cloudiness or particles floating in the water.",
          "Check for any unusual color (brown, green, yellow).",
          "Smell the water for chemical, rotten egg, or sewage odors.",
          "If in doubt, do not drink. Always boil first or use a trusted filter."
        ]
      },
      tip6: {
        title: 'Monsoon & Flood Safety',
        description: 'Extra precautions during heavy rains and floods.',
        steps: [
          "Always assume that floodwater is heavily contaminated.",
          "Drink only boiled, bottled, or properly treated water.",
          "Keep food and drinking water supplies elevated and securely covered.",
          "After floods, clean and disinfect wells before using them again.",
        ]
      }
    }
  },
  'hi-IN': {
    login: {
      continueWith: 'या इसके साथ जारी रखें',
      selectRole: 'अपनी भूमिका चुनें:',
      villager: 'ग्रामीण',
      healthWorker: 'स्वास्थ्य कार्यकर्ता',
      loginButton: 'लॉग इन करें',
      noAccount: 'कोई खाता नहीं है?',
      signUp: 'साइन अप करें',
      emailPlaceholder: 'ईमेल',
      passwordPlaceholder: 'पासवर्ड',
    },
    header: {
      villagerDashboard: 'ग्रामीण डैशबोर्ड',
      healthWorkerDashboard: 'स्वास्थ्य कार्यकर्ता डैशबोर्ड',
      tagline: 'एक्वा गार्डियन प्रोजेक्ट',
      editProfile: 'प्रोफ़ाइल संपादित करें',
      appGuide: 'ऐप गाइड',
      deviceHealth: 'डिवाइस स्वास्थ्य',
      storageManager: 'स्टोरेज प्रबंधक',
      hardwareSettings: 'हार्डवेयर सेटिंग्स',
      hardwareManual: 'हार्डवेयर मैनुअल',
      aboutAqua: 'एक्वा के बारे में',
      logout: 'लॉग आउट',
      reportMissingData: 'गुम डेटा की रिपोर्ट करें',
    },
    modals: {
      aboutTitle: 'एक्वा गार्डियन के बारे में',
      aboutHeader: 'स्मार्ट हेल्थ वाटर अलर्ट',
      aboutTagline: 'आपके समुदाय का रक्षक',
      ourMission: 'हमारा लक्ष्य',
      missionText: 'ग्रामीण पूर्वोत्तर भारत में ग्रामीणों और स्वास्थ्य कार्यकर्ताओं को पानी की गुणवत्ता के बारे में सुलभ, वास्तविक समय के डेटा के साथ सशक्त बनाना। हमारा उद्देश्य जल-जनित बीमारियों को रोकना, सार्वजनिक स्वास्थ्य परिणामों में सुधार करना और प्रौद्योगिकी के माध्यम से सामुदायिक कल्याण के लिए एक सक्रिय दृष्टिकोण को बढ़ावा देना है।',
      ourTeam: 'हमारी टीम',
      teamText: 'यह एप्लिकेशन सिविक टेक इनिशिएटिव द्वारा क्षेत्रीय स्वास्थ्य भागीदारों और सामुदायिक नेताओं के सहयोग से विकसित एक प्रोटोटाइप है। यह सामाजिक भलाई के लिए प्रौद्योगिकी का उपयोग करने की प्रतिबद्धता का प्रतिनिधित्व करता है।',
      learnMore: 'जल सुरक्षा के बारे में और जानें',
      appGuideTitle: 'ऐप का उपयोग कैसे करें',
      villagerGuideTitle: 'ग्रामीण गाइड',
      healthWorkerGuideTitle: 'स्वास्थ्य कार्यकर्ता गाइड',
      villagerGuide: [
        { title: '1. पानी की गुणवत्ता जांचें', description: "अपने डैशबोर्ड पर 'एआई वाटर स्कैनर' का उपयोग करें। आप एक नकली परीक्षण चला सकते हैं या एआई-संचालित विश्लेषण के लिए पानी के नमूने की एक तस्वीर अपलोड कर सकते हैं।" },
        { title: '2. लक्षणों की रिपोर्ट करें', description: "यदि आप अस्वस्थ महसूस करते हैं, तो 'लक्षणों की रिपोर्ट करें' पर टैप करें। आप जो महसूस कर रहे हैं उसे चुनें और नोट्स जोड़ें। यह स्थानीय स्वास्थ्य कार्यकर्ताओं को सचेत करता है।" },
        { title: '3. सुरक्षा युक्तियाँ जानें', description: "आवश्यक स्वास्थ्य जानकारी के लिए 'सुरक्षा गाइड' अनुभाग ब्राउज़ करें, जैसे कि पानी को सही तरीके से कैसे उबालें या हाथ ठीक से कैसे धोएं।" },
        { title: '4. एआई सहायक से पूछें', description: "हमारे एआई, एक्वा के साथ चैट करने के लिए बैंगनी चमक वाले बटन पर टैप करें। पानी की सुरक्षा के बारे में प्रश्न पूछें, लेकिन चिकित्सा सलाह के लिए हमेशा एक स्वास्थ्य कार्यकर्ता से परामर्श करें।" },
      ],
      healthWorkerGuide: [
        { title: '1. गांवों की निगरानी करें', description: "आपका डैशबोर्ड सभी गांवों के लिए वास्तविक समय में पानी की स्थिति दिखाता है। स्थिति का त्वरित मूल्यांकन करने के लिए सूची या मानचित्र दृश्य का उपयोग करें।" },
        { title: '2. स्वास्थ्य लॉग प्रबंधित करें', description: "'सामुदायिक स्वास्थ्य लॉग' में ग्रामीणों से लक्षण रिपोर्ट की समीक्षा करें और उनका समाधान करें। आप अपने रिकॉर्ड के लिए इस डेटा को निर्यात भी कर सकते हैं।" },
        { title: '3. हार्डवेयर कनेक्ट करें', description: "सीधे अपने डैशबोर्ड पर लाइव डेटा स्ट्रीमिंग के लिए ब्लूटूथ जल सेंसर के साथ लिंक करने के लिए 'वनटैप कनेक्ट' का उपयोग करें।" },
        { title: '4. सुरक्षा गाइड अपडेट करें', description: "आप ग्रामीणों द्वारा देखे जाने वाले सुरक्षा सुझावों को जोड़, संपादित या हटा सकते हैं। जानकारी को अद्यतित रखने के लिए 'त्वरित कार्रवाई युक्तियाँ प्रबंधित करें' पर टैप करें।" },
      ],
      aboutProject: 'इस परियोजना के बारे में',
      askAqua: 'एक्वा एआई से पूछें',
      chatbotPlaceholder: 'जल सुरक्षा के बारे में पूछें...',
      chatbotHello: "नमस्ते! मैं एक्वा हूँ, आपका व्यक्तिगत जल गुणवत्ता सहायक। आज मैं आपकी कैसे मदद कर सकता हूँ?",
      reportSymptomsTitle: 'लक्षणों की रिपोर्ट करें',
      submitReport: 'रिपोर्ट सबमिट करें',
      reportMissingDataTitle: 'गुम डेटा की रिपोर्ट करें',
      missingDataType: 'गुम डेटा का प्रकार',
      selectDataType: 'एक डेटा प्रकार चुनें...',
      selectDataTypeError: 'कृपया एक डेटा प्रकार चुनें।',
      waterQualitySensorData: 'जल गुणवत्ता सेंसर डेटा',
      symptomReport: 'लक्षण रिपोर्ट',
      other: 'अन्य',
      briefNote: 'संक्षिप्त नोट (वैकल्पिक)',
      notePlaceholder: 'उदा., सेंसर 3 दिनों से ऑफ़लाइन है।',
      submitting: 'सबमिट हो रहा है...',
      reportSubmitted: 'रिपोर्ट सबमिट हो गई',
      reportSubmittedDesc: 'धन्यवाद। आपकी रिपोर्ट स्थानीय रूप से लॉग कर ली गई है।',
      locationError: 'आपका स्थान प्राप्त नहीं हो सका। रिपोर्ट को स्थान डेटा के बिना सहेजा गया है।',
    },
    pdf: {
      reportTitle: 'सामुदायिक स्वास्थ्य लॉग रिपोर्ट',
      generatedOn: 'जारी करने की तिथि',
      summary: 'समग्र सारांश',
      totalReports: 'कुल रिपोर्ट',
      resolved: 'समाधानित',
      unresolved: 'अनसुलझा',
      detailedLog: 'विस्तृत लॉग',
      reportedBy: 'द्वारा रिपोर्ट किया गया',
      reported: 'रिपोर्ट किया गया',
      symptoms: 'लक्षण',
      notes: 'टिप्पणियाँ',
      originalReport: 'मूल रिपोर्ट',
      englishTranslation: 'अंग्रेजी अनुवाद',
      page: 'पृष्ठ',
      of: 'में से',
    },
    tips: {
      tip1: {
        title: 'पानी उबालने की गाइड',
        description: 'हानिकारक कीटाणुओं से पानी को शुद्ध करने का सबसे सुरक्षित तरीका।',
        steps: [
          "गंदे पानी को एक साफ कपड़े से छान लें या इसे जमने दें।",
          "साफ पानी को अच्छी तरह उबालें।",
          "इसे कम से कम 1 पूरा मिनट तक उबलने दें।",
          "पीने से पहले पानी को अपने आप ठंडा होने दें।",
          "उबले हुए पानी को एक साफ, ढके हुए बर्तन में रखें।"
        ]
      },
      tip2: {
        title: 'हाथ धोने के चरण',
        description: 'उचित हाथ स्वच्छता से बीमारी को रोकें।',
        steps: [
          "अपने हाथों को साफ, बहते पानी से गीला करें।",
          "साबुन से अपने हाथों को आपस में रगड़कर झाग बनाएं।",
          "हाथों के पीछे, कलाई, उंगलियों के बीच और नाखूनों के नीचे सहित सभी सतहों को रगड़ें।",
          "कम से कम 20 सेकंड तक रगड़ना जारी रखें।",
          "हाथों को साफ, बहते पानी के नीचे अच्छी तरह धो लें।",
          "अपने हाथों को एक साफ तौलिये से सुखाएं।"
        ]
      },
      tip3: {
        title: 'सुरक्षित भोजन तैयारी',
        description: 'अपने भोजन को संदूषण से सुरक्षित रखें।',
        steps: [
          "फलों और सब्जियों को सुरक्षित, साफ पानी से अच्छी तरह धोएं।",
          "कच्चे मांस और अन्य खाद्य पदार्थों के लिए अलग-अलग कटिंग बोर्ड और बर्तनों का उपयोग करें।",
          "किसी भी हानिकारक बैक्टीरिया को मारने के लिए भोजन को उचित तापमान पर पकाएं।",
          "भोजन को मक्खियों और कीटों से बचाने के लिए ढक कर रखें।",
          "खराब होने वाले भोजन को ठंडी जगह या फ्रिज में रखें यदि उपलब्ध हो।"
        ]
      },
      tip4: {
        title: 'सुरक्षित जल भंडारण',
        description: 'साफ पानी को दोबारा दूषित होने से कैसे बचाएं।',
        steps: [
          "साफ, ढके हुए और संकरे मुंह वाले कंटेनरों का उपयोग करें।",
          "संग्रहीत पानी में हाथ या गंदे कप न डुबोएं; एक लंबे हैंडल वाले करछुल का उपयोग करें।",
          "पानी को धूप और जानवरों से दूर ठंडी, अंधेरी जगह पर रखें।",
          "भंडारण कंटेनरों को नियमित रूप से साबुन और सुरक्षित पानी से साफ करें।"
        ]
      },
      tip5: {
        title: 'असुरक्षित पानी की पहचान',
        description: 'संकेत कि आपका पानी दूषित हो सकता है।',
        steps: [
          "पानी में गंदगी या तैरते कणों की तलाश करें।",
          "किसी भी असामान्य रंग (भूरा, हरा, पीला) के लिए जाँच करें।",
          "रासायनिक, सड़े हुए अंडे, या सीवेज की गंध के लिए पानी को सूंघें।",
          "यदि संदेह है, तो न पिएं। हमेशा पहले उबालें या किसी विश्वसनीय फिल्टर का उपयोग करें।"
        ]
      },
      tip6: {
        title: 'मानसून और बाढ़ सुरक्षा',
        description: 'भारी बारिश और बाढ़ के दौरान अतिरिक्त सावधानियां।',
        steps: [
          "हमेशा मानें कि बाढ़ का पानी भारी रूप से दूषित है।",
          "केवल उबला हुआ, बोतलबंद या ठीक से उपचारित पानी पिएं।",
          "भोजन और पीने के पानी की आपूर्ति को ऊंचा और सुरक्षित रूप से ढका हुआ रखें।",
          "बाढ़ के बाद, कुओं का दोबारा उपयोग करने से पहले उन्हें साफ और कीटाणुरहित करें।"
        ]
      }
    }
  },
  'as-IN': { // Assamese
    login: {
      continueWith: 'অথবা ইয়াৰ সৈতে আগবাঢ়ক',
      selectRole: 'আপোনাৰ ভূমিকা নিৰ্বাচন কৰক:',
      villager: 'গাঁৱবাসী',
      healthWorker: 'স্বাস্থ্যকৰ্মী',
      loginButton: 'লগইন কৰক',
      noAccount: 'একাউণ্ট নাই?',
      signUp: 'চাইন আপ কৰক',
      emailPlaceholder: 'ইমেইল',
      passwordPlaceholder: 'পাছৱৰ্ড',
    },
    header: {
      villagerDashboard: 'গাঁৱবাসী ডেচবৰ্ড',
      healthWorkerDashboard: 'স্বাস্থ্যকৰ্মী ডেচবৰ্ড',
      tagline: 'একুৱা গাৰ্ডিয়ান প্ৰকল্প',
      editProfile: 'প্ৰফাইল সম্পাদনা কৰক',
      appGuide: 'এপ গাইড',
      deviceHealth: 'ডিভাইচ স্বাস্থ্য',
      storageManager: 'ষ্টোৰেজ মেনেজাৰ',
      hardwareSettings: 'হাৰ্ডৱেৰ ছেটিংছ',
      hardwareManual: 'হাৰ্ডৱেৰ মেনুৱেল',
      aboutAqua: 'একুৱা বিষয়ে',
      logout: 'লগ আউট',
      reportMissingData: 'হেৰুৱা ডাটা ৰিপৰ্ট কৰক',
    },
    modals: {
      reportMissingDataTitle: "হেৰুৱা ডাটা ৰিপৰ্ট কৰক",
      missingDataType: "হেৰুৱা ডাটাৰ প্ৰকাৰ",
      selectDataType: "ডাটাৰ প্ৰকাৰ বাছনি কৰক...",
      selectDataTypeError: "অনুগ্ৰহ কৰি এটা ডাটাৰ প্ৰকাৰ বাছনি কৰক।",
      waterQualitySensorData: "পানীৰ গুণগত মান চেন্সৰ ডাটা",
      symptomReport: "লক্ষণৰ প্ৰতিবেদন",
      other: "অন্য",
      briefNote: "সংক্ষিপ্ত টোকা (বৈকল্পিক)",
      notePlaceholder: "যেনে, চেন্সৰটো ৩ দিন ধৰি অফলাইন হৈ আছে।",
      submitting: "দাখিল কৰি থকা হৈছে...",
      reportSubmitted: "ৰিপৰ্ট দাখিল কৰা হ'ল",
      reportSubmittedDesc: "ধন্যবাদ। আপোনাৰ ৰিপৰ্ট স্থানীয়ভাৱে লগ কৰা হৈছে।",
      locationError: "আপোনাৰ অৱস্থান পোৱা নগ'ল। অৱস্থান ডাটা অবিহনে ৰিপৰ্ট সংৰক্ষণ কৰা হৈছে।",
    },
    pdf: {
      reportTitle: 'সামূহিক স্বাস্থ্য লগ প্ৰতিবেদন',
      generatedOn: 'জাৰি কৰা তাৰিখ',
      summary: 'সামগ্ৰিক সাৰাংশ',
      totalReports: 'মুঠ প্ৰতিবেদন',
      resolved: 'সমাধানিত',
      unresolved: 'অসমাধানিত',
      detailedLog: 'বিস্তাৰিত লগ',
      reportedBy: 'প্ৰতিবেদনকাৰী',
      reported: 'প্ৰতিবেদন কৰা',
      symptoms: 'ৰোগৰ লক্ষণ',
      notes: 'টোকা',
      originalReport: 'মূল প্ৰতিবেদন',
      englishTranslation: 'ইংৰাজী অনুবাদ',
      page: 'পৃষ্ঠা',
      of: 'ৰ',
    },
    tips: {
      tip1: {
        title: 'পানী উতলোৱা নিৰ্দেশিকা',
        description: 'हानિકারক জীবাণুৰ পৰা পানী বিশুদ্ধ কৰাৰ আটাইতকৈ নিৰাপদ উপায়।',
        steps: [
          "গোলা পানী এখন পৰিষ্কাৰ কাপোৰেৰে ছেকি লওক বা থিতাপি ল’বলৈ দিয়ক।",
          "পৰিষ্কাৰ পানীখিনি উতলিবলৈ দিয়ক।",
          "ইয়াক কমেও ১ মিনিট সময় উতলাই থাকক।",
          "খোৱাৰ আগতে পানীখিনি নিজে নিজে ঠাণ্ডা হ’বলৈ দিয়ক।",
          "উতলোৱা পানীখিনি এটা পৰিষ্কাৰ, ঢাকনি থকা পাত্ৰত সংৰক্ষণ কৰক।"
        ]
      },
      tip2: {
        title: 'হাত ধোৱাৰ পদক্ষেপ',
        description: 'সঠিক হাতৰ পৰিষ্কাৰ-পৰিচ্ছন্নতাৰে ৰোগ প্ৰতিৰোধ কৰক।',
        steps: [
          "পৰিষ্কাৰ, চলি থকা পানীৰে হাত দুখন তিয়াই লওক।",
          "চাবোনেৰে হাত দুখন একেলগে ঘঁহি ফেন উলিয়াওক।",
          "হাতৰ পিছফাল, হাতৰ কব্জি, আঙুলিৰ মাজত, আৰু নখৰ তলকে ধৰি সকলো পৃষ্ঠ ভালদৰে ঘঁহক।",
          "কমেও ২০ ছেকেণ্ড ঘঁহি থাকক।",
          "পৰিষ্কাৰ, চলি থকা পানীৰ তলত হাত ভালদৰে ধুব।",
          "পৰিষ্কাৰ টাৱেলেৰে হাত দুখন শুকুৱাই লওক।"
        ]
      },
      tip3: {
        title: 'নিৰাপদ খাদ্য প্ৰস্তুতি',
        description: 'আপোনাৰ খাদ্যক সংক্ৰমণৰ পৰা নিৰাপদে ৰাখক।',
        steps: [
          "ফল-মূল আৰু শাক-পাচলি নিৰাপদ, পৰিষ্কাৰ পানীৰে ভালদৰে ধুব।",
          "কেঁচা মাংস আৰু অন্য খাদ্যৰ বাবে পৃথক কটিং বৰ্ড আৰু সঁজুলি ব্যৱহাৰ কৰক।",
          "যিকোনো ক্ষতিকাৰক বেক্টেৰিয়া মাৰিবলৈ খাদ্য সঠিক উষ্ণতাত ৰান্ধক।",
          "মাখি আৰু কীট-পতংগৰ পৰা ৰক্ষা কৰিবলৈ খাদ্য ঢাকি ৰাখক।",
          "নষ্ট হোৱা খাদ্য ঠাণ্ডা ঠাইত বা ফ্ৰীজত সংৰক্ষণ কৰক যদি উপলব্ধ হয়।"
        ]
      },
       tip4: {
        title: 'নিৰাপদ পানী সংৰক্ষণ',
        description: 'পৰিষ্কাৰ পানীক পুনৰ দূষিত হোৱাৰ পৰা কেনেদৰে ৰক্ষা কৰিব।',
        steps: [
          "সৰু মুখৰ আৰু ঢাকনি থকা পৰিষ্কাৰ পাত্ৰ ব্যৱহাৰ কৰক।",
          "সংৰক্ষণ কৰা পানীত হাত বা লেতেৰা কাপ জুবুৰিয়াই নিদিব; দীঘল হেণ্ডেল থকা হেতা ব্যৱহাৰ কৰক।",
          "পানীক ৰ’দ আৰু জীৱ-জন্তুৰ পৰা আঁতৰত ঠাণ্ডা, আন্ধাৰ ঠাইত ৰাখক।",
          "সংৰক্ষণ পাত্ৰবোৰ নিয়মীয়াকৈ চাবোন আৰু নিৰাপদ পানীৰে পৰিষ্কাৰ কৰক।"
        ]
      },
      tip5: {
        title: 'অনিৰাপদ পানী চিনাক্তকৰণ',
        description: 'আপোনাৰ পানী দূষিত হ’ব পৰাৰ লক্ষণ।',
        steps: [
          "পানীত ডাৱৰীয়া বা плавук কণিকাৰ বাবে চাওক।",
          "যিকোনো অস্বাভাৱিক ৰঙৰ (মটিয়া, সেউজীয়া, হালধীয়া) বাবে পৰীক্ষা কৰক।",
          "ৰাসায়নিক, গেলি যোৱা কণী, বা নৰ্দমাৰ গোন্ধৰ বাবে পানী শুঙি চাওক।",
          "সন্দেহ হ’লে নাখাব। সদায় প্ৰথমে উতলাওক বা বিশ্বাসযোগ্য ফিল্টাৰ ব্যৱহাৰ কৰক।"
        ]
      },
      tip6: {
        title: 'মৌচুমী আৰু বানপানীৰ সুৰক্ষা',
        description: 'ভয়াৱহ বৰষুণ আৰু বানপানীৰ সময়ত অতিৰিক্ত সাৱধানতা।',
        steps: [
          "সদায় ধৰি লওক যে বানপানীৰ পানী অতি দূষিত।",
          "কেৱল উতলোৱা, বটলৰ, বা সঠিকভাৱে শোধিত পানী খাব।",
          "খাদ্য আৰু খোৱা পানীৰ যোগান ওপৰত আৰু সুৰক্ষিতভাৱে ঢাকি ৰাখক।",
          "বানপানীৰ পিছত, কুঁৱাবোৰ পুনৰ ব্যৱহাৰ কৰাৰ আগতে পৰিষ্কাৰ আৰু বীজাণুমুক্ত কৰক।"
        ]
      }
    }
  },
  'bn-IN': { // Bengali
    login: {
      continueWith: 'অথবা দিয়ে চালিয়ে যান',
      selectRole: 'আপনার ভূমিকা নির্বাচন করুন:',
      villager: 'গ্রামবাসী',
      healthWorker: 'স্বাস্থ্যকর্মী',
      loginButton: 'লগইন করুন',
      noAccount: 'অ্যাকাউন্ট নেই?',
      signUp: 'সাইন আপ করুন',
      emailPlaceholder: 'ইমেল',
      passwordPlaceholder: 'পাসওয়ার্ড',
    },
    header: {
      villagerDashboard: 'গ্রামবাসী ড্যাশবোর্ড',
      healthWorkerDashboard: 'স্বাস্থ্যকর্মী ড্যাশবোর্ড',
      tagline: 'অ্যাকোয়া গার্ডিয়ান প্রকল্প',
      editProfile: 'প্রোফাইল সম্পাদনা করুন',
      appGuide: 'অ্যাপ গাইড',
      deviceHealth: 'ডিভাইস স্বাস্থ্য',
      storageManager: 'স্টোরেজ ম্যানেজার',
      hardwareSettings: 'হার্ডওয়্যার সেটিংস',
      hardwareManual: 'হার্ডওয়্যার ম্যানুয়াল',
      aboutAqua: 'অ্যাকোয়া সম্পর্কে',
      logout: 'লগ আউট',
      reportMissingData: 'হারানো ডেটা রিপোর্ট করুন',
    },
    modals: {
      reportMissingDataTitle: "হারানো ডেটা রিপোর্ট করুন",
      missingDataType: "হারানো ডেটার প্রকার",
      selectDataType: "একটি ডেটার প্রকার নির্বাচন করুন...",
      selectDataTypeError: "অনুগ্রহ করে একটি ডেটার প্রকার নির্বাচন করুন।",
      waterQualitySensorData: "জল মানের সেন্সর ডেটা",
      symptomReport: "উপসর্গ রিপোর্ট",
      other: "অন্যান্য",
      briefNote: "সংক্ষিপ্ত নোট (ঐচ্ছিক)",
      notePlaceholder: "যেমন, সেন্সরটি ৩ দিন ধরে অফলাইন আছে।",
      submitting: "জমা দেওয়া হচ্ছে...",
      reportSubmitted: "রিপোর্ট জমা দেওয়া হয়েছে",
      reportSubmittedDesc: "ধন্যবাদ। আপনার রিপোর্ট স্থানীয়ভাবে লগ করা হয়েছে।",
      locationError: "আপনার অবস্থান পাওয়া যায়নি। অবস্থান ডেটা ছাড়াই রিপোর্ট সংরক্ষণ করা হয়েছে।",
    },
    pdf: {
      reportTitle: 'কমিউনিটি স্বাস্থ্য লগ রিপোর্ট',
      generatedOn: 'প্রকাশের তারিখ',
      summary: 'সামগ্রিক সারসংক্ষেপ',
      totalReports: 'মোট রিপোর্ট',
      resolved: 'সমাধানকৃত',
      unresolved: 'অমীমাংসিত',
      detailedLog: 'বিস্তারিত লগ',
      reportedBy: 'রিপোর্ট করেছেন',
      reported: 'রিপোর্ট করা হয়েছে',
      symptoms: 'উপসর্গ',
      notes: 'নোট',
      originalReport: 'মূল রিপোর্ট',
      englishTranslation: 'ইংরেজি অনুবাদ',
      page: 'পৃষ্ঠা',
      of: 'এর',
    },
    tips: {
      tip1: {
        title: 'জল ফোটানোর নির্দেশিকা',
        description: 'ক্ষতিকারক জীবাণু থেকে জল বিশুদ্ধ করার সবচেয়ে নিরাপদ উপায়।',
        steps: [
          "ঘোলা জল একটি পরিষ্কার কাপড় দিয়ে ছেঁকে নিন বা থিতু হতে দিন।",
          "পরিষ্কার জল ফুটিয়ে নিন।",
          "কমপক্ষে ১ মিনিট ধরে ফোটান।",
          "পান করার আগে জল নিজে থেকে ঠান্ডা হতে দিন।",
          "ফোটানো জল একটি পরিষ্কার, ঢাকা পাত্রে সংরক্ষণ করুন।"
        ]
      },
      tip2: {
        title: 'হাত ধোয়ার পদক্ষেপ',
        description: 'সঠিক হাত ধোয়ার মাধ্যমে রোগ প্রতিরোধ করুন।',
        steps: [
          "পরিষ্কার, চলমান জলে আপনার হাত ভেজান।",
          "সাবান দিয়ে হাত ঘষে ফেনা তৈরি করুন।",
          "হাতের পিছন, কব্জি, আঙ্গুলের মধ্যে এবং নখের নিচে সহ সমস্ত পৃষ্ঠ ঘষুন।",
          "কমপক্ষে ২০ সেকেন্ড ধরে ঘষতে থাকুন।",
          "পরিষ্কার, চলমান জলে ভাল করে হাত ধুয়ে ফেলুন।",
          "একটি পরিষ্কার তোয়ালে দিয়ে আপনার হাত শুকিয়ে নিন।"
        ]
      },
      tip3: {
        title: 'নিরাপদ খাদ্য প্রস্তুতি',
        description: 'আপনার খাবারকে দূষণ থেকে নিরাপদ রাখুন।',
        steps: [
          "ফল এবং সবজি নিরাপদ, পরিষ্কার জল দিয়ে ভালভাবে ধুয়ে নিন।",
          "কাঁচা মাংস এবং অন্যান্য খাবারের জন্য আলাদা কাটিং বোর্ড এবং বাসন ব্যবহার করুন।",
          "যেকোন ক্ষতিকারক ব্যাকটেরিয়া মারতে সঠিক তাপমাত্রায় খাবার রান্না করুন।",
          "মাছি এবং পোকামাকড় থেকে রক্ষা করার জন্য খাবার ঢেকে রাখুন।",
          "পচনশীল খাবার ঠান্ডা জায়গায় বা ফ্রিজে সংরক্ষণ করুন যদি উপলব্ধ থাকে।"
        ]
      },
      tip4: {
        title: 'নিরাপদ জল সঞ্চয়',
        description: 'পরিষ্কার জলকে পুনরায় দূষিত হওয়া থেকে কীভাবে বাঁচাবেন।',
        steps: [
          "সংকীর্ণ মুখ এবং ঢাকনা সহ পরিষ্কার পাত্র ব্যবহার করুন।",
          "সংরক্ষিত জলে হাত বা নোংরা কাপ ডোবাবেন না; একটি লম্বা হাতলযুক্ত হাতা ব্যবহার করুন।",
          "জলকে সূর্যরশ্মি এবং পশুদের থেকে দূরে ঠান্ডা, অন্ধকার জায়গায় রাখুন।",
          "সঞ্চয়ের পাত্রগুলি নিয়মিত সাবান ও নিরাপদ জল দিয়ে পরিষ্কার করুন।"
        ]
      },
      tip5: {
        title: 'অনিরাপদ জল চেনা',
        description: 'আপনার জল দূষিত হতে পারার লক্ষণ।',
        steps: [
          "জলে ঘোলাভাব বা ভাসমান কণার সন্ধান করুন।",
          "কোনো অস্বাভাবিক রঙের (বাদামী, সবুজ, হলুদ) জন্য পরীক্ষা করুন।",
          "রাসায়নিক, পচা ডিম বা নর্দমার গন্ধের জন্য জলের গন্ধ নিন।",
          "সন্দেহ হলে পান করবেন না। সর্বদা প্রথমে ফুটিয়ে নিন বা একটি বিশ্বস্ত ফিল্টার ব্যবহার করুন।"
        ]
      },
      tip6: {
        title: 'বর্ষা ও বন্যা নিরাপত্তা',
        description: 'ভারী বৃষ্টি ও বন্যার সময় অতিরিক্ত সতর্কতা।',
        steps: [
          "সর্বদা মনে রাখবেন যে বন্যার জল অত্যন্ত দূষিত।",
          "কেবল ফোটানো, বোতলজাত বা সঠিকভাবে শোধিত জল পান করুন।",
          "খাবার ও পানীয় জলের সরবরাহ উঁচু এবং সুরক্ষিতভাবে ঢাকা জায়গায় রাখুন।",
          "বন্যার পরে, কুয়োগুলি পুনরায় ব্যবহার করার আগে পরিষ্কার এবং জীবাণুমুক্ত করুন।"
        ]
      }
    }
  },
  'mni-IN': { // Manipuri (Bengali script)
    login: {
      continueWith: 'নত্র গসিদা মখা তাউ',
      selectRole: 'নহাক্কী থৌদাং খনবিয়ু:',
      villager: 'খুলবাসী',
      healthWorker: 'হাকশেলগী থবক তৌরিবা',
      loginButton: 'লগইন তৌ',
      noAccount: 'এক্কাউন্ট লৈতে?',
      signUp: 'সাইন আপ তৌ',
      emailPlaceholder: 'ইমেল',
      passwordPlaceholder: 'পাসওয়ার্ড',
    },
    header: {
      villagerDashboard: 'খুলবাসী ড্যাশবোর্ড',
      healthWorkerDashboard: 'হাকশেলগী থবক তৌরিবা ড্যাশবোর্ড',
      tagline: 'একুয়া গার্ডিয়ান প্রোজেক্ট',
      editProfile: 'প্রোফাইল সেমদোকপা',
      appGuide: 'एप গাইড',
      deviceHealth: 'ডিভাইস হাকশেল',
      storageManager: 'স্টোরেজ ম্যানেজার',
      hardwareSettings: 'হার্ডওয়্যার সেটিংস',
      hardwareManual: 'হার্ডওয়্যার ম্যানুয়াল',
      aboutAqua: 'একুয়াগী মরমদা',
      logout: 'লগ আউট',
      reportMissingData: 'মাংখ্রবা দেতা রিপোর্ট তৌ',
    },
    modals: {
      reportMissingDataTitle: "মাংখ্রবা দেতা রিপোর্ট তৌ",
      missingDataType: "মাংখ্রবা দেতাগী মখল",
      selectDataType: "দেতা মখল অম খল্লু...",
      selectDataTypeError: "অদোমগী দেতা মখল অমা খল্লু।",
      waterQualitySensorData: "ঈশিংগী গুনस्तर সেন্সর দেতা",
      symptomReport: "লক্ষণ রিপোর্ট",
      other: "অতৈ",
      briefNote: "অকুপ্পা নোট (অপশনাল)",
      notePlaceholder: "খুদম ওইনা, সেন্সর অসিনা নুমিৎ ৩ দি অফলাইন ওইদুনা লৈরে।",
      submitting: "সাবমিট তৌরি...",
      reportSubmitted: "রিপোর্ট সাবমিট তৌখ্রে",
      reportSubmittedDesc: "থগৎচরি। নহাক্কী রিপোর্ট অদু লোকেল ওইনা লগ তৌখ্রে।",
      locationError: "নহাক্কী মফম ফংবা ঙমদ্রে। মফমগী দেতা য়াওদনা রিপোর্ট সেভ তৌখ্রে।",
    },
    pdf: {
      reportTitle: 'খুন্নাইগী হকশেল লগ রিপোর্ট',
      generatedOn: 'প্রকাশ তৌবগী নুমিৎ',
      summary: 'অপুনবা ৱারোম',
      totalReports: 'অপুনবা রিপোর্টশিং',
      resolved: 'ৱারোইশินখ্রে',
      unresolved: 'ৱারোইশিন্নদ্রিবা',
      detailedLog: 'অকুপ্পা লগ',
      reportedBy: 'রিপোর্ট তৌবিরিবা',
      reported: 'রিপোর্ট তৌখি',
      symptoms: 'অনা-লাইনাগী মওং',
      notes: 'অকুপ্পা ৱাফম',
      originalReport: 'অরিবা রিপোর্ট',
      englishTranslation: 'ইংলিশতা হন্দোকপা',
      page: 'লমাই',
      of: 'গী',
    },
    tips: {
      tip1: {
        title: 'ঈশিং থুমহনবগী কৈরিক',
        description: 'অশোইবা জীবানুশিংদগী ঈশিং শুদ্ধ তৌবগী খুৱাইদগী নিংথিজরবা উপাই।',
        steps: [
          "নোপ্পা ঈশিং অদু ফি অমনা মরুপ্না চেকৌ নত্রগদি থুমহনবিয়ু।",
          "লুবা ঈশিং অদু ফজরেনা থুমহনবিয়ু।",
          "মদু খুৱাইদগী তানা মিনিট ১ ফাওবা থুমদুনা লৈহনবিয়ু।",
          "থকনবগী মমাংদা ঈশিং অদু মসানা মসানা যেন্থহনবিয়ু।",
          "থুমহল্লবা ঈশিং অদু অশা-বা, কুপশিনবা পাত্রদা থম্বিয়ু।"
        ]
      },
      tip2: {
        title: 'খুৎ হম্বগী স্টেপশিং',
        description: 'সহি খুৎ হম্বগী মাধ্যমদগী লাইনادগী ঙাকথোক-উ।',
        steps: [
          "নহাক্কী খুৎশা অদু লুবা, তুরেলগী ঈশিংনা তোত্থহনবিয়ু।",
          "সাবোনগা লোইননা খুৎশা অদু নাইদুনা লিং ককথোক-উ।",
          "খুৎকী মপান্দা, খুৎকী মফমদা, খুৎকী মরক্তা অমসুং খুৎকী মখাদা ফাওবা پুম্নমক নাইবিয়ু।",
          "খুৱাইদগী তানা সেকেন্ড ২০ ফাওবা নাইদুনা লৈহনবিয়ু।",
          "লুবা, তুরেলগী ঈশিংগী মখাদা ফজরেনা খুৎশা অদু হম্বিয়ু।",
          "নহাক্কী খুৎশা অদু অশা-বা ফি অমনা হengthok-উ।"
        ]
      },
      tip3: {
        title: 'নিরাপদ চরোন প্রস্তুতি',
        description: 'নহাক্কী চরোন অদু অশোইবদগী নিংথিনা থম্বিয়ু।',
        steps: [
          "হৈ অমসুং নপিশিং অদু নিংথিজরবা, লুবা ঈশিংনা ফজরেনা হম্বিয়ু।",
          "অশংবা সগা অমসুং অতৈ চরোনশিংগীদমক তোঙান তোঙানবা কাটিং বোর্ড অমসুং পাত্রশিং শিজিন্নবিয়ু।",
          "যেকোন অশোইবা ব্যাকটেরিযاشیং মংহনবগীদমক চরোন অদু সহি তাপমানদা থোংবিয়ু।",
          "হৈচিং অমসুং পোকশিংদগী ঙাকথোকনবগীদমক চরোন অদু কুপশিন্দুনা থম্বিয়ু।",
          "ফত্তবা চরোনশিং অদু অইংবা মফমদা নত্রগদি ফংলবদি ফ্রিজদা থম্বিয়ু।"
        ]
      },
      tip4: {
        title: 'নিরাপদ ঈশিং থমজিনবা',
        description: 'লু-নাবা ঈশিং অদু অমুক হন্না মাংহনদনা কনগনি।',
        steps: [
          "অপিকপা মचिন অমসুং কুপশিনবা থোং লৈবা লু-নাবা পাত্রশিং শিজিন্নবিয়ু।",
          "থমজিনবা ঈশিংদা খুৎ নত্রগা মমোৎ তায়বা কোপশিং থাদবিয়ু; অশাংবা খুৎ লৈবা চাওকা শিজিন্নবিয়ু।",
          "ঈশিং অদু নুমিৎ অমসুং শানশিংদগী লাপনা অইং-অশাবা, অমম্বা মফমদা থম্বিয়ু।",
          "থমজিনবগী পাত্রশিং অদু মতম মতমগী ওইনা সাবোন অমসুং নিংথিজরবা ঈশিংনা তাঙ্কক্না হম্বিয়ু।"
        ]
      },
      tip5: {
        title: 'অনিরাপদ ঈশিং খঙদোকপা',
        description: 'নহাক্কী ঈশিং অদু মাংখ্রবা য়াই হায়বগী খুদম।',
        steps: [
          "ঈশিংদা লুম্বা নত্রগা পাম্বি মচাশীং লৈবরা হায়বদু য়েংবিয়ু।",
          "যেকোন অচৌবা মচু (খ্বাং, অশাংবা, অঙাংবা) লৈবরা হায়বদু চেক তৌবিয়ু।",
          "রাসায়নিক, অথুম্বা মচি, নত্রগা নোংথক্কী নুংশিৎ লৈবরা হায়বদু ঈশিংদা নুংশিবিয়ু।",
          "চিংনরবদি থকপীরুনু। মতম পুম্নমক্তা অহানবদা থুমহনবিয়ু নত্রগা থাজনীংঙাই ওইরবা ফিল্টার শিজিন্নবিয়ু।"
        ]
      },
      tip6: {
        title: 'নোংজু অমসুং ঈচাওগী নিরাপত্তা',
        description: 'অকনবা নোং অমসুং ঈচাওগী মতমদা অহেনবা চেকশিন থৌরাং।',
        steps: [
          "মতম পুম্নমক্তা খঙবিয়ু মদুদি ঈচাওগী ঈশিং অদু অকনবা মাংখ্রবনি।",
          "থুমহনবা, বোটলদা থম্বা, নত্রগা মওং তানা শুদ্ধ তৌরবা ঈশিং খক্তা থকপিয়ু।",
          "চিনজাক অমসুং থকনবগী ঈশিংগী পোৎলমশিং অদু অৱাংবা অমসুং নিংথিনা কুপশিনবা মফমদা থম্বিয়ু।",
          "ঈচাওগী মতুংদা, কুৱাশিং অদু অমুক হন্না শিজিন্নবগী মমাংদা ফজরেনা হন্দোক-উ অমসুং জীবানু মুক্ত তৌবিয়ু।"
        ]
      }
    }
  }
};
