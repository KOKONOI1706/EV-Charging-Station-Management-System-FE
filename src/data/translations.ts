export type Language = "en" | "vi" | "ja";

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
  filterStations: string;
  all: string;
  available: string;
  fastCharging: string;
  availableNow: string;
  rating: string;
  bookNow: string;
  
  // Booking Modal
  bookChargingSession: string;
  
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
  
  // Map and Station Layout
  mapView: string;
  listView: string;
  viewLayout: string;
  stationLayout: string;
  chargingPoints: string;
  chargingPoint: string;
  available: string;
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
  selectDateTime: string;
  selectDate: string;
  selectTime: string;
  duration: string;
  hours: string;
  reviewBooking: string;
  stationDetails: string;
  bookingDetails: string;
  totalCost: string;
  confirmBooking: string;
  bookingConfirmed: string;
  bookingConfirmedDesc: string;
  viewDashboard: string;
  close: string;
  
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
  analytics: string;
  reports: string;
  systemSettings: string;
  addStation: string;
  editStation: string;
  deleteStation: string;
  stationStatus: string;
  operational: string;
  maintenance: string;
  offline: string;
  totalUsers: string;
  activeBookings: string;
  revenue: string;
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
    heroTitle: "Charge Your EV with Confidence",
    heroSubtitle: "Find, book, and pay for EV charging stations nationwide. Fast, reliable, and convenient charging when you need it.",
    findStationsButton: "Find Stations",
    learnMore: "Learn More",
    
    // Features
    whyChooseTitle: "Why Choose ChargeTech?",
    whyChooseSubtitle: "Experience the future of EV charging with our reliable, fast, and user-friendly charging network.",
    ultraFastCharging: "Ultra-Fast Charging",
    ultraFastChargingDesc: "Up to 350kW charging speeds to get you back on the road quickly.",
    easyBooking: "Easy Booking",
    easyBookingDesc: "Reserve your charging slot in advance with our simple booking system.",
    nationwideNetwork: "Nationwide Network",
    nationwideNetworkDesc: "Access over 500 charging stations across the country.",
    
    // CTA Section
    readyToStartTitle: "Ready to Start Charging?",
    readyToStartSubtitle: "Join thousands of drivers who trust ChargeTech for their EV charging needs.",
    getStartedToday: "Get Started Today",
    goToDashboard: "Go to Dashboard",
    viewPricing: "View Pricing",
    downloadApp: "Download App",
    
    // Station Finder
    findChargingStations: "Find Charging Stations",
    findChargingStationsDesc: "Locate the nearest charging stations and book your slot in advance. Real-time availability and instant confirmation.",
    searchPlaceholder: "Search by station name or address",
    filterStations: "Filter Stations",
    all: "All",
    available: "Available",
    fastCharging: "Fast Charging",
    availableNow: "Available Now",
    rating: "Rating",
    bookNow: "Book Now",
    
    // Booking Modal
    bookChargingSession: "Book Charging Session",
    selectDateTime: "Select Date & Time",
    selectDate: "Select Date",
    selectTime: "Select Time",
    duration: "Duration",
    hours: "hours",
    reviewBooking: "Review Booking",
    stationDetails: "Station Details",
    bookingDetails: "Booking Details",
    totalCost: "Total Cost",
    confirmBooking: "Confirm Booking",
    bookingConfirmed: "Booking Confirmed!",
    bookingConfirmedDesc: "Your charging session has been booked successfully. You'll receive a confirmation email shortly.",
    viewDashboard: "View Dashboard",
    close: "Close",
    
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
    
    // Support
    howCanWeHelp: "How can we help you?",
    howCanWeHelpDesc: "Get quick answers to common questions or reach out to our support team.",
    callUs: "Call Us",
    supportAvailable: "24/7 Support Available",
    liveChat: "Live Chat",
    avgResponse: "Average response: 2 minutes",
    emailSupport: "Email Support",
    responseTime: "Response within 24 hours",
    startChat: "Start Chat",
    sendEmail: "Send Email",
    faq: "FAQ",
    contactUs: "Contact Us",
    systemStatus: "System Status",
    
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
    analytics: "Analytics",
    reports: "Reports",
    systemSettings: "System Settings",
    addStation: "Add Station",
    editStation: "Edit Station",
    deleteStation: "Delete Station",
    stationStatus: "Station Status",
    operational: "Operational",
    maintenance: "Maintenance",
    offline: "Offline",
    totalUsers: "Total Users",
    activeBookings: "Active Bookings",
    revenue: "Revenue",
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
    filterStations: "Lọc trạm sạc",
    all: "Tất cả",
    available: "Có sẵn",
    fastCharging: "Sạc nhanh",
    availableNow: "Có sẵn ngay",
    rating: "Đánh giá",
    bookNow: "Đặt ngay",
    
    // Booking Modal
    bookChargingSession: "Đặt phiên sạc",
    selectDateTime: "Chọn ngày & giờ",
    selectDate: "Chọn ngày",
    selectTime: "Chọn giờ",
    duration: "Thời lượng",
    hours: "giờ",
    reviewBooking: "Xem lại đặt chỗ",
    stationDetails: "Chi tiết trạm sạc",
    bookingDetails: "Chi tiết đặt chỗ",
    totalCost: "Tổng chi phí",
    confirmBooking: "Xác nhận đặt chỗ",
    bookingConfirmed: "Đã xác nhận đặt chỗ!",
    bookingConfirmedDesc: "Phiên sạc của bạn đã được đặt thành công. Bạn sẽ nhận được email xác nhận trong thời gian ngắn.",
    viewDashboard: "Xem bảng điều khiển",
    close: "Đóng",
    
    // Dashboard
    myDashboard: "Bảng điều khiển của tôi",
    overview: "Tổng quan",
    bookings: "Đặt chỗ",
    settings: "Cài đặt",
    totalSessions: "Tổng phiên",
    totalSpent: "Tổng chi tiêu",
    memberSince: "Thành viên từ",
    upcomingBookings: "Đặt chỗ sắp tới",
    recentBookings: "Đặt chỗ gần đây",
    confirmed: "Đã xác nhận",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    inProgress: "Đang tiến hành",
    
    // Pricing
    choosePlan: "Chọn gói sạc của bạn",
    choosePlanDesc: "Tiết kiệm tiền và tận hưởng các tính năng cao cấp với các gói giá linh hoạt. Không ràng buộc hợp đồng, hủy bất cứ lúc nào.",
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
    
    // Support
    howCanWeHelp: "Chúng tôi có thể giúp gì cho bạn?",
    howCanWeHelpDesc: "Nhận câu trả lời nhanh cho các câu hỏi thường gặp hoặc liên hệ với đội ngũ hỗ trợ.",
    callUs: "Gọi cho chúng tôi",
    supportAvailable: "Hỗ trợ 24/7",
    liveChat: "Chat trực tiếp",
    avgResponse: "Phản hồi trung bình: 2 phút",
    emailSupport: "Hỗ trợ qua email",
    responseTime: "Phản hồi trong vòng 24 giờ",
    startChat: "Bắt đầu chat",
    sendEmail: "Gửi email",
    faq: "Câu hỏi thường gặp",
    contactUs: "Liên hệ chúng tôi",
    systemStatus: "Trạng thái hệ thống",
    
    // Footer
    powering: "Thúc đẩy tương lai của di động điện với các giải pháp sạc đáng tin cậy, nhanh chóng và dễ tiếp cận.",
    quickLinks: "Liên kết nhanh",
    services: "Dịch vụ",
    contactUsFooter: "Liên hệ chúng tôi",
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
    previous: "Trước",
    search: "Tìm kiếm",
    filter: "Lọc",
    
    // Staff/Admin
    staffDashboard: "Bảng điều khiển nhân viên",
    adminDashboard: "Bảng điều khiển quản trị",
    stationManagement: "Quản lý trạm sạc",
    userManagement: "Quản lý người dùng",
    bookingManagement: "Quản lý đặt chỗ",
    analytics: "Phân tích",
    reports: "Báo cáo",
    systemSettings: "Cài đặt hệ thống",
    addStation: "Thêm trạm sạc",
    editStation: "Chỉnh sửa trạm sạc",
    deleteStation: "Xóa trạm sạc",
    stationStatus: "Trạng thái trạm sạc",
    operational: "Hoạt động",
    maintenance: "Bảo trì",
    offline: "Offline",
    totalUsers: "Tổng người dùng",
    activeBookings: "Đặt chỗ đang hoạt động",
    revenue: "Doanh thu",
    manageUsers: "Quản lý người dùng",
    viewBookings: "Xem đặt chỗ",
    generateReport: "Tạo báo cáo",
  },
  
  ja: {
    // Header
    signIn: "サインイン",
    signOut: "サインアウト",
    welcome: "ようこそ",
    findStations: "ステーション検索",
    pricing: "料金",
    support: "サポート",
    dashboard: "ダッシュボード",
    
    // Hero Section
    heroTitle: "安心してEVを充電",
    heroSubtitle: "全国のEV充電ステーションを検索、予約、支払い。必要な時に迅速で信頼性があり便利な充電。",
    findStationsButton: "ステーション検索",
    learnMore: "詳細を見る",
    
    // Features
    whyChooseTitle: "なぜChargeTechを選ぶのか？",
    whyChooseSubtitle: "信頼性が高く、高速でユーザーフレンドリーな充電ネットワークでEV充電の未来を体験してください。",
    ultraFastCharging: "超高速充電",
    ultraFastChargingDesc: "最大350kWの充電速度で素早く道路に戻れます。",
    easyBooking: "簡単予約",
    easyBookingDesc: "シンプルな予約システムで事前に充電スロットを予約。",
    nationwideNetwork: "全国ネットワーク",
    nationwideNetworkDesc: "全国500以上の充電ステーションにアクセス。",
    
    // CTA Section
    readyToStartTitle: "充電を始める準備はできましたか？",
    readyToStartSubtitle: "EV充電のニーズでChargeTechを信頼する数千人のドライバーに参加してください。",
    getStartedToday: "今日から始める",
    goToDashboard: "ダッシュボードへ",
    viewPricing: "料金を見る",
    downloadApp: "アプリをダウンロード",
    
    // Station Finder
    findChargingStations: "充電ステーション検索",
    findChargingStationsDesc: "最寄りの充電ステーションを見つけて事前にスロットを予約。リアルタイム空き状況と即座の確認。",
    searchPlaceholder: "ステーション名または住所で検索",
    filterStations: "ステーション絞り込み",
    all: "すべて",
    available: "利用可能",
    fastCharging: "急速充電",
    availableNow: "今利用可能",
    rating: "評価",
    bookNow: "今すぐ予約",
    
    // Booking Modal
    bookChargingSession: "充電セッション予約",
    selectDateTime: "日時選択",
    selectDate: "日付選択",
    selectTime: "時間選択",
    duration: "時間",
    hours: "時間",
    reviewBooking: "予約確認",
    stationDetails: "ステーション詳細",
    bookingDetails: "予約詳細",
    totalCost: "合計費用",
    confirmBooking: "予約確認",
    bookingConfirmed: "予約が確認されました！",
    bookingConfirmedDesc: "充電セッションが正常に予約されました。確認メールを間もなくお送りします。",
    viewDashboard: "ダッシュボードを見る",
    close: "閉じる",
    
    // Dashboard
    myDashboard: "マイダッシュボード",
    overview: "概要",
    bookings: "予約",
    settings: "設定",
    totalSessions: "総セッション数",
    totalSpent: "総支出",
    memberSince: "会員開始日",
    upcomingBookings: "今後の予約",
    recentBookings: "最近の予約",
    confirmed: "確認済み",
    completed: "完了",
    cancelled: "キャンセル",
    inProgress: "進行中",
    
    // Pricing
    choosePlan: "充電プランを選択",
    choosePlanDesc: "柔軟な料金プランでお金を節約し、プレミアム機能をお楽しみください。契約なし、いつでもキャンセル可能。",
    monthly: "月額",
    annual: "年額",
    save: "節約",
    mostPopular: "最も人気",
    getStartedFree: "無料で始める",
    choosePlan2: "プラン選択",
    savingsCalculator: "節約計算機",
    lightUser: "ライトユーザー",
    regularUser: "レギュラーユーザー",
    heavyUser: "ヘビーユー��ー",
    
    // Support
    howCanWeHelp: "どのようにお手伝いできますか？",
    howCanWeHelpDesc: "よくある質問への迅速な回答を得るか、サポートチームにお問い合わせください。",
    callUs: "お電話ください",
    supportAvailable: "24時間年中無休サポート",
    liveChat: "ライブチャット",
    avgResponse: "平均応答時間：2分",
    emailSupport: "メールサポート",
    responseTime: "24時間以内に返信",
    startChat: "チャット開始",
    sendEmail: "メール送信",
    faq: "よくある質問",
    contactUs: "お問い合わせ",
    systemStatus: "システム状況",
    
    // Footer
    powering: "信頼性が高く、高速でアクセス可能な充電ソリューションで電気モビリティの未来を支えています。",
    quickLinks: "クイックリンク",
    services: "サービス",
    contactUsFooter: "お問い合わせ",
    dcFastCharging: "DC急速充電",
    level2Charging: "レベル2充電",
    fleetSolutions: "フリートソリューション",
    businessPartnerships: "ビジネスパートナーシップ",
    privacyPolicy: "プライバシーポリシー",
    termsOfService: "利用規約",
    cookiePolicy: "クッキーポリシー",
    allRightsReserved: "全著作権所有。",
    
    // Common
    loading: "読み込み中...",
    error: "エラー",
    success: "成功",
    cancel: "キャンセル",
    save2: "保存",
    edit: "編集",
    delete: "削除",
    back: "戻る",
    next: "次へ",
    previous: "前へ",
    search: "検索",
    filter: "フィルター",
    
    // Staff/Admin
    staffDashboard: "スタッフダッシュボード",
    adminDashboard: "管理者ダッシュボード",
    stationManagement: "ステーション管理",
    userManagement: "ユーザー管理",
    bookingManagement: "予約管理",
    analytics: "分析",
    reports: "レポート",
    systemSettings: "システム設定",
    addStation: "ステーション追加",
    editStation: "ステーション編集",
    deleteStation: "ステーション削除",
    stationStatus: "ステーション状況",
    operational: "運用中",
    maintenance: "メンテナンス",
    offline: "オフライン",
    totalUsers: "総ユーザー数",
    activeBookings: "アクティブな予約",
    revenue: "収益",
    manageUsers: "ユーザー管理",
    viewBookings: "予約を見る",
    generateReport: "レポート生成",
  }
};

export const getTranslation = (language: Language): Translation => {
  return translations[language] || translations.en;
};