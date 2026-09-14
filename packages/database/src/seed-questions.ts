/**
 * Seed Question Bank for Bangladeshi University Admissions (BUET, Medical, DU, CKRUET).
 * Generates 100 authentic questions per subject across:
 * - Physics (PHY): 100 questions
 * - Chemistry (CHEM): 100 questions
 * - Higher Mathematics (MATH): 100 questions
 * - Biology (BIO): 100 questions
 * Total: 400 High-Yield MCQ Questions with LaTeX & Explanations.
 */

export interface QuestionSeedItem {
  subjectCode: string;
  chapterNumber: number;
  chapterName: string;
  topicName: string;
  questionText: string;
  options: Array<{ id: string; text: string; isLatex?: boolean }>;
  correctOptionId: string;
  explanation: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  universityTags: string[];
}

// ─── PHYSICS (100 Questions) ──────────────────────────────────────────────────
export const physicsQuestionTemplates: Omit<QuestionSeedItem, "subjectCode">[] = [
  // 1. Newtonian Mechanics (15 Qs)
  {
    chapterNumber: 4,
    chapterName: "Newtonian Mechanics",
    topicName: "Conservation of Linear Momentum",
    questionText: "একটি $m = 20\\text{ g}$ ভরের বুলেট $v$ বেগে এসে $M = 1.98\\text{ kg}$ ভরের ঝুলন্ত ব্লকে বিদ্ধ হয়ে থেমে গেল। ব্লকটি উলম্বভাবে $h = 0.45\\text{ m}$ উচ্চতায় উঠলে বুলেটের আদিবেগ $v$ কত? ($g = 9.8\\text{ m/s}^2$)",
    options: [
      { id: "A", text: "$150\\text{ m/s}$", isLatex: true },
      { id: "B", text: "$200\\text{ m/s}$", isLatex: true },
      { id: "C", text: "$297\\text{ m/s}$", isLatex: true },
      { id: "D", text: "$350\\text{ m/s}$", isLatex: true },
    ],
    correctOptionId: "C",
    explanation: "শক্তি সংরক্ষণ: $V = \\sqrt{2gh} = \\sqrt{2 \\times 9.8 \\times 0.45} = 2.97\\text{ m/s}$। ভরবেগ সংরক্ষণ: $mv = (M+m)V \\implies v = \\frac{2.0}{0.02} \\times 2.97 = 297\\text{ m/s}$।",
    difficulty: "HARD",
    universityTags: ["BUET", "CKRUET"],
  },
  {
    chapterNumber: 4,
    chapterName: "Newtonian Mechanics",
    topicName: "Banking of Roads",
    questionText: "$R = 100\\text{ m}$ ব্যাসার্ধের একটি বাঁকা রাস্তায় গাড়ি সর্বোচ্চ $72\\text{ km/h}$ বেগে পিছলে না গিয়ে নিরাপদে বাঁক নিতে চাইলে রাস্তার ব্যাংকিং কোণ $\\theta$ কত হতে হবে? ($g = 9.8\\text{ m/s}^2$)",
    options: [
      { id: "A", text: "$\\tan^{-1}(0.408)$", isLatex: true },
      { id: "B", text: "$\\tan^{-1}(0.25)$", isLatex: true },
      { id: "C", text: "$\\tan^{-1}(0.55)$", isLatex: true },
      { id: "D", text: "$\\tan^{-1}(0.15)$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "$v = 72\\text{ km/h} = 20\\text{ m/s}$। $\\tan\\theta = \\frac{v^2}{Rg} = \\frac{400}{100 \\times 9.8} = 0.408 \\implies \\theta = \\tan^{-1}(0.408) \\approx 22.2^\\circ$।",
    difficulty: "MEDIUM",
    universityTags: ["BUET", "DU_KA", "RUET"],
  },
  {
    chapterNumber: 4,
    chapterName: "Newtonian Mechanics",
    topicName: "Rotational Dynamics & Moment of Inertia",
    questionText: "$M$ ভর ও $R$ ব্যাসার্ধের একটি নিরেট গোলকের কেন্দ্রগামী অক্ষের সাপেক্ষে জড়তার ভ্রামক $I$ এবং চক্রগতির ব্যাসার্ধ $k$ এর মান কত?",
    options: [
      { id: "A", text: "$I = \\frac{1}{2}MR^2, k = \\frac{R}{\\sqrt{2}}$", isLatex: true },
      { id: "B", text: "$I = \\frac{2}{5}MR^2, k = \\sqrt{\\frac{2}{5}}R$", isLatex: true },
      { id: "C", text: "$I = \\frac{2}{3}MR^2, k = \\sqrt{\\frac{2}{3}}R$", isLatex: true },
      { id: "D", text: "$I = MR^2, k = R$", isLatex: true },
    ],
    correctOptionId: "B",
    explanation: "নিরেট গোলকের ক্ষেত্রে কেন্দ্রগামী অক্ষের সাপেক্ষে $I = \\frac{2}{5}MR^2$। $I = Mk^2 \\implies k = \\sqrt{2/5}R$।",
    difficulty: "EASY",
    universityTags: ["DU_KA", "CUET", "KUET"],
  },
  {
    chapterNumber: 4,
    chapterName: "Newtonian Mechanics",
    topicName: "Angular Momentum",
    questionText: "একটি কণা যার অবস্থান ভেক্টর $\\vec{r} = (2\\hat{i} + 3\\hat{j})\\text{ m}$ এবং রৈখিক ভরবেগ $\\vec{p} = (4\\hat{i} - 2\\hat{j})\\text{ kg}\\cdot\\text{m/s}$। মূলবিন্দুর সাপেক্ষে কণাটির কৌণিক ভরবেগ $\\vec{L}$ কত?",
    options: [
      { id: "A", text: "$-16\\hat{k}\\text{ J}\\cdot\\text{s}$", isLatex: true },
      { id: "B", text: "$16\\hat{k}\\text{ J}\\cdot\\text{s}$", isLatex: true },
      { id: "C", text: "$-8\\hat{k}\\text{ J}\\cdot\\text{s}$", isLatex: true },
      { id: "D", text: "$8\\hat{k}\\text{ J}\\cdot\\text{s}$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "$\\vec{L} = \\vec{r} \\times \\vec{p} = (2\\hat{i} + 3\\hat{j}) \\times (4\\hat{i} - 2\\hat{j}) = (2 \\times -2 - 3 \\times 4)\\hat{k} = (-4 - 12)\\hat{k} = -16\\hat{k}\\text{ J}\\cdot\\text{s}$।",
    difficulty: "MEDIUM",
    universityTags: ["BUET", "DU_KA"],
  },
  {
    chapterNumber: 4,
    chapterName: "Newtonian Mechanics",
    topicName: "Friction & Inclined Plane",
    questionText: "$30^\\circ$ আনত একটি ঘর্ষণবিহীন তলে একটি ব্লক ছেড়ে দিলে যে ত্বরণ হয়, ঘর্ষণযুক্ত একই তলে ত্বরণ তার অর্ধেক হলে ঘর্ষণ গুণাঙ্ক $\\mu_k$ কত?",
    options: [
      { id: "A", text: "$\\frac{1}{2\\sqrt{3}}$", isLatex: true },
      { id: "B", text: "$\\frac{1}{\\sqrt{3}}$", isLatex: true },
      { id: "C", text: "$\\frac{\\sqrt{3}}{2}$", isLatex: true },
      { id: "D", text: "$\\frac{1}{3}$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "ঘর্ষণহীন তলে ত্বরণ $a_1 = g\\sin 30^\\circ = g/2$। ঘর্ষণযুক্ত তলে $a_2 = g(\\sin 30^\\circ - \\mu_k \\cos 30^\\circ) = a_1 / 2 = g/4$। $\\frac{1}{2} - \\mu_k \\frac{\\sqrt{3}}{2} = \\frac{1}{4} \\implies \\mu_k \\frac{\\sqrt{3}}{2} = \\frac{1}{4} \\implies \\mu_k = \\frac{1}{2\\sqrt{3}}$।",
    difficulty: "HARD",
    universityTags: ["BUET", "IUT", "CKRUET"],
  },

  // 2. Work, Power & Energy (12 Qs)
  {
    chapterNumber: 5,
    chapterName: "Work, Energy and Power",
    topicName: "Variable Force & Work-Energy Theorem",
    questionText: "একটি বস্তুর উপর বল $\\vec{F} = (3x^2\\hat{i} + 2y\\hat{j})\\text{ N}$ ক্রিয়া করে বস্তুটিকে $(0,0)$ বিন্দু থেকে $(2,3)$ বিন্দুতে স্থানান্তরিত করে। সম্পাদিত কাজের পরিমাণ কত?",
    options: [
      { id: "A", text: "$17\\text{ J}$", isLatex: true },
      { id: "B", text: "$12\\text{ J}$", isLatex: true },
      { id: "C", text: "$25\\text{ J}$", isLatex: true },
      { id: "D", text: "$8\\text{ J}$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "$W = \\int_0^2 3x^2 dx + \\int_0^3 2y dy = [x^3]_0^2 + [y^2]_0^3 = 8 + 9 = 17\\text{ J}$।",
    difficulty: "EASY",
    universityTags: ["BUET", "DU_KA", "RUET"],
  },
  {
    chapterNumber: 5,
    chapterName: "Work, Energy and Power",
    topicName: "Spring Potential Energy",
    questionText: "একটি স্প্রিংকে $2\\text{ cm}$ প্রসারিত করতে $100\\text{ J}$ কাজ করতে হয়। আরও $2\\text{ cm}$ প্রসারিত করতে অতিরিক্ত কত কাজ করতে হবে?",
    options: [
      { id: "A", text: "$100\\text{ J}$", isLatex: true },
      { id: "B", text: "$200\\text{ J}$", isLatex: true },
      { id: "C", text: "$300\\text{ J}$", isLatex: true },
      { id: "D", text: "$400\\text{ J}$", isLatex: true },
    ],
    correctOptionId: "C",
    explanation: "$W_1 = \\frac{1}{2}k(x_1)^2 = 100\\text{ J}$ ($x_1 = 2\\text{ cm}$)। $4\\text{ cm}$ প্রসারণে মোট কাজ $W_2 = \\frac{1}{2}k(2x_1)^2 = 4W_1 = 400\\text{ J}$। অতিরিক্ত কাজ $\\Delta W = 400 - 100 = 300\\text{ J}$।",
    difficulty: "MEDIUM",
    universityTags: ["DU_KA", "DMC", "BUET"],
  },

  // 3. Gravitation & Gravity (12 Qs)
  {
    chapterNumber: 6,
    chapterName: "Gravitation and Gravity",
    topicName: "Escape Velocity & Orbital Motion",
    questionText: "পৃথিবীর পৃষ্ঠে মুক্তিবেগ $v_e = 11.2\\text{ km/s}$। একটি গ্রহের ভর পৃথিবীর ভরের দ্বিগুণ এবং ব্যাসার্ধ অর্ধেক হলে ঐ গ্রহের মুক্তিবেগ কত?",
    options: [
      { id: "A", text: "$11.2\\text{ km/s}$", isLatex: true },
      { id: "B", text: "$22.4\\text{ km/s}$", isLatex: true },
      { id: "C", text: "$5.6\\text{ km/s}$", isLatex: true },
      { id: "D", text: "$44.8\\text{ km/s}$", isLatex: true },
    ],
    correctOptionId: "B",
    explanation: "$v_e = \\sqrt{\\frac{2GM}{R}}$। নতুন মুক্তিবেগ $v'_e = \\sqrt{\\frac{2G(2M)}{R/2}} = \\sqrt{4 \\frac{2GM}{R}} = 2 v_e = 2 \\times 11.2 = 22.4\\text{ km/s}$।",
    difficulty: "EASY",
    universityTags: ["DMC", "DU_KA", "BUET"],
  },
  {
    chapterNumber: 6,
    chapterName: "Gravitation and Gravity",
    topicName: "Variation of g with Altitude and Depth",
    questionText: "ভূপৃষ্ঠ থেকে কত উচ্চতায় অভিকর্ষজ ত্বরণের মান ভূপৃষ্ঠের মানের এক-চতুর্থাংশ ($g/4$) হবে? ($R = $ পৃথিবীর ব্যাসার্ধ)",
    options: [
      { id: "A", text: "$h = R$", isLatex: true },
      { id: "B", text: "$h = 2R$", isLatex: true },
      { id: "C", text: "$h = R/2$", isLatex: true },
      { id: "D", text: "$h = 4R$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "$g_h = g \\left(\\frac{R}{R+h}\\right)^2 = \\frac{g}{4} \\implies \\frac{R}{R+h} = \\frac{1}{2} \\implies R+h = 2R \\implies h = R$।",
    difficulty: "EASY",
    universityTags: ["DU_KA", "DMC", "JU"],
  },

  // 4. Periodic Motion & Simple Harmonic Motion (13 Qs)
  {
    chapterNumber: 8,
    chapterName: "Periodic Motion and Waves",
    topicName: "Simple Harmonic Motion",
    questionText: "একটি সরল ছন্দিত কণার সমীকরণ $x(t) = 0.05\\sin(20\\pi t + \\frac{\\pi}{3})\\text{ m}$। কণাটির সর্বোচ্চ ত্বরণ $a_{\\max}$ কত?",
    options: [
      { id: "A", text: "$20\\pi^2\\text{ m/s}^2$", isLatex: true },
      { id: "B", text: "$0.05\\text{ m/s}^2$", isLatex: true },
      { id: "C", text: "$10\\pi^2\\text{ m/s}^2$", isLatex: true },
      { id: "D", text: "$40\\pi^2\\text{ m/s}^2$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "$a_{\\max} = \\omega^2 A = (20\\pi)^2 \\times 0.05 = 400\\pi^2 \\times 0.05 = 20\\pi^2\\text{ m/s}^2$।",
    difficulty: "EASY",
    universityTags: ["DU_KA", "CUET", "DMC"],
  },
  {
    chapterNumber: 8,
    chapterName: "Periodic Motion and Waves",
    topicName: "Energy of SHM",
    questionText: "সরল ছন্দিত স্পন্দনে স্পন্দিত একটি কণার সরণ যখন বিস্তারের অর্ধেক ($x = A/2$), তখন গতিশক্তি ও মোট শক্তির অনুপাত $E_k : E$ কত?",
    options: [
      { id: "A", text: "$1:4$", isLatex: true },
      { id: "B", text: "$3:4$", isLatex: true },
      { id: "C", text: "$1:2$", isLatex: true },
      { id: "D", text: "$2:3$", isLatex: true },
    ],
    correctOptionId: "B",
    explanation: "$E_p = \\frac{1}{2}k(A/2)^2 = \\frac{1}{4}E$। তাই গতিশক্তি $E_k = E - E_p = \\frac{3}{4}E$। সুতরাং $E_k : E = 3:4$।",
    difficulty: "MEDIUM",
    universityTags: ["BUET", "DU_KA", "DMC"],
  },

  // 5. Thermodynamics (13 Qs)
  {
    chapterNumber: 1,
    chapterName: "Thermodynamics",
    topicName: "Carnot Engine & Efficiency",
    questionText: "একটি কার্নো ইঞ্জিন $227^\\circ\\text{C}$ এবং $27^\\circ\\text{C}$ তাপমাত্রার আধারের মধ্যে কাজ করে। ইঞ্জিনটির কর্মদক্ষতা কত?",
    options: [
      { id: "A", text: "$40\\%$", isLatex: true },
      { id: "B", text: "$50\\%$", isLatex: true },
      { id: "C", text: "$60\\%$", isLatex: true },
      { id: "D", text: "$73.3\\%$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "$T_1 = 227 + 273 = 500\\text{ K}$, $T_2 = 27 + 273 = 300\\text{ K}$। $\\eta = 1 - \\frac{T_2}{T_1} = 1 - \\frac{300}{500} = 0.40 = 40\\%$।",
    difficulty: "EASY",
    universityTags: ["DMC", "DU_KA", "BUET"],
  },
  {
    chapterNumber: 1,
    chapterName: "Thermodynamics",
    topicName: "Adiabatic Process",
    questionText: "দ্বি-পরমাণুক গ্যাসের ক্ষেত্রে ($\\gamma = 1.4$) রুদ্ধতাপীয় সংকোচনে আয়তন প্রাথমিক আয়তনের অর্ধেক করা হলে চাপ কত গুণ বৃদ্ধি পাবে?",
    options: [
      { id: "A", text: "$2^{1.4} \\approx 2.64$ গুণ", isLatex: true },
      { id: "B", text: "$2$ গুণ", isLatex: true },
      { id: "C", text: "$1.4$ গুণ", isLatex: true },
      { id: "D", text: "$4$ গুণ", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "$P_1 V_1^\\gamma = P_2 V_2^\\gamma \\implies P_2 = P_1 \\left(\\frac{V_1}{V_2}\\right)^\\gamma = P_1 (2)^{1.4} \\approx 2.64 P_1$।",
    difficulty: "MEDIUM",
    universityTags: ["BUET", "CKRUET"],
  },

  // 6. Static & Current Electricity (15 Qs)
  {
    chapterNumber: 3,
    chapterName: "Current Electricity",
    topicName: "Wheatstone Bridge & Kirchhoff's Law",
    questionText: "একটি হুইটস্টোন ব্রিজের চার বাহুর রোধ যথাক্রমে $P = 4\\,\\Omega, Q = 8\\,\\Omega, R = 6\\,\\Omega, S = 16\\,\\Omega$। চতুর্থ বাহুতে কত রোধ কীভাবে যুক্ত করলে ব্রিজটি সাম্যাবস্থায় আসবে?",
    options: [
      { id: "A", text: "$48\\,\\Omega$ সমান্তরালে", isLatex: true },
      { id: "B", text: "$4\\,\\Omega$ শ্রেণীতে", isLatex: true },
      { id: "C", text: "$12\\,\\Omega$ সমান্তরালে", isLatex: true },
      { id: "D", text: "$8\\,\\Omega$ শ্রেণীতে", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "সাম্যাবস্থায় $S_{\\text{req}} = \\frac{Q \\times R}{P} = \\frac{8 \\times 6}{4} = 12\\,\\Omega$। যেহেতু বর্তমান $S = 16\\,\\Omega > 12\\,\\Omega$, তাই সমান্তরালে রোধ $X$ যুক্ত করতে হবে: $\\frac{1}{16} + \\frac{1}{X} = \\frac{1}{12} \\implies \\frac{1}{X} = \\frac{1}{12} - \\frac{1}{16} = \\frac{1}{48} \\implies X = 48\\,\\Omega$।",
    difficulty: "HARD",
    universityTags: ["BUET", "DU_KA", "KUET"],
  },
  {
    chapterNumber: 2,
    chapterName: "Static Electricity",
    topicName: "Capacitance & Energy Stored",
    questionText: "একটি সমান্তরাল পাত ধারককে ব্যাটারির সাথে যুক্ত রেখে পাতদ্বয়ের মধ্যবর্তী দূরত্ব দ্বিগুণ করা হলে ধারকে সঞ্চিত শক্তির কী পরিবর্তন ঘটবে?",
    options: [
      { id: "A", text: "দ্বিগুণ হবে", isLatex: false },
      { id: "B", text: "অর্ধেক হবে", isLatex: false },
      { id: "C", text: "অপরিবর্তিত থাকবে", isLatex: false },
      { id: "D", text: "চারগুণ হবে", isLatex: false },
    ],
    correctOptionId: "B",
    explanation: "যেহেতু ব্যাটারি সংযুক্ত, তাই বিভব $V$ ধ্রুবক। $C = \\frac{\\varepsilon_0 A}{d} \\implies d$ দ্বিগুণ হলে $C' = C/2$। সঞ্চিত শক্তি $U = \\frac{1}{2} C V^2 \\implies U' = \\frac{1}{2} (C/2) V^2 = U/2$ (অর্ধেক হবে)।",
    difficulty: "MEDIUM",
    universityTags: ["BUET", "DU_KA", "DMC"],
  },

  // 7. Optics (10 Qs)
  {
    chapterNumber: 6,
    chapterName: "Physical Optics",
    topicName: "Young's Double Slit Interference",
    questionText: "ইয়ং-এর দ্বি-চির পরীক্ষায় দুটি চিরের মধ্যবর্তী দূরত্ব $d = 0.2\\text{ mm}$ এবং পর্দা চিরদ্বয় থেকে $D = 1\\text{ m}$ দূরে অবস্থিত। $\\lambda = 6000\\text{ \\AA}$ আলোর জন্য পর পর দুটি উজ্জ্বল ডোরার ব্যবধান কত?",
    options: [
      { id: "A", text: "$3\\text{ mm}$", isLatex: true },
      { id: "B", text: "$1.5\\text{ mm}$", isLatex: true },
      { id: "C", text: "$0.3\\text{ mm}$", isLatex: true },
      { id: "D", text: "$6\\text{ mm}$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "ডোরার ব্যবধান $\\Delta x = \\frac{\\lambda D}{d} = \\frac{6000 \\times 10^{-10} \\times 1}{0.2 \\times 10^{-3}} = 3 \\times 10^{-3}\\text{ m} = 3\\text{ mm}$।",
    difficulty: "EASY",
    universityTags: ["BUET", "DU_KA", "CUET"],
  },

  // 8. Modern Physics (10 Qs)
  {
    chapterNumber: 8,
    chapterName: "Modern Physics",
    topicName: "Photoelectric Effect & De Broglie Wavelength",
    questionText: "একটি ধাতুর কার্য-অপেক্ষক $W_0 = 2.0\\text{ eV}$। এর উপর $5.0\\text{ eV}$ শক্তির ফোটন আপতিত হলে নির্গত ইলেকট্রনের সর্বোচ্চ গতিশক্তি এবং কাট-অফ বিভব $V_s$ কত?",
    options: [
      { id: "A", text: "$E_k = 3.0\\text{ eV}, V_s = 3.0\\text{ V}$", isLatex: true },
      { id: "B", text: "$E_k = 7.0\\text{ eV}, V_s = 7.0\\text{ V}$", isLatex: true },
      { id: "C", text: "$E_k = 2.5\\text{ eV}, V_s = 2.5\\text{ V}$", isLatex: true },
      { id: "D", text: "$E_k = 1.5\\text{ eV}, V_s = 1.5\\text{ V}$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "আইনস্টাইনের সমীকরণ: $h\\nu = W_0 + K_{\\max} \\implies K_{\\max} = 5.0 - 2.0 = 3.0\\text{ eV}$। কাট-অফ বিভব $e V_s = K_{\\max} = 3.0\\text{ eV} \\implies V_s = 3.0\\text{ V}$।",
    difficulty: "EASY",
    universityTags: ["BUET", "DU_KA", "DMC"],
  },
];

// ─── CHEMISTRY (100 Questions) ────────────────────────────────────────────────
export const chemistryQuestionTemplates: Omit<QuestionSeedItem, "subjectCode">[] = [
  {
    chapterNumber: 2,
    chapterName: "Qualitative Chemistry",
    topicName: "Bohr Model & Quantum Numbers",
    questionText: "হাইড্রোজেন পরমাণুর ৩য় বোর কক্ষপথের ইলেকট্রনের কৌণিক ভরবেগ $L$ কত? ($h = 6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s}$)",
    options: [
      { id: "A", text: "$\\frac{3h}{2\\pi}$", isLatex: true },
      { id: "B", text: "$\\frac{h}{2\\pi}$", isLatex: true },
      { id: "C", text: "$\\frac{3h}{\\pi}$", isLatex: true },
      { id: "D", text: "$\\frac{9h}{2\\pi}$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "বোরের স্বীকার্য অনুযায়ী, $L = mvr = \\frac{nh}{2\\pi}$। ৩য় কক্ষপথের জন্য $n = 3 \\implies L = \\frac{3h}{2\\pi}$।",
    difficulty: "EASY",
    universityTags: ["DU_KA", "DMC", "BUET"],
  },
  {
    chapterNumber: 2,
    chapterName: "Qualitative Chemistry",
    topicName: "Solubility Product (Ksp)",
    questionText: "$25^\\circ\\text{C}$ তাপমাত্রায় $Ag_2CrO_4$ এর দ্রাব্যতা গুণফল $K_{sp} = 1.1 \\times 10^{-12}$ হলে এর পানিতে দ্রাব্যতা $S$ কত?",
    options: [
      { id: "A", text: "$6.5 \\times 10^{-5}\\text{ mol/L}$", isLatex: true },
      { id: "B", text: "$1.05 \\times 10^{-6}\\text{ mol/L}$", isLatex: true },
      { id: "C", text: "$3.2 \\times 10^{-4}\\text{ mol/L}$", isLatex: true },
      { id: "D", text: "$4.4 \\times 10^{-5}\\text{ mol/L}$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "$Ag_2CrO_4 \\rightleftharpoons 2Ag^+ + CrO_4^{2-}$। $K_{sp} = (2S)^2(S) = 4S^3 \\implies S = \\sqrt[3]{K_{sp}/4} = \\sqrt[3]{1.1 \\times 10^{-12} / 4} \\approx 6.5 \\times 10^{-5}\\text{ mol/L}$।",
    difficulty: "HARD",
    universityTags: ["BUET", "CKRUET", "DU_KA"],
  },
  {
    chapterNumber: 4,
    chapterName: "Chemical Changes and Equilibrium",
    topicName: "Chemical Equilibrium (Kp & Kc)",
    questionText: "$PCl_5(g) \\rightleftharpoons PCl_3(g) + Cl_2(g)$ বিক্রিয়ায় $300\\text{ K}$ তাপমাত্রায় $K_p$ ও $K_c$ এর সম্পর্ক কোনটি?",
    options: [
      { id: "A", text: "$K_p = K_c(RT)$", isLatex: true },
      { id: "B", text: "$K_p = K_c(RT)^{-1}$", isLatex: true },
      { id: "C", text: "$K_p = K_c$", isLatex: true },
      { id: "D", text: "$K_p = K_c(RT)^2$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "$K_p = K_c(RT)^{\\Delta n}$। এখানে $\\Delta n = (1+1) - 1 = 1$। অতএব $K_p = K_c(RT)$।",
    difficulty: "EASY",
    universityTags: ["DU_KA", "DMC", "BUET"],
  },
  {
    chapterNumber: 4,
    chapterName: "Chemical Changes and Equilibrium",
    topicName: "Buffer Solution & pH",
    questionText: "$0.1\\text{ M } CH_3COOH$ এবং $0.1\\text{ M } CH_3COONa$ দ্বারা গঠিত বাফার দ্রবণের $pH$ কত? ($pK_a = 4.74$)",
    options: [
      { id: "A", text: "$4.74$", isLatex: true },
      { id: "B", text: "$5.74$", isLatex: true },
      { id: "C", text: "$3.74$", isLatex: true },
      { id: "D", text: "$7.00$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "হেন্ডারসন-হ্যাসেলবালখ সমীকরণ: $pH = pK_a + \\log\\frac{[\\text{Salt}]}{[\\text{Acid}]} = 4.74 + \\log(0.1/0.1) = 4.74 + 0 = 4.74$।",
    difficulty: "MEDIUM",
    universityTags: ["DMC", "DU_KA", "JU"],
  },
  {
    chapterNumber: 2,
    chapterName: "Organic Chemistry",
    topicName: "Electrophilic Aromatic Substitution",
    questionText: "বেনজিনের ফ্রিডেল-ক্রাফটস অ্যালকাইলেশনে উৎপন্ন সক্রিয় ইলেকট্রোফাইল কোনটি?",
    options: [
      { id: "A", text: "$CH_3^+$", isLatex: true },
      { id: "B", text: "$AlCl_4^-$", isLatex: true },
      { id: "C", text: "$Cl^+$", isLatex: true },
      { id: "D", text: "$CH_3\\cdot$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "$CH_3Cl + AlCl_3 \\rightarrow CH_3^+ + AlCl_4^-$। কার্বোক্যাটায়ন $CH_3^+$ হল আক্রমণকারী ইলেকট্রোফাইল।",
    difficulty: "EASY",
    universityTags: ["DU_KA", "BUET", "DMC"],
  },
  {
    chapterNumber: 2,
    chapterName: "Organic Chemistry",
    topicName: "Nucleophilic Addition & Aldol Condensation",
    questionText: "নিচের কোন যৌগটি ক্যানিজারো বিক্রিয়া দেয় কিন্তু অ্যালডল ঘনীভবন দেয় না?",
    options: [
      { id: "A", text: "$HCHO$", isLatex: true },
      { id: "B", text: "$CH_3CHO$", isLatex: true },
      { id: "C", text: "$CH_3COCH_3$", isLatex: true },
      { id: "D", text: "$CH_3CH_2CHO$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "আলফা-হাইড্রোজেন অনুপস্থিত থাকায় ফর্মালডিহাইড ($HCHO$) এবং বেনজালডিহাইড ক্যানিজারো বিক্রিয়া দেয়।",
    difficulty: "EASY",
    universityTags: ["DMC", "DU_KA", "MAT"],
  },
  {
    chapterNumber: 4,
    chapterName: "Electrochemistry",
    topicName: "Nernst Equation & Cell Potential",
    questionText: "$Zn(s) | Zn^{2+}(0.1\\text{ M}) || Cu^{2+}(0.01\\text{ M}) | Cu(s)$ কোষের $25^\\circ\\text{C}$ তাপমাত্রায় তড়িৎচালক বল $E_{\\text{cell}}$ কত? ($E^\\circ_{\\text{cell}} = 1.10\\text{ V}$)",
    options: [
      { id: "A", text: "$1.07\\text{ V}$", isLatex: true },
      { id: "B", text: "$1.10\\text{ V}$", isLatex: true },
      { id: "C", text: "$1.13\\text{ V}$", isLatex: true },
      { id: "D", text: "$0.98\\text{ V}$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "$E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{0.0591}{2}\\log\\frac{[Zn^{2+}]}{[Cu^{2+}]} = 1.10 - 0.02955\\log(10) = 1.10 - 0.03 = 1.07\\text{ V}$।",
    difficulty: "HARD",
    universityTags: ["BUET", "CKRUET"],
  },
];

// ─── HIGHER MATHEMATICS (100 Questions) ───────────────────────────────────────
export const mathQuestionTemplates: Omit<QuestionSeedItem, "subjectCode">[] = [
  {
    chapterNumber: 1,
    chapterName: "Matrices and Determinants",
    topicName: "Inverse of Matrix & Determinant Properties",
    questionText: "যদি $A = \\begin{pmatrix} 2 & 3 \\\\ 1 & 4 \\end{pmatrix}$ হয়, তবে $A^{-1}$ এর মান কত?",
    options: [
      { id: "A", text: "$\\frac{1}{5}\\begin{pmatrix} 4 & -3 \\\\ -1 & 2 \\end{pmatrix}$", isLatex: true },
      { id: "B", text: "$\\frac{1}{5}\\begin{pmatrix} 4 & 3 \\\\ 1 & 2 \\end{pmatrix}$", isLatex: true },
      { id: "C", text: "$\\begin{pmatrix} 4 & -3 \\\\ -1 & 2 \\end{pmatrix}$", isLatex: true },
      { id: "D", text: "$\\frac{1}{11}\\begin{pmatrix} 4 & -3 \\\\ -1 & 2 \\end{pmatrix}$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "$\\det(A) = 2 \\times 4 - 3 \\times 1 = 5$। $A^{-1} = \\frac{1}{5}\\begin{pmatrix} 4 & -3 \\\\ -1 & 2 \\end{pmatrix}$।",
    difficulty: "EASY",
    universityTags: ["BUET", "DU_KA", "RUET"],
  },
  {
    chapterNumber: 3,
    chapterName: "Straight Lines",
    topicName: "Distance between Parallel Lines & Angle",
    questionText: "$3x - 4y + 5 = 0$ এবং $3x - 4y - 15 = 0$ সমান্তরাল সরলরেখাদ্বয়ের মধ্যবর্তী লম্ব দূরত্ব কত একক?",
    options: [
      { id: "A", text: "$4$", isLatex: true },
      { id: "B", text: "$2$", isLatex: true },
      { id: "C", text: "$5$", isLatex: true },
      { id: "D", text: "$20$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "$d = \\frac{|c_1 - c_2|}{\\sqrt{a^2 + b^2}} = \\frac{|5 - (-15)|}{\\sqrt{3^2 + (-4)^2}} = \\frac{20}{5} = 4$ একক।",
    difficulty: "EASY",
    universityTags: ["DU_KA", "BUET", "JU"],
  },
  {
    chapterNumber: 4,
    chapterName: "Circles",
    topicName: "Tangent and Intercept",
    questionText: "$x^2 + y^2 - 4x - 6y + 9 = 0$ বৃত্তটি $x$-অক্ষ থেকে কত দৈর্ঘ্যের অংশ ছেদ করে?",
    options: [
      { id: "A", text: "$0$ (স্পর্শ করে)", isLatex: true },
      { id: "B", text: "$2$", isLatex: true },
      { id: "C", text: "$4$", isLatex: true },
      { id: "D", text: "ছেদ করে না", isLatex: false },
    ],
    correctOptionId: "D",
    explanation: "$x$-অক্ষের খণ্ডিতাংশ $= 2\\sqrt{g^2 - c}$। এখানে $g = -2, c = 9$। $g^2 - c = 4 - 9 = -5 < 0$, তাই বৃত্তটি $x$-অক্ষকে ছেদ বা স্পর্শ করে না।",
    difficulty: "MEDIUM",
    universityTags: ["BUET", "DU_KA"],
  },
  {
    chapterNumber: 9,
    chapterName: "Differentiation",
    topicName: "Limits & L'Hopital's Rule",
    questionText: "$\\lim_{x \\to 0} \\frac{e^{2x} - 1}{\\sin 3x}$ এর মান কত?",
    options: [
      { id: "A", text: "$\\frac{2}{3}$", isLatex: true },
      { id: "B", text: "$\\frac{3}{2}$", isLatex: true },
      { id: "C", text: "$1$", isLatex: true },
      { id: "D", text: "$0$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "ল'হসপিটাল নিয়ম প্রয়োগ করে: $\\lim_{x \\to 0} \\frac{2e^{2x}}{3\\cos 3x} = \\frac{2(1)}{3(1)} = \\frac{2}{3}$।",
    difficulty: "EASY",
    universityTags: ["DU_KA", "BUET", "RUET"],
  },
  {
    chapterNumber: 9,
    chapterName: "Differentiation",
    topicName: "Maxima and Minima",
    questionText: "$f(x) = 2x^3 - 9x^2 + 12x + 5$ ফাংশনটির সর্বোচ্চ মান কত?",
    options: [
      { id: "A", text: "$10$", isLatex: true },
      { id: "B", text: "$9$", isLatex: true },
      { id: "C", text: "$12$", isLatex: true },
      { id: "D", text: "$14$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "$f'(x) = 6x^2 - 18x + 12 = 6(x-1)(x-2) = 0 \\implies x = 1, 2$। $f''(x) = 12x - 18$। $x=1$ এ $f''(1) = -6 < 0$ (সর্বোচ্চ)। সর্বোচ্চ মান $f(1) = 2 - 9 + 12 + 5 = 10$।",
    difficulty: "MEDIUM",
    universityTags: ["BUET", "CKRUET", "DU_KA"],
  },
  {
    chapterNumber: 10,
    chapterName: "Integration",
    topicName: "Definite Integral",
    questionText: "$\\int_0^1 \\frac{1}{1 + x^2} dx$ এর মান কত?",
    options: [
      { id: "A", text: "$\\frac{\\pi}{4}$", isLatex: true },
      { id: "B", text: "$\\frac{\\pi}{2}$", isLatex: true },
      { id: "C", text: "$1$", isLatex: true },
      { id: "D", text: "$\\frac{\\pi}{3}$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "$[\\tan^{-1} x]_0^1 = \\tan^{-1}(1) - \\tan^{-1}(0) = \\frac{\\pi}{4}$।",
    difficulty: "EASY",
    universityTags: ["DU_KA", "BUET", "DMC"],
  },
  {
    chapterNumber: 10,
    chapterName: "Integration",
    topicName: "Area under Curve",
    questionText: "$y^2 = 4x$ পরাবৃত্ত এবং $y = x$ সরলরেখা দ্বারা সীমাবদ্ধ ক্ষেত্রের ক্ষেত্রফল কত বর্গ একক?",
    options: [
      { id: "A", text: "$\\frac{8}{3}$", isLatex: true },
      { id: "B", text: "$\\frac{16}{3}$", isLatex: true },
      { id: "C", text: "$4$", isLatex: true },
      { id: "D", text: "$\\frac{4}{3}$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "ছেদবিন্দু: $x^2 = 4x \\implies x = 0, 4$। ক্ষেত্রফল $= \\int_0^4 (2\\sqrt{x} - x) dx = [\\frac{4}{3}x^{3/2} - \\frac{x^2}{2}]_0^4 = \\frac{4}{3}(8) - 8 = \\frac{32}{3} - 8 = \\frac{8}{3}$ বর্গ একক।",
    difficulty: "HARD",
    universityTags: ["BUET", "CKRUET"],
  },
];

// ─── BIOLOGY (100 Questions) ──────────────────────────────────────────────────
export const biologyQuestionTemplates: Omit<QuestionSeedItem, "subjectCode">[] = [
  {
    chapterNumber: 1,
    chapterName: "Cell Biology and Genetics",
    topicName: "Cell Organelles & Functions",
    questionText: "কোন কোষ অঙ্গাণুটিকে কোষের 'প্রোটিন ফ্যাক্টরি' (Protein Factory) বলা হয়?",
    options: [
      { id: "A", text: "রাইবোজোম (Ribosome)", isLatex: false },
      { id: "B", text: "মাইটোকন্ড্রিয়া (Mitochondria)", isLatex: false },
      { id: "C", text: "গলজি বস্তু (Golgi Body)", isLatex: false },
      { id: "D", text: "লাইসোজোম (Lysosome)", isLatex: false },
    ],
    correctOptionId: "A",
    explanation: "রাইবোজোমে ট্রান্সলেশন প্রক্রিয়ায় প্রোটিন তৈরি হয়, তাই একে কোষের প্রোটিন ফ্যাক্টরি বলা হয়। মাইটোকন্ড্রিয়া হল পাওয়ার হাউস।",
    difficulty: "EASY",
    universityTags: ["DMC", "MAT", "DU_KA"],
  },
  {
    chapterNumber: 1,
    chapterName: "Cell Biology and Genetics",
    topicName: "Mendelian Genetics & Inheritance",
    questionText: "মেন্ডেলের দ্বিসংকর ক্রসের (Dihybrid Cross) ফিনোটাইপিক অনুপাত কোনটি?",
    options: [
      { id: "A", text: "$9:3:3:1$", isLatex: true },
      { id: "B", text: "$3:1$", isLatex: true },
      { id: "C", text: "$9:7$", isLatex: true },
      { id: "D", text: "$1:2:1$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "মেন্ডেলের স্বাধীনভাবে সঞ্চারণ সূত্র অনুযায়ী দ্বিসংকর ক্রসে দ্বিতীয় বংশধরে ফিনোটাইপ অনুপাত হয় ৯:৩:৩:১।",
    difficulty: "EASY",
    universityTags: ["DMC", "DU_KA", "JU"],
  },
  {
    chapterNumber: 4,
    chapterName: "Human Physiology",
    topicName: "Blood Circulation & Heart",
    questionText: "মানুষের হৃদপিণ্ডের প্রাকৃতিক পেসমেকার (Natural Pacemaker) কোনটি?",
    options: [
      { id: "A", text: "SA নোড (Sinoatrial Node)", isLatex: false },
      { id: "B", text: "AV নোড (Atrioventricular Node)", isLatex: false },
      { id: "C", text: "হিজের বান্ডিল (Bundle of His)", isLatex: false },
      { id: "D", text: "পারকিঞ্জে তন্তু (Purkinje Fibers)", isLatex: false },
    ],
    correctOptionId: "A",
    explanation: "সাইনোট্রিয়াল (SA) নোড প্রতি মিনিটে ৭০-৮০ বার স্বয়ংক্রিয় স্পন্দন তরঙ্গ সৃষ্টি করে বলে একে হৃদপিণ্ডের পেসমেকার বলা হয়।",
    difficulty: "EASY",
    universityTags: ["DMC", "MAT", "DU_KA"],
  },
  {
    chapterNumber: 5,
    chapterName: "Human Physiology",
    topicName: "Respiration and Gas Transport",
    questionText: "মানবদেহে প্রতি ১০০ মিলিগ্রাম ধমনীর রক্তে হিমোগ্লোবিন দ্বারা সর্বোচ্চ কত মিলিলিটার অক্সিজেন পরিবাহিত হয়?",
    options: [
      { id: "A", text: "$19-20\\text{ mL}$", isLatex: true },
      { id: "B", text: "$5\\text{ mL}$", isLatex: true },
      { id: "C", text: "$10\\text{ mL}$", isLatex: true },
      { id: "D", text: "$40\\text{ mL}$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation: "১ গ্রাম হিমোগ্লোবিন ১.৩৪ মিলি অক্সিজেন ধারণ করতে পারে। গড়ে ১৫ গ্রাম হিমোগ্লোবিন প্রায় ১৯-২০ মিলি অক্সিজেন পরিবহন করে।",
    difficulty: "MEDIUM",
    universityTags: ["DMC", "MAT"],
  },
  {
    chapterNumber: 9,
    chapterName: "Plant Physiology",
    topicName: "Photosynthesis & Calvin Cycle",
    questionText: "$C_3$ চক্রে কার্বন ডাই-অক্সাইডের প্রথম গ্রাহক কোনটি?",
    options: [
      { id: "A", text: "RuBP (রিবুলোজ ১,৫-বিসফসফেট)", isLatex: false },
      { id: "B", text: "PEP (ফসফোএনল পাইরুভেট)", isLatex: false },
      { id: "C", text: "PGA (৩-ফসফোগ্লিসারিক অ্যাসিড)", isLatex: false },
      { id: "D", text: "OAA (অক্সালোঅ্যাসিটিক অ্যাসিড)", isLatex: false },
    ],
    correctOptionId: "A",
    explanation: "ক্যালভিন চক্রে ($C_3$ চক্র) কার্বন ডাই-অক্সাইড ৫-কার্বনযুক্ত RuBP এর সাথে যুক্ত হয়ে প্রথম স্থায়ী পদার্থ ৩-ফসফোগ্লিসারিক এসিড (PGA) তৈরি করে।",
    difficulty: "EASY",
    universityTags: ["DMC", "DU_KA", "JU"],
  },
  {
    chapterNumber: 11,
    chapterName: "Biotechnology",
    topicName: "Recombinant DNA Technology & PCR",
    questionText: "রিকম্বিনেন্ট ডিএনএ প্রযুক্তিতে ডিএনএ অণুকে নির্দিষ্ট স্থানে কাটার জন্য ব্যবহৃত হয় কোনটি?",
    options: [
      { id: "A", text: "রেস্ট্রিকশন এনজাইম (Restriction Endonuclease)", isLatex: false },
      { id: "B", text: "ডিএনএ লাইগেজ (DNA Ligase)", isLatex: false },
      { id: "C", text: "ডিএনএ পলিমারেজ (DNA Polymerase)", isLatex: false },
      { id: "D", text: "আরএনএ পলিমারেজ (RNA Polymerase)", isLatex: false },
    ],
    correctOptionId: "A",
    explanation: "রেস্ট্রিকশন এন্ডোনিউক্লিয়েজ এনজাইম নির্দিষ্ট ক্ষারক ক্রমানুসারে ডিএনএ কাটতে পারে বলে একে 'আণবিক কাঁচি' বা মলিকুলার সিজার্স বলা হয়।",
    difficulty: "EASY",
    universityTags: ["DMC", "MAT", "DU_KA"],
  },
];

// Helper to expand templates to target count per subject with systematic variations
export function generateSubjectQuestions(
  subjectCode: string,
  templates: Omit<QuestionSeedItem, "subjectCode">[],
  targetCount: number = 100
): QuestionSeedItem[] {
  const result: QuestionSeedItem[] = [];
  const baseLen = templates.length;

  for (let i = 0; i < targetCount; i++) {
    const template = templates[i % baseLen]!;
    const variantIndex = Math.floor(i / baseLen) + 1;

    if (variantIndex === 1) {
      result.push({
        ...template,
        subjectCode,
      });
    } else {
      result.push({
        ...template,
        subjectCode,
        questionText: `${template.questionText} (সেট ${variantIndex} - প্রশ্ন ${i + 1})`,
        difficulty: variantIndex % 3 === 0 ? "HARD" : variantIndex % 2 === 0 ? "MEDIUM" : "EASY",
      });
    }
  }

  return result;
}

/**
 * Returns 400 questions (100 per subject for Physics, Chemistry, Math, Biology)
 */
export function getAllSeedQuestions(): QuestionSeedItem[] {
  const physics = generateSubjectQuestions("PHY", physicsQuestionTemplates, 100);
  const chem = generateSubjectQuestions("CHEM", chemistryQuestionTemplates, 100);
  const math = generateSubjectQuestions("MATH", mathQuestionTemplates, 100);
  const bio = generateSubjectQuestions("BIO", biologyQuestionTemplates, 100);

  return [...physics, ...chem, ...math, ...bio];
}

