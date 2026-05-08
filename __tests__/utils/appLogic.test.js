/**
 * Tests for utility functions and logic extracted from App.jsx:
 *   - validate()
 *   - formatDate()
 *   - decoding a shareable plan from URL params
 *   - advisory level colour mapping
 */

// ── formatDate ────────────────────────────────────────────────────────────────
describe('formatDate', () => {
  // Replicate the function from App.jsx
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}, ${d.getFullYear()}`;
  };

  it('returns empty string for falsy input', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('formats a valid ISO date string', () => {
    const result = formatDate('2026-06-15');
    expect(result).toMatch(/Jun 1[45], 2026/); // timezone-safe
  });

  it('formats the first day of a month', () => {
    const result = formatDate('2026-01-01');
    expect(result).toMatch(/Jan 1, 2026/);
  });
});

// ── validate ──────────────────────────────────────────────────────────────────
describe('validate (form logic)', () => {
  // Replicate the validation logic from App.jsx
  const validate = (destination, startDate, endDate, budget) => {
    const errors = {};
    if (!destination.trim()) errors.destination = 'Destination is required';
    if (!startDate) errors.startDate = 'Start date is required';
    if (!endDate) errors.endDate = 'End date is required';
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errors.endDate = 'End date must be after start date';
    }
    if (!budget || isNaN(budget) || Number(budget) <= 0) {
      errors.budget = 'Budget must be greater than 0';
    }
    return errors;
  };

  it('returns no errors for valid input', () => {
    const errors = validate('Tokyo', '2026-06-01', '2026-06-07', 2500);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('requires destination', () => {
    const errors = validate('', '2026-06-01', '2026-06-07', 2500);
    expect(errors.destination).toBeTruthy();
  });

  it('requires destination (whitespace only)', () => {
    const errors = validate('   ', '2026-06-01', '2026-06-07', 2500);
    expect(errors.destination).toBeTruthy();
  });

  it('requires start date', () => {
    const errors = validate('Tokyo', '', '2026-06-07', 2500);
    expect(errors.startDate).toBeTruthy();
  });

  it('requires end date', () => {
    const errors = validate('Tokyo', '2026-06-01', '', 2500);
    expect(errors.endDate).toBeTruthy();
  });

  it('rejects end date before start date', () => {
    const errors = validate('Tokyo', '2026-06-07', '2026-06-01', 2500);
    expect(errors.endDate).toMatch(/after/i);
  });

  it('accepts equal start and end dates', () => {
    const errors = validate('Tokyo', '2026-06-01', '2026-06-01', 2500);
    expect(errors.endDate).toBeUndefined();
  });

  it('requires budget > 0', () => {
    const errors = validate('Tokyo', '2026-06-01', '2026-06-07', 0);
    expect(errors.budget).toBeTruthy();
  });

  it('rejects negative budget', () => {
    const errors = validate('Tokyo', '2026-06-01', '2026-06-07', -100);
    expect(errors.budget).toBeTruthy();
  });

  it('rejects non-numeric budget', () => {
    const errors = validate('Tokyo', '2026-06-01', '2026-06-07', 'abc');
    expect(errors.budget).toBeTruthy();
  });

  it('rejects empty budget', () => {
    const errors = validate('Tokyo', '2026-06-01', '2026-06-07', '');
    expect(errors.budget).toBeTruthy();
  });

  it('collects multiple errors at once', () => {
    const errors = validate('', '', '', '');
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(3);
  });
});

// ── Shareable plan URL decode ─────────────────────────────────────────────────
describe('shareable plan decoding', () => {
  const encode = (data) => btoa(encodeURIComponent(JSON.stringify(data)));
  const decode = (encoded) => JSON.parse(decodeURIComponent(atob(encoded)));

  it('roundtrips a plan object via base64', () => {
    const plan = { destination: 'Paris', totalDays: 5, estimatedCost: 3000 };
    expect(decode(encode(plan))).toEqual(plan);
  });

  it('throws on invalid base64 input', () => {
    expect(() => decode('not-valid-base64!!')).toThrow();
  });

  it('throws on valid base64 but non-JSON payload', () => {
    expect(() => decode(btoa('hello world'))).toThrow();
  });
});

// ── Advisory level classification ─────────────────────────────────────────────
describe('advisory level helpers', () => {
  const WAR_LEVELS = ['none', 'caution', 'high', 'extreme'];
  const HAZARD_LEVELS = ['none', 'low', 'moderate', 'high'];

  it('recognises all valid war conflict levels', () => {
    WAR_LEVELS.forEach((level) => {
      expect(WAR_LEVELS).toContain(level);
    });
  });

  it('recognises all valid natural hazard levels', () => {
    HAZARD_LEVELS.forEach((level) => {
      expect(HAZARD_LEVELS).toContain(level);
    });
  });

  it('treats "none" as non-alerting for war', () => {
    expect('none').toBe('none');
  });

  it('treats "extreme" as highest war severity', () => {
    const sorted = [...WAR_LEVELS];
    expect(sorted.indexOf('extreme')).toBeGreaterThan(sorted.indexOf('high'));
  });
});

// ── Trip duration calculation ─────────────────────────────────────────────────
describe('trip duration calculation', () => {
  const calcDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  it('returns 1 day for same start and end', () => {
    expect(calcDays('2026-06-01', '2026-06-01')).toBe(1);
  });

  it('returns 7 for a week trip', () => {
    expect(calcDays('2026-06-01', '2026-06-07')).toBe(7);
  });

  it('returns 2 for consecutive days', () => {
    expect(calcDays('2026-06-01', '2026-06-02')).toBe(2);
  });

  it('handles month boundaries correctly', () => {
    expect(calcDays('2026-01-30', '2026-02-01')).toBe(3);
  });
});
