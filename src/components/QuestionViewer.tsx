import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Question data for CSE 4215 CT 1
const mcqQuestions = [
  {
    id: 1,
    text: "Which of the following is a key principle of professional ethics in computing?",
    options: ["A) Maximize profit at all costs", "B) Act with integrity and honesty", "C) Ignore user privacy", "D) Share confidential data freely"],
  },
  {
    id: 2,
    text: "The ACM Code of Ethics primarily emphasizes which of the following?",
    options: ["A) Revenue generation", "B) Public interest and harm avoidance", "C) Software speed optimization", "D) Hardware maintenance"],
  },
  {
    id: 3,
    text: "Intellectual property rights in software include:",
    options: ["A) Only patents", "B) Patents, copyrights, and trade secrets", "C) Only copyrights", "D) None of the above"],
  },
  {
    id: 4,
    text: "Which legislation primarily governs data protection in many countries?",
    options: ["A) GDPR", "B) HTML5 Standard", "C) IEEE 802.11", "D) TCP/IP Protocol"],
  },
  {
    id: 5,
    text: "A software engineer's responsibility to society includes:",
    options: ["A) Only delivering code on time", "B) Ensuring software safety and reliability", "C) Minimizing testing", "D) Avoiding documentation"],
  },
];

const gridSelectQ6 = {
  id: 6,
  text: "Select exactly 4 ethical principles that a computing professional must follow:",
  options: ["Integrity", "Transparency", "Negligence", "Accountability", "Privacy", "Deception", "Fairness", "Competence", "Bias", "Exploitation"],
};

const multiSelectQ7 = {
  id: 7,
  text: "Select exactly 3 responsibilities of a software engineer according to IEEE-CS code:",
  options: ["Public safety", "Client interest", "Ignoring standards", "Professional development", "Code plagiarism", "Product quality"],
};

const matchingQ8 = {
  id: 8,
  text: "Match each ethical concept (left) with its correct description (right):",
  left: ["Privacy", "Intellectual Property", "Whistleblowing", "Plagiarism"],
  right: [
    "Reporting unethical practices within an organization",
    "Right to control personal information",
    "Legal protection for creative works",
    "Presenting others' work as one's own",
  ],
};

const gridSelectQ9 = {
  id: 9,
  text: "Select exactly 4 items that are considered professional misconduct in computing:",
  options: ["Data theft", "Peer review", "Unauthorized access", "Open-source contribution", "Code documentation", "Identity fraud", "Mentoring", "Copyright violation", "Testing", "Ethical hacking certification"],
};

const trueFalseQ10 = {
  id: 10,
  text: "Mark each statement as True or False:",
  statements: [
    "Software engineers have no obligation to report security vulnerabilities.",
    "The ACM Code of Ethics applies only to ACM members.",
    "Copying open-source code without attribution is acceptable.",
    "Professional competence requires continuous learning.",
    "Privacy is a fundamental right in digital ethics.",
    "Whistleblowing is always considered unethical.",
  ],
};

