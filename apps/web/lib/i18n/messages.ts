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
  spinDemo: {
    badge: string;
    title: string;
    subtitle: string;
    inputPlaceholder: string;
    addButton: string;
    spinButton: string;
    spinningButton: string;
    resetButton: string;
    winnerLabel: string;
    maxReached: string;
    emptyHint: string;
    dragHint: string;
    participantsCount: string;
  };
};

type PricingPlanFeature = {
  text: string;
  included: boolean;
};

type PricingPlanMessages = {
  name: string;
  description: string;
  cta: string;
  features: PricingPlanFeature[];
};

type PricingProPlanMessages = PricingPlanMessages & {
  popularBadge: string;
};

export type PricingMessages = {
  metaTitle: string;
  heroTitle: string;
  heroSubtitle: string;
  billingMonthly: string;
  billingYearly: string;
  yearlySaveBadge: string;
  priceSuffix: string;
  billedAnnuallyNote: string;
  plans: {
    free: PricingPlanMessages;
    pro: PricingProPlanMessages;
    business: PricingPlanMessages;
  };
  showcaseTitle: string;
  showcaseSubtitle: string;
  videoPlaceholderLabel: string;
  highlights: Array<{ title: string; description: string }>;
  bottomBanner: {
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
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
  errorInvalidCredentials: string;
  errorEmailNotVerified: string;
  resendVerification: string;
  errorGeneric: string;
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
  fullNameLabel: string;
  fullNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  passwordPlaceholder: string;
  submit: string;
  alreadyHaveAccount: string;
  loginHere: string;
  legalDisclaimer: string;
  errorEmailInUse: string;
  errorGoogleAccountExists: string;
  errorPasswordMismatch: string;
  errorGeneric: string;
};

type AuthMessages = {
  oauthCallback: {
    pageTitle: string;
    working: string;
    errorGeneric: string;
    googleUnavailable: string;
    continueHome: string;
    existingAccountTitle: string;
    existingAccountSubtitle: string;
    continueToApp: string;
  };
  checkEmail: {
    pageTitle: string;
    title: string;
    subtitle: string;
    resendPrompt: string;
    resendAction: string;
    resendSuccess: string;
    backToLogin: string;
  };
  googleWelcome: {
    pageTitle: string;
    title: string;
    subtitle: string;
    goToDashboard: string;
    emailNote: string;
  };
  verifyEmail: {
    pageTitle: string;
    verifying: string;
    successTitle: string;
    successSubtitle: string;
    goToLogin: string;
    errorInvalidTitle: string;
    errorInvalidBody: string;
    errorExpiredTitle: string;
    errorExpiredBody: string;
    resendAction: string;
    resendSuccess: string;
  };
};

type WheelLabProductSphereMessages = {
  title: string;
  subtitle: string;
  helper: string;
  modeTable: string;
  modeSphere: string;
  controlsHint: string;
  backToLab: string;
  spin: string;
  spinning: string;
  resetDraw: string;
  winnerLabel: string;
  noWinner: string;
  participantsCount: string;
  winnerOverlayBadge: string;
  winnerOverlayIdLabel: string;
  demoCardsNote: string;
  prizeTierFirst: string;
  prizeTierSecond: string;
  prizeTierThird: string;
  prizeTierSlotsLabel: string;
  prizeTierHint: string;
  /** e.g. “người” / “people” for fixed prize summary lines */
  prizePeopleUnit: string;
  revealPause: string;
  revealResume: string;
  viewAllResults: string;
  resultsSummaryTitle: string;
  resultsSummaryClose: string;
  continueNextTier: string;
  expandArena: string;
  collapseArena: string;
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
  productSphereLink: string;
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
    logout: string;
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
  auth: AuthMessages;
  wheelLab: WheelLabMessages;
  wheelLabProductSphere: WheelLabProductSphereMessages;
  home: HomeMessages;
  pricing: PricingMessages;
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
      logout: "Đăng xuất",
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
      errorInvalidCredentials: "Email hoặc mật khẩu không đúng.",
      errorEmailNotVerified: "Vui lòng xác nhận email trước khi đăng nhập.",
      resendVerification: "Gửi lại email xác nhận",
      errorGeneric: "Đăng nhập thất bại. Vui lòng thử lại.",
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
      fullNameLabel: "Họ và tên (không bắt buộc)",
      fullNamePlaceholder: "Nguyễn Văn A",
      emailLabel: "Email",
      emailPlaceholder: "name@company.com",
      passwordLabel: "Mật khẩu",
      confirmPasswordLabel: "Xác nhận mật khẩu",
      passwordPlaceholder: "••••••••",
      submit: "Tạo tài khoản miễn phí",
      alreadyHaveAccount: "Đã có tài khoản?",
      loginHere: "Đăng nhập tại đây",
      legalDisclaimer:
        "Khi đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi. Chúng tôi bảo vệ dữ liệu của bạn như của chính mình.",
      errorEmailInUse: "Email này đã được sử dụng. Vui lòng đăng nhập.",
      errorGoogleAccountExists: "Email này đã đăng ký bằng Google. Vui lòng dùng nút \"Đăng ký bằng Google\".",
      errorPasswordMismatch: "Mật khẩu xác nhận không khớp.",
      errorGeneric: "Đăng ký thất bại. Vui lòng thử lại.",
    },
    auth: {
      oauthCallback: {
        pageTitle: "Đăng nhập Google",
        working: "Đang hoàn tất đăng nhập…",
        errorGeneric: "Đăng nhập Google không thành công. Vui lòng thử lại.",
        googleUnavailable:
          "Chưa cấu hình NEXT_PUBLIC_API_URL — không thể mở đăng nhập Google.",
        continueHome: "Về trang chủ",
        existingAccountTitle: "Tài khoản đã tồn tại",
        existingAccountSubtitle: "Email này đã được đăng ký. Bạn đã được đăng nhập vào tài khoản hiện có.",
        continueToApp: "Tiếp tục vào ứng dụng",
      },
      checkEmail: {
        pageTitle: "Kiểm tra hộp thư — Random Lucky",
        title: "Kiểm tra hộp thư của bạn",
        subtitle: "Chúng tôi đã gửi liên kết xác nhận đến",
        resendPrompt: "Không nhận được email?",
        resendAction: "Gửi lại",
        resendSuccess: "Đã gửi lại! Vui lòng kiểm tra hộp thư (bao gồm thư mục spam).",
        backToLogin: "Quay lại đăng nhập",
      },
      googleWelcome: {
        pageTitle: "Đăng ký thành công — Random Lucky",
        title: "Tài khoản đã được tạo thành công! 🎉",
        subtitle: "Bạn đã đăng ký Random Lucky bằng Google. Email của bạn đã được xác nhận tự động.",
        goToDashboard: "Bắt đầu sử dụng",
        emailNote: "Chúng tôi đã gửi email chào mừng đến hộp thư của bạn.",
      },
      verifyEmail: {
        pageTitle: "Xác nhận email — Random Lucky",
        verifying: "Đang xác nhận email của bạn…",
        successTitle: "Email đã được xác nhận!",
        successSubtitle: "Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.",
        goToLogin: "Đăng nhập",
        errorInvalidTitle: "Liên kết không hợp lệ",
        errorInvalidBody: "Liên kết xác nhận không đúng hoặc đã được sử dụng.",
        errorExpiredTitle: "Liên kết đã hết hạn",
        errorExpiredBody: "Liên kết xác nhận đã hết hạn (24 giờ). Vui lòng yêu cầu gửi lại.",
        resendAction: "Gửi lại email xác nhận",
        resendSuccess: "Đã gửi lại! Kiểm tra hộp thư của bạn.",
      },
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
      productSphereLink: "Demo quả cầu đúng cấu hình product (217 ô, xoay & zoom chuột)",
    },
    wheelLabProductSphere: {
      title: "Quả cầu (parity product)",
      subtitle:
        "217 thẻ (7×31), phân bố spherical + lookAt ra ngoài như `product`, xoay/zoom/pan bằng chuột trong vùng canvas.",
      helper:
        "Lưới và công thức phi/theta trùng legacy; đơn vị scene scale ×0.01 so với bản gốc (radius 800 → 8).",
      modeTable: "Chế độ bảng",
      modeSphere: "Chế độ cầu",
      controlsHint: "Kéo chuột trái để xoay · lăn để zoom · chuột phải (hoặc giữ Shift + kéo) để pan.",
      backToLab: "← Wheel Lab",
      spin: "Quay",
      spinning: "Đang quay…",
      resetDraw: "Chọn lại",
      winnerLabel: "Người trúng",
      noWinner: "Chưa quay — bấm Quay để chọn ngẫu nhiên một thẻ trúng.",
      participantsCount: "Người trong danh sách",
      winnerOverlayBadge: "Chúc mừng",
      winnerOverlayIdLabel: "Mã định danh",
      demoCardsNote: "Mỗi ô trên cầu là dữ liệu demo (tên + mã + id). Kết quả quay hiển thị đúng người trên ô trúng.",
      prizeTierFirst: "Giải nhất",
      prizeTierSecond: "Giải nhì",
      prizeTierThird: "Giải ba",
      prizeTierSlotsLabel: "Số giải",
      prizeTierHint:
        "Bấm Quay để quay lần lượt giải ba → nhì → nhất (mỗi người chỉ một giải trong phiên). Sau mỗi giải bấm Tiếp tục để quay giải kế tiếp. Thanh tiến độ ở góc trên trái trên cầu.",
      prizePeopleUnit: "người",
      revealPause: "Tạm dừng",
      revealResume: "Tiếp tục",
      viewAllResults: "Xem tất cả kết quả",
      resultsSummaryTitle: "Tổng kết kết quả quay",
      resultsSummaryClose: "Đóng",
      continueNextTier: "Tiếp tục quay giải tiếp theo",
      expandArena: "Mở rộng toàn màn hình",
      collapseArena: "Thu nhỏ",
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
      spinDemo: {
        badge: "Thử ngay",
        title: "Quay số 3D ngay tại đây",
        subtitle: "Thêm tối đa 10 người vào danh sách và bấm Quay để xem ai trúng thưởng. Kéo chuột để xoay quả cầu.",
        inputPlaceholder: "Nhập tên người tham gia...",
        addButton: "Thêm",
        spinButton: "Quay ngay!",
        spinningButton: "Đang quay...",
        resetButton: "Quay lại",
        winnerLabel: "Người trúng thưởng",
        maxReached: "Đã đủ 10 người",
        emptyHint: "Cần ít nhất 2 người để quay",
        dragHint: "Kéo chuột để xoay · cuộn để zoom",
        participantsCount: "người tham gia",
      },
    },
    pricing: {
      metaTitle: "Giá — Random Lucky",
      heroTitle: "Chọn “động cơ may mắn” của bạn",
      heroSubtitle:
        "So sánh gói để chọn mức phù hợp với chiến dịch gamification và sự kiện của bạn — bắt đầu miễn phí, nâng cấp khi đã sẵn sàng mở rộng.",
      billingMonthly: "Theo tháng",
      billingYearly: "Theo năm",
      yearlySaveBadge: "GIẢM 20%",
      priceSuffix: "/tháng",
      billedAnnuallyNote: "Thanh toán theo năm (đã áp dụng giảm 20%).",
      plans: {
        free: {
          name: "Miễn phí",
          description:
            "Dùng thử 14 ngày cho chiến dịch đầu tiên — phù hợp team nhỏ và demo nội bộ.",
          cta: "Bắt đầu",
          features: [
            { text: "Tối đa 15 người chơi mỗi sự kiện (dùng thử)", included: true },
            { text: "Vòng quay 3D & theme có sẵn", included: true },
            { text: "Nhúng vào landing page / website", included: true },
            { text: "Upload avatar người chơi", included: false },
            { text: "Import danh sách lớn & API nâng cao", included: false },
          ],
        },
        pro: {
          name: "Pro",
          popularBadge: "Phổ biến nhất",
          description:
            "Cho đội marketing cần nhập danh sách lớn, thương hiệu hóa và đo lường đầy đủ.",
          cta: "Dùng thử Pro",
          features: [
            { text: "Không giới hạn người chơi theo gói đăng ký", included: true },
            { text: "Upload avatar qua link bảo mật", included: true },
            { text: "Import Excel / CSV quy mô lớn", included: true },
            { text: "API, webhook & loại watermark", included: true },
            { text: "Ưu tiên trong hàng đợi xử lý", included: true },
          ],
        },
        business: {
          name: "Business",
          description:
            "Cho doanh nghiệp cần triển khai đa thương hiệu, bảo mật và hỗ trợ chuyên sâu.",
          cta: "Liên hệ bán hàng",
          features: [
            { text: "Tất cả tính năng Pro", included: true },
            { text: "Nhiều workspace / thương hiệu", included: true },
            { text: "Hỗ trợ ưu tiên & tư vấn triển khai", included: true },
            { text: "SLA & tùy chọn bảo mật nâng cao", included: true },
            { text: "Đồng hành chiến dịch theo giai đoạn", included: true },
          ],
        },
      },
      showcaseTitle: "Mọi thứ bạn cần để gamify hành trình tăng trưởng",
      showcaseSubtitle:
        "Thiết kế vòng quay, nhúng vào web và theo dõi hiệu quả — trong một nền tảng gọn gàng cho team marketing.",
      videoPlaceholderLabel: "Video / sản phẩm (placeholder)",
      highlights: [
        {
          title: "Tùy chỉnh trọn vẹn",
          description: "Màu sắc, giải thưởng và luật quay theo từng chiến dịch.",
        },
        {
          title: "Phân tích sâu",
          description: "Theo dõi lượt quay, chuyển đổi và ROI theo thời gian thực.",
        },
        {
          title: "Quay mượt, không độ trễ",
          description: "Trải nghiệm 3D ổn định trên desktop và mobile.",
        },
      ],
      bottomBanner: {
        title: "Vẫn đang phân vân?",
        subtitle:
          "Bắt đầu dùng thử 14 ngày — không cần thẻ tín dụng. Hoặc đặt lịch demo để xem phù hợp với team bạn.",
        primaryCta: "Dùng thử miễn phí",
        secondaryCta: "Đặt lịch demo",
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
      logout: "Sign out",
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
      errorInvalidCredentials: "Invalid email or password.",
      errorEmailNotVerified: "Please verify your email before signing in.",
      resendVerification: "Resend verification email",
      errorGeneric: "Sign in failed. Please try again.",
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
      fullNameLabel: "Full Name (optional)",
      fullNamePlaceholder: "John Smith",
      emailLabel: "Email",
      emailPlaceholder: "name@company.com",
      passwordLabel: "Password",
      confirmPasswordLabel: "Confirm Password",
      passwordPlaceholder: "••••••••",
      submit: "Create Free Account",
      alreadyHaveAccount: "Already have an account?",
      loginHere: "Login here",
      legalDisclaimer:
        "By signing up, you agree to our Terms of Service and Privacy Policy. We'll protect your data like it's our own lucky charm.",
      errorEmailInUse: "This email is already in use. Please sign in.",
      errorGoogleAccountExists: "This email is registered with Google. Please use \"Continue with Google\".",
      errorPasswordMismatch: "Passwords do not match.",
      errorGeneric: "Registration failed. Please try again.",
    },
    auth: {
      oauthCallback: {
        pageTitle: "Google sign-in",
        working: "Finishing sign-in…",
        errorGeneric: "Google sign-in failed. Please try again.",
        googleUnavailable:
          "NEXT_PUBLIC_API_URL is not set — Google sign-in cannot start.",
        continueHome: "Back to home",
        existingAccountTitle: "Account already exists",
        existingAccountSubtitle: "This email is already registered. You have been signed in to your existing account.",
        continueToApp: "Continue to app",
      },
      checkEmail: {
        pageTitle: "Check your inbox — Random Lucky",
        title: "Check your inbox",
        subtitle: "We sent a verification link to",
        resendPrompt: "Didn't receive it?",
        resendAction: "Resend",
        resendSuccess: "Sent! Check your inbox (including spam folder).",
        backToLogin: "Back to login",
      },
      googleWelcome: {
        pageTitle: "Registration successful — Random Lucky",
        title: "Account created successfully! 🎉",
        subtitle: "You signed up for Random Lucky with Google. Your email has been automatically verified.",
        goToDashboard: "Get Started",
        emailNote: "We sent a welcome email to your inbox.",
      },
      verifyEmail: {
        pageTitle: "Verify email — Random Lucky",
        verifying: "Verifying your email…",
        successTitle: "Email verified!",
        successSubtitle: "Your account is now active. You can sign in.",
        goToLogin: "Sign in",
        errorInvalidTitle: "Invalid link",
        errorInvalidBody: "This verification link is invalid or has already been used.",
        errorExpiredTitle: "Link expired",
        errorExpiredBody: "This verification link has expired (24 hours). Please request a new one.",
        resendAction: "Resend verification email",
        resendSuccess: "Sent! Check your inbox.",
      },
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
      productSphereLink: "Product-style sphere demo (217 tiles, mouse orbit & zoom)",
    },
    wheelLabProductSphere: {
      title: "Product-style sphere",
      subtitle:
        "217 tiles (7×31), same spherical placement + outward lookAt as `product`, with mouse orbit, scroll zoom, and pan inside the canvas.",
      helper:
        "Grid and phi/theta match the legacy app; scene units are scaled ×0.01 (radius 800 → 8).",
      modeTable: "Table mode",
      modeSphere: "Sphere mode",
      controlsHint: "Left drag to orbit · scroll to zoom · right-drag (or Shift+drag) to pan.",
      backToLab: "← Wheel Lab",
      spin: "Spin",
      spinning: "Spinning…",
      resetDraw: "Draw again",
      winnerLabel: "Winner",
      noWinner: "No draw yet — press Spin to pick one random winning tile.",
      participantsCount: "Participants in pool",
      winnerOverlayBadge: "Congratulations",
      winnerOverlayIdLabel: "Participant ID",
      demoCardsNote: "Each tile shows demo data (name + code + id). The draw result matches the person on the winning tile.",
      prizeTierFirst: "First prize",
      prizeTierSecond: "Second prize",
      prizeTierThird: "Third prize",
      prizeTierSlotsLabel: "Winners",
      prizeTierHint:
        "Press Spin for third → second → first (one prize per person per session). After each tier, press Continue before the next draw. Progress bars are in the top-left overlay on the sphere.",
      prizePeopleUnit: "people",
      revealPause: "Pause",
      revealResume: "Resume",
      viewAllResults: "View all results",
      resultsSummaryTitle: "Draw results summary",
      resultsSummaryClose: "Close",
      continueNextTier: "Continue to next prize",
      expandArena: "Enter fullscreen",
      collapseArena: "Exit fullscreen",
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
      spinDemo: {
        badge: "Try it now",
        title: "Spin the 3D wheel right here",
        subtitle: "Add up to 10 participants and press Spin to pick a winner. Drag to rotate the sphere.",
        inputPlaceholder: "Enter participant name...",
        addButton: "Add",
        spinButton: "Spin now!",
        spinningButton: "Spinning...",
        resetButton: "Spin again",
        winnerLabel: "Winner",
        maxReached: "Max 10 reached",
        emptyHint: "Add at least 2 people to spin",
        dragHint: "Drag to rotate · scroll to zoom",
        participantsCount: "participants",
      },
    },
    pricing: {
      metaTitle: "Pricing — Random Lucky",
      heroTitle: "Choose Your Engine of Luck",
      heroSubtitle:
        "Compare plans and pick the right tier for your gamified campaigns and events — start free, upgrade when you are ready to scale.",
      billingMonthly: "Monthly",
      billingYearly: "Yearly",
      yearlySaveBadge: "SAVE 20%",
      priceSuffix: "/month",
      billedAnnuallyNote: "Billed annually (20% savings applied).",
      plans: {
        free: {
          name: "Free",
          description:
            "A 14-day trial for your first campaign — ideal for small teams and internal demos.",
          cta: "Get Started",
          features: [
            { text: "Up to 15 participants per event (trial limits)", included: true },
            { text: "3D wheel themes & presets", included: true },
            { text: "Embed on landing pages and websites", included: true },
            { text: "Participant avatar uploads", included: false },
            { text: "Large imports & advanced API access", included: false },
          ],
        },
        pro: {
          name: "Pro",
          popularBadge: "Most Popular",
          description:
            "For marketing teams that need large lists, branding, and full analytics.",
          cta: "Start Pro Trial",
          features: [
            { text: "High participant limits for production campaigns", included: true },
            { text: "Secure avatar uploads", included: true },
            { text: "Large Excel / CSV imports", included: true },
            { text: "API, webhooks & watermark removal", included: true },
            { text: "Priority processing where applicable", included: true },
          ],
        },
        business: {
          name: "Business",
          description:
            "For organizations that need multi-brand rollout, security reviews, and hands-on support.",
          cta: "Contact Sales",
          features: [
            { text: "Everything in Pro", included: true },
            { text: "Multiple workspaces / brands", included: true },
            { text: "Priority support & implementation guidance", included: true },
            { text: "SLA options & advanced security add-ons", included: true },
            { text: "Partner support for major campaign pushes", included: true },
          ],
        },
      },
      showcaseTitle: "Everything you need to gamify your growth",
      showcaseSubtitle:
        "Design wheels, embed them anywhere, and measure performance — one streamlined stack for growth teams.",
      videoPlaceholderLabel: "Product video / screenshot (placeholder)",
      highlights: [
        {
          title: "Full customization",
          description: "Colors, prizes, and rules tailored to every campaign.",
        },
        {
          title: "Deep analytics",
          description: "Track spins, conversions, and ROI in real time.",
        },
        {
          title: "Zero-lag spinning",
          description: "Smooth 3D experiences on desktop and mobile.",
        },
      ],
      bottomBanner: {
        title: "Still not sure?",
        subtitle:
          "Start a 14-day free trial — no credit card required. Or book a live walkthrough with our team.",
        primaryCta: "Start Free Trial",
        secondaryCta: "Book a Demo",
      },
    },
  },
};

export function getMessages(locale: AppLocale) {
  return messages[locale];
}
