"use client";


import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Heart, Check, Calendar, MapPin, Sparkles, ArrowLeft } from "lucide-react";
import clsx from "clsx";
import confetti from "canvas-confetti";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:40080";

type Step = "intro" | "question" | "proposal" | "celebrating" | "choiceDay" | "choicePlace" | "sending" | "confirmation";

const INTRO_NAME = "Manuela Fouedjio";
const INTRO_MESSAGE = "Ce message est pour toi. Une question spéciale t'attend... Quand tu es prête, clique sur Commencer.";
// Étape 1 : choix du jour
const DAY_OPTIONS = [
  { id: "sat7", label: "Samedi 7 février à 19h" },
  { id: "sun8", label: "Dimanche 8 février à 19h" },
  { id: "fri13", label: "Vendredi 13 février à 19h" },
  { id: "sat14", label: "Samedi 14 février à 19h" },
  { id: "sun15", label: "Dimanche 15 février à 19h" },
] as const;
const CUSTOM_DAY_ID = "custom";

// Étape 2 : choix du lieu (avec descriptions)
const PLACE_OPTIONS = [
  { id: "restaurant", place: "Restaurant", description: "Un dîner calme et élégant 🍷. Je te réserverai une belle table dans un endroit agréable pour qu'on puisse bien discuter et profiter du moment." },
  { id: "maison", place: "À la maison", description: "Un moment cosy et chaleureux 🏡. Je cuisine moi-même, pour qu'on puisse manger tranquillement et discuter en toute sérénité." },
  { id: "evenement", place: "Événement fun", description: "Un moment fun et détendu 🎶. Ambiance festive, musique et bonne humeur — on pourra choisir ensemble l'événement qui te fait envie." },
];

const FLEE_RADIUS = 90;
const FLEE_PUSH = 38;
const FLEE_MAX = 120;
const CONFETTI_DURATION_MS = 5_000;
const CONFETTI_INTERVAL_MS = 450;

// Cœurs décoratifs en arrière-plan (positions en %)
const BG_HEARTS = [
  { left: "10%", top: "15%", delay: 0, size: "w-4 h-4" },
  { left: "85%", top: "20%", delay: 1, size: "w-3 h-3" },
  { left: "20%", top: "70%", delay: 2, size: "w-5 h-5" },
  { left: "75%", top: "65%", delay: 0.5, size: "w-3 h-3" },
  { left: "50%", top: "35%", delay: 1.5, size: "w-2 h-2" },
  { left: "90%", top: "80%", delay: 2.5, size: "w-4 h-4" },
  { left: "5%", top: "50%", delay: 1, size: "w-3 h-3" },
  { left: "60%", top: "10%", delay: 0.8, size: "w-2 h-2" },
];

