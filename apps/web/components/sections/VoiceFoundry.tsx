"use client"

import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const voices = [
  { name: "Hannah", style: "Professional & Clear", accent: "American" },
  { name: "Melody", style: "Warm & Conversational", accent: "American" },
  { name: "Noah", style: "Dynamic & Energetic", accent: "American" },
  { name: "Ethan", style: "Thoughtful & Measured", accent: "American" },
];

const VoiceFoundry = () => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const togglePlay = (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playingIndex === index) {
      audio.pause();
      setPlayingIndex(null);
      return;
    }

    audio.src = `/voice-samples/${voices[index]!.name.toLowerCase()}.mp3`;
    audio.play().catch(() => setPlayingIndex(null));
    setPlayingIndex(index);
  };

  return (
    <section className="py-32 relative">
      <audio ref={audioRef} onEnded={() => setPlayingIndex(null)} className="hidden" />
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Column - Voice Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            {voices.map((voice, index) => (
              <motion.div
                key={voice.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group flex items-center gap-6 p-6 rounded-lg border border-border/30 bg-surface/30 hover:bg-surface/60 hover:border-border/50 transition-all duration-300 cursor-pointer"
                onClick={() => togglePlay(index)}
              >
                {/* Play Button */}
                <div className="w-12 h-12 rounded-full border border-border/50 flex items-center justify-center group-hover:border-slate-light transition-colors">
                  {playingIndex === index ? (
                    <Pause className="w-4 h-4 text-slate-light" />
                  ) : (
                    <Play className="w-4 h-4 text-slate-light ml-0.5" />
                  )}
                </div>

                {/* Voice Info */}
                <div className="flex-1">
                  <h4 className="font-serif text-lg text-foreground mb-1">{voice.name}</h4>
                  <p className="text-sm font-light text-muted-foreground">
                    {voice.style} · {voice.accent}
                  </p>
                </div>

                {/* Waveform visualization */}
                <div className="flex items-center gap-0.5 h-8">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-0.5 bg-slate-light/30 rounded-full transition-all duration-300 ${
                        playingIndex === index ? "animate-pulse" : ""
                      }`}
                      style={{
                        // Deterministic integer arithmetic (not
                        // Math.random() or a transcendental function) so
                        // server and client always produce byte-identical
                        // markup — Math.sin() isn't guaranteed bit-identical
                        // across JS engines and still caused a mismatch.
                        height: `${8 + ((i * 7 + index * 5) % 20)}px`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:sticky lg:top-32"
          >
            <span className="text-xs font-light tracking-wider text-muted-foreground uppercase mb-4 block">
              Voice Foundry
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium leading-tight mb-6">
              Voices that
              <br />
              <span className="italic text-slate-light">resonate.</span>
            </h2>
            <p className="text-lg font-light text-muted-foreground leading-relaxed mb-8">
              Natural-sounding AI voices for your host and guest, so conversations
              feel like real dialogue instead of robotic narration.
            </p>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <span className="font-serif text-4xl text-foreground">17+</span>
                <p className="text-sm font-light text-muted-foreground mt-1">
                  Professional voices
                </p>
              </div>
              <div>
                <span className="font-serif text-4xl text-foreground">2</span>
                <p className="text-sm font-light text-muted-foreground mt-1">
                  Episode lengths: short & long
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VoiceFoundry;

