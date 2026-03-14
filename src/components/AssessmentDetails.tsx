import { Send, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { courses } from "@/data/courses";
import { format } from "date-fns";

interface AssessmentDetailsProps {
  courseCode: string;
  setCourseCode: (v: string) => void;
  studentId: string;
  setStudentId: (v: string) => void;
  studentName: string;
  setStudentName: (v: string) => void;
  ctNumber: string;
  setCtNumber: (v: string) => void;
}

const AssessmentDetails = ({
  courseCode, setCourseCode,
  studentId, setStudentId,
  studentName, setStudentName,
  ctNumber, setCtNumber,
}: AssessmentDetailsProps) => {
  const selectedCourse = courses.find((c) => c.code === courseCode);

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Send className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-display font-bold text-foreground">Assessment Details</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="font-semibold text-foreground">Course Code</Label>
          <Select value={courseCode} onValueChange={setCourseCode}>
            <SelectTrigger>
              <SelectValue placeholder="Select course code" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="font-semibold text-foreground">Course Name</Label>
          <Input value={selectedCourse?.name || ""} readOnly placeholder="Auto-selected" className="bg-muted" />
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <Label className="font-semibold text-foreground">Department</Label>
          <Input value={selectedCourse?.department || ""} readOnly placeholder="Auto-selected" className="bg-muted" />
        </div>

        <div className="space-y-1.5">
          <Label className="font-semibold text-foreground">Student ID</Label>
          <Input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter student ID (digits only)"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="font-semibold text-foreground">Student Name</Label>
          <Input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter student name"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="font-semibold text-foreground">Date</Label>
          <div className="flex items-center gap-2 border border-input rounded-md px-3 py-2 bg-card">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{format(new Date(), "MMMM do, yyyy")}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="font-semibold text-foreground">CT No</Label>
          <Select value={ctNumber} onValueChange={setCtNumber}>
            <SelectTrigger>
              <SelectValue placeholder="Select CT" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CT 1">CT 1</SelectItem>
              <SelectItem value="CT 2">CT 2</SelectItem>
              <SelectItem value="CT 3">CT 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDetails;
