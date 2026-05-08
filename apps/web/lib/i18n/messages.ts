import type { AppLocale } from "./config";

type HomeMessages = {
  hero: {
    badge: string;
    titleStart: string;
    titleAccent: string;
    titleEnd: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    trustText: string;
    wheelPlaceholderTitle: string;
    wheelPlaceholderDescription: string;
  };
  howItWorks: {
    title: string;
    subtitle: string;
    customizeTitle: string;
    customizeDescription: string;
    embedTitle: string;
    embedDescription: string;
    analyzeTitle: string;
    analyzeDescription: string;
  };
  whyChoose: {
    title: string;
    mainTitle: string;
    mainDescription: string;
    bulletOne: string;
    bulletTwo: string;
    bulletThree: string;
    effectsTitle: string;
    effectsDescription: string;
    easeTitle: string;
    easeDescription: string;
    mobileTitle: string;
    mobileDescription: string;
  };
  bottomCta: {
    title: string;
    subtitle: string;
    primaryButton: string;
    secondaryButton: string;
  };
};

type LoginMessages = {
  topNote: string;
  topAction: string;
  welcome: string;
  subtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  forgotPassword: string;
  signIn: string;
  continueWith: string;
  signInWithGoogle: string;
  noAccount: string;
  createAccount: string;
};

type RegisterMessages = {
  cardTagline: string;
  headlinePrefix: string;
  headlineAccent: string;
  headlineSuffix: string;
  marketingBody: string;
  title: string;
  subtitle: string;
  continueWithGoogle: string;
  orWithEmail: string;
  businessNameLabel: string;
  businessNamePlaceholder: string;
  businessEmailLabel: string;
  businessEmailPlaceholder: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  passwordPlaceholder: string;
  submit: string;
  alreadyHaveAccount: string;
  loginHere: string;
  legalDisclaimer: string;
};

type WheelLabMessages = {
  title: string;
  subtitle: string;
  helper: string;
  modeTable: string;
  modeSphere: string;
  spin: string;
  spinning: string;
  redraw: string;
  reset: string;
  participantsLabel: string;
  prizesLabel: string;
  sourceApi: string;
  sourceMock: string;
  winnerLabel: string;
  noWinner: string;
  currentPrizeLabel: string;
  remainingLabel: string;
  sessionIdle: string;
  sessionRunning: string;
  sessionCompleted: string;
  allPrizesDone: string;
  webglUnsupportedTitle: string;
  webglUnsupportedDescription: string;
  fallbackAction: string;
};

type AppMessages = {
  header: {
    brand: string;
    features: string;
    pricing: string;
    showcase: string;
    docs: string;
    login: string;
    getStarted: string;
  };
  footer: {
    brand: string;
    copyright: string;
    privacyPolicy: string;
    termsOfService: string;
    contactSupport: string;
    apiReference: string;
  };
  login: LoginMessages;
  register: RegisterMessages;
  wheelLab: WheelLabMessages;
  home: HomeMessages;
};

