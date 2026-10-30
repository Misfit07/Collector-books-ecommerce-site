import React from "react";

export default function CurioPrizeIcon({ id, className = "w-12 h-12" }: { id: string; className?: string }) {
  switch (id) {
    case "ship-in-bottle":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Bottle outline */}
          <path d="M 20 50 C 20 38 28 32 40 32 L 72 32 C 78 32 82 36 84 40 L 92 40 L 92 60 L 84 60 C 82 64 78 68 72 68 L 40 68 C 28 68 20 62 20 50 Z" stroke="#3A2D20" strokeWidth="2.5" fill="#EBF2F5" fillOpacity="0.4" />
          {/* Cork */}
          <rect x="92" y="44" width="6" height="12" rx="1" fill="#8C653C" stroke="#3A2D20" strokeWidth="1.5" />
          {/* Wooden Hull inside */}
          <path d="M 32 58 Q 50 63 68 56 L 66 52 L 34 52 Z" fill="#6B3F21" stroke="#3A2D20" strokeWidth="1.5" />
          {/* Masts */}
          <line x1="42" y1="52" x2="42" y2="38" stroke="#3A2D20" strokeWidth="1.5" />
          <line x1="52" y1="52" x2="52" y2="36" stroke="#3A2D20" strokeWidth="1.5" />
          <line x1="62" y1="52" x2="62" y2="40" stroke="#3A2D20" strokeWidth="1.5" />
          {/* White Sails */}
          <path d="M 42 39 Q 47 44 42 49 Z" fill="#FDFBF7" stroke="#3A2D20" strokeWidth="1" />
          <path d="M 52 37 Q 57 43 52 49 Z" fill="#FDFBF7" stroke="#3A2D20" strokeWidth="1" />
          <path d="M 62 41 Q 67 46 62 50 Z" fill="#FDFBF7" stroke="#3A2D20" strokeWidth="1" />
          {/* Wooden Stand */}
          <rect x="36" y="70" width="36" height="4" rx="1" fill="#4A2F17" />
        </svg>
      );
    case "wooden-bottle":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Solid Turned Timber Bottle */}
          <path d="M 42 20 L 58 20 L 58 32 C 68 40 70 54 70 70 C 70 82 62 86 50 86 C 38 86 30 82 30 70 C 30 54 32 40 42 32 Z" fill="#C49A6C" stroke="#3A2D20" strokeWidth="2.5" />
          {/* Lathe Turning Grooves */}
          <ellipse cx="50" cy="50" rx="18" ry="3" stroke="#8C653C" strokeWidth="1.5" strokeDasharray="3 2" />
          <ellipse cx="50" cy="65" rx="19" ry="3" stroke="#8C653C" strokeWidth="1.5" />
          {/* Wooden Plug (glued shut!) */}
          <rect x="44" y="14" width="12" height="8" rx="1" fill="#8C653C" stroke="#3A2D20" strokeWidth="1.5" />
          {/* "Solid Pine" label line */}
          <path d="M 38 72 L 62 72" stroke="#664422" strokeWidth="1" opacity="0.6" />
        </svg>
      );
    case "boxwood-bookmark":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Boxwood Rule Bookmark */}
          <rect x="38" y="15" width="24" height="70" rx="2" fill="#E8D196" stroke="#3A2D20" strokeWidth="2" />
          {/* Brass Rivet */}
          <circle cx="50" cy="24" r="4" fill="#C59B27" stroke="#3A2D20" strokeWidth="1.5" />
          {/* Measurement Ticks */}
          {[34, 40, 46, 52, 58, 64, 70, 76].map((y, i) => (
            <line key={y} x1="38" y1={y} x2={i % 2 === 0 ? "48" : "44"} y2={y} stroke="#3A2D20" strokeWidth="1.2" />
          ))}
          {/* Silk Tassel */}
          <path d="M 50 20 Q 50 8 42 6 Q 36 10 38 18" stroke="#8B2635" strokeWidth="2" />
          <path d="M 38 18 L 34 28 M 38 18 L 38 28 M 38 18 L 42 28" stroke="#8B2635" strokeWidth="1.5" />
        </svg>
      );
    case "cathedral-owl":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Carved Oak Owl */}
          <path d="M 34 82 C 30 65 30 40 38 30 C 42 24 58 24 62 30 C 70 40 70 65 66 82 Z" fill="#5C4028" stroke="#3A2D20" strokeWidth="2.5" />
          {/* Horn Tufts */}
          <polygon points="34,30 38,18 44,28" fill="#5C4028" stroke="#3A2D20" strokeWidth="2" />
          <polygon points="66,30 62,18 56,28" fill="#5C4028" stroke="#3A2D20" strokeWidth="2" />
          {/* Big Carved Eyes */}
          <circle cx="43" cy="38" r="6" fill="#F4EFE6" stroke="#3A2D20" strokeWidth="2" />
          <circle cx="43" cy="38" r="2.5" fill="#1A1816" />
          <circle cx="57" cy="38" r="6" fill="#F4EFE6" stroke="#3A2D20" strokeWidth="2" />
          <circle cx="57" cy="38" r="2.5" fill="#1A1816" />
          {/* Beak */}
          <polygon points="50,42 47,48 53,48" fill="#C59B27" stroke="#3A2D20" strokeWidth="1.5" />
          {/* Feather marks */}
          <path d="M 40 60 Q 50 64 60 60 M 42 70 Q 50 74 58 70" stroke="#3A2D20" strokeWidth="1.5" />
        </svg>
      );
    case "rosewood-magnifier":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Turned Rosewood Handle */}
          <path d="M 46 45 Q 40 60 44 84 C 47 88 53 88 56 84 Q 60 60 54 45 Z" fill="#4A1C22" stroke="#3A2D20" strokeWidth="2" />
          {/* Brass Ferrule */}
          <rect x="44" y="32" width="12" height="13" rx="1" fill="#C59B27" stroke="#3A2D20" strokeWidth="1.5" />
          {/* Lens Rim (Miniature) */}
          <circle cx="50" cy="22" r="14" fill="#EBF4F7" fillOpacity="0.5" stroke="#C59B27" strokeWidth="2.5" />
          <ellipse cx="46" cy="18" rx="4" ry="2" fill="#FFFFFF" opacity="0.8" />
        </svg>
      );
    case "wooden-peg":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Split Ash Peg */}
          <path d="M 44 15 L 56 15 L 56 45 L 60 85 L 50 82 L 40 85 L 44 45 Z" fill="#C2B29F" stroke="#3A2D20" strokeWidth="2" />
          {/* Whittled Split Notch */}
          <path d="M 50 35 L 50 75" stroke="#3A2D20" strokeWidth="2" />
          <circle cx="50" cy="30" r="3" fill="#3A2D20" />
        </svg>
      );
    case "walnut-acorn":
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Acorn Cupule (Cap) */}
          <path d="M 32 38 C 32 26 68 26 68 38 L 70 42 L 30 42 Z" fill="#3D2617" stroke="#26170E" strokeWidth="2" />
          <circle cx="50" cy="22" r="3" fill="#3D2617" stroke="#26170E" strokeWidth="1.5" />
          {/* Acorn Body */}
          <path d="M 32 42 C 32 64 45 78 50 82 C 55 78 68 64 68 42 Z" fill="#6B4423" stroke="#26170E" strokeWidth="2" />
          {/* Thread seam */}
          <line x1="30" y1="42" x2="70" y2="42" stroke="#C59B27" strokeWidth="1.5" />
        </svg>
      );
    case "cherry-bookstand":
    default:
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wild Cherrywood Folding Book Cradle */}
          <polygon points="18,65 50,45 82,65 50,75" fill="#803823" stroke="#3A2D20" strokeWidth="2" />
          <polygon points="50,45 25,28 35,22 55,38" fill="#9C472E" stroke="#3A2D20" strokeWidth="1.5" />
          <polygon points="50,45 75,28 65,22 45,38" fill="#B85637" stroke="#3A2D20" strokeWidth="1.5" />
          {/* Brass Lip Pins */}
          <circle cx="28" cy="62" r="2.5" fill="#C59B27" stroke="#3A2D20" strokeWidth="1" />
          <circle cx="72" cy="62" r="2.5" fill="#C59B27" stroke="#3A2D20" strokeWidth="1" />
        </svg>
      );
  }
}
