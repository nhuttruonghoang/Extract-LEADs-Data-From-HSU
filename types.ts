export interface StudentData {
  id: string;
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  idCardNumber: string;
  email: string;
  address: string;
  major: string;
  highSchoolProvince: string;
  highSchoolName: string;
}


// FIX: Add missing type definitions to resolve compilation errors.
export interface DropdownData {
  majors: string[];
  provinces: string[];
  highSchools: string[];
}

export interface TranscriptScores {
  math: string;
  literature: string;
  elective: string;
}

export interface AcademicData {
  transcript_hk2_10: TranscriptScores;
  transcript_hk1_11: TranscriptScores;
  transcript_hk2_11: TranscriptScores;
  transcriptElectiveSubject: string;
  transcriptFile: File | null;
  ieltsScore: string;
  ieltsDate: string;
  ieltsFile: File | null;
  competencyExam: string;
  competencyScore: string;
  competencyFile: File | null;
  highSchoolExam_math: string;
  highSchoolExam_literature: string;
  highSchoolExam_elective: string;
  highSchoolExamElectiveSubject: string;
  highSchoolExamFile: File | null;
}
