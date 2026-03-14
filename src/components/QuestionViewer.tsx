import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, XCircle, ArrowRight, Sparkles,
  FileSearch, Send, ShieldCheck, Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";

const mcqQuestions = [
  {
    id: 1,
    text: "According to the first principle of the Code of Ethics, software engineers must act consistently with",
    options: [
      "A) The client's profit",
      "B) The Public interest",
      "C) Their own career goals",
      "D) The latest technology trends",
    ],
  },
  {
    id: 2,
    text: 'What is "Fabrication" in the context of lying?',
    options: [
      "A) A statement not based on fact",
      "B) Sarcasm, storytelling or comedy",
      "C) A strategic lie",
      "D) A harmless lie",
    ],
  },
  {
    id: 3,
    text: "According to Principle 3 (Product), software engineers should ensure that their products meet:",
    options: [
      "A) The highest professional standards possible",
      "B) Only the legal minimum requirements",
      "C) The lowest possible cost",
      "D) The marketing department's hype",
    ],
  },
  {
    id: 4,
    text: 'The "Computer Game Fallacy" involves the mistaken belief that:',
    options: [
      "A) All software should be gamified.",
      "B) Real-life actions have no serious consequences, like in a video game",
      "C) Video games are too difficult to program",
      "D) Computer games are primarily designed for educational purposes",
    ],
  },
  {
    id: 5,
    text: "Rushing a product to market without testing is an example of which conflict?",
    options: [
      "A) Privacy vs. Security",
      "B) Innovation vs. Regulation",
      "C) Profit vs. User Safety",
      "D) Individual rights vs. Public protection",
    ],
  },
];

const gridSelectQ6 = {
  id: 6,
  text: "There are eight principles in the ACM Code of Ethics. Identify the four correct principles from the options provided below.",
  options: [
    "Efficiency", "Security", "Public", "Company", "Product",
    "Management", "Compliance", "Project", "Colleagues", "Government",
  ],
};

const multiSelectQ7 = {
  id: 7,
  text: "Which three of the following statements accurately describe the core focus of these specific organizational cultures? (Select three correct options)",
  options: [
    "a) Government culture prioritizes strict regulatory compliance.",
    "b) Silicon Valley prioritizes bureaucratic stability.",
    "c) Japanese culture focuses on rapid individual profit.",
    "d) Silicon Valley focuses on rapid innovation.",
    "e) Japanese culture emphasizes collective responsibility.",
    "f) Government culture adopts a \"move fast and break things\" mentality.",
  ],
};

const matchingQ8 = {
  id: 8,
  text: "Match Table A with Table B by drawing an arrow from the item in Table A to the corresponding item in Table B.",
  left: [
    "Shatterproof fallacy",
    "Candy-from-a-baby fallacy",
    "Law Abiding Citizen Fallacy",
    "Free information fallacy",
  ],
  right: [
    "Knowledge Isn't Costless",
    "Legality is Not Morality",
    "Nothing is Unbreakable",
    "Easy Isn't Effortless",
  ],
};

const gridSelectQ9 = {
  id: 9,
  text: "From the list below, select the four correct forms of lies commonly identified in professional and communication ethics.",
  options: [
    "Bribery", "Fabrication", "Conflict of interest", "Regulatory compliance", "Bald-faced lie",
    "Inaccurate disclosure", "Black lie", "Lying by omission", "Objective", "Emergency lie",
  ],
};

const trueFalseQ10 = {
  id: 10,
  text: "Read each statement below carefully. Write True if the statement accurately describes a lie, or False if it does not. (Hint: Three options are true and three options are false)",
  statements: [
    "a) A lie involves providing false information with the specific goal of tricking another person.",
    "b) If you accidentally say something incorrect because you forgot the facts, you are lying.",
    "c) Using a false statement to gain a reward or a personal advantage is a form of lying.",
    "d) To be considered a lie, the speaker must believe that what they are saying is actually true.",
    "e) Lying can include trying to make yourself look better by stating things you know are wrong.",
    "f) A statement is only a lie if the other person immediately realizes they have been fooled.",
  ],
};

const STORAGE_KEY = "assessment-platform-answers";

const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { }
  return null;
};

const saveToStorage = (data: any) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { }
};