export default function ValentinePage() {
  const [step, setStep] = useState<Step>("intro");
  const [curtainsVisible, setCurtainsVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [customDayText, setCustomDayText] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<typeof PLACE_OPTIONS[0] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showChangeChoice, setShowChangeChoice] = useState(false);
  const noButtonWrapperRef = useRef<HTMLDivElement | null>(null);
  const [noButtonMounted, setNoButtonMounted] = useState(false);
  const proposalNoButtonWrapperRef = useRef<HTMLDivElement | null>(null);
  const [proposalNoButtonMounted, setProposalNoButtonMounted] = useState(false);
  const questionRef = useRef<HTMLDivElement>(null);
  const proposalRef = useRef<HTMLDivElement>(null);
  const celebratingRef = useRef<HTMLDivElement>(null);
  const choiceDayRef = useRef<HTMLDivElement>(null);
  const choicePlaceRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const curtainLeftRef = useRef<HTMLDivElement>(null);
  const curtainRightRef = useRef<HTMLDivElement>(null);

  const setNoButtonWrapperRef = useCallback((el: HTMLDivElement | null) => {
    noButtonWrapperRef.current = el;
    setNoButtonMounted(!!el);
  }, []);

  const setProposalNoButtonWrapperRef = useCallback((el: HTMLDivElement | null) => {
    proposalNoButtonWrapperRef.current = el;
    setProposalNoButtonMounted(!!el);
  }, []);

  const fleeSteps = (step === "question" && noButtonMounted) || (step === "proposal" && proposalNoButtonMounted);

  useEffect(() => {
    if (!fleeSteps) return;
    const wrapper = step === "question" ? noButtonWrapperRef.current : proposalNoButtonWrapperRef.current;
    if (!wrapper) return;

    const onMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const currentX = (gsap.getProperty(wrapper, "x") as number) || 0;
      const currentY = (gsap.getProperty(wrapper, "y") as number) || 0;
      if (dist < FLEE_RADIUS && dist > 2) {
        const ux = -dx / dist;
        const uy = -dy / dist;
        let targetX = currentX + ux * FLEE_PUSH;
        let targetY = currentY + uy * FLEE_PUSH;
        targetX = Math.max(-FLEE_MAX, Math.min(FLEE_MAX, targetX));
        targetY = Math.max(-FLEE_MAX, Math.min(FLEE_MAX, targetY));
        gsap.to(wrapper, { x: targetX, y: targetY, duration: 0.4, ease: "power2.out" });
      } else {
        gsap.to(wrapper, { x: 0, y: 0, duration: 0.6, ease: "power2.out" });
      }
    };

    const onLeave = () => gsap.to(wrapper, { x: 0, y: 0, duration: 0.7, ease: "power2.out" });

    window.addEventListener("mousemove", onMove, { passive: true });
    document.body.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.body.removeEventListener("mouseleave", onLeave);
    };
  }, [step, noButtonMounted, proposalNoButtonMounted, fleeSteps]);

  useEffect(() => {
    if (step !== "question" && noButtonWrapperRef.current) gsap.set(noButtonWrapperRef.current, { x: 0, y: 0 });
    if (step !== "proposal" && proposalNoButtonWrapperRef.current) gsap.set(proposalNoButtonWrapperRef.current, { x: 0, y: 0 });
  }, [step]);

  // Animation rideaux à l'ouverture (intro → question)
  useEffect(() => {
    if (!curtainsVisible || !curtainLeftRef.current || !curtainRightRef.current) return;
    const left = curtainLeftRef.current;
    const right = curtainRightRef.current;
    gsap.set(left, { xPercent: 0 });
    gsap.set(right, { xPercent: 0 });
    const tl = gsap.timeline({
      onComplete: () => setCurtainsVisible(false),
    });
    tl.to(left, { xPercent: -100, duration: 2.5, ease: "power2.inOut" }, 0);
    tl.to(right, { xPercent: 100, duration: 2.5, ease: "power2.inOut" }, 0);
  }, [curtainsVisible]);

  useEffect(() => {
    if (step === "question" && questionRef.current && !curtainsVisible) {
      const el = questionRef.current;
      const title = el.querySelector("[data-title]");
      const card = el.querySelector("[data-card]");
      const btns = el.querySelector("[data-buttons]");
      gsap.fromTo(card, { opacity: 0, scale: 0.92, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "back.out(1.2)" });
      gsap.fromTo(title, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power2.out" });
      gsap.fromTo(btns, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.45, ease: "power2.out" });
    }
  }, [step, curtainsVisible]);

  useEffect(() => {
    if (step === "proposal" && proposalRef.current) {
      const el = proposalRef.current;
      const card = el.querySelector("[data-proposal-card]");
      const text = el.querySelector("[data-proposal-text]");
      const btns = el.querySelector("[data-proposal-buttons]");
      gsap.fromTo(card, { opacity: 0, scale: 0.95, y: 24 }, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: "back.out(1.2)" });
      gsap.fromTo(text, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: "power2.out" });
      gsap.fromTo(btns, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, delay: 0.4, ease: "power2.out" });
    }
  }, [step]);

  useEffect(() => {
    if (step !== "celebrating") return;
    const t = setTimeout(() => {
      const el = celebratingRef.current;
      if (!el) return;
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      const bigHeart = el.querySelector("[data-big-heart]");
      const text = el.querySelector("[data-celebrating-text]");
      const burstHearts = el.querySelectorAll("[data-burst-heart]");
      tl.fromTo(bigHeart, { scale: 0, rotation: -20 }, { scale: 1.2, rotation: 0, duration: 0.6, ease: "back.out(1.6)" });
      tl.to(bigHeart, { scale: 1, duration: 0.3 }, "-=0.2");
      tl.fromTo(text, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.3");
      burstHearts.forEach((node, i) => {
        const angle = (i / burstHearts.length) * 360;
        const r = 80 + Math.random() * 40;
        const x = Math.cos((angle * Math.PI) / 180) * r;
        const y = Math.sin((angle * Math.PI) / 180) * r;
        gsap.fromTo(node, { opacity: 0, x: 0, y: 0, scale: 0 }, { opacity: 0.9, x, y, scale: 1, duration: 0.7, delay: 0.4 + i * 0.04, ease: "back.out(1.2)" });
        gsap.to(node, { opacity: 0, scale: 0.5, duration: 0.5, delay: 1.2 + i * 0.03 });
      });
    }, 50);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step !== "choiceDay" && step !== "choicePlace") return;
    const t = setTimeout(() => {
      const el = step === "choiceDay" ? choiceDayRef.current : choicePlaceRef.current;
      if (!el) return;
      const cards = el.querySelectorAll("[data-choice-card]");
      const submit = el.querySelector("[data-submit]");
      const next = el.querySelector("[data-next]");
      gsap.fromTo(cards, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: "back.out(1.1)" });
      if (submit) gsap.fromTo(submit, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.4, ease: "power2.out" });
      if (next) gsap.fromTo(next, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.4, ease: "power2.out" });
    }, 50);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (step !== "confirmation") return;
    setShowChangeChoice(false);
    const t = setTimeout(() => {
      const el = confirmationRef.current;
      if (!el) return;
      const icon = el.querySelector("[data-confirm-icon]");
      const title = el.querySelector("[data-confirm-title]");
      const subtitle = el.querySelector("[data-confirm-subtitle]");
      const hearts = el.querySelectorAll("[data-confirm-heart]");
      gsap.fromTo(icon, { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 0.7, ease: "back.out(1.8)" });
      gsap.fromTo(title, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.4, ease: "power2.out" });
      gsap.fromTo(subtitle, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.6, ease: "power2.out" });
      hearts.forEach((node, i) => {
        gsap.fromTo(node, { scale: 0, opacity: 0 }, { scale: 1, opacity: 0.6, duration: 0.4, delay: 0.5 + i * 0.08, ease: "back.out(1.4)" });
      });
    }, 50);
    return () => clearTimeout(t);
  }, [step]);

  // Confettis pendant 5s puis afficher "Changer mon choix"
  useEffect(() => {
    if (step !== "confirmation") {
      setShowChangeChoice(false);
      return;
    }
    const fire = () => {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#f43f5e", "#ec4899", "#f472b6", "#fbbf24", "#a78bfa", "#f0abfc"],
      });
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#f43f5e", "#f472b6", "#fbbf24"],
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#ec4899", "#a78bfa", "#f0abfc"],
      });
    };
    fire();
    const interval = setInterval(fire, CONFETTI_INTERVAL_MS);
    const stopAt = setTimeout(() => {
      clearInterval(interval);
      setShowChangeChoice(true);
    }, CONFETTI_DURATION_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(stopAt);
    };
  }, [step]);

  const handleCommencer = () => {
    setStep("question");
    setCurtainsVisible(true);
  };

  const handleOui = () => {
    setStep("proposal");
  };

  const handleProposalOui = () => {
    setStep("celebrating");
    setTimeout(() => setStep("choiceDay"), 2800);
  };

  const goBack = () => {
    setStep("question");
    setSelectedDay(null);
    setCustomDayText("");
    setSelectedPlace(null);
    setError(null);
    setShowChangeChoice(false);
  };

  const goBackToChoiceDay = () => {
    setStep("choiceDay");
    setSelectedPlace(null);
    setError(null);
  };

  const goBackFromChoiceDay = () => {
    setStep("celebrating");
  };

  const changeChoiceFromConfirmation = () => {
    setStep("choiceDay");
    setSelectedDay(null);
    setCustomDayText("");
    setSelectedPlace(null);
    setError(null);
    setShowChangeChoice(false);
  };

  const goBackToProposal = () => {
    setStep("proposal");
  };

  const submitChoice = async () => {
    if (!selectedPlace || !selectedDay) return;
    const dateLabel = selectedDay === CUSTOM_DAY_ID ? customDayText.trim() : DAY_OPTIONS.find((d) => d.id === selectedDay)?.label ?? "";
    if (!dateLabel) return;
    setError(null);
    setStep("sending");
    try {
      const res = await fetch(`${API_BASE}/api/valentine/choice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chosenOptionId: 1,
          chosenPlace: selectedPlace.place,
          chosenDate: dateLabel,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Erreur lors de l'envoi");
      }
      setStep("confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
      setStep("choicePlace");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Fond décoratif : cœurs flottants */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {BG_HEARTS.map((h, i) => (
          <div
            key={i}
            className={clsx("absolute text-rose-500/25", h.size)}
            style={{ left: h.left, top: h.top }}
          >
            <Heart
              className={clsx("w-full h-full fill-current", i % 2 === 0 ? "bg-heart-float" : "bg-heart-float-slow")}
              style={{ animationDelay: `${h.delay}s` }}
            />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative flex flex-col items-center justify-center text-center max-w-lg w-full px-4"
          >
            <div className="relative rounded-3xl border border-white/10 bg-[var(--card-bg)] backdrop-blur-xl px-8 py-12 sm:px-12 sm:py-16 shadow-2xl shadow-black/30">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />
              <p className="font-display text-lg sm:text-xl text-foreground leading-relaxed mb-10">
                Chère <span className="font-semibold text-rose-300">{INTRO_NAME}</span>, {INTRO_MESSAGE}
              </p>
              <motion.button
                type="button"
                onClick={handleCommencer}
                className="relative px-10 py-4 rounded-2xl font-semibold text-white text-lg overflow-hidden bg-gradient-to-r from-rose-500 via-rose-400 to-pink-500 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-shadow duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">Commencer</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === "question" && (
          <motion.div
            key="question"
            ref={questionRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative flex flex-col items-center text-center max-w-lg w-full"
          >
            <div
              data-card
              className="relative rounded-3xl border border-white/10 bg-[var(--card-bg)] backdrop-blur-xl px-8 py-10 sm:px-12 sm:py-14 shadow-2xl shadow-black/30"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none" />
              <h1
                data-title
                className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight mb-2"
              >
                Veux-tu être ma Valentine ?
              </h1>
              <p className="text-foreground-muted/80 text-sm sm:text-base mb-10">
                Une question pour toi
              </p>
              <div data-buttons className="flex flex-wrap items-center justify-center gap-4">
                <motion.button
                  type="button"
                  onClick={handleOui}
                  className="relative px-10 py-4 rounded-2xl font-semibold text-white text-lg overflow-hidden bg-gradient-to-r from-rose-500 via-rose-400 to-pink-500 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-shadow duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Heart className="w-5 h-5 fill-white" /> Oui
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-400 opacity-0 hover:opacity-100 transition-opacity" />
                </motion.button>
                <div ref={setNoButtonWrapperRef} className="inline-block will-change-transform">
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl text-sm text-foreground-muted/70 border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Non
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === "proposal" && (
          <motion.div
            key="proposal"
            ref={proposalRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="relative flex flex-col items-center text-center max-w-lg w-full"
          >
            <button
              type="button"
              onClick={goBack}
              className="absolute left-0 top-0 flex items-center gap-2 text-foreground-muted/80 hover:text-foreground text-sm transition-colors z-10"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <div
              data-proposal-card
              className="relative rounded-3xl border border-white/10 bg-[var(--card-bg)] backdrop-blur-xl px-8 py-10 sm:px-12 sm:py-14 shadow-2xl shadow-black/30"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none" />
              <p
                data-proposal-text
                className="font-display text-xl sm:text-2xl text-foreground leading-relaxed mb-10"
              >
                Je propose qu’on fasse notre premier Date pour en discuter. Qu’en penses-tu ?
              </p>
              <div data-proposal-buttons className="flex flex-wrap items-center justify-center gap-4">
                <motion.button
                  type="button"
                  onClick={handleProposalOui}
                  className="relative px-10 py-4 rounded-2xl font-semibold text-white text-lg overflow-hidden bg-gradient-to-r from-rose-500 via-rose-400 to-pink-500 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-shadow duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                     Oui, je suis d'accord
                  </span>
                </motion.button>
                <div ref={setProposalNoButtonWrapperRef} className="inline-block will-change-transform">
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl text-sm text-foreground-muted/70 border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Non
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === "celebrating" && (
          <motion.div
            key="celebrating"
            ref={celebratingRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative flex flex-col items-center gap-8 w-full max-w-lg"
          >
            <button
              type="button"
              onClick={goBackToProposal}
              className="absolute left-0 top-0 flex items-center gap-2 text-foreground-muted/80 hover:text-foreground text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <div className="relative">
              <div data-big-heart className="relative z-10 drop-shadow-lg">
                <Heart className="w-28 h-28 sm:w-32 sm:h-32 text-rose-400 fill-rose-500 drop-shadow-[0_0_30px_rgba(244,63,94,0.5)]" />
              </div>
              {/* Cœurs qui explosent */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <div key={i} data-burst-heart className="absolute">
                    <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-400/90 fill-rose-400" />
                  </div>
                ))}
              </div>
            </div>
            <p data-celebrating-text className="text-xl sm:text-2xl text-foreground font-medium text-center max-w-sm">
              Merci ! Choisis notre rendez-vous…
            </p>
          </motion.div>
        )}

        {step === "choiceDay" && (
          <motion.div
            key="choiceDay"
            ref={choiceDayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl flex flex-col gap-6"
          >
            <button
              type="button"
              onClick={goBackFromChoiceDay}
              className="flex items-center gap-2 text-foreground-muted/80 hover:text-foreground text-sm transition-colors self-start"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <div className="text-center mb-2">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
                Choisis le jour
              </h2>
              <p className="text-foreground-muted/80 text-sm mt-1">Ensuite tu choisiras le lieu</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DAY_OPTIONS.map((opt) => (
                <motion.button
                  key={opt.id}
                  data-choice-card
                  type="button"
                  onClick={() => { setSelectedDay(opt.id); setCustomDayText(""); }}
                  className={clsx(
                    "relative text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3",
                    selectedDay === opt.id
                      ? "border-rose-500/60 bg-rose-500/15 shadow-lg shadow-rose-500/20"
                      : "border-white/15 bg-white/5 hover:border-rose-500/30 hover:bg-white/10"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {selectedDay === opt.id && (
                    <span className="absolute top-3 right-3">
                      <Check className="w-5 h-5 text-rose-400" />
                    </span>
                  )}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                    <Calendar className="w-5 h-5" />
                  </span>
                  <span className="font-medium text-foreground">{opt.label}</span>
                </motion.button>
              ))}
              <motion.button
                data-choice-card
                type="button"
                onClick={() => { setSelectedDay(CUSTOM_DAY_ID); }}
                className={clsx(
                  "relative text-left p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3 sm:col-span-2",
                  selectedDay === CUSTOM_DAY_ID
                    ? "border-rose-500/60 bg-rose-500/15 shadow-lg shadow-rose-500/20"
                    : "border-white/15 bg-white/5 hover:border-rose-500/30 hover:bg-white/10"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.99 }}
              >
                {selectedDay === CUSTOM_DAY_ID && (
                  <span className="absolute top-3 right-3">
                    <Check className="w-5 h-5 text-rose-400" />
                  </span>
                )}
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                  <Calendar className="w-5 h-5" />
                </span>
                <span className="font-medium text-foreground">Proposer mon jour</span>
              </motion.button>
            </div>
            {selectedDay === CUSTOM_DAY_ID && (
              <div className="mt-1">
                <label className="block text-sm text-foreground-muted mb-2">Quel jour préfères-tu ?</label>
                <input
                  type="text"
                  value={customDayText}
                  onChange={(e) => setCustomDayText(e.target.value)}
                  placeholder="Ex. Samedi 21 février, Dimanche 15h…"
                  className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
              </div>
            )}
            <motion.button
              data-next
              type="button"
              onClick={() => setStep("choicePlace")}
              disabled={!selectedDay || (selectedDay === CUSTOM_DAY_ID && !customDayText.trim())}
              className="w-full py-4 rounded-2xl font-semibold text-white text-lg bg-gradient-to-r from-rose-500 to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all duration-300"
              whileTap={{ scale: 0.98 }}
            >
              Continuer
            </motion.button>
          </motion.div>
        )}

        {step === "choicePlace" && (
          <motion.div
            key="choicePlace"
            ref={choicePlaceRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl flex flex-col gap-6"
          >
            <button
              type="button"
              onClick={goBackToChoiceDay}
              className="flex items-center gap-2 text-foreground-muted/80 hover:text-foreground text-sm transition-colors self-start"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <div className="text-center mb-2">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-foreground">
                Choisis le lieu
              </h2>
              <p className="text-foreground-muted/80 text-sm mt-1">
                {selectedDay === CUSTOM_DAY_ID ? customDayText.trim() || "Ton jour" : DAY_OPTIONS.find((d) => d.id === selectedDay)?.label} — où aimerais-tu qu’on se retrouve ?
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PLACE_OPTIONS.map((opt) => (
                <motion.button
                  key={opt.id}
                  data-choice-card
                  type="button"
                  onClick={() => setSelectedPlace(opt)}
                  className={clsx(
                    "relative text-left p-5 rounded-2xl border-2 transition-all duration-300 overflow-hidden flex-1 min-w-0",
                    selectedPlace?.id === opt.id
                      ? "border-rose-500/60 bg-rose-500/15 shadow-lg shadow-rose-500/20"
                      : "border-white/15 bg-white/5 hover:border-rose-500/30 hover:bg-white/10"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {selectedPlace?.id === opt.id && (
                    <span className="absolute top-3 right-3">
                      <Check className="w-5 h-5 text-rose-400" />
                    </span>
                  )}
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
                      <MapPin className="w-6 h-6" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{opt.place}</p>
                      <p className="text-sm text-foreground-muted/90 mt-2 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            {error && <p className="text-sm text-rose-400 text-center">{error}</p>}
            <motion.button
              data-submit
              type="button"
              onClick={submitChoice}
              disabled={!selectedPlace}
              className="w-full py-4 rounded-2xl font-semibold text-white text-lg bg-gradient-to-r from-rose-500 to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all duration-300"
              whileTap={{ scale: 0.98 }}
            >
              Envoyer mon choix
            </motion.button>
          </motion.div>
        )}

        {step === "sending" && (
          <motion.div
            key="sending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="relative w-16 h-16 rounded-full border-2 border-rose-500/30 border-t-rose-400"
            />
            <p className="text-foreground-muted flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" /> Envoi en cours…
            </p>
          </motion.div>
        )}

        {step === "confirmation" && (
          <motion.div
            key="confirmation"
            ref={confirmationRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative flex flex-col items-center gap-8 text-center max-w-md"
          >
            <div className="relative flex flex-col items-center gap-6">
              <div
                data-confirm-icon
                className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/30 to-green-600/30 border-2 border-emerald-500/50 flex items-center justify-center shadow-lg shadow-emerald-500/20"
              >
                <Check className="w-12 h-12 text-emerald-400" strokeWidth={3} />
              </div>
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} data-confirm-heart>
                    <Heart className="w-6 h-6 text-rose-400/60 fill-rose-400/60" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 data-confirm-title className="font-display text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-foreground to-foreground-muted bg-clip-text text-transparent">
                Message envoyé
              </h2>
              <p data-confirm-subtitle className="text-foreground-muted mt-2">
                À très bientôt pour notre rendez-vous…
              </p>
            </div>
            <AnimatePresence>
              {showChangeChoice && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="pt-8"
                >
                  <button
                    type="button"
                    onClick={changeChoiceFromConfirmation}
                    className="text-foreground-muted/90 hover:text-foreground text-sm underline underline-offset-2 transition-colors"
                  >
                    Changer mon choix
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rideaux : ouverture façon spectacle */}
      {curtainsVisible && (
        <div className="fixed inset-0 z-50 pointer-events-auto flex" aria-hidden>
          <div
            ref={curtainLeftRef}
            className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 shadow-[4px_0_20px_rgba(0,0,0,0.5)]"
            style={{ willChange: "transform" }}
          />
          <div
            ref={curtainRightRef}
            className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-rose-950 via-rose-900 to-rose-950 shadow-[-4px_0_20px_rgba(0,0,0,0.5)]"
            style={{ willChange: "transform" }}
          />
        </div>
      )}
    </main>
  );
}
