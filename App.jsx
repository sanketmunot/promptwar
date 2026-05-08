"use client";
import React, { useState, useEffect } from 'react';
import { Plane, Moon, MapPin, Calendar, DollarSign, Send, Globe, Share2, RefreshCw, Clock, ExternalLink, Sparkles, Map, ChevronRight, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FeatureCard = ({ icon, title, desc, delay }) => (
  <motion.div
    initial={{ y: 30, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white/50 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
  >
    <div className="bg-gradient-to-br from-white to-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center shadow-md border border-slate-100 mb-6 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
    <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
  </motion.div>
);

const LandingPage = ({ onStart }) => {
  return (
    <motion.div
      key="landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
      transition={{ duration: 0.5 }}
      className="flex-grow flex flex-col items-center justify-center p-6 sm:p-10 z-10 w-full min-h-[calc(100vh-100px)]"
    >
      <div className="text-center mb-20 relative mt-12 md:mt-0 max-w-4xl mx-auto">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl font-black text-slate-900 mb-8 leading-[1.05] tracking-tighter"
        >
          Travel Planning, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
            Reimagined with AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-slate-500 text-lg md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed mb-12"
        >
          Stop spending hours researching. Tell Vagabond AI where you want to go, and get a complete, personalized itinerary in seconds.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg md:text-xl py-5 px-12 rounded-full shadow-2xl hover:shadow-slate-900/30 transition-all flex items-center gap-3 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 flex items-center gap-3">
              <Plane className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Start Planning Now
            </span>
          </motion.button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-8 md:px-12 mt-8 pb-16">
        <FeatureCard
          icon={<Sparkles className="w-8 h-8 text-indigo-500" />}
          title="AI-Powered Precision"
          desc="Our advanced AI creates day-by-day plans tailored exactly to your destination and timeframe."
          delay={0.4}
        />
        <FeatureCard
          icon={<DollarSign className="w-8 h-8 text-emerald-500" />}
          title="Smart Budgeting"
          desc="Set your budget and we'll estimate costs for activities, helping you stay on track."
          delay={0.5}
        />
        <FeatureCard
          icon={<Share2 className="w-8 h-8 text-pink-500" />}
          title="Easily Shareable"
          desc="Generate a unique link to your itinerary to share with travel companions instantly."
          delay={0.6}
        />
      </div>
    </motion.div>
  );
};

export default function App() {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [originalBudget, setOriginalBudget] = useState(null);
  const [viewState, setViewState] = useState('landing');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    if (plan) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(plan)));
        setItinerary(decoded);
        setOriginalBudget(decoded.originalBudget || decoded.estimatedCost);
        setViewState('result');
      } catch (e) {
        console.error("Invalid shareable link", e);
      }
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!destination.trim()) newErrors.destination = "Destination is required";
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    if (!budget || isNaN(budget) || Number(budget) <= 0) {
      newErrors.budget = "Budget must be greater than 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchItinerary = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    setOriginalBudget(Number(budget));

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const prompt = `You are a travel planning assistant. Generate a ${days}-day trip itinerary for ${destination} from ${startDate} to ${endDate} with a total budget of $${budget} USD.

IMPORTANT: Before the itinerary, assess the current safety situation for this destination:
1. Check for any active armed conflicts, wars, civil unrest, or military operations
2. Check for known natural hazard risks: seismic/earthquake activity, tsunami risk zones, volcanic activity, hurricane/cyclone/typhoon seasons, flood-prone areas
3. Check for any recent or ongoing natural disasters

Return ONLY valid JSON in this exact shape, no markdown, no explanation:
{
  "destination": "string",
  "totalDays": ${days},
  "estimatedCost": number,
  "advisories": {
    "warConflict": {
      "level": "none" | "caution" | "high" | "extreme",
      "summary": "string (null if level is none)",
      "details": ["string"] 
    },
    "naturalHazards": {
      "level": "none" | "low" | "moderate" | "high",
      "summary": "string (null if level is none)",
      "details": ["string"]
    }
  },
  "days": [
    {
      "day": number,
      "title": "string",
      "activities": [
        { "time": "string", "activity": "string", "cost": number }
      ]
    }
  ]
}`;

    try {
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 16384,
            // Cap thinking tokens so the JSON response has enough room
            thinkingConfig: { thinkingBudget: 1024 }
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to fetch from Gemini");
      }

      const text = data.candidates[0].content.parts[0].text;
      const cleanText = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanText);

      parsed.startDate = startDate;
      parsed.endDate = endDate;
      parsed.originalBudget = Number(budget);

      setItinerary(parsed);
      setViewState('result');
    } catch (err) {
      console.error(err);
      alert("Error generating itinerary: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchItinerary();
  };

  const handleShare = () => {
    try {
      const base64 = btoa(encodeURIComponent(JSON.stringify(itinerary)));
      const url = `${window.location.origin}${window.location.pathname}?plan=${base64}`;
      navigator.clipboard.writeText(url);
      alert("Shareable link copied to clipboard!");
    } catch (e) {
      alert("Failed to generate link");
    }
  };

  const handleNewTrip = () => {
    setItinerary(null);
    setDestination('');
    setStartDate('');
    setEndDate('');
    setBudget('');
    setOriginalBudget(null);
    setViewState('form');
    window.history.pushState({}, '', window.location.pathname); // clear URL
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const TopNav = () => (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between p-4 px-6 md:px-12 backdrop-blur-xl bg-white/70 border-b border-white/40 sticky top-0 z-50 shadow-sm"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => {
          setItinerary(null);
          setViewState('landing');
          window.history.pushState({}, '', window.location.pathname);
        }}
      >
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all">
          <Plane className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
        <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-950 to-purple-900">
          Vagabond AI
        </span>
      </motion.div>
      <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-full transition-colors shadow-sm bg-white/50 border border-slate-100">
        <Moon className="w-4 h-4" />
      </button>
    </motion.nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/40 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-pink-200/30 to-rose-200/30 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-tr from-blue-200/30 to-indigo-200/30 blur-[150px]" />
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[100px]" />
      </div>

      <TopNav />

      <AnimatePresence mode="wait">
        {viewState === 'landing' && (
          <LandingPage onStart={() => setViewState('form')} />
        )}
        {viewState === 'form' && (
          <motion.main
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex-grow flex flex-col items-center justify-center p-6 sm:p-10 z-10 w-full min-h-[calc(100vh-100px)]"
          >
            <div className="text-center mb-16 relative max-w-3xl mx-auto mt-10 md:mt-0">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-[1.05] tracking-tighter"
              >
                Design Your Perfect <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                  Getaway with AI
                </span>
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
              >
                Enter your details below and our engine will craft a personalized, day-by-day itinerary in seconds.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-white w-full max-w-3xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/10 pointer-events-none" />

              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-500" /> Destination
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    placeholder="e.g. Kyoto, Japan or Amalfi Coast"
                    className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium text-lg shadow-sm"
                  />
                  {errors.destination && <p className="text-pink-500 text-sm mt-2 font-semibold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-pink-500" />{errors.destination}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500" /> Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 outline-none transition-all text-slate-800 font-medium text-lg shadow-sm appearance-none min-h-[60px]"
                    />
                    {errors.startDate && <p className="text-pink-500 text-sm mt-2 font-semibold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-pink-500" />{errors.startDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500" /> End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 outline-none transition-all text-slate-800 font-medium text-lg shadow-sm appearance-none min-h-[60px]"
                    />
                    {errors.endDate && <p className="text-pink-500 text-sm mt-2 font-semibold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-pink-500" />{errors.endDate}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-indigo-500" /> Total Budget (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-bold text-lg">$</span>
                    </div>
                    <input
                      type="number"
                      value={budget}
                      onChange={e => setBudget(e.target.value)}
                      placeholder="2500"
                      className="w-full pl-10 pr-6 py-4 bg-slate-50/50 border border-slate-200/80 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium text-lg shadow-sm"
                    />
                  </div>
                  {errors.budget && <p className="text-pink-500 text-sm mt-2 font-semibold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-pink-500" />{errors.budget}</p>}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 px-8 rounded-2xl transition-all flex justify-center items-center gap-3 mt-6 shadow-xl hover:shadow-2xl hover:shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed text-lg relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex items-center gap-3">
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Crafting your journey...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" /> Generate Magic Itinerary
                      </>
                    )}
                  </div>
                </motion.button>
              </form>
            </motion.div>
          </motion.main>
        )}
        {viewState === 'result' && itinerary && (
          <motion.main
            key="result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex-grow max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 z-10"
          >
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100/80 text-indigo-700 font-bold tracking-widest text-xs uppercase mb-4 border border-indigo-200"
                >
                  <Globe className="w-3.5 h-3.5" /> Your Itinerary is Ready
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-6xl font-black text-slate-900 mb-5 tracking-tight"
                >
                  {itinerary.destination}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600"
                >
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    {formatDate(itinerary.startDate)} — {formatDate(itinerary.endDate)}
                  </div>
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    {itinerary.totalDays} Days
                  </div>
                  <div className="bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg font-bold shadow-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Est. Cost: ${itinerary.estimatedCost}
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 w-full md:w-auto"
              >
                <button
                  onClick={handleShare}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition shadow-sm hover:shadow"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button
                  onClick={fetchItinerary}
                  disabled={loading}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-md hover:shadow-lg disabled:opacity-70"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Regenerate
                </button>
              </motion.div>
            </div>

            {/* Advisory Cards */}
            {(itinerary.advisories?.warConflict?.level !== 'none' || itinerary.advisories?.naturalHazards?.level !== 'none') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
              >
                {/* War / Conflict Advisory */}
                {itinerary.advisories?.warConflict?.level && itinerary.advisories.warConflict.level !== 'none' && (
                  <div className={`rounded-2xl border p-5 ${
                    itinerary.advisories.warConflict.level === 'extreme'
                      ? 'bg-red-50 border-red-300'
                      : itinerary.advisories.warConflict.level === 'high'
                      ? 'bg-orange-50 border-orange-300'
                      : 'bg-yellow-50 border-yellow-300'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-lg font-black uppercase tracking-widest text-xs px-2.5 py-1 rounded-full ${
                        itinerary.advisories.warConflict.level === 'extreme'
                          ? 'bg-red-100 text-red-700'
                          : itinerary.advisories.warConflict.level === 'high'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>⚔️ {itinerary.advisories.warConflict.level.toUpperCase()} — Conflict Advisory</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">{itinerary.advisories.warConflict.summary}</p>
                    <ul className="space-y-1">
                      {itinerary.advisories.warConflict.details?.map((d, i) => (
                        <li key={i} className="text-xs text-slate-600 flex gap-2"><span className="mt-0.5 shrink-0">•</span>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Natural Hazard Advisory */}
                {itinerary.advisories?.naturalHazards?.level && itinerary.advisories.naturalHazards.level !== 'none' && (
                  <div className={`rounded-2xl border p-5 ${
                    itinerary.advisories.naturalHazards.level === 'high'
                      ? 'bg-amber-50 border-amber-300'
                      : itinerary.advisories.naturalHazards.level === 'moderate'
                      ? 'bg-sky-50 border-sky-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`font-black uppercase tracking-widest text-xs px-2.5 py-1 rounded-full ${
                        itinerary.advisories.naturalHazards.level === 'high'
                          ? 'bg-amber-100 text-amber-700'
                          : itinerary.advisories.naturalHazards.level === 'moderate'
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>🌊 {itinerary.advisories.naturalHazards.level.toUpperCase()} — Natural Hazard Risk</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">{itinerary.advisories.naturalHazards.summary}</p>
                    <ul className="space-y-1">
                      {itinerary.advisories.naturalHazards.details?.map((d, i) => (
                        <li key={i} className="text-xs text-slate-600 flex gap-2"><span className="mt-0.5 shrink-0">•</span>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-white/80 backdrop-blur-lg rounded-[2.5rem] shadow-sm border border-slate-100 p-6 sm:p-10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500" />

                  <div className="space-y-12 pl-4">
                    {itinerary.days?.map((dayPlan, idx) => (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx}
                        className="relative"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-black text-lg shrink-0 shadow-sm border border-indigo-200/50">
                              {dayPlan.day}
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">{dayPlan.title}</h3>
                          </div>
                        </div>

                        <div className="ml-6 pl-8 border-l-[3px] border-slate-100 space-y-6 relative">
                          {dayPlan.activities?.map((act, i) => (
                            <motion.div
                              whileHover={{ x: 5 }}
                              key={i}
                              className="relative group bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
                            >
                              <div className="absolute w-4 h-4 bg-white border-[3px] border-indigo-400 rounded-full -left-[41px] top-6 group-hover:scale-125 transition-transform" />
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-2 uppercase tracking-wide">
                                    <Clock className="w-4 h-4" /> {act.time}
                                  </div>
                                  <p className="text-slate-700 font-semibold text-[1.05rem] leading-relaxed">{act.activity}</p>
                                </div>
                                <div className="bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm px-3 py-1.5 rounded-lg self-start mt-2 sm:mt-0 shadow-sm shrink-0">
                                  ${act.cost}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-[2.5rem] p-3 shadow-sm border border-slate-100 relative group overflow-hidden"
                >
                  <div className="w-full h-72 bg-slate-100 rounded-[2rem] overflow-hidden relative">
                    <a
                      href={`https://maps.google.com/maps?q=${encodeURIComponent(itinerary.destination)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl text-sm font-bold text-slate-800 shadow-lg flex items-center gap-2 hover:bg-white hover:scale-105 transition-all z-10"
                    >
                      <Map className="w-4 h-4 text-indigo-600" /> Open Map
                    </a>
                    <iframe
                      title="Map view"
                      width="100%"
                      height="100%"
                      style={{ border: 0, filter: 'contrast(1.1) saturate(1.2)' }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(itinerary.destination)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-[-20%] right-[-10%] opacity-10 transform rotate-12">
                    <Navigation className="w-64 h-64" />
                  </div>

                  <h3 className="text-2xl font-black mb-8 flex items-center gap-3 relative z-10">
                    <div className="bg-indigo-500/30 p-2 rounded-lg">
                      <DollarSign className="w-6 h-6 text-indigo-300" />
                    </div>
                    Budget Overview
                  </h3>

                  <div className="space-y-6 relative z-10 text-[15px]">
                    <div className="flex justify-between items-center border-b border-indigo-800/50 pb-5">
                      <span className="text-indigo-200 font-medium">Trip Duration</span>
                      <span className="font-bold text-lg">{itinerary.totalDays} Days</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-indigo-800/50 pb-5">
                      <span className="text-indigo-200 font-medium">Initial Budget</span>
                      <span className="font-bold text-lg">${itinerary.originalBudget || originalBudget || itinerary.estimatedCost}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-indigo-800/50 pb-5">
                      <span className="text-indigo-200 font-medium">Est. Total Cost</span>
                      <span className="font-black text-xl text-emerald-400">${itinerary.estimatedCost}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-indigo-200 font-medium">Daily Average</span>
                      <span className="font-bold text-lg">${Math.round(itinerary.estimatedCost / itinerary.totalDays)}</span>
                    </div>

                    <button
                      onClick={handleNewTrip}
                      className="w-full mt-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group"
                    >
                      Plan Another Trip <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      <footer className="text-center py-8 text-sm text-slate-400 font-medium z-10">
        © {new Date().getFullYear()} Vagabond AI. Powered by Gemini.
      </footer>
    </div>
  );
}