const messages: Record<AppLocale, AppMessages> = {
  vi: {
    header: {
      brand: "Random Lucky",
      features: "Tính năng",
      pricing: "Giá",
      showcase: "Mẫu giao diện",
      docs: "Tài liệu",
      login: "Đăng nhập",
      getStarted: "Bắt đầu ngay",
    },
    footer: {
      brand: "Random Lucky",
      copyright: "© 2024 Random Lucky. Quay số minh bạch, vận hành an toàn.",
      privacyPolicy: "Chính sách bảo mật",
      termsOfService: "Điều khoản dịch vụ",
      contactSupport: "Liên hệ hỗ trợ",
      apiReference: "Tài liệu API",
    },
    login: {
      topNote: "Chưa có tài khoản?",
      topAction: "Bắt đầu ngay",
      welcome: "Chào mừng trở lại",
      subtitle: "Đăng nhập để quay lại tài khoản của bạn.",
      emailLabel: "Email",
      emailPlaceholder: "name@company.com",
      passwordLabel: "Mật khẩu",
      passwordPlaceholder: "••••••••",
      forgotPassword: "Quên mật khẩu?",
      signIn: "Đăng nhập",
      continueWith: "Hoặc tiếp tục với",
      signInWithGoogle: "Đăng nhập với Google",
      noAccount: "Chưa có tài khoản Random Lucky?",
      createAccount: "Tạo tài khoản",
    },
    register: {
      cardTagline: "VÒNG QUAY 3D",
      headlinePrefix: "Biến những vòng quay đơn điệu trở nên hấp dẫn hơn",
      headlineAccent: "",
      headlineSuffix: "",
      marketingBody: "",
      title: "Tạo tài khoản",
      subtitle: "",
      continueWithGoogle: "Đăng ký bằng Google",
      orWithEmail: "HOẶC DÙNG EMAIL",
      businessNameLabel: "Tên doanh nghiệp",
      businessNamePlaceholder: "VD: Lucky Sprinkles Co.",
      businessEmailLabel: "Email doanh nghiệp",
      businessEmailPlaceholder: "name@company.com",
      passwordLabel: "Mật khẩu",
      confirmPasswordLabel: "Xác nhận mật khẩu",
      passwordPlaceholder: "••••••••",
      submit: "Tạo tài khoản miễn phí",
      alreadyHaveAccount: "Đã có tài khoản?",
      loginHere: "Đăng nhập tại đây",
      legalDisclaimer:
        "Khi đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi. Chúng tôi bảo vệ dữ liệu của bạn như của chính mình.",
    },
    wheelLab: {
      title: "Wheel 3D Lab",
      subtitle: "Nền scene 3D đầu tiên cho vòng quay mới trên Next.js.",
      helper: "Mục tiêu Task 2: scene rỗng + camera + lights + orbit controls.",
      modeTable: "Chế độ bảng",
      modeSphere: "Chế độ cầu",
      spin: "Bắt đầu quay",
      spinning: "Đang quay...",
      redraw: "Quay lại",
      reset: "Đặt lại",
      participantsLabel: "Người chơi",
      prizesLabel: "Giải thưởng",
      sourceApi: "Nguồn API",
      sourceMock: "Nguồn Mock",
      winnerLabel: "Người trúng",
      noWinner: "Chưa có",
      currentPrizeLabel: "Giải hiện tại",
      remainingLabel: "Còn lại",
      sessionIdle: "Sẵn sàng",
      sessionRunning: "Đang quay",
      sessionCompleted: "Hoàn tất",
      allPrizesDone: "Đã hoàn thành tất cả giải thưởng",
      webglUnsupportedTitle: "Thiết bị chưa hỗ trợ WebGL ổn định",
      webglUnsupportedDescription:
        "Trình duyệt hoặc GPU hiện tại không phù hợp để chạy vòng quay 3D. Vui lòng thử lại bằng Chrome/Edge mới nhất hoặc thiết bị mạnh hơn.",
      fallbackAction: "Tải lại trang",
    },
    home: {
      hero: {
        badge: "NỀN TẢNG GAMIFIED MARKETING",
        titleStart: "Biến sự kiện thành khoảnh khắc bùng nổ",
        titleAccent: "",
        titleEnd: "",
        description:
          "Thiết kế vòng quay 3D riêng cho doanh nghiệp, nổi bật trong mọi chiến dịch marketing và sự kiện.",
        primaryCta: "Dùng thử miễn phí",
        secondaryCta: "Đặt lịch demo",
        trustText: "Được tin dùng bởi hơn 3.000 doanh nghiệp.",
        wheelPlaceholderTitle: "Khu vực vòng quay 3D cũ",
        wheelPlaceholderDescription:
          "Nhúng vòng quay hiện tại tại đây bằng NEXT_PUBLIC_LEGACY_WHEEL_URL.",
      },
      howItWorks: {
        title: "Cách hoạt động",
        subtitle:
          "Ra mắt chiến dịch vòng quay chỉ với vài bước và bắt đầu thu lead chất lượng.",
        customizeTitle: "Tùy chỉnh",
        customizeDescription:
          "Thiết kế giao diện, phần thưởng và luật chơi theo từng chiến dịch.",
        embedTitle: "Nhúng nhanh",
        embedDescription:
          "Gắn vào landing page, website hoặc popup bằng vài dòng cấu hình.",
        analyzeTitle: "Phân tích",
        analyzeDescription:
          "Theo dõi lượt chơi, tỉ lệ chuyển đổi và hiệu quả theo thời gian thực.",
      },
      whyChoose: {
        title: "Vì sao chọn chúng tôi",
        mainTitle: "Hạ tầng ổn định cho các chiến dịch tăng trưởng",
        mainDescription:
          "Tối ưu cho đội marketing cần chạy nhanh, đo lường chính xác và mở rộng linh hoạt.",
        bulletOne: "Hiệu ứng gamified mượt và hấp dẫn",
        bulletTwo: "API mở để tích hợp CRM và automation",
        bulletThree: "Bảo mật dữ liệu theo tiêu chuẩn SaaS",
        effectsTitle: "Hiệu ứng đẹp",
        effectsDescription: "Nhiều mẫu chuyển động giúp tăng tương tác.",
        easeTitle: "Dễ sử dụng",
        easeDescription: "Thiết lập nhanh, không cần đội kỹ thuật lớn.",
        mobileTitle: "Mobile-first",
        mobileDescription: "Tối ưu cho điện thoại, tablet và desktop.",
      },
      bottomCta: {
        title: "Sẵn sàng tăng trưởng cùng Random Lucky?",
        subtitle: "Bắt đầu dùng thử hoặc để đội ngũ tư vấn giải pháp phù hợp.",
        primaryButton: "Đăng ký ngay",
        secondaryButton: "Đặt lịch demo",
      },
    },
  },
  en: {
    header: {
      brand: "Random Lucky",
      features: "Features",
      pricing: "Pricing",
      showcase: "Showcase",
      docs: "Docs",
      login: "Login",
      getStarted: "Get Started",
    },
    footer: {
      brand: "Random Lucky",
      copyright: "© 2024 Random Lucky. Spin your way to success.",
      privacyPolicy: "Privacy Policy",
      termsOfService: "Terms of Service",
      contactSupport: "Contact Support",
      apiReference: "API Reference",
    },
    login: {
      topNote: "Don't have an account?",
      topAction: "Get Started",
      welcome: "Welcome Back",
      subtitle: "Sign in your way back into your account.",
      emailLabel: "Email Address",
      emailPlaceholder: "name@company.com",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      forgotPassword: "Forgot Password?",
      signIn: "Sign In",
      continueWith: "Or continue with",
      signInWithGoogle: "Sign in with Google",
      noAccount: "New to Random Lucky?",
      createAccount: "Create an account",
    },
    register: {
      cardTagline: "3D SPIN WHEEL",
      headlinePrefix: "Spin your way to ",
      headlineAccent: "24% more lead",
      headlineSuffix: " captures instantly.",
      marketingBody:
        "The world's most engaging gamified conversion engine for modern e-commerce and high-growth brands.",
      title: "Create your account",
      subtitle: "Start your 14-day free trial. No credit card required.",
      continueWithGoogle: "Continue with Google",
      orWithEmail: "OR WITH EMAIL",
      businessNameLabel: "Business Name",
      businessNamePlaceholder: "e.g. Lucky Sprinkles Co.",
      businessEmailLabel: "Business Email",
      businessEmailPlaceholder: "name@company.com",
      passwordLabel: "Password",
      confirmPasswordLabel: "Confirm Password",
      passwordPlaceholder: "••••••••",
      submit: "Create Free Account",
      alreadyHaveAccount: "Already have an account?",
      loginHere: "Login here",
      legalDisclaimer:
        "By signing up, you agree to our Terms of Service and Privacy Policy. We'll protect your data like it's our own lucky charm.",
    },
    wheelLab: {
      title: "Wheel 3D Lab",
      subtitle: "First 3D scene baseline for the new wheel on Next.js.",
      helper: "Task 2 target: empty scene + camera + lights + orbit controls.",
      modeTable: "Table mode",
      modeSphere: "Sphere mode",
      spin: "Start spin",
      spinning: "Spinning...",
      redraw: "Redraw",
      reset: "Reset",
      participantsLabel: "Participants",
      prizesLabel: "Prizes",
      sourceApi: "API source",
      sourceMock: "Mock source",
      winnerLabel: "Winner",
      noWinner: "None",
      currentPrizeLabel: "Current prize",
      remainingLabel: "Remaining",
      sessionIdle: "Ready",
      sessionRunning: "Running",
      sessionCompleted: "Completed",
      allPrizesDone: "All prizes completed",
      webglUnsupportedTitle: "WebGL support is not available",
      webglUnsupportedDescription:
        "Your browser or GPU cannot run this 3D wheel reliably. Please try the latest Chrome/Edge or a more capable device.",
      fallbackAction: "Reload page",
    },
    home: {
      hero: {
        badge: "GAMIFIED MARKETING PLATFORM",
        titleStart: "Spin your marketing into",
        titleAccent: "high engagement",
        titleEnd: "",
        description:
          "Build spin campaigns, mini-games, and interactive rewards to convert more visitors.",
        primaryCta: "Try for free",
        secondaryCta: "Book a demo",
        trustText: "Trusted by 3,000+ growth teams.",
        wheelPlaceholderTitle: "Legacy 3D wheel area",
        wheelPlaceholderDescription:
          "Mount your existing wheel app here with NEXT_PUBLIC_LEGACY_WHEEL_URL.",
      },
      howItWorks: {
        title: "How it works",
        subtitle:
          "Launch high-converting spin campaigns in minutes with a clean workflow.",
        customizeTitle: "Customize",
        customizeDescription:
          "Configure prize logic, visuals, and campaign rules in one place.",
        embedTitle: "Embed",
        embedDescription:
          "Drop it into landing pages, websites, or popups with lightweight setup.",
        analyzeTitle: "Analyze",
        analyzeDescription:
          "Track spins, conversions, and ROI with real-time campaign analytics.",
      },
      whyChoose: {
        title: "Why choose us",
        mainTitle: "Built for teams that move fast",
        mainDescription:
          "Everything you need to launch campaigns quickly and scale with confidence.",
        bulletOne: "High-quality gamified interactions",
        bulletTwo: "Open API for CRM and marketing automation",
        bulletThree: "SaaS-grade security and reliability",
        effectsTitle: "Beautiful effects",
        effectsDescription: "Motion presets designed to boost attention.",
        easeTitle: "Ease of use",
        easeDescription: "Fast setup and no heavy technical overhead.",
        mobileTitle: "Mobile-first",
        mobileDescription: "Responsive experience on every modern device.",
      },
      bottomCta: {
        title: "Ready to start winning?",
        subtitle: "Start your trial or talk with us to design your campaign flow.",
        primaryButton: "Sign up now",
        secondaryButton: "Book a demo",
      },
    },
  },
};

export function getMessages(locale: AppLocale) {
  return messages[locale];
}
