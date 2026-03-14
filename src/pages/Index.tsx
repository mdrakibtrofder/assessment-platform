import { useState, useEffect } from "react";
import Header from "@/components/Header";
import UniversityCard from "@/components/UniversityCard";
import AssessmentDetails from "@/components/AssessmentDetails";
import QuestionViewer from "@/components/QuestionViewer";
import { format } from "date-fns";
import { courses } from "@/data/courses";

const FORM_KEY = "assessment-platform-form";

const Index = () => {
  const saved = (() => { try { const s = localStorage.getItem(FORM_KEY); return s ? JSON.parse(s) : null; } catch { return null; } })();
  const [courseCode, setCourseCode] = useState(saved?.courseCode ?? "");
  const [studentId, setStudentId] = useState(saved?.studentId ?? "");
  const [studentName, setStudentName] = useState(saved?.studentName ?? "");
  const [ctNumber, setCtNumber] = useState(saved?.ctNumber ?? "");

  useEffect(() => {
    localStorage.setItem(FORM_KEY, JSON.stringify({ courseCode, studentId, studentName, ctNumber }));
  }, [courseCode, studentId, studentName, ctNumber]);

  const handleReset = () => {
    setCourseCode("");
    setStudentId("");
    setStudentName("");
    setCtNumber("");
    localStorage.removeItem(FORM_KEY);
    localStorage.removeItem("assessment-platform-answers");
  };

  const showQuestions = courseCode === "CSE 4215" && ctNumber === "CT 1";

  const handleExport = async () => {
    const questionsContainer = document.querySelector(".questions-content");
    if (!questionsContainer) return;

    const { exportToPDF } = await import("@/lib/exportUtils");
    const selectedCourse = courses.find((c) => c.code === courseCode);

    await exportToPDF({
      universityName: "Bangladesh Army University of Science and Technology",
      department: selectedCourse?.department || "Department of Computer Science and Engineering",
      courseCode,
      courseName: selectedCourse?.name || "",
      studentName,
      studentId,
      ctNumber,
      date: format(new Date(), "MMMM do, yyyy"),
      questionsHtml: questionsContainer.innerHTML,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onReset={handleReset}
        onExport={handleExport}
        isExportEnabled={!!(courseCode && studentId && studentName && ctNumber && showQuestions)}
      />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        <UniversityCard />
        <AssessmentDetails
          courseCode={courseCode}
          setCourseCode={setCourseCode}
          studentId={studentId}
          setStudentId={setStudentId}
          studentName={studentName}
          setStudentName={setStudentName}
          ctNumber={ctNumber}
          setCtNumber={setCtNumber}
        />
        {showQuestions && <QuestionViewer />}
      </main>
    </div>
  );
};

export default Index;