const QuestionViewer = () => {
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({});
  const [gridSelect6, setGridSelect6] = useState<Set<number>>(new Set());
  const [multiSelect7, setMultiSelect7] = useState<Set<number>>(new Set());
  const [matching, setMatching] = useState<Record<number, number | null>>({0: null, 1: null, 2: null, 3: null});
  const [gridSelect9, setGridSelect9] = useState<Set<number>>(new Set());
  const [trueFalse, setTrueFalse] = useState<Record<number, boolean | null>>({});

  const toggleGridSelect = (set: Set<number>, setFn: (s: Set<number>) => void, idx: number, max: number) => {
    const next = new Set(set);
    if (next.has(idx)) {
      next.delete(idx);
    } else if (next.size < max) {
      next.add(idx);
    }
    setFn(next);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-8">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-8 bg-primary rounded-full" />
        <h3 className="text-lg font-display font-bold text-foreground">Question Paper — CSE 4215 — CT 1</h3>
      </div>

      {/* Questions 1-5: MCQ */}
      {mcqQuestions.map((q) => (
        <div key={q.id} className="space-y-3">
          <div className="flex items-start justify-between">
            <p className="font-semibold text-foreground">
              <span className="text-primary mr-1">Q{q.id}.</span>{q.text}
            </p>
            <div className="flex gap-1.5 shrink-0 ml-3">
              <Badge variant="secondary" className="text-xs">Marks: 1</Badge>
              <Badge variant="outline" className="text-xs">CLO: 1</Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setMcqAnswers({ ...mcqAnswers, [q.id]: i })}
                className={cn(
                  "text-left px-4 py-2.5 rounded-lg border text-sm transition-all",
                  mcqAnswers[q.id] === i
                    ? "border-primary bg-accent text-accent-foreground font-medium shadow-sm"
                    : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent/50"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Question 6: Grid Select */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <p className="font-semibold text-foreground">
            <span className="text-primary mr-1">Q6.</span>{gridSelectQ6.text}
          </p>
          <div className="flex gap-1.5 shrink-0 ml-3">
            <Badge variant="secondary" className="text-xs">Marks: 2</Badge>
            <Badge variant="outline" className="text-xs">CLO: 1</Badge>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {gridSelectQ6.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => toggleGridSelect(gridSelect6, setGridSelect6, i, 4)}
              className={cn(
                "px-3 py-3 rounded-lg border text-sm font-medium transition-all text-center",
                gridSelect6.has(i)
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Selected: {gridSelect6.size}/4</p>
      </div>

      {/* Question 7: Multi-select */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <p className="font-semibold text-foreground">
            <span className="text-primary mr-1">Q7.</span>{multiSelectQ7.text}
          </p>
          <div className="flex gap-1.5 shrink-0 ml-3">
            <Badge variant="secondary" className="text-xs">Marks: 2</Badge>
            <Badge variant="outline" className="text-xs">CLO: 1</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {multiSelectQ7.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => toggleGridSelect(multiSelect7, setMultiSelect7, i, 3)}
              className={cn(
                "px-4 py-3 rounded-lg border text-sm font-medium transition-all text-center",
                multiSelect7.has(i)
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Selected: {multiSelect7.size}/3</p>
      </div>

      {/* Question 8: Matching */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <p className="font-semibold text-foreground">
            <span className="text-primary mr-1">Q8.</span>{matchingQ8.text}
          </p>
          <div className="flex gap-1.5 shrink-0 ml-3">
            <Badge variant="secondary" className="text-xs">Marks: 2</Badge>
            <Badge variant="outline" className="text-xs">CLO: 1</Badge>
          </div>
        </div>
        <div className="space-y-3">
          {matchingQ8.left.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 px-4 py-2.5 rounded-lg bg-accent border border-border text-sm font-medium text-accent-foreground">
                {item}
              </div>
              <svg className="w-6 h-4 text-primary shrink-0" viewBox="0 0 24 16"><path d="M0 8h20M16 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <select
                value={matching[i] ?? ""}
                onChange={(e) => setMatching({ ...matching, [i]: e.target.value === "" ? null : Number(e.target.value) })}
                className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground focus:ring-2 focus:ring-ring"
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
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <p className="font-semibold text-foreground">
            <span className="text-primary mr-1">Q9.</span>Select exactly 4 items that are considered professional misconduct in computing:
          </p>
          <div className="flex gap-1.5 shrink-0 ml-3">
            <Badge variant="secondary" className="text-xs">Marks: 2</Badge>
            <Badge variant="outline" className="text-xs">CLO: 1</Badge>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {gridSelectQ9.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => toggleGridSelect(gridSelect9, setGridSelect9, i, 4)}
              className={cn(
                "px-3 py-3 rounded-lg border text-sm font-medium transition-all text-center",
                gridSelect9.has(i)
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Selected: {gridSelect9.size}/4</p>
      </div>

      {/* Question 10: True/False */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <p className="font-semibold text-foreground">
            <span className="text-primary mr-1">Q10.</span>{trueFalseQ10.text}
          </p>
          <div className="flex gap-1.5 shrink-0 ml-3">
            <Badge variant="secondary" className="text-xs">Marks: 2</Badge>
            <Badge variant="outline" className="text-xs">CLO: 1</Badge>
          </div>
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_80px_80px] bg-muted px-4 py-2 text-sm font-semibold text-foreground">
            <span>Statement</span>
            <span className="text-center">True</span>
            <span className="text-center">False</span>
          </div>
          {trueFalseQ10.statements.map((stmt, i) => (
            <div key={i} className={cn("grid grid-cols-[1fr_80px_80px] px-4 py-3 text-sm items-center", i % 2 === 0 ? "bg-card" : "bg-muted/50")}>
              <span className="text-foreground">{stmt}</span>
              <div className="flex justify-center">
                <button
                  onClick={() => setTrueFalse({ ...trueFalse, [i]: true })}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center text-xs font-bold",
                    trueFalse[i] === true
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  )}
                >
                  T
                </button>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setTrueFalse({ ...trueFalse, [i]: false })}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center text-xs font-bold",
                    trueFalse[i] === false
                      ? "border-destructive bg-destructive text-destructive-foreground"
                      : "border-border text-muted-foreground hover:border-destructive/50"
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
  );
};

export default QuestionViewer;
