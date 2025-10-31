export type Language = "en" | "vi";

export interface Translation {
  // Header
  signIn: string;
  signOut: string;
  welcome: string;
  findStations: string;
  pricing: string;
  support: string;
  dashboard: string;
  
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  findStationsButton: string;
  learnMore: string;
  
  // Features
  whyChooseTitle: string;
  whyChooseSubtitle: string;
  ultraFastCharging: string;
  ultraFastChargingDesc: string;
  easyBooking: string;
  easyBookingDesc: string;
  nationwideNetwork: string;
  nationwideNetworkDesc: string;
  
  // Hero Features (short versions)
  fastChargingShort: string;
  availableAlwaysShort: string;
  locationsShort: string;
  
  // CTA Section
  readyToStartTitle: string;
  readyToStartSubtitle: string;
  getStartedToday: string;
  goToDashboard: string;
  viewPricing: string;
  downloadApp: string;
  
  // Station Finder
  findChargingStations: string;
  findChargingStationsDesc: string;
  searchPlaceholder: string;
  searchStationsPlaceholder: string;
  filterStations: string;
  all: string;
  available: string;
  fastCharging: string;
  availableNow: string;
  rating: string;
  bookNow: string;
  
  // Map and Station Layout
  mapView: string;
  listView: string;
  viewLayout: string;
  stationLayout: string;
  chargingPoints: string;
  chargingPoint: string;
  ports: string;
  
  // Map Legend
  stationStatusLegend: string;
  availableStatus: string;
  limitedStatus: string;
  busyStatus: string;
  foundStations: string;
  filters: string;
  noStationsFound: string;
  noStationsFoundDesc: string;
  inUse: string;
  maintenance: string;
  offline: string;
  bookThisPoint: string;
  anyAvailable: string;
  statusOverview: string;
  stationDetails: string;
  quickActions: string;
  getDirections: string;
  callStation: string;
  reportIssue: string;
  facilities: string;
  entrances: string;
  connectorType: string;
  powerLevel: string;
  estimatedTime: string;
  currentUser: string;
  
  // Booking Modal
  bookChargingSession: string;
  selectDateTime: string;
  selectDate: string;
  selectTime: string;
  duration: string;
  hours: string;
  reviewBooking: string;
  bookingDetails: string;
  totalCost: string;
  confirmBooking: string;
  bookingConfirmed: string;
  bookingConfirmedDesc: string;
  viewDashboard: string;
  close: string;
  
  // Login/Auth
  signInTitle: string;
  signUpTitle: string;
  createAccount: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  vehicleInfo: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  batteryCapacity: string;
  rememberMe: string;
  forgotPassword: string;
  noAccount: string;
  haveAccount: string;
  signUp: string;
  signInDemo: string;
  demoAccounts: string;
  customer: string;
  staff: string;
  admin: string;
  selectRole: string;
  roleSelection: string;
  selectRoleToFillEmail: string;
  demoPassword: string;
  
  // Placeholders
  emailPlaceholder: string;
  passwordPlaceholder: string;
  fullNamePlaceholder: string;
  phoneNumberPlaceholder: string;
  vehicleMakePlaceholder: string;
  vehicleModelPlaceholder: string;
  vehicleYearPlaceholder: string;
  batteryCapacityPlaceholder: string;
  
  // Profile
  profile: string;
  profileSettings: string;
  personalInfo: string;
  personalInformation: string;
  updatePersonalDetails: string;
  vehicleInformation: string;
  updateVehicleDetails: string;
  security: string;
  securitySettings: string;
  changePassword: string;
  currentPassword: string;
  newPassword: string;
  accountStats: string;
  accessDenied: string;
  pleaseLoginToViewProfile: string;
  updateProfileSuccess: string;
  updateVehicleSuccess: string;
  updateFailed: string;
  passwordChangedSuccess: string;
  passwordsDoNotMatch: string;
  passwordTooShort: string;
  fillAllPasswordFields: string;
  saving: string;
  // Password requirements box
  passwordRequirementsTitle: string;
  passwordRequirementMinLength: string;
  passwordRequirementLettersAndNumbers: string;
  passwordRequirementNoReuse: string;
  
  // Dashboard
  myDashboard: string;
  overview: string;
  bookings: string;
  settings: string;
  totalSessions: string;
  totalSpent: string;
  memberSince: string;
  upcomingBookings: string;
  recentBookings: string;
  confirmed: string;
  completed: string;
  cancelled: string;
  inProgress: string;
  
  // Analytics
  analytics: string;
  comprehensiveAnalytics: string;
  revenueAnalytics: string;
  usageAnalytics: string;
  stationAnalytics: string;
  customerAnalytics: string;
  forecastingAnalytics: string;
  realTimeMetrics: string;
  dailyRevenue: string;
  monthlyGrowth: string;
  totalRevenue: string;
  averagePerSession: string;
  profitMargin: string;
  totalUsers: string;
  revenue: string;
  activeBookings: string;
  systemHealth: string;
  peakUsageHours: string;
  weeklyPattern: string;
  utilizationRate: string;
  customerSatisfaction: string;
  topStations: string;
  maintenanceAlerts: string;
  stationHealth: string;
  expansionRecommendations: string;
  demandForecast: string;
  revenueForecast: string;
  seasonalTrends: string;
  personalAnalytics: string;
  chargingInsights: string;
  spendingAnalysis: string;
  usagePatterns: string;
  efficiency: string;
  insights: string;
  achievements: string;
  carbonSaved: string;
  energyUsed: string;
  favoriteStation: string;
  chargingHistory: string;
  costPerKwh: string;
  sessionsThisMonth: string;
  averageDuration: string;
  environmentalImpact: string;
  
  // Pricing
  choosePlan: string;
  choosePlanDesc: string;
  monthly: string;
  annual: string;
  save: string;
  mostPopular: string;
  getStartedFree: string;
  choosePlan2: string;
  savingsCalculator: string;
  lightUser: string;
  regularUser: string;
  heavyUser: string;
  // Pricing plan specific
  planBasicName: string;
  planBasicDescription: string;
  planBasicFeature1: string;
  planBasicFeature2: string;
  planBasicFeature3: string;
  planBasicFeature4: string;

  planPlusName: string;
  planPlusDescription: string;
  planPlusFeature1: string;
  planPlusFeature2: string;
  planPlusFeature3: string;
  planPlusFeature4: string;
  planPlusFeature5: string;

