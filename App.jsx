"use client";
import React, { useState, useEffect } from 'react';
import { Plane, Moon, MapPin, Calendar, DollarSign, Send, Globe, Share2, RefreshCw, Clock, ExternalLink, Sparkles, Map, ChevronRight, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FeatureCard = ({ icon, title, desc, delay }) => (
  <motion.div
    initial={{ y: 30, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay }}
    className="bg-white/60 backdrop-blur-lg p-8 rounded-3xl border border-white/60 shadow-sm hover:shadow-md transition-all group"
  >
    <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
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
      exit={{ opacity: 0, y: -20 }}
      className="flex-grow flex flex-col items-center justify-center p-6 sm:p-10 z-10 w-full max-w-6xl mx-auto"
    >
      <div className="text-center mb-16 relative mt-8 md:mt-0">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: "spring", delay: 0.2 }}
          className="absolute -top-12 -left-8 text-yellow-400 opacity-80 hidden md:block"
        >
          <Sparkles className="w-10 h-10" />
        </motion.div>
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          transition={{ type: "spring", delay: 0.4 }}
          className="absolute bottom-0 -right-12 text-indigo-400 opacity-80 hidden md:block"
        >
          <Plane className="w-12 h-12 rotate-45" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-slate-200 text-slate-600 font-semibold text-sm mb-6 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-indigo-500" /> Vagabond AI Travel Engine
        </motion.div>

        <motion.h1 
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-[1.1] tracking-tight"
        >
          Travel Planning, <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
            Reimagined with AI
          </span>
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 text-lg md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Stop spending hours researching. Tell Vagabond AI where you want to go, and get a complete, personalized itinerary in seconds.
        </motion.p>
        
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg md:text-xl py-4 px-8 md:py-5 md:px-10 rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(99,102,241,0.6)] hover:shadow-[0_25px_50px_-15px_rgba(99,102,241,0.7)] transition-all flex items-center gap-3 mx-auto"
        >
          <Plane className="w-6 h-6" /> Start Planning Now
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full mt-4">
        <FeatureCard 
          icon={<Sparkles className="w-6 h-6 text-indigo-500" />}
          title="AI-Powered Precision"
          desc="Our advanced AI creates day-by-day plans tailored exactly to your destination and timeframe."
          delay={0.3}
        />
        <FeatureCard 
          icon={<DollarSign className="w-6 h-6 text-emerald-500" />}
          title="Smart Budgeting"
          desc="Set your budget and we'll estimate costs for activities, helping you stay on track."
          delay={0.4}
        />
        <FeatureCard 
          icon={<Share2 className="w-6 h-6 text-pink-500" />}
          title="Easily Shareable"
          desc="Generate a unique link to your itinerary to share with travel companions instantly."
          delay={0.5}
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

    const prompt = `Generate a ${days}-day trip itinerary for ${destination} from ${startDate} to ${endDate} with a total budget of $${budget} USD. Return ONLY valid JSON in this exact shape, no markdown, no explanation:
{
  "destination": "string",
  "totalDays": ${days},
  "estimatedCost": number,
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
      const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        alert("API Key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment.");
        setLoading(false);
        return;
      }

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 8192
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
    <div className="min-h-screen bg-[#f4f7f9] font-sans flex flex-col relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/80 via-purple-50/40 to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-200/40 blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-200/40 blur-[120px] -z-10 pointer-events-none" />
      
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
            transition={{ duration: 0.4 }}
            className="flex-grow flex flex-col items-center justify-center p-6 sm:p-10 z-10"
          >
            <div className="text-center mb-12 relative">
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                transition={{ type: "spring", delay: 0.2 }}
                className="absolute -top-8 -right-8 text-yellow-400 opacity-80"
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>
              <h1 className="text-5xl md:text-[3.5rem] font-black text-slate-900 mb-6 leading-[1.1] tracking-tight">
                Design Your Perfect <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                  Getaway with AI
                </span>
              </h1>
              <p className="text-slate-500 text-lg md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
                Enter your details below and our engine will craft a personalized, day-by-day itinerary in seconds.
              </p>
            </div>

            <motion.div 
              className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/60 w-full max-w-3xl relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 rounded-[2.5rem] pointer-events-none" />
              
              <form onSubmit={handleSubmit} className="space-y-7 relative z-10">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2.5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-500" /> Destination
                  </label>
                  <input 
                    type="text" 
                    value={destination} 
                    onChange={e => setDestination(e.target.value)}
                    placeholder="e.g. Kyoto, Japan or Amalfi Coast"
                    className="w-full px-5 py-4 bg-white/80 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium text-lg shadow-sm"
                  />
                  {errors.destination && <p className="text-pink-500 text-sm mt-2 font-semibold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-pink-500" />{errors.destination}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2.5 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500" /> Start Date
                    </label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-5 py-4 bg-white/80 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-800 font-medium text-lg shadow-sm appearance-none"
                    />
                    {errors.startDate && <p className="text-pink-500 text-sm mt-2 font-semibold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-pink-500" />{errors.startDate}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2.5 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-500" /> End Date
                    </label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full px-5 py-4 bg-white/80 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-800 font-medium text-lg shadow-sm appearance-none"
                    />
                    {errors.endDate && <p className="text-pink-500 text-sm mt-2 font-semibold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-pink-500" />{errors.endDate}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2.5 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-indigo-500" /> Total Budget (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-bold text-lg">$</span>
                    </div>
                    <input 
                      type="number" 
                      value={budget} 
                      onChange={e => setBudget(e.target.value)}
                      placeholder="2500"
                      className="w-full pl-9 pr-5 py-4 bg-white/80 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-800 placeholder-slate-400 font-medium text-lg shadow-sm"
                    />
                  </div>
                  {errors.budget && <p className="text-pink-500 text-sm mt-2 font-semibold flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-pink-500" />{errors.budget}</p>}
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-2xl transition-all flex justify-center items-center gap-3 mt-4 shadow-[0_10px_20px_-10px_rgba(99,102,241,0.6)] hover:shadow-[0_15px_30px_-10px_rgba(99,102,241,0.7)] disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                >
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
