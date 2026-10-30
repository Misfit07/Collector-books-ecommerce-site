"use client";

import React, { useState } from "react";
import { CURIO_PRIZES, CurioPrize, CURIO_FREE_THRESHOLD_CENTS, CURIO_SPIN_POINTS_COST } from "@/lib/curios";
import CurioPrizeIcon from "./CurioPrizeIcon";
import { Sparkles, Gift, RotateCcw, Check, AlertCircle } from "lucide-react";

interface CurioWheelProps {
  cartTotalInCents: number;
  userPoints: number;
  selectedPrize: CurioPrize | null;
  onSelectPrize: (prize: CurioPrize | null) => void;
  onDeductPoints?: (points: number) => void;
}

export default function CurioWheel({
  cartTotalInCents,
  userPoints,
  selectedPrize,
  onSelectPrize,
  onDeductPoints,
}: CurioWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<CurioPrize | null>(selectedPrize);
  const [spinError, setSpinError] = useState<string | null>(null);

  const isFreeEligible = cartTotalInCents >= CURIO_FREE_THRESHOLD_CENTS;
  const canAffordWithPoints = userPoints >= CURIO_SPIN_POINTS_COST;
  const canSpin = isFreeEligible || canAffordWithPoints;

  const totalSlices = CURIO_PRIZES.length;
  const sliceAngle = 360 / totalSlices;

  const handleSpin = () => {
    if (isSpinning) return;
    setSpinError(null);

    // If not free and cannot afford with points
    if (!isFreeEligible && !canAffordWithPoints) {
      setSpinError(`A spin requires either an acquisition over $500 or 50 Patron Points (You have ${userPoints} pts).`);
      return;
    }

    // Deduct points if using points
    if (!isFreeEligible && onDeductPoints) {
      onDeductPoints(CURIO_SPIN_POINTS_COST);
    }

    setIsSpinning(true);

    // Pick a random prize index
    const prizeIndex = Math.floor(Math.random() * totalSlices);
    const chosen = CURIO_PRIZES[prizeIndex];

    // Compute rotation so ticker (at top, angle 0 / 360) lands on this slice
    // Slice i occupies angle [i * sliceAngle, (i + 1) * sliceAngle]
    // The top pointer is at 0 degrees (or 360).
    const sliceCenter = prizeIndex * sliceAngle + sliceAngle / 2;
    const extraSpins = 5 * 360; // 5 full revolutions
    const targetRotation = rotation + extraSpins + (360 - (rotation % 360)) + (360 - sliceCenter);

    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(chosen);
      onSelectPrize(chosen);
    }, 4600);
  };

  return (
    <div className="bg-[#FAF7F0] border border-[#E0D7C3] rounded-xs p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[#E5DECD]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#1A1816] text-[#C59B27] flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#1A1816]">
              The Antiquarian Curio Wheel
            </h3>
            <p className="text-[11px] text-[#5C564E]">
              Complimentary wooden curios and desk companions boxed with qualified parcels.
            </p>
          </div>
        </div>

        {/* Qualification Badge */}
        {isFreeEligible ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1E3A2F] text-[#E8F2EC] text-[11px] font-mono uppercase tracking-wider rounded-xs">
            <Sparkles className="w-3 h-3 text-[#B38838]" />
            <span>Complimentary ($500+ Acquisition)</span>
          </span>
        ) : (
          <span className="text-[11px] text-[#8E867B] font-mono">
            {canAffordWithPoints
              ? `Unlocked with 50 Points (${userPoints} pts available)`
              : `Add $${((CURIO_FREE_THRESHOLD_CENTS - cartTotalInCents) / 100).toFixed(0)} more for a free spin`}
          </span>
        )}
      </div>

      {spinError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xs text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{spinError}</span>
        </div>
      )}

      {/* Main Wheel Presentation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left: The Wheel */}
        <div className="md:col-span-6 flex flex-col items-center">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 select-none">
            {/* Top Pointer Ticker (Vintage Brass) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-30 filter drop-shadow-md">
              <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
                <polygon points="12,28 3,4 21,4" fill="#C59B27" stroke="#1A1816" strokeWidth="1.5" />
                <circle cx="12" cy="6" r="3" fill="#1A1816" />
              </svg>
            </div>

            {/* Rotating Wheel Disk */}
            <div
              className="w-full h-full rounded-full border-4 border-[#3A2D20] shadow-xl overflow-hidden relative"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? "transform 4.5s cubic-bezier(0.12, 0.8, 0.2, 1)" : "none",
              }}
            >
              <svg viewBox="0 0 400 400" className="w-full h-full">
                <defs>
                  <radialGradient id="brassHub" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFF2B2" />
                    <stop offset="50%" stopColor="#C59B27" />
                    <stop offset="100%" stopColor="#6E5014" />
                  </radialGradient>
                </defs>

                {/* Slices */}
                {CURIO_PRIZES.map((prize, idx) => {
                  const startAngle = idx * sliceAngle;
                  const endAngle = (idx + 1) * sliceAngle;
                  const radStart = ((startAngle - 90) * Math.PI) / 180;
                  const radEnd = ((endAngle - 90) * Math.PI) / 180;
                  const x1 = 200 + 200 * Math.cos(radStart);
                  const y1 = 200 + 200 * Math.sin(radStart);
                  const x2 = 200 + 200 * Math.cos(radEnd);
                  const y2 = 200 + 200 * Math.sin(radEnd);

                  const pathData = `M 200 200 L ${x1} ${y1} A 200 200 0 0 1 ${x2} ${y2} Z`;

                  // Text rotation at slice midpoint
                  const midAngle = startAngle + sliceAngle / 2;

                  return (
                    <g key={prize.id}>
                      <path
                        d={pathData}
                        fill={prize.color}
                        stroke="#2B2117"
                        strokeWidth="1.5"
                      />
                      {/* Radially aligned label */}
                      <g transform={`rotate(${midAngle}, 200, 200)`}>
                        <text
                          x="200"
                          y="50"
                          textAnchor="middle"
                          fill="#FDFBF7"
                          fontSize="11"
                          fontFamily="Georgia, serif"
                          fontWeight="bold"
                          letterSpacing="0.5"
                          opacity="0.95"
                        >
                          {prize.name.split(" ")[0]}
                        </text>
                        <text
                          x="200"
                          y="65"
                          textAnchor="middle"
                          fill="#E6D3A3"
                          fontSize="9"
                          fontFamily="monospace"
                          opacity="0.8"
                        >
                          {prize.tier}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Center Brass Hub */}
                <circle cx="200" cy="200" r="42" fill="url(#brassHub)" stroke="#1A1816" strokeWidth="2.5" />
                <circle cx="200" cy="200" r="32" fill="#241B14" stroke="#C59B27" strokeWidth="1" />
                <text
                  x="200"
                  y="198"
                  textAnchor="middle"
                  fill="#E6D3A3"
                  fontSize="9"
                  fontFamily="'Playfair Display', serif"
                  fontWeight="bold"
                  letterSpacing="1"
                >
                  CURIO
                </text>
                <text
                  x="200"
                  y="210"
                  textAnchor="middle"
                  fill="#C59B27"
                  fontSize="8"
                  fontFamily="monospace"
                  letterSpacing="1"
                >
                  CABINET
                </text>
              </svg>
            </div>
          </div>

          {/* Spin Trigger Button */}
          <div className="mt-5 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning || !canSpin}
              className="px-6 py-2.5 bg-[#1A1816] hover:bg-[#B38838] text-white text-xs font-bold uppercase tracking-widest rounded-xs transition-colors flex items-center gap-2 shadow disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSpinning ? "animate-spin" : ""}`} />
              <span>
                {isSpinning
                  ? "Spinning the Wheel..."
                  : isFreeEligible
                  ? "Spin Wheel (Complimentary Gift)"
                  : `Spin Wheel (-${CURIO_SPIN_POINTS_COST} Points)`}
              </span>
            </button>
            <p className="text-[10px] text-[#8E867B] font-mono text-center">
              Prizes are hand-crafted wooden &amp; brass curiosities shipped inside your book parcel.
            </p>
          </div>
        </div>

        {/* Right: Won Prize Dossier & Inspection */}
        <div className="md:col-span-6">
          {wonPrize ? (
            <div className="bg-white border border-[#DDD6C5] rounded-xs p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-start gap-4 pb-3 border-b border-[#E8E2D4]">
                <div>
                  <span
                    className={`inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded-xs font-bold tracking-wider mb-1 ${
                      wonPrize.tier === "RARE"
                        ? "bg-[#8B2635] text-white"
                        : wonPrize.tier === "FINE"
                        ? "bg-[#1E3A2F] text-white"
                        : "bg-[#F4EFE6] text-[#6B5B4D]"
                    }`}
                  >
                    {wonPrize.tierLabel} &bull; {wonPrize.shortVerdict}
                  </span>
                  <h4 className="font-serif font-bold text-lg text-[#1A1816]">
                    {wonPrize.name}
                  </h4>
                </div>

                <div className="p-2 bg-[#F9F7F1] rounded-xs border border-[#E0D7C3] shrink-0">
                  <CurioPrizeIcon id={wonPrize.id} className="w-14 h-14" />
                </div>
              </div>

              {/* Humorous / Detailed Bookseller Appraisal */}
              <div className="space-y-2 text-xs">
                <p className="text-[#5C564E] leading-relaxed">
                  {wonPrize.description}
                </p>

                {!wonPrize.isGood && (
                  <div className="p-3 bg-[#FFF8E7] border border-[#EAD8B0] rounded-xs text-[11px] text-[#8A6720] leading-relaxed">
                    <strong>Bookseller&apos;s Honest Note:</strong> While of questionable utilitarian value, this humble timber specimen is fashioned with genuine devotion by our workshop joiner. It shall be safely packaged with your book!
                  </div>
                )}

                {wonPrize.isGood && (
                  <div className="p-3 bg-[#F0F5F2] border border-[#C5DDD0] rounded-xs text-[11px] text-[#1E3A2F] leading-relaxed flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#233D30] shrink-0" />
                    <span><strong>Collector&apos;s Gift:</strong> This item has been reserved and stamped onto your order manifest.</span>
                  </div>
                )}

                <div className="pt-2 text-[10px] text-[#8E867B] font-mono">
                  <span>Materials: {wonPrize.material}</span>
                </div>
              </div>

              {/* Status footer */}
              <div className="pt-3 border-t border-[#E8E2D4] flex items-center justify-between">
                <span className="text-xs text-[#233D30] font-medium flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#233D30]" />
                  <span>Added to Parcel Manifest</span>
                </span>

                {canAffordWithPoints && (
                  <button
                    type="button"
                    onClick={handleSpin}
                    disabled={isSpinning}
                    className="text-[11px] text-[#B38838] hover:text-[#966E26] font-medium underline"
                  >
                    Try Luck Again (-50 Pts)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white/60 border border-dashed border-[#DDD6C5] rounded-xs p-8 text-center space-y-3">
              <Gift className="w-10 h-10 text-[#C59B27] mx-auto opacity-70" />
              <h4 className="font-serif font-bold text-base text-[#1A1816]">
                Spin for a Physical Wooden Curio
              </h4>
              <p className="text-xs text-[#5C564E] max-w-sm mx-auto leading-relaxed">
                Take a spin to claim an authentic bibliophile desk curiosity&mdash;ranging from a prized hand-carved ship in a bottle, to an exquisitely useless turned wooden bottle, to cathedral oak desk weights.
              </p>
              <div className="pt-2 text-[11px] text-[#8E867B] font-mono">
                {isFreeEligible ? (
                  <span className="text-[#1E3A2F] font-bold">1 Free Spin Available for this Order</span>
                ) : (
                  <span>Threshold: $500.00 or 50 Patron Points</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
