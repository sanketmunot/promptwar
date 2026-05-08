/**
 * Component integration tests for App.jsx
 * Covers: LandingPage, form view, result view, advisory cards, navigation.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

// ── Mock global fetch ─────────────────────────────────────────────────────────
const mockGeminiResponse = (overrides = {}) => ({
  candidates: [{
    content: {
      parts: [{
        text: JSON.stringify({
          destination: 'Tokyo',
          totalDays: 3,
          estimatedCost: 1500,
          advisories: {
            warConflict: { level: 'none', summary: null, details: [] },
            naturalHazards: { level: 'none', summary: null, details: [] },
          },
          days: [
            {
              day: 1,
              title: 'Day One',
              activities: [{ time: 'Morning', activity: 'Visit temple', cost: 0 }],
            },
          ],
          ...overrides,
        }),
      }],
    },
  }],
});

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => mockGeminiResponse(),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────────────────────────────────────
describe('LandingPage', () => {
  it('renders the hero heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the "Start Planning Now" CTA button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /start planning now/i })).toBeInTheDocument();
  });

  it('renders three feature cards', () => {
    render(<App />);
    expect(screen.getByText('AI-Powered Precision')).toBeInTheDocument();
    expect(screen.getByText('Smart Budgeting')).toBeInTheDocument();
    expect(screen.getByText('Easily Shareable')).toBeInTheDocument();
  });

  it('navigates to form view on CTA click', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /start planning now/i }));
    expect(screen.getByRole('heading', { name: /getaway with ai/i })).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION BAR
// ─────────────────────────────────────────────────────────────────────────────
describe('TopNav', () => {
  it('renders the Vagabond AI brand name', () => {
    render(<App />);
    expect(screen.getByText('Vagabond AI')).toBeInTheDocument();
  });

  it('renders a navigation landmark', () => {
    render(<App />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('clicking logo on form view returns to landing', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /start planning now/i }));
    // Logo is a button (or clickable div) with the brand text
    const logo = screen.getByRole('button', { name: /vagabond ai/i });
    await userEvent.click(logo);
    expect(screen.getByRole('button', { name: /start planning now/i })).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FORM VALIDATION
// ─────────────────────────────────────────────────────────────────────────────
describe('Trip planning form', () => {
  async function goToForm() {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /start planning now/i }));
  }

  it('renders all form fields with labels', async () => {
    await goToForm();
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total budget/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitted empty', async () => {
    await goToForm();
    await userEvent.click(screen.getByRole('button', { name: /generate magic itinerary/i }));
    expect(await screen.findByText(/destination is required/i)).toBeInTheDocument();
    expect(screen.getByText(/start date is required/i)).toBeInTheDocument();
    expect(screen.getByText(/end date is required/i)).toBeInTheDocument();
    expect(screen.getByText(/budget must be greater than 0/i)).toBeInTheDocument();
  });

  it('shows error when end date is before start date', async () => {
    await goToForm();
    fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Paris' } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2026-06-10' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2026-06-05' } });
    fireEvent.change(screen.getByLabelText(/total budget/i), { target: { value: '2000' } });
    await userEvent.click(screen.getByRole('button', { name: /generate magic itinerary/i }));
    expect(await screen.findByText(/end date must be after start date/i)).toBeInTheDocument();
  });

  it('submit button is accessible and has correct type', async () => {
    await goToForm();
    const btn = screen.getByRole('button', { name: /generate magic itinerary/i });
    expect(btn).toHaveAttribute('type', 'submit');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FETCHING & RESULT VIEW
// ─────────────────────────────────────────────────────────────────────────────
describe('Itinerary result', () => {
  async function generateItinerary(overrides = {}) {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockGeminiResponse(overrides),
    });

    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /start planning now/i }));
    fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Tokyo' } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2026-06-01' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2026-06-03' } });
    fireEvent.change(screen.getByLabelText(/total budget/i), { target: { value: '1500' } });
    await userEvent.click(screen.getByRole('button', { name: /generate magic itinerary/i }));
    await waitFor(() => screen.getByRole('heading', { name: 'Tokyo' }), { timeout: 3000 });
  }

  it('shows the destination heading in result', async () => {
    await generateItinerary();
    expect(screen.getByRole('heading', { name: 'Tokyo' })).toBeInTheDocument();
  });

  it('shows itinerary day title', async () => {
    await generateItinerary();
    expect(screen.getByText('Day One')).toBeInTheDocument();
  });

  it('shows activity from the itinerary', async () => {
    await generateItinerary();
    expect(screen.getByText('Visit temple')).toBeInTheDocument();
  });

  it('shows Share and Regenerate action buttons', async () => {
    await generateItinerary();
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument();
  });

  it('does NOT show advisory cards when both advisories are "none"', async () => {
    await generateItinerary();
    expect(screen.queryByText(/conflict advisory/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/natural hazard risk/i)).not.toBeInTheDocument();
  });

  it('shows war conflict advisory for non-none level', async () => {
    await generateItinerary({
      advisories: {
        warConflict: {
          level: 'extreme',
          summary: 'Active armed conflict in the region.',
          details: ['Avoid non-essential travel.'],
        },
        naturalHazards: { level: 'none', summary: null, details: [] },
      },
    });
    expect(await screen.findByText(/conflict advisory/i)).toBeInTheDocument();
    expect(screen.getByText(/active armed conflict in the region/i)).toBeInTheDocument();
  });

  it('shows natural hazard advisory for non-none level', async () => {
    await generateItinerary({
      advisories: {
        warConflict: { level: 'none', summary: null, details: [] },
        naturalHazards: {
          level: 'high',
          summary: 'Earthquake-prone region.',
          details: ['Monitor local alerts.'],
        },
      },
    });
    expect(await screen.findByText(/natural hazard risk/i)).toBeInTheDocument();
    expect(screen.getByText(/earthquake-prone region/i)).toBeInTheDocument();
  });

  it('shows both advisory cards simultaneously', async () => {
    await generateItinerary({
      advisories: {
        warConflict: {
          level: 'high',
          summary: 'Civil unrest reported.',
          details: ['Check travel warnings.'],
        },
        naturalHazards: {
          level: 'moderate',
          summary: 'Typhoon season active.',
          details: ['Monitor weather.'],
        },
      },
    });
    expect(await screen.findByText(/conflict advisory/i)).toBeInTheDocument();
    expect(screen.getByText(/natural hazard risk/i)).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────
describe('Error handling', () => {
  async function goToForm() {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /start planning now/i }));
  }

  it('alerts on API error response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    });

    await goToForm();
    fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Paris' } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2026-06-01' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2026-06-07' } });
    fireEvent.change(screen.getByLabelText(/total budget/i), { target: { value: '2000' } });
    await userEvent.click(screen.getByRole('button', { name: /generate magic itinerary/i }));
    await waitFor(() => expect(window.alert).toHaveBeenCalled(), { timeout: 3000 });
  });

  it('alerts on network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network failure'));

    await goToForm();
    fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Paris' } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2026-06-01' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2026-06-07' } });
    fireEvent.change(screen.getByLabelText(/total budget/i), { target: { value: '2000' } });
    await userEvent.click(screen.getByRole('button', { name: /generate magic itinerary/i }));
    await waitFor(() => expect(window.alert).toHaveBeenCalled(), { timeout: 3000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SHARE FUNCTIONALITY
// ─────────────────────────────────────────────────────────────────────────────
describe('Share functionality', () => {
  it('copies URL to clipboard on Share click', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockGeminiResponse(),
    });

    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /start planning now/i }));
    fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Tokyo' } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2026-06-01' } });
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2026-06-03' } });
    fireEvent.change(screen.getByLabelText(/total budget/i), { target: { value: '1500' } });
    await userEvent.click(screen.getByRole('button', { name: /generate magic itinerary/i }));
    await waitFor(() => screen.getByRole('heading', { name: 'Tokyo' }), { timeout: 3000 });
    await userEvent.click(screen.getByRole('button', { name: /share/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });
});
