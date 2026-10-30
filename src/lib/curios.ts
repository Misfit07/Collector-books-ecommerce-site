export interface CurioPrize {
  id: string;
  name: string;
  tier: "RARE" | "FINE" | "UNCOMMON" | "COMMON";
  tierLabel: string;
  isGood: boolean;
  shortVerdict: string;
  description: string;
  material: string;
  color: string; // for wheel slice
}

export const CURIO_PRIZES: CurioPrize[] = [
  {
    id: "ship-in-bottle",
    name: "Hand-Carved Schooner in a Bottle",
    tier: "RARE",
    tierLabel: "Masterwork Curio",
    isGood: true,
    shortVerdict: "Coveted Treasure",
    description: "A three-masted wooden sailing vessel meticulously rigged with fine thread inside clear hand-blown glass, mounted upon a polished oak display cradle.",
    material: "Hand-carved pine, cotton rigging, blown glass, English oak",
    color: "#8B2635", // Deep burgundy
  },
  {
    id: "wooden-bottle",
    name: "Turned Wooden Bottle",
    tier: "COMMON",
    tierLabel: "Modest Curio",
    isGood: false,
    shortVerdict: "Rather Questionable",
    description: "A solid, unopenable turned pine timber bottle with a glued wooden stopper. Entirely incapable of holding liquids, yet undeniably smooth to hold.",
    material: "Solid lathe-turned yellow pine, raw beeswax finish",
    color: "#6B5B4D", // Earthy timber
  },
  {
    id: "boxwood-bookmark",
    name: "Boxwood & Brass Folding Bookmark",
    tier: "FINE",
    tierLabel: "Bibliophile Essential",
    isGood: true,
    shortVerdict: "Delightful Companion",
    description: "A vintage-style folding leaf marker crafted in dense European boxwood with stamped inch calibrations and an antiqued brass rivet hinge.",
    material: "Natural boxwood, patinated brass",
    color: "#9A7B38", // Antique gold
  },
  {
    id: "cathedral-owl",
    name: "Carved English Oak Book-Weight",
    tier: "FINE",
    tierLabel: "Desk Ornament",
    isGood: true,
    shortVerdict: "Distinguished Friend",
    description: "A lead-weighted miniature desk owl sculpted from reclaimed 19th-century English cathedral oak to hold fragile leaves flat.",
    material: "Reclaimed aged English oak, hidden lead core",
    color: "#3F4F3D", // Forest patina
  },
  {
    id: "rosewood-magnifier",
    name: "Turned Rosewood Magnifier Handle",
    tier: "RARE",
    tierLabel: "Masterwork Curio",
    isGood: true,
    shortVerdict: "Prized Archival Tool",
    description: "A fluted dark Indian rosewood handle with antiqued brass threaded ferrule, crafted for fine bibliographic magnification.",
    material: "Seasoned Indian rosewood, solid milled brass",
    color: "#5C2434", // Wine morocco
  },
  {
    id: "wooden-peg",
    name: "Whittled Ash Wood Page-Peg",
    tier: "COMMON",
    tierLabel: "Humble Curio",
    isGood: false,
    shortVerdict: "Humble Timber",
    description: "A simple piece of split ash timber fashioned with a pocket knife into a rudimentary page clamp. Sturdy, though noticeably unsophisticated.",
    material: "Split green ash wood, rough-whittled",
    color: "#736458", // Rustic taupe
  },
  {
    id: "walnut-acorn",
    name: "Walnut Acorn Wax-Seal Capsule",
    tier: "UNCOMMON",
    tierLabel: "Cabinet Curiosity",
    isGood: true,
    shortVerdict: "Charming Oddity",
    description: "A threaded hollow acorn turned from black walnut, intended for carrying sealing wax pellets and a signet seal.",
    material: "American black walnut, beeswax thread lubricant",
    color: "#593822", // Warm walnut
  },
  {
    id: "cherry-bookstand",
    name: "Miniature Cherrywood Book Cradle",
    tier: "FINE",
    tierLabel: "Bibliophile Essential",
    isGood: true,
    shortVerdict: "Graceful Display",
    description: "A folding desktop display cradle in warm Pennsylvania wild cherry, designed to support octavo and duodecimo volumes safely open.",
    material: "Wild American cherry, brass pin hinges",
    color: "#8C4A2F", // Rich cherry
  },
];

// Curio Threshold: Cart total in cents to unlock a free spin ($500.00 = 50000 cents)
export const CURIO_FREE_THRESHOLD_CENTS = 50000;

// Points needed to spin if under threshold
export const CURIO_SPIN_POINTS_COST = 50;

// Points earned per dollar spent: 1 point per $10 spent
export const calculatePointsEarned = (totalInCents: number): number => {
  return Math.floor(totalInCents / 1000);
};

// Points redemption value: 100 points = $10 discount ($0.10 per point)
export const calculatePointsDiscountCents = (points: number): number => {
  return points * 10;
};
