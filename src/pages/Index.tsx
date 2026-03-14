import { useState } from "react";
import Header from "@/components/Header";
import UniversityCard from "@/components/UniversityCard";
import AssessmentDetails from "@/components/AssessmentDetails";
import QuestionViewer from "@/components/QuestionViewer";

const Index = () => {
  const [courseCode, setCourseCode] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [ctNumber, setCtNumber] = useState("");

  const handleReset = () => {
    setCourseCode("");
    setStudentId("");
    setStudentName("");
    setCtNumber("");
  };

  const showQuestions = courseCode === "CSE 4215" && ctNumber === "CT 1";

  return (
    <div className="min-h-screen bg-background">
      <Header onReset={handleReset} />
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