  planPremiumName: string;
  planPremiumDescription: string;
  planPremiumFeature1: string;
  planPremiumFeature2: string;
  planPremiumFeature3: string;
  planPremiumFeature4: string;
  planPremiumFeature5: string;
  planPremiumFeature6: string;
  pricingPlanPricePer: string;
  savingsLabel: string;
  statsChargingStations: string;
  statsUptime: string;
  statsActiveUsers: string;
  statsSessions: string;
  faqTitle: string;
  faqChangePlanTitle: string;
  faqChangePlanDesc: string;
  faqRefundsTitle: string;
  faqRefundsDesc: string;
  faqPaymentsTitle: string;
  faqPaymentsDesc: string;
  faqHiddenFeesTitle: string;
  faqHiddenFeesDesc: string;
  
  // Support
  howCanWeHelp: string;
  howCanWeHelpDesc: string;
  callUs: string;
  supportAvailable: string;
  liveChat: string;
  avgResponse: string;
  emailSupport: string;
  responseTime: string;
  startChat: string;
  sendEmail: string;
  faq: string;
  contactUs: string;
  systemStatus: string;
  
  // Support FAQ
  frequentlyAskedQuestions: string;
  searchForAnswers: string;
  selectCategory: string;
  allTopics: string;
  chargingSessions: string;
  technicalIssues: string;
  billingPayment: string;
  reservations: string;
  noFaqsFound: string;
  
  // FAQ Items
  faqQ1: string;
  faqA1: string;
  faqQ2: string;
  faqA2: string;
  faqQ3: string;
  faqA3: string;
  faqQ4: string;
  faqA4: string;
  faqQ5: string;
  faqA5: string;
  faqQ6: string;
  faqA6: string;
  
  // Contact Form
  submitSupportTicket: string;
  subject: string;
  subjectPlaceholder: string;
  category: string;
  selectIssueCategory: string;
  categoryCharging: string;
  categoryBilling: string;
  categoryTechnical: string;
  categoryAccount: string;
  categoryOther: string;
  priority: string;
  priorityLow: string;
  priorityMedium: string;
  priorityHigh: string;
  priorityUrgent: string;
  message: string;
  messagePlaceholder: string;
  submitTicket: string;
  fillAllFields: string;
  ticketSubmitted: string;
  
  // Contact Info
  contactInformation: string;
  supportHotline: string;
  headquarters: string;
  supportHours: string;
  emergencyContacts: string;
  stationEmergency: string;
  emergencyMessage: string;
  
  // System Status
  allSystemsOperational: string;
  operationalStatus: string;
  coreServices: string;
  chargingNetwork: string;
  mobileApp: string;
  paymentSystem: string;
  supportServices: string;
  customerSupport: string;
  accountManagement: string;
  webPortal: string;
  recentUpdates: string;
  statusUpdate1Title: string;
  statusUpdate1Desc: string;
  statusUpdate2Title: string;
  statusUpdate2Desc: string;
  
  // Footer
  powering: string;
  quickLinks: string;
  services: string;
  contactUsFooter: string;
  dcFastCharging: string;
  level2Charging: string;
  fleetSolutions: string;
  businessPartnerships: string;
  privacyPolicy: string;
  termsOfService: string;
  cookiePolicy: string;
  allRightsReserved: string;
  
  // Common
  loading: string;
  error: string;
  success: string;
  cancel: string;
  save2: string;
  edit: string;
  delete: string;
  back: string;
  next: string;
  previous: string;
  search: string;
  filter: string;
  
  // Staff/Admin
  staffDashboard: string;
  adminDashboard: string;
  stationManagement: string;
  userManagement: string;
  bookingManagement: string;
  reports: string;
  systemSettings: string;
  addStation: string;
  editStation: string;
  deleteStation: string;
  stationStatus: string;
  operational: string;
  manageUsers: string;
  viewBookings: string;
  generateReport: string;
}

