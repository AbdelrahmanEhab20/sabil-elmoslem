import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock framer-motion
jest.mock("framer-motion", () => {
  const React = require("react");
  const createMotionComponent = (tag) =>
    React.forwardRef(({ children, initial, animate, transition, whileInView, viewport, whileHover, whileTap, ...props }, ref) => {
      // Filter out framer-motion specific props
      return React.createElement(tag, { ...props, ref }, children);
    });
  
  return {
    motion: {
      div: createMotionComponent("div"),
      span: createMotionComponent("span"),
      button: createMotionComponent("button"),
      ul: createMotionComponent("ul"),
      li: createMotionComponent("li"),
      h1: createMotionComponent("h1"),
      h2: createMotionComponent("h2"),
      h3: createMotionComponent("h3"),
      p: createMotionComponent("p"),
      section: createMotionComponent("section"),
      article: createMotionComponent("article"),
      nav: createMotionComponent("nav"),
      header: createMotionComponent("header"),
      footer: createMotionComponent("footer"),
      main: createMotionComponent("main"),
      aside: createMotionComponent("aside"),
    },
    AnimatePresence: ({ children }) => children,
    useAnimation: () => ({
      start: jest.fn(),
      stop: jest.fn(),
    }),
    useMotionValue: () => ({
      get: () => 0,
      set: jest.fn(),
    }),
    useTransform: () => 0,
    MotionConfig: ({ children }) => children,
  };
});

// Mock lucide-react icons
jest.mock("lucide-react", () => {
  const React = require("react");
  const createMockIcon = (name) =>
    React.forwardRef((props, ref) =>
      React.createElement("svg", {
        ...props,
        ref,
        "data-testid": `icon-${name}`,
      })
    );

  return {
    Search: createMockIcon("Search"),
    Check: createMockIcon("Check"),
    Plus: createMockIcon("Plus"),
    RotateCcw: createMockIcon("RotateCcw"),
    BadgeCheck: createMockIcon("BadgeCheck"),
    ListOrdered: createMockIcon("ListOrdered"),
    Play: createMockIcon("Play"),
    Pause: createMockIcon("Pause"),
    Volume2: createMockIcon("Volume2"),
    VolumeX: createMockIcon("VolumeX"),
    SkipForward: createMockIcon("SkipForward"),
    SkipBack: createMockIcon("SkipBack"),
    Loader2: createMockIcon("Loader2"),
    MapPin: createMockIcon("MapPin"),
    Clock: createMockIcon("Clock"),
    Sun: createMockIcon("Sun"),
    Moon: createMockIcon("Moon"),
    Sunrise: createMockIcon("Sunrise"),
    Sunset: createMockIcon("Sunset"),
    ChevronLeft: createMockIcon("ChevronLeft"),
    ChevronRight: createMockIcon("ChevronRight"),
    ChevronDown: createMockIcon("ChevronDown"),
    ChevronUp: createMockIcon("ChevronUp"),
    X: createMockIcon("X"),
    Menu: createMockIcon("Menu"),
    Home: createMockIcon("Home"),
    Book: createMockIcon("Book"),
    Settings: createMockIcon("Settings"),
    Info: createMockIcon("Info"),
    AlertCircle: createMockIcon("AlertCircle"),
    CheckCircle: createMockIcon("CheckCircle"),
    RefreshCw: createMockIcon("RefreshCw"),
    Globe: createMockIcon("Globe"),
    Languages: createMockIcon("Languages"),
  };
});