const QuestionViewer = ({ metadata }: { metadata: any }) => {
  const saved = loadFromStorage();
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>(saved?.mcqAnswers ?? {});
  const [gridSelect6, setGridSelect6] = useState<Set<number>>(new Set(saved?.gridSelect6 ?? []));
  const [multiSelect7, setMultiSelect7] = useState<Set<number>>(new Set(saved?.multiSelect7 ?? []));
  const [matching, setMatching] = useState<Record<number, number | null>>(
    saved?.matching
      ? Object.fromEntries(Object.entries(saved.matching).map(([k, v]) => [Number(k), v === null ? null : Number(v)]))
      : { 0: null, 1: null, 2: null, 3: null }
  );
  const [gridSelect9, setGridSelect9] = useState<Set<number>>(new Set(saved?.gridSelect9 ?? []));
  const [trueFalse, setTrueFalse] = useState<Record<number, boolean | null>>(saved?.trueFalse ?? {});
  const [hoveredMatch, setHoveredMatch] = useState<number | null>(null);

  // Submission States
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const persistAll = (overrides: any = {}) => {
    const data = {
      mcqAnswers: overrides.mcqAnswers ?? mcqAnswers,
      gridSelect6: [...(overrides.gridSelect6 ?? gridSelect6)],
      multiSelect7: [...(overrides.multiSelect7 ?? multiSelect7)],
      matching: overrides.matching ?? matching,
      gridSelect9: [...(overrides.gridSelect9 ?? gridSelect9)],
      trueFalse: overrides.trueFalse ?? trueFalse,
    };
    saveToStorage(data);
  };

  const toggleGridSelect = (set: Set<number>, setFn: (s: Set<number>) => void, idx: number, max: number, key: string) => {
    const next = new Set(set);
    if (next.has(idx)) next.delete(idx);
    else if (next.size < max) next.add(idx);
    setFn(next);
    persistAll({ [key]: next });
  };

  const answeredMcq = Object.keys(mcqAnswers).length;
  const totalQuestions = 10;
  const answeredCount = answeredMcq
    + (gridSelect6.size === 4 ? 1 : 0)
    + (multiSelect7.size === 3 ? 1 : 0)
    + (Object.values(matching).every(v => v !== null) ? 1 : 0)
    + (gridSelect9.size === 4 ? 1 : 0)
    + (Object.keys(trueFalse).length === 6 ? 1 : 0);

  return (
    <div className="space-y-6 questions-content p-4 bg-white">
      {/* Progress Bar */}
      <div className="bg-card border border-border rounded-xl p-5" data-html2canvas-ignore>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground">Progress</span>
          </div>
          <span className="text-sm font-semibold text-primary">{answeredCount}/{totalQuestions} answered</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent-foreground transition-all duration-500 ease-out"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1.5 h-10 bg-gradient-to-b from-primary to-accent-foreground rounded-full" />
          <div>
            <h3 className="text-xl font-display font-bold text-foreground">CSE 4215 — Class Test #1</h3>
            <p className="text-sm text-muted-foreground">Winter 2026 · Full Marks: 15 · Time: 15 Minutes</p>
          </div>
        </div>

        {/* Questions 1-5: MCQ */}
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/50 text-primary text-xs font-bold font-display">
              SECTION A — Multiple Choice
            </div>
          </div>
          {mcqQuestions.map((q) => (
            <div key={q.id} className="space-y-3 group">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-foreground leading-relaxed">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground text-xs font-bold mr-2 align-middle">
                    {q.id}
                  </span>
                  {q.text}
                </p>
                <div className="flex gap-1.5 shrink-0">
                  <Badge variant="secondary" className="text-xs whitespace-nowrap">Marks: 1</Badge>
                  <Badge variant="outline" className="text-xs whitespace-nowrap">CLO: 1</Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-9">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => { const next = { ...mcqAnswers, [q.id]: i }; setMcqAnswers(next); persistAll({ mcqAnswers: next }); }}
                    className={cn(
                      "text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200 relative overflow-hidden",
                      mcqAnswers[q.id] === i
                        ? "border-primary bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground font-medium shadow-lg scale-[1.02]"
                        : "border-border bg-card text-foreground hover:border-primary/40 hover:shadow-sm hover:translate-x-0.5"
                    )}
                  >
                    {mcqAnswers[q.id] === i && <CheckCircle2 className="w-3.5 h-3.5 absolute top-1 right-1 text-primary-foreground/80" />}
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Question 6: Grid Select */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/50 text-primary text-xs font-bold font-display">
              SECTION B — Grid Selection
            </div>
          </div>
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold text-foreground leading-relaxed">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground text-xs font-bold mr-2 align-middle">
                6
              </span>
              {gridSelectQ6.text}
            </p>
            <div className="flex gap-1.5 shrink-0">
              <Badge variant="secondary" className="text-xs">Marks: 2</Badge>
              <Badge variant="outline" className="text-xs">CLO: 1</Badge>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2.5 pl-9">
            {gridSelectQ6.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => toggleGridSelect(gridSelect6, setGridSelect6, i, 4, 'gridSelect6')}
                className={cn(
                  "px-3 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 text-center relative",
                  gridSelect6.has(i)
                    ? "border-primary bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground shadow-lg scale-[1.02]"
                    : "border-border bg-card text-foreground hover:border-primary/40 hover:shadow-sm hover:scale-[1.01]"
                )}
              >
                {gridSelect6.has(i) && <CheckCircle2 className="w-3.5 h-3.5 absolute top-1 right-1 text-primary-foreground/80" />}
                {opt}
              </button>
            ))}
          </div>
          <div className="pl-9 flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={cn("w-2.5 h-2.5 rounded-full transition-all", i < gridSelect6.size ? "bg-primary scale-110" : "bg-muted")} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Selected: {gridSelect6.size}/4</p>
          </div>
        </div>

        {/* Question 7: Multi-select */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold text-foreground leading-relaxed">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground text-xs font-bold mr-2 align-middle">
                7
              </span>
              {multiSelectQ7.text}
            </p>
            <div className="flex gap-1.5 shrink-0">
              <Badge variant="secondary" className="text-xs">Marks: 2</Badge>
              <Badge variant="outline" className="text-xs">CLO: 1</Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2.5 pl-9">
            {multiSelectQ7.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => toggleGridSelect(multiSelect7, setMultiSelect7, i, 3, 'multiSelect7')}
                className={cn(
                  "text-left px-5 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-3",
                  multiSelect7.has(i)
                    ? "border-primary bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground shadow-lg scale-[1.02]"
                    : "border-border bg-card text-foreground hover:border-primary/40 hover:shadow-sm"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                  multiSelect7.has(i) ? "border-primary-foreground/50 bg-primary-foreground/20" : "border-muted-foreground/30"
                )}>
                  {multiSelect7.has(i) && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />}
                </div>
                {opt}
              </button>
            ))}
          </div>
          <div className="pl-9 flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className={cn("w-2.5 h-2.5 rounded-full transition-all", i < multiSelect7.size ? "bg-primary scale-110" : "bg-muted")} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Selected: {multiSelect7.size}/3</p>
          </div>
        </div>

        {/* Question 8: Matching */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/50 text-primary text-xs font-bold font-display">
              SECTION C — Matching
            </div>
          </div>
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold text-foreground leading-relaxed">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground text-xs font-bold mr-2 align-middle">
                8
              </span>
              {matchingQ8.text}
            </p>
            <div className="flex gap-1.5 shrink-0">
              <Badge variant="secondary" className="text-xs">Marks: 2</Badge>
              <Badge variant="outline" className="text-xs">CLO: 1</Badge>
            </div>
          </div>
          <div className="pl-9 space-y-3">
            <div className="grid grid-cols-[1fr_40px_1fr] gap-0 items-start">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-2">Table A</div>
              <div />
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-2">Table B</div>
            </div>
            {matchingQ8.left.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_40px_1fr] gap-0 items-center"
                onMouseEnter={() => setHoveredMatch(i)}
                onMouseLeave={() => setHoveredMatch(null)}
              >
                <div className={cn(
                  "px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200",
                  matching[i] !== null
                    ? "bg-gradient-to-r from-primary/10 to-accent/30 border-primary/40 text-foreground"
                    : hoveredMatch === i
                      ? "bg-accent/50 border-primary/30 text-foreground"
                      : "bg-card border-border text-foreground"
                )}>
                  {item}
                </div>
                <div className="flex justify-center">
                  <ArrowRight className={cn(
                    "w-5 h-5 transition-all duration-200",
                    matching[i] !== null ? "text-primary scale-110" : "text-muted-foreground/40"
                  )} />
                </div>
                <select
                  value={matching[i] ?? ""}
                  onChange={(e) => { const next = { ...matching, [i]: e.target.value === "" ? null : Number(e.target.value) }; setMatching(next); persistAll({ matching: next }); }}
                  className={cn(
                    "px-3 py-3 rounded-xl border text-sm transition-all duration-200 bg-card text-foreground focus:ring-2 focus:ring-ring cursor-pointer",
                    matching[i] !== null ? "border-primary/40 font-medium" : "border-border"
                  )}
                >
                  <option value="">Select match...</option>
                  {matchingQ8.right.map((r, ri) => (
                    <option key={ri} value={ri}>{r}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Question 9: Grid Select */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/50 text-primary text-xs font-bold font-display">
              SECTION D — Grid Selection
            </div>
          </div>
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold text-foreground leading-relaxed">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground text-xs font-bold mr-2 align-middle">
                9
              </span>
              {gridSelectQ9.text}
            </p>
            <div className="flex gap-1.5 shrink-0">
              <Badge variant="secondary" className="text-xs">Marks: 2</Badge>
              <Badge variant="outline" className="text-xs">CLO: 1</Badge>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2.5 pl-9">
            {gridSelectQ9.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => toggleGridSelect(gridSelect9, setGridSelect9, i, 4, 'gridSelect9')}
                className={cn(
                  "px-3 py-3.5 rounded-xl border text-sm font-medium transition-all duration-200 text-center relative",
                  gridSelect9.has(i)
                    ? "border-primary bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground shadow-lg scale-[1.02]"
                    : "border-border bg-card text-foreground hover:border-primary/40 hover:shadow-sm hover:scale-[1.01]"
                )}
              >
                {gridSelect9.has(i) && <CheckCircle2 className="w-3.5 h-3.5 absolute top-1 right-1 text-primary-foreground/80" />}
                {opt}
              </button>
            ))}
          </div>
          <div className="pl-9 flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={cn("w-2.5 h-2.5 rounded-full transition-all", i < gridSelect9.size ? "bg-primary scale-110" : "bg-muted")} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Selected: {gridSelect9.size}/4</p>
          </div>
        </div>

        {/* Question 10: True/False */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/50 text-primary text-xs font-bold font-display">
              SECTION E — True / False
            </div>
          </div>
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold text-foreground leading-relaxed">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground text-xs font-bold mr-2 align-middle">
                10
              </span>
              {trueFalseQ10.text}
            </p>
            <div className="flex gap-1.5 shrink-0">
              <Badge variant="secondary" className="text-xs">Marks: 2</Badge>
              <Badge variant="outline" className="text-xs">CLO: 1</Badge>
            </div>
          </div>
          <div className="pl-9 border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_80px] bg-gradient-to-r from-primary/5 to-accent/20 px-5 py-3 text-sm font-bold text-foreground font-display">
              <span>Statement</span>
              <span className="text-center text-primary">True</span>
              <span className="text-center text-destructive">False</span>
            </div>
            {trueFalseQ10.statements.map((stmt, i) => (
              <div key={i} className={cn(
                "grid grid-cols-[1fr_80px_80px] px-5 py-4 text-sm items-center transition-colors",
                i % 2 === 0 ? "bg-card" : "bg-muted/30"
              )}>
                <span className="text-foreground leading-relaxed pr-4">{stmt}</span>
                <div className="flex justify-center">
                  <button
                    onClick={() => { const next = { ...trueFalse, [i]: true }; setTrueFalse(next); persistAll({ trueFalse: next }); }}
                    className={cn(
                      "w-9 h-9 rounded-xl border-2 transition-all duration-200 flex items-center justify-center text-xs font-bold",
                      trueFalse[i] === true
                        ? "border-primary bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground shadow-md scale-110"
                        : "border-border text-muted-foreground hover:border-primary/50 hover:scale-105"
                    )}
                  >
                    T
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => { const next = { ...trueFalse, [i]: false }; setTrueFalse(next); persistAll({ trueFalse: next }); }}
                    className={cn(
                      "w-9 h-9 rounded-xl border-2 transition-all duration-200 flex items-center justify-center text-xs font-bold",
                      trueFalse[i] === false
                        ? "border-destructive bg-gradient-to-br from-destructive to-pink-500 text-destructive-foreground shadow-md scale-110"
                        : "border-border text-muted-foreground hover:border-destructive/50 hover:scale-105"
                    )}
                  >
                    F
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-6 pb-12">
        <button
          onClick={() => setShowPreview(true)}
          className="group relative px-12 py-4 bg-gradient-to-r from-primary to-accent-foreground text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex items-center gap-3"
        >
          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <FileSearch className="w-6 h-6" />
          <span className="text-lg">Preview & Submit</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* PDF Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl" hideClose>
          <DialogHeader className="p-6 bg-gradient-to-r from-primary to-accent-foreground text-white">
            <DialogTitle className="text-2xl font-display font-bold flex items-center gap-3">
              <ShieldCheck className="w-8 h-8" />
              Final Submission Preview
            </DialogTitle>
            <DialogDescription className="text-white/80 font-medium">
              Please review your answers carefully. Once submitted, your assessment will be graded and stored.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
            <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-end">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Student Identifier</h4>
                  <p className="text-xl font-display font-black text-slate-800">{metadata.studentName}</p>
                  <p className="text-sm font-mono text-slate-500">{metadata.studentId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{metadata.courseCode}</p>
                  <p className="text-xs text-slate-400 font-medium">{metadata.date}</p>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 text-emerald-600 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5" />
                  <p className="text-sm font-medium">All {totalQuestions} questions have been answered. Ready for grading.</p>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  By clicking "Confirm Submission", you acknowledge that the answers shown are final.
                  A PDF copy will be generated for your records, and data will be synchronized with the BAUST Assessment Engine.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-white border-t border-slate-100 flex items-center justify-between sm:justify-between">
            <Button variant="ghost" onClick={() => setShowPreview(false)} className="font-bold text-slate-500">
              Back to Editor
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  const { exportToPDF } = await import("@/lib/exportUtils");
                  const questionsContainer = document.querySelector(".questions-content");

                  // Fix for select values not being captured in innerHTML
                  const selects = questionsContainer?.querySelectorAll('select');
                  selects?.forEach(select => {
                    const val = select.value;
                    const options = select.querySelectorAll('option');
                    options.forEach(opt => {
                      if (opt.value === val) opt.setAttribute('selected', 'selected');
                      else opt.removeAttribute('selected');
                    });
                  });

                  await exportToPDF({
                    ...metadata,
                    questionsHtml: questionsContainer?.innerHTML || "",
                    answers: {
                      mcqAnswers,
                      gridSelect6: Array.from(gridSelect6),
                      multiSelect7: Array.from(multiSelect7),
                      matching,
                      gridSelect9: Array.from(gridSelect9),
                      trueFalse,
                    }
                  });

                  setShowPreview(false);
                  setShowSuccess(true);
                  // localStorage.removeItem(STORAGE_KEY); // User requested not to reset values
                } catch (err) {
                  console.error(err);
                  toast.error("PDF generation failed.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="bg-primary hover:bg-primary/90 font-bold px-8 h-12 rounded-xl flex items-center gap-2 shadow-lg"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {isSubmitting ? "Generating PDF..." : "Confirm & Download PDF"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md p-0 border-none shadow-2xl overflow-hidden" hideClose>
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-12 text-center text-white">
            <div className="mx-auto w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 scale-110 animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-display font-black mb-2">PDF Generated!</h2>
            <p className="text-indigo-50 font-medium">Your assessment report is ready for submission.</p>
          </div>
          <div className="p-8 bg-white space-y-6 text-center">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Send className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Submit on Google Classroom</p>
                <p className="text-xs text-slate-500 mt-1">Please upload the downloaded PDF to your assigned classroom task.</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-500 leading-relaxed">
                The file has been saved to your downloads folder. Ensure you don't rename it to maintain consistency.
              </p>
              <Button onClick={() => window.location.reload()} className="w-full bg-slate-900 hover:bg-slate-800 h-14 rounded-2xl font-bold text-lg">
                I've Downloaded It
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default QuestionViewer;