export const translations: Record<Language, Translation> = {
  en: {
    // Header
    signIn: "Sign In",
    signOut: "Sign Out",
    welcome: "Welcome",
    findStations: "Find Stations",
    pricing: "Pricing",
    support: "Support",
    dashboard: "Dashboard",
    
    // Hero Section
    heroTitle: "Reliable EV Charging",
    heroSubtitle: "Find, book, and pay for electric vehicle charging stations nationwide. Fast, reliable, and convenient charging when you need it.",
    findStationsButton: "Find Stations",
    learnMore: "Learn More",
    
    // Features
    whyChooseTitle: "Why Choose ChargeTech?",
    whyChooseSubtitle: "Experience the future of electric vehicle charging with our reliable, fast, and user-friendly charging network.",
    ultraFastCharging: "Ultra-Fast Charging",
    ultraFastChargingDesc: "Up to 350kW charging speeds to get you back on the road quickly.",
    easyBooking: "Easy Booking",
    easyBookingDesc: "Reserve your charging slot in advance with our simple booking system.",
    nationwideNetwork: "Nationwide Network",
    nationwideNetworkDesc: "Access to over 500 charging stations across the country.",
    
    // Hero Features (short versions)
    fastChargingShort: "Up to 350kW",
    availableAlwaysShort: "Always open", 
    locationsShort: "500+ locations",
    
    // CTA Section
    readyToStartTitle: "Ready to Start Charging?",
    readyToStartSubtitle: "Join thousands of EV drivers who choose ChargeTech for their charging needs.",
    getStartedToday: "Get Started Today",
    goToDashboard: "Go to Dashboard",
    viewPricing: "View Pricing",
    downloadApp: "Download App",
    
    // Station Finder
    findChargingStations: "Find Charging Stations",
    findChargingStationsDesc: "Locate the nearest charging stations and book slots in advance. Real-time availability and instant confirmation.",
    searchPlaceholder: "Search by station name or address",
    searchStationsPlaceholder: "Search stations by name or location...",
    filterStations: "Filter Stations",
    all: "All",
    available: "Available",
    fastCharging: "Fast Charging",
    availableNow: "Available Now",
    rating: "Rating",
    bookNow: "Book Now",
    
    // Map and Station Layout
    mapView: "Map View",
    listView: "List View",
    viewLayout: "View Layout",
    stationLayout: "Station Layout",
    chargingPoints: "Charging Points",
    chargingPoint: "Charging Point",
    ports: "ports",
    
    // Map Legend
    stationStatusLegend: "Station Status",
    availableStatus: "Available (50%+)",
    limitedStatus: "Limited (20-50%)",
    busyStatus: "Busy (<20%)",
    foundStations: "Found {count} charging stations",
    filters: "Filters",
    noStationsFound: "No stations found",
    noStationsFoundDesc: "Try adjusting your search terms or clearing the search to see all stations.",
    inUse: "In Use",
    maintenance: "Maintenance",
    offline: "Offline",
    bookThisPoint: "Book This Point",
    anyAvailable: "Book Any Available",
    statusOverview: "Status Overview",
    stationDetails: "Station Details",
    quickActions: "Quick Actions",
    getDirections: "Get Directions",
    callStation: "Call Station",
    reportIssue: "Report Issue",
    facilities: "Facilities",
    entrances: "Entrances",
    connectorType: "Connector Type",
    powerLevel: "Power Level",
    estimatedTime: "Estimated Time",
    currentUser: "Current User",
    
    // Booking Modal
    bookChargingSession: "Book Charging Session",
    selectDateTime: "Select Date & Time",
    selectDate: "Select Date",
    selectTime: "Select Time",
    duration: "Duration",
    hours: "hours",
    reviewBooking: "Review Booking",
    bookingDetails: "Booking Details",
    totalCost: "Total Cost",
    confirmBooking: "Confirm Booking",
    bookingConfirmed: "Booking Confirmed!",
    bookingConfirmedDesc: "Your charging session has been successfully booked. You'll receive a confirmation email shortly.",
    viewDashboard: "View Dashboard",
    close: "Close",
    
    // Login/Auth
    signInTitle: "Sign In",
    signUpTitle: "Sign Up",
    createAccount: "Create Account",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    vehicleInfo: "Vehicle Information",
    vehicleMake: "Vehicle Make",
    vehicleModel: "Vehicle Model",
    vehicleYear: "Vehicle Year",
    batteryCapacity: "Battery Capacity (kWh)",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    signUp: "Sign Up",
    signInDemo: "Sign In with Demo",
    demoAccounts: "Demo Accounts",
    customer: "Customer",
    staff: "Staff",
    admin: "Admin",
    selectRole: "Select Role",
    roleSelection: "Role Selection",
    selectRoleToFillEmail: "Select a role to auto-fill email",
    demoPassword: "Demo password: <strong>123</strong>",
    
    // Placeholders
    emailPlaceholder: "your@email.com",
    passwordPlaceholder: "••••••••",
    fullNamePlaceholder: "John Doe",
    phoneNumberPlaceholder: "+1 234 567 890",
    vehicleMakePlaceholder: "Tesla",
    vehicleModelPlaceholder: "Model 3",
    vehicleYearPlaceholder: "2023",
    batteryCapacityPlaceholder: "75",
    
    // Profile
    profile: "Profile",
    profileSettings: "Profile Settings",
    personalInfo: "Personal Info",
    personalInformation: "Personal Information",
    updatePersonalDetails: "Update Personal Details",
    vehicleInformation: "Vehicle Information",
    updateVehicleDetails: "Update Vehicle Details",
    security: "Security",
    securitySettings: "Security Settings",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    accountStats: "Account Stats",
    accessDenied: "Access Denied",
    pleaseLoginToViewProfile: "Please log in to view your profile",
    updateProfileSuccess: "Profile updated successfully!",
    updateVehicleSuccess: "Vehicle information updated successfully!",
    updateFailed: "Update failed",
    passwordChangedSuccess: "Password changed successfully!",
    passwordsDoNotMatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 6 characters",
    fillAllPasswordFields: "Please fill in all password fields",
    saving: "Saving...",
  // Password requirements
  passwordRequirementsTitle: "Password requirements:",
  passwordRequirementMinLength: "At least 6 characters",
  passwordRequirementLettersAndNumbers: "Use a combination of letters and numbers",
  passwordRequirementNoReuse: "Do not reuse an old password",
    
    // Dashboard
    myDashboard: "My Dashboard",
    overview: "Overview",
    bookings: "Bookings",
    settings: "Settings",
    totalSessions: "Total Sessions",
    totalSpent: "Total Spent",
    memberSince: "Member Since",
    upcomingBookings: "Upcoming Bookings",
    recentBookings: "Recent Bookings",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    inProgress: "In Progress",
    
    // Analytics
    analytics: "Analytics",
    comprehensiveAnalytics: "Comprehensive Analytics",
    revenueAnalytics: "Revenue Analytics",
    usageAnalytics: "Usage Analytics",
    stationAnalytics: "Station Analytics",
    customerAnalytics: "Customer Analytics",
    forecastingAnalytics: "Forecasting Analytics",
    realTimeMetrics: "Real-time Metrics",
    dailyRevenue: "Daily Revenue",
    monthlyGrowth: "Monthly Growth",
    totalRevenue: "Total Revenue",
    averagePerSession: "Average per Session",
    profitMargin: "Profit Margin",
    totalUsers: "Total Users",
    revenue: "Revenue",
    activeBookings: "Active Bookings",
    systemHealth: "System Health",
    peakUsageHours: "Peak Usage Hours",
    weeklyPattern: "Weekly Pattern",
    utilizationRate: "Utilization Rate",
    customerSatisfaction: "Customer Satisfaction",
    topStations: "Top Stations",
    maintenanceAlerts: "Maintenance Alerts",
    stationHealth: "Station Health",
    expansionRecommendations: "Expansion Recommendations",
    demandForecast: "Demand Forecast",
    revenueForecast: "Revenue Forecast",
    seasonalTrends: "Seasonal Trends",
    personalAnalytics: "Personal Analytics",
    chargingInsights: "Charging Insights",
    spendingAnalysis: "Spending Analysis",
    usagePatterns: "Usage Patterns",
    efficiency: "Efficiency",
    insights: "Insights",
    achievements: "Achievements",
    carbonSaved: "Carbon Saved",
    energyUsed: "Energy Used",
    favoriteStation: "Favorite Station",
    chargingHistory: "Charging History",
    costPerKwh: "Cost per kWh",
    sessionsThisMonth: "Sessions This Month",
    averageDuration: "Average Duration",
    environmentalImpact: "Environmental Impact",
    
    // Pricing
    choosePlan: "Choose Your Charging Plan",
    choosePlanDesc: "Save money and enjoy premium features with our flexible pricing plans. No contracts, cancel anytime.",
    monthly: "Monthly",
    annual: "Annual",
    save: "Save",
    mostPopular: "Most Popular",
    getStartedFree: "Get Started Free",
    choosePlan2: "Choose Plan",
    savingsCalculator: "Savings Calculator",
    lightUser: "Light User",
    regularUser: "Regular User",
    heavyUser: "Heavy User",
  pricingPlanPricePer: "per",
  // Plans (EN)
  planBasicName: "Basic",
  planBasicDescription: "Perfect for occasional charging",
  planBasicFeature1: "Standard charging rates",
  planBasicFeature2: "Basic customer support",
  planBasicFeature3: "Mobile app access",
  planBasicFeature4: "Real-time availability",

  planPlusName: "Plus",
  planPlusDescription: "Great for regular commuters",
  planPlusFeature1: "10% discount on all charging",
  planPlusFeature2: "Priority customer support",
  planPlusFeature3: "Advanced booking features",
  planPlusFeature4: "Monthly usage reports",
  planPlusFeature5: "Free charging session alerts",

  planPremiumName: "Premium",
  planPremiumDescription: "Best value for frequent travelers",
  planPremiumFeature1: "20% discount on all charging",
  planPremiumFeature2: "24/7 premium support",
  planPremiumFeature3: "Unlimited advanced bookings",
  planPremiumFeature4: "Detailed analytics dashboard",
  planPremiumFeature5: "Priority charging slots",
  planPremiumFeature6: "Concierge charging service",
  savingsLabel: "Savings",
  statsChargingStations: "Charging Stations",
  statsUptime: "Uptime",
  statsActiveUsers: "Active Users",
  statsSessions: "Sessions Completed",
  faqTitle: "Frequently Asked Questions",
  faqChangePlanTitle: "Can I change my plan anytime?",
  faqChangePlanDesc: "Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes take effect at the start of your next billing cycle.",
  faqRefundsTitle: "Do you offer refunds?",
  faqRefundsDesc: "We offer a 30-day money-back guarantee for annual subscriptions. Monthly subscriptions can be cancelled at any time without penalty.",
  faqPaymentsTitle: "What payment methods do you accept?",
  faqPaymentsDesc: "We accept all major credit cards, PayPal, and ACH bank transfers. Payment is automatically processed at the beginning of each billing cycle.",
  faqHiddenFeesTitle: "Are there any hidden fees?",
  faqHiddenFeesDesc: "No hidden fees! The pricing shown includes all features listed. You only pay for the electricity you use plus your plan fee.",
    
    // Support
    howCanWeHelp: "How can we help you?",
    howCanWeHelpDesc: "Get quick answers to common questions or contact our support team.",
    callUs: "Call Us",
    supportAvailable: "24/7 Support Available",
    liveChat: "Live Chat",
    avgResponse: "Avg. response: 2 minutes",
    emailSupport: "Email Support",
    responseTime: "Response within 24 hours",
    startChat: "Start Chat",
    sendEmail: "Send Email",
    faq: "FAQ",
    contactUs: "Contact Us",
    systemStatus: "System Status",
    
    // Support FAQ
    frequentlyAskedQuestions: "Frequently Asked Questions",
    searchForAnswers: "Search for answers...",
    selectCategory: "Select category",
    allTopics: "All Topics",
    chargingSessions: "Charging Sessions",
    technicalIssues: "Technical Issues",
    billingPayment: "Billing & Payment",
    reservations: "Reservations",
    noFaqsFound: "No FAQs found matching your search criteria.",
    
    // FAQ Items
    faqQ1: "How do I start a charging session?",
    faqA1: "To start a charging session, locate your reserved charging station using the app, plug in your vehicle, and tap 'Start Session' in the app. The session will begin automatically.",
    faqQ2: "What if a charging station is not working?",
    faqA2: "If you encounter a faulty station, please report it immediately through the app or call our 24/7 support line. We'll help you find an alternative station and may provide charging credits for the inconvenience.",
    faqQ3: "How are charging fees calculated?",
    faqA3: "Charging fees are calculated based on the amount of electricity consumed (kWh) and the station's per-kWh rate. Your plan discount is automatically applied. You can view detailed pricing before starting each session.",
    faqQ4: "Can I cancel or modify my reservation?",
    faqA4: "Yes, you can cancel or modify reservations up to 15 minutes before your scheduled time through the app or website. No cancellation fees apply for changes made with sufficient notice.",
    faqQ5: "What types of connectors are available?",
    faqA5: "Our stations support CCS, CHAdeMO, and Type 2 connectors. The app shows available connector types for each station. Most newer EVs use CCS connectors.",
    faqQ6: "How do I update my payment method?",
    faqA6: "You can update your payment method in the app under Settings > Payment Methods or in your account dashboard. Changes take effect immediately for future sessions.",
    
    // Contact Form
    submitSupportTicket: "Submit a Support Ticket",
    subject: "Subject",
    subjectPlaceholder: "Brief description of your issue",
    category: "Category",
    selectIssueCategory: "Select issue category",
    categoryCharging: "Charging Issues",
    categoryBilling: "Billing & Payment",
    categoryTechnical: "Technical Problems",
    categoryAccount: "Account Management",
    categoryOther: "Other",
    priority: "Priority",
    priorityLow: "Low",
    priorityMedium: "Medium",
    priorityHigh: "High",
    priorityUrgent: "Urgent",
    message: "Message",
    messagePlaceholder: "Please provide detailed information about your issue...",
    submitTicket: "Submit Ticket",
    fillAllFields: "Please fill in all required fields.",
    ticketSubmitted: "Support ticket submitted! We'll get back to you within 24 hours.",
    
    // Contact Info
    contactInformation: "Contact Information",
    supportHotline: "24/7 Support Hotline",
    headquarters: "Headquarters",
    supportHours: "Support Hours",
    emergencyContacts: "Emergency Contacts",
    stationEmergency: "Station Emergency",
    emergencyMessage: "If you're stuck at a station or experiencing safety issues, call: 1-800-EMERGENCY",
    
    // System Status
    allSystemsOperational: "All Systems Operational",
    operationalStatus: "Operational",
    coreServices: "Core Services",
    chargingNetwork: "Charging Network",
    mobileApp: "Mobile App",
    paymentSystem: "Payment System",
    supportServices: "Support Services",
    customerSupport: "Customer Support",
    accountManagement: "Account Management",
    webPortal: "Web Portal",
    recentUpdates: "Recent Updates",
    statusUpdate1Title: "System Performance Optimization",
    statusUpdate1Desc: "Improved app loading times and charging session reliability.",
    statusUpdate2Title: "New Station Locations Added",
    statusUpdate2Desc: "15 new charging stations now available across the network.",
    
    // Footer
    powering: "Powering the future of electric mobility with reliable, fast, and accessible charging solutions.",
    quickLinks: "Quick Links",
    services: "Services",
    contactUsFooter: "Contact Us",
    dcFastCharging: "DC Fast Charging",
    level2Charging: "Level 2 Charging",
    fleetSolutions: "Fleet Solutions",
    businessPartnerships: "Business Partnerships",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    cookiePolicy: "Cookie Policy",
    allRightsReserved: "All rights reserved.",
    
    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    save2: "Save",
    edit: "Edit",
    delete: "Delete",
    back: "Back",
    next: "Next",
    previous: "Previous",
    search: "Search",
    filter: "Filter",
    
    // Staff/Admin
    staffDashboard: "Staff Dashboard",
    adminDashboard: "Admin Dashboard",
    stationManagement: "Station Management",
    userManagement: "User Management",
    bookingManagement: "Booking Management",
    reports: "Reports",
    systemSettings: "System Settings",
    addStation: "Add Station",
    editStation: "Edit Station",
    deleteStation: "Delete Station",
    stationStatus: "Station Status",
    operational: "Operational",
    manageUsers: "Manage Users",
    viewBookings: "View Bookings",
    generateReport: "Generate Report",
  },
  vi: {
    // Header
    signIn: "Đăng nhập",
    signOut: "Đăng xuất",
    welcome: "Chào mừng",
    findStations: "Tìm trạm sạc",
    pricing: "Bảng giá",
    support: "Hỗ trợ",
    dashboard: "Bảng điều khiển",
    
    // Hero Section
    heroTitle: "Sạc xe điện với sự tin cậy",
    heroSubtitle: "Tìm, đặt và thanh toán cho các trạm sạc xe điện trên toàn quốc. Sạc nhanh, đáng tin cậy và tiện lợi khi bạn cần.",
    findStationsButton: "Tìm trạm sạc",
    learnMore: "Tìm hiểu thêm",
    
    // Features
    whyChooseTitle: "Tại sao chọn ChargeTech?",
    whyChooseSubtitle: "Trải nghiệm tương lai của việc sạc xe điện với mạng lưới sạc đáng tin cậy, nhanh chóng và thân thiện với người dùng.",
    ultraFastCharging: "Sạc siêu nhanh",
    ultraFastChargingDesc: "Tốc độ sạc lên đến 350kW để bạn nhanh chóng trở lại đường.",
    easyBooking: "Đặt chỗ dễ dàng",
    easyBookingDesc: "Đặt trước chỗ sạc của bạn với hệ thống đặt chỗ đơn giản.",
    nationwideNetwork: "Mạng lưới toàn quốc",
    nationwideNetworkDesc: "Truy cập hơn 500 trạm sạc trên khắp đất nước.",
    
    // Hero Features (short versions)
    fastChargingShort: "Lên đến 350kW",
    availableAlwaysShort: "Luôn mở cửa",
    locationsShort: "500+ địa điểm",
    
    // CTA Section
    readyToStartTitle: "Sẵn sàng bắt đầu sạc?",
    readyToStartSubtitle: "Tham gia cùng hàng nghìn tài xế tin tưởng ChargeTech cho nhu cầu sạc xe điện.",
    getStartedToday: "Bắt đầu ngay hôm nay",
    goToDashboard: "Đến bảng điều khiển",
    viewPricing: "Xem bảng giá",
    downloadApp: "Tải ứng dụng",
    
    // Station Finder
    findChargingStations: "Tìm trạm sạc",
    findChargingStationsDesc: "Định vị các trạm sạc gần nhất và đặt chỗ trước. Tình trạng thời gian thực và xác nhận ngay lập tức.",
    searchPlaceholder: "Tìm kiếm theo tên trạm hoặc địa chỉ",
    searchStationsPlaceholder: "Tìm kiếm trạm theo tên hoặc địa điểm...",
    filterStations: "Lọc trạm sạc",
    all: "Tất cả",
    available: "Có sẵn",
    fastCharging: "Sạc nhanh",
    availableNow: "Có sẵn ngay",
    rating: "Đánh giá",
    bookNow: "Đặt ngay",
    
    // Map and Station Layout
    mapView: "Xem bản đồ",
    listView: "Xem danh sách",
    viewLayout: "Xem bố cục",
    stationLayout: "Bố cục trạm sạc",
    chargingPoints: "Điểm sạc",
    chargingPoint: "Điểm sạc",
    ports: "cổng",
    
    // Map Legend
    stationStatusLegend: "Trạng thái trạm",
    availableStatus: "Có sẵn (50%+)",
    limitedStatus: "Hạn chế (20-50%)",
    busyStatus: "Bận (<20%)",
    foundStations: "Tìm thấy {count} trạm sạc",
    filters: "Bộ lọc",
    noStationsFound: "Không tìm thấy trạm nào",
    noStationsFoundDesc: "Thử điều chỉnh từ khóa tìm kiếm hoặc xóa tìm kiếm để xem tất cả trạm.",
    inUse: "Đang sử dụng",
    maintenance: "Bảo trì",
    offline: "Ngoại tuyến",
    bookThisPoint: "Đặt điểm này",
    anyAvailable: "Đặt bất kỳ điểm có sẵn",
    statusOverview: "Tổng quan trạng thái",
    stationDetails: "Chi tiết trạm",
    quickActions: "Hành động nhanh",
    getDirections: "Chỉ đường",
    callStation: "Gọi trạm",
    reportIssue: "Báo cáo sự cố",
    facilities: "Tiện ích",
    entrances: "Lối vào",
    connectorType: "Loại đầu sạc",
    powerLevel: "Mức công suất",
    estimatedTime: "Thời gian ước tính",
    currentUser: "Người dùng hiện tại",
    
    // Booking Modal
    bookChargingSession: "Đặt phiên sạc",
    selectDateTime: "Chọn ngày & giờ",
    selectDate: "Chọn ngày",
    selectTime: "Chọn giờ",
    duration: "Thời lượng",
    hours: "giờ",
    reviewBooking: "Xem lại đặt chỗ",
    bookingDetails: "Chi tiết đặt chỗ",
    totalCost: "Tổng chi phí",
    confirmBooking: "Xác nhận đặt chỗ",
    bookingConfirmed: "Đã xác nhận đặt chỗ!",
    bookingConfirmedDesc: "Phiên sạc của bạn đã được đặt thành công. Bạn sẽ nhận được email xác nhận sớm.",
    viewDashboard: "Xem bảng điều khiển",
    close: "Đóng",
    
    // Login/Auth
    signInTitle: "Đăng nhập",
    signUpTitle: "Đăng ký",
    createAccount: "Tạo tài khoản",
    email: "Email",
    password: "Mật khẩu",
    confirmPassword: "Xác nhận mật khẩu",
    fullName: "Họ và tên",
    phoneNumber: "Số điện thoại",
    vehicleInfo: "Thông tin xe",
    vehicleMake: "Hãng xe",
    vehicleModel: "Mẫu xe",
    vehicleYear: "Năm sản xuất",
    batteryCapacity: "Dung lượng pin (kWh)",
    rememberMe: "Ghi nhớ đăng nhập",
    forgotPassword: "Quên mật khẩu?",
    noAccount: "Chưa có tài khoản?",
    haveAccount: "Đã có tài khoản?",
    signUp: "Đăng ký",
    signInDemo: "Đăng nhập Demo",
    demoAccounts: "Tài khoản Demo",
    customer: "Khách hàng",
    staff: "Nhân viên",
    admin: "Quản trị viên",
    selectRole: "Chọn Vai Trò",
    roleSelection: "Lựa Chọn Vai Trò", 
    selectRoleToFillEmail: "Chọn vai trò để tự động điền email",
    demoPassword: "Mật khẩu demo: <strong>123</strong>",
    
    // Placeholders
    emailPlaceholder: "email@example.com",
    passwordPlaceholder: "••••••••",
    fullNamePlaceholder: "Nhập họ và tên",
    phoneNumberPlaceholder: "+84 123 456 789",
    vehicleMakePlaceholder: "VinFast",
    vehicleModelPlaceholder: "VF 8",
    vehicleYearPlaceholder: "2023",
    batteryCapacityPlaceholder: "75",
    
    // Profile
    profile: "Hồ sơ",
    profileSettings: "Cài đặt hồ sơ",
    personalInfo: "Thông tin cá nhân",
    personalInformation: "Thông tin cá nhân",
    updatePersonalDetails: "Cập nhật thông tin cá nhân",
    vehicleInformation: "Thông tin xe",
    updateVehicleDetails: "Cập nhật thông tin xe",
    security: "Bảo mật",
    securitySettings: "Cài đặt bảo mật",
    changePassword: "Đổi mật khẩu",
    currentPassword: "Mật khẩu hiện tại",
    newPassword: "Mật khẩu mới",
    accountStats: "Thống kê tài khoản",
    accessDenied: "Truy cập bị từ chối",
    pleaseLoginToViewProfile: "Vui lòng đăng nhập để xem hồ sơ của bạn",
    updateProfileSuccess: "Cập nhật hồ sơ thành công!",
    updateVehicleSuccess: "Cập nhật thông tin xe thành công!",
    updateFailed: "Cập nhật thất bại",
    passwordChangedSuccess: "Đổi mật khẩu thành công!",
    passwordsDoNotMatch: "Mật khẩu không khớp",
    passwordTooShort: "Mật khẩu phải có ít nhất 6 ký tự",
    fillAllPasswordFields: "Vui lòng điền tất cả các trường mật khẩu",
    saving: "Đang lưu...",
  // Password requirements
  passwordRequirementsTitle: "⚠️ Yêu cầu mật khẩu:",
  passwordRequirementMinLength: "Tối thiểu 6 ký tự",
  passwordRequirementLettersAndNumbers: "Sử dụng kết hợp chữ cái và số",
  passwordRequirementNoReuse: "Không sử dụng lại mật khẩu cũ",
    
    // Dashboard
    myDashboard: "Bảng điều khiển của tôi",
    overview: "Tổng quan",
    bookings: "Đặt chỗ",
    settings: "Cài đặt",
    totalSessions: "Tổng số phiên",
    totalSpent: "Tổng chi tiêu",
    memberSince: "Thành viên từ",
    upcomingBookings: "Đặt chỗ sắp tới",
    recentBookings: "Đặt chỗ gần đây",
    confirmed: "Đã xác nhận",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    inProgress: "Đang tiến hành",
    
    // Analytics
    analytics: "Phân tích",
    comprehensiveAnalytics: "Phân tích toàn diện",
    revenueAnalytics: "Phân tích doanh thu",
    usageAnalytics: "Phân tích sử dụng",
    stationAnalytics: "Phân tích trạm",
    customerAnalytics: "Phân tích khách hàng",
    forecastingAnalytics: "Phân tích dự báo",
    realTimeMetrics: "Chỉ số thời gian thực",
    dailyRevenue: "Doanh thu hàng ngày",
    monthlyGrowth: "Tăng trưởng hàng tháng",
    totalRevenue: "Tổng doanh thu",
    averagePerSession: "Trung bình mỗi phiên",
    profitMargin: "Biên lợi nhuận",
    totalUsers: "Tổng người dùng",
    revenue: "Doanh thu",
    activeBookings: "Đặt chỗ đang hoạt động",
    systemHealth: "Sức khỏe hệ thống",
    peakUsageHours: "Giờ cao điểm",
    weeklyPattern: "Mẫu hàng tuần",
    utilizationRate: "Tỷ lệ sử dụng",
    customerSatisfaction: "Sự hài lòng khách hàng",
    topStations: "Trạm hàng đầu",
    maintenanceAlerts: "Cảnh báo bảo trì",
    stationHealth: "Sức khỏe trạm",
    expansionRecommendations: "Khuyến nghị mở rộng",
    demandForecast: "Dự báo nhu cầu",
    revenueForecast: "Dự báo doanh thu",
    seasonalTrends: "Xu hướng theo mùa",
    personalAnalytics: "Phân tích cá nhân",
    chargingInsights: "Thông tin sạc",
    spendingAnalysis: "Phân tích chi tiêu",
    usagePatterns: "Mẫu sử dụng",
    efficiency: "Hiệu quả",
    insights: "Thông tin chi tiết",
    achievements: "Thành tích",
    carbonSaved: "Carbon tiết kiệm",
    energyUsed: "Năng lượng sử dụng",
    favoriteStation: "Trạm yêu thích",
    chargingHistory: "Lịch sử sạc",
    costPerKwh: "Chi phí mỗi kWh",
    sessionsThisMonth: "Phiên tháng này",
    averageDuration: "Thời lượng trung bình",
    environmentalImpact: "Tác động môi trường",
    
    // Pricing
    choosePlan: "Chọn gói sạc của bạn",
    choosePlanDesc: "Tiết kiệm tiền và tận hưởng các tính năng cao cấp với gói định giá linh hoạt. Không có hợp đồng, hủy bất cứ lúc nào.",
    monthly: "Hàng tháng",
    annual: "Hàng năm",
    save: "Tiết kiệm",
    mostPopular: "Phổ biến nhất",
    getStartedFree: "Bắt đầu miễn phí",
    choosePlan2: "Chọn gói",
    savingsCalculator: "Máy tính tiết kiệm",
    lightUser: "Người dùng nhẹ",
    regularUser: "Người dùng thường xuyên",
    heavyUser: "Người dùng nặng",
  pricingPlanPricePer: "/",
  // Plans (VI)
  planBasicName: "Cơ bản",
  planBasicDescription: "Phù hợp cho việc sạc thỉnh thoảng",
  planBasicFeature1: "Giá sạc tiêu chuẩn",
  planBasicFeature2: "Hỗ trợ khách hàng cơ bản",
  planBasicFeature3: "Truy cập ứng dụng di động",
  planBasicFeature4: "Hiển thị tình trạng thời gian thực",

  planPlusName: "Plus",
  planPlusDescription: "Tốt cho người đi làm thường xuyên",
  planPlusFeature1: "Giảm 10% cho tất cả giao dịch sạc",
  planPlusFeature2: "Hỗ trợ khách hàng ưu tiên",
  planPlusFeature3: "Tính năng đặt chỗ nâng cao",
  planPlusFeature4: "Báo cáo sử dụng hàng tháng",
  planPlusFeature5: "Thông báo phiên sạc miễn phí",

  planPremiumName: "Premium",
  planPremiumDescription: "Giá trị tốt cho người đi xa thường xuyên",
  planPremiumFeature1: "Giảm 20% cho tất cả giao dịch sạc",
  planPremiumFeature2: "Hỗ trợ cao cấp 24/7",
  planPremiumFeature3: "Đặt chỗ nâng cao không giới hạn",
  planPremiumFeature4: "Bảng điều khiển phân tích chi tiết",
  planPremiumFeature5: "Vị trí sạc ưu tiên",
  planPremiumFeature6: "Dịch vụ trợ lý sạc (concierge)",
  savingsLabel: "Tiết kiệm",
  statsChargingStations: "Trạm sạc",
  statsUptime: "Thời gian hoạt động",
  statsActiveUsers: "Người dùng hoạt động",
  statsSessions: "Phiên đã hoàn thành",
  faqTitle: "Câu hỏi thường gặp",
  faqChangePlanTitle: "Tôi có thể thay đổi gói bất cứ lúc nào không?",
  faqChangePlanDesc: "Bạn có thể nâng cấp, hạ cấp hoặc hủy gói bất cứ lúc nào. Thay đổi sẽ có hiệu lực vào đầu chu kỳ thanh toán tiếp theo.",
  faqRefundsTitle: "Bạn có hoàn tiền không?",
  faqRefundsDesc: "Chúng tôi cung cấp đảm bảo hoàn tiền 30 ngày cho đăng ký hàng năm. Đăng ký hàng tháng có thể bị hủy bất cứ lúc nào mà không bị phạt.",
  faqPaymentsTitle: "Bạn chấp nhận phương thức thanh toán nào?",
  faqPaymentsDesc: "Chúng tôi chấp nhận tất cả các thẻ tín dụng chính, PayPal và chuyển khoản ngân hàng ACH. Thanh toán được xử lý tự động vào đầu mỗi chu kỳ thanh toán.",
  faqHiddenFeesTitle: "Có phí ẩn không?",
  faqHiddenFeesDesc: "Không có phí ẩn! Giá hiển thị bao gồm tất cả các tính năng được liệt kê. Bạn chỉ trả cho điện năng bạn sử dụng cộng với phí gói.",
    
    // Support
    howCanWeHelp: "Chúng tôi có thể giúp gì cho bạn?",
    howCanWeHelpDesc: "Nhận câu trả lời nhanh cho các câu hỏi thường gặp hoặc liên hệ với đội ngũ hỗ trợ.",
    callUs: "Gọi cho chúng tôi",
    supportAvailable: "Hỗ trợ 24/7",
    liveChat: "Chat trực tuyến",
    avgResponse: "Phản hồi trung bình: 2 phút",
    emailSupport: "Hỗ trợ email",
    responseTime: "Phản hồi trong 24 giờ",
    startChat: "Bắt đầu chat",
    sendEmail: "Gửi email",
    faq: "Câu hỏi thường gặp",
    contactUs: "Liên hệ",
    systemStatus: "Trạng thái hệ thống",
    
    // Support FAQ
    frequentlyAskedQuestions: "Câu hỏi thường gặp",
    searchForAnswers: "Tìm kiếm câu trả lời...",
    selectCategory: "Chọn danh mục",
    allTopics: "Tất cả chủ đề",
    chargingSessions: "Phiên sạc",
    technicalIssues: "Vấn đề kỹ thuật",
    billingPayment: "Thanh toán & Hóa đơn",
    reservations: "Đặt chỗ",
    noFaqsFound: "Không tìm thấy câu hỏi nào phù hợp với tiêu chí tìm kiếm của bạn.",
    
    // FAQ Items
    faqQ1: "Làm thế nào để bắt đầu phiên sạc?",
    faqA1: "Để bắt đầu phiên sạc, hãy tìm trạm sạc đã đặt của bạn bằng ứng dụng, cắm xe của bạn vào và nhấn 'Bắt đầu phiên' trong ứng dụng. Phiên sẽ tự động bắt đầu.",
    faqQ2: "Nếu trạm sạc không hoạt động thì sao?",
    faqA2: "Nếu bạn gặp trạm bị lỗi, vui lòng báo cáo ngay qua ứng dụng hoặc gọi đường dây hỗ trợ 24/7 của chúng tôi. Chúng tôi sẽ giúp bạn tìm trạm thay thế và có thể cung cấp tín dụng sạc để bù đắp sự bất tiện.",
    faqQ3: "Phí sạc được tính như thế nào?",
    faqA3: "Phí sạc được tính dựa trên lượng điện tiêu thụ (kWh) và giá mỗi kWh của trạm. Giảm giá theo gói của bạn được tự động áp dụng. Bạn có thể xem giá chi tiết trước khi bắt đầu mỗi phiên.",
    faqQ4: "Tôi có thể hủy hoặc thay đổi đặt chỗ không?",
    faqA4: "Có, bạn có thể hủy hoặc thay đổi đặt chỗ tới 15 phút trước giờ đã lên lịch qua ứng dụng hoặc trang web. Không áp dụng phí hủy cho các thay đổi được thực hiện với thông báo đầy đủ.",
    faqQ5: "Có những loại đầu sạc nào?",
    faqA5: "Các trạm của chúng tôi hỗ trợ đầu sạc CCS, CHAdeMO và Type 2. Ứng dụng hiển thị các loại đầu sạc có sẵn cho mỗi trạm. Hầu hết xe điện mới hơn sử dụng đầu sạc CCS.",
    faqQ6: "Làm thế nào để cập nhật phương thức thanh toán?",
    faqA6: "Bạn có thể cập nhật phương thức thanh toán trong ứng dụng tại Cài đặt > Phương thức thanh toán hoặc trong bảng điều khiển tài khoản. Thay đổi có hiệu lực ngay lập tức cho các phiên trong tương lai.",
    
    // Contact Form
    submitSupportTicket: "Gửi yêu cầu hỗ trợ",
    subject: "Chủ đề",
    subjectPlaceholder: "Mô tả ngắn gọn vấn đề của bạn",
    category: "Danh mục",
    selectIssueCategory: "Chọn danh mục vấn đề",
    categoryCharging: "Vấn đề sạc",
    categoryBilling: "Thanh toán & Hóa đơn",
    categoryTechnical: "Vấn đề kỹ thuật",
    categoryAccount: "Quản lý tài khoản",
    categoryOther: "Khác",
    priority: "Độ ưu tiên",
    priorityLow: "Thấp",
    priorityMedium: "Trung bình",
    priorityHigh: "Cao",
    priorityUrgent: "Khẩn cấp",
    message: "Tin nhắn",
    messagePlaceholder: "Vui lòng cung cấp thông tin chi tiết về vấn đề của bạn...",
    submitTicket: "Gửi yêu cầu",
    fillAllFields: "Vui lòng điền đầy đủ các trường bắt buộc.",
    ticketSubmitted: "Yêu cầu hỗ trợ đã được gửi! Chúng tôi sẽ phản hồi trong vòng 24 giờ.",
    
    // Contact Info
    contactInformation: "Thông tin liên hệ",
    supportHotline: "Đường dây nóng hỗ trợ 24/7",
    headquarters: "Trụ sở chính",
    supportHours: "Giờ hỗ trợ",
    emergencyContacts: "Liên hệ khẩn cấp",
    stationEmergency: "Trạm khẩn cấp",
    emergencyMessage: "Nếu bạn bị mắc kẹt tại trạm hoặc gặp vấn đề an toàn, hãy gọi: 1-800-EMERGENCY",
    
    // System Status
    allSystemsOperational: "Tất cả hệ thống hoạt động bình thường",
    operationalStatus: "Hoạt động",
    coreServices: "Dịch vụ cốt lõi",
    chargingNetwork: "Mạng lưới sạc",
    mobileApp: "Ứng dụng di động",
    paymentSystem: "Hệ thống thanh toán",
    supportServices: "Dịch vụ hỗ trợ",
    customerSupport: "Hỗ trợ khách hàng",
    accountManagement: "Quản lý tài khoản",
    webPortal: "Cổng web",
    recentUpdates: "Cập nhật gần đây",
    statusUpdate1Title: "Tối ưu hóa hiệu suất hệ thống",
    statusUpdate1Desc: "Cải thiện thời gian tải ứng dụng và độ tin cậy của phiên sạc.",
    statusUpdate2Title: "Thêm vị trí trạm mới",
    statusUpdate2Desc: "15 trạm sạc mới hiện có sẵn trên toàn mạng lưới.",
    
    // Footer
    powering: "Thúc đẩy tương lai của di chuyển điện với các giải pháp sạc đáng tin cậy, nhanh chóng và dễ tiếp cận.",
    quickLinks: "Liên kết nhanh",
    services: "Dịch vụ",
    contactUsFooter: "Liên hệ",
    dcFastCharging: "Sạc nhanh DC",
    level2Charging: "Sạc cấp 2",
    fleetSolutions: "Giải pháp đội xe",
    businessPartnerships: "Đối tác kinh doanh",
    privacyPolicy: "Chính sách bảo mật",
    termsOfService: "Điều khoản dịch vụ",
    cookiePolicy: "Chính sách cookie",
    allRightsReserved: "Tất cả quyền được bảo lưu.",
    
    // Common
    loading: "Đang tải...",
    error: "Lỗi",
    success: "Thành công",
    cancel: "Hủy",
    save2: "Lưu",
    edit: "Chỉnh sửa",
    delete: "Xóa",
    back: "Quay lại",
    next: "Tiếp theo",
    previous: "Trước đó",
    search: "Tìm kiếm",
    filter: "Lọc",
    
    // Staff/Admin
    staffDashboard: "Bảng điều khiển nhân viên",
    adminDashboard: "Bảng điều khiển quản trị",
    stationManagement: "Quản lý trạm",
    userManagement: "Quản lý người dùng",
    bookingManagement: "Quản lý đặt chỗ",
    reports: "Báo cáo",
    systemSettings: "Cài đặt hệ thống",
    addStation: "Thêm trạm",
    editStation: "Chỉnh sửa trạm",
    deleteStation: "Xóa trạm",
    stationStatus: "Trạng thái trạm",
    operational: "Hoạt động",
    manageUsers: "Quản lý người dùng",
    viewBookings: "Xem đặt chỗ",
    generateReport: "Tạo báo cáo",
  }
};

export const getTranslation = (language: Language): Translation => {
  return translations[language] || translations.en;
};