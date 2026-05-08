import '@testing-library/jest-dom';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const React = require('react');
  const motion = new Proxy({}, {
    get: (_, tag) => {
      const Component = React.forwardRef(({ children, ...props }, ref) => {
        // Strip framer-motion-specific props
        const {
          initial, animate, exit, transition, whileHover, whileTap,
          whileInView, viewport, layout, layoutId, variants, custom,
          ...domProps
        } = props;
        return React.createElement(tag, { ...domProps, ref }, children);
      });
      Component.displayName = `motion.${tag}`;
      return Component;
    },
  });

  return {
    motion,
    AnimatePresence: ({ children }) => children,
    useAnimation: () => ({ start: jest.fn(), stop: jest.fn() }),
    useInView: () => true,
  };
});

// Mock lucide-react icons as simple spans
jest.mock('lucide-react', () => {
  const icons = [
    'Plane', 'Moon', 'MapPin', 'Calendar', 'DollarSign', 'Send', 'Globe',
    'Share2', 'RefreshCw', 'Clock', 'ExternalLink', 'Sparkles', 'Map',
    'ChevronRight', 'Navigation',
  ];
  const mocks = {};
  icons.forEach((name) => {
    mocks[name] = ({ className }) =>
      require('react').createElement('span', {
        'data-testid': `icon-${name.toLowerCase()}`,
        className,
      });
  });
  return mocks;
});

if (typeof window !== 'undefined') {
  // history.pushState is not fully implemented in jsdom, we can spy on it
  window.history.pushState = jest.fn();

  // Mock clipboard
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: jest.fn().mockResolvedValue(undefined) },
    writable: true,
  });
}

// Silence console.error in tests (keeps output clean)
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  if (typeof window !== 'undefined') {
    window.alert = jest.fn();
  }
});

afterEach(() => {
  jest.restoreAllMocks();
});
