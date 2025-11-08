import { StudentData, AcademicData } from '../types';

// This is a placeholder for your actual backend API endpoint.
// The backend would receive the data and execute SQL commands similar to the ones generated below.
const API_ENDPOINT = '/api/submit-student-data';

/**
 * Escapes single quotes in a string for SQL compatibility.
 * @param value The string to escape.
 * @returns A SQL-safe string.
 */
const escapeSqlString = (value: string | undefined | null): string => {
    if (value === null || value === undefined || value === '') {
        return 'NULL';
    }
    return `'${value.replace(/'/g, "''")}'`;
};

/**
 * Converts a string or number to a SQL-safe number string, or 'NULL'.
 * @param value The value to convert.
 * @returns A string representation of the number, or 'NULL'.
 */
const toSqlNumber = (value: string | number | undefined | null): string => {
    if (value === null || value === undefined || value === '') {
        return 'NULL';
    }
    const num = parseFloat(String(value));
    return isNaN(num) ? 'NULL' : num.toString();
};

/**
 * Converts a date string into a SQL-safe date format 'YYYY-MM-DD'.
 * Handles both 'DD/MM/YYYY' and 'YYYY-MM-DD' input formats.
 * @param value The date string to convert.
 * @returns A formatted SQL date string, or 'NULL'.
 */
const toSqlDate = (value: string | undefined | null): string => {
    if (!value) {
        return 'NULL';
    }
    let date: Date;
    // Handle DD/MM/YYYY format from OCR
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
        const parts = value.split('/');
        // Month is 0-indexed in JS Date constructor
        date = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    } else {
        // Handle other formats like YYYY-MM-DD from date input
        date = new Date(value);
    }
    // Check if the parsed date is valid
    if (isNaN(date.getTime())) {
        return 'NULL';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `'${year}-${month}-${day}'`;
};


/**
 * Generates SQL INSERT statements for all student and academic data.
 * @param student - The student information from the OCR step.
 * @param academicData - The academic results from the form.
 * @returns A string containing the full SQL script for the transaction.
 */
const generateSqlInsertStatements = (student: StudentData, academicData: AcademicData): string => {
    const studentSql = `
-- Step 1: Insert student personal data
INSERT INTO Students (FullName, DateOfBirth, PhoneNumber, IdCardNumber, Email, Address, Major, HighSchoolProvince, HighSchoolName)
VALUES (
    ${escapeSqlString(student.fullName)},
    ${toSqlDate(student.dateOfBirth)},
    ${escapeSqlString(student.phoneNumber)},
    ${escapeSqlString(student.idCardNumber)},
    ${escapeSqlString(student.email)},
    ${escapeSqlString(student.address)},
    ${escapeSqlString(student.major)},
    ${escapeSqlString(student.highSchoolProvince)},
    ${escapeSqlString(student.highSchoolName)}
);

-- Get the ID of the newly inserted student for linking
DECLARE @StudentID INT = SCOPE_IDENTITY();
`;

    const academicSql = `
-- Step 2: Insert academic results linked to the student
INSERT INTO AcademicResults (
    StudentID, TranscriptElectiveSubject, IeltsScore, IeltsDate,
    CompetencyExam, CompetencyScore, HighSchoolExamMath, HighSchoolExamLiterature,
    HighSchoolExamElectiveScore, HighSchoolExamElectiveSubject
)
VALUES (
    @StudentID,
    ${escapeSqlString(academicData.transcriptElectiveSubject)},
    ${toSqlNumber(academicData.ieltsScore)},
    ${toSqlDate(academicData.ieltsDate)},
    ${escapeSqlString(academicData.competencyExam)},
    ${toSqlNumber(academicData.competencyScore)},
    ${toSqlNumber(academicData.highSchoolExam_math)},
    ${toSqlNumber(academicData.highSchoolExam_literature)},
    ${toSqlNumber(academicData.highSchoolExam_elective)},
    ${escapeSqlString(academicData.highSchoolExamElectiveSubject)}
);

-- Get the ID of the newly inserted academic record for linking scores
DECLARE @AcademicResultID INT = SCOPE_IDENTITY();
`;

    const transcriptScoresSql = `
-- Step 3: Insert transcript scores for each semester
INSERT INTO TranscriptScores (AcademicResultID, Semester, MathScore, LiteratureScore, ElectiveScore)
VALUES
    (@AcademicResultID, 'HK2_Lop10', ${toSqlNumber(academicData.transcript_hk2_10.math)}, ${toSqlNumber(academicData.transcript_hk2_10.literature)}, ${toSqlNumber(academicData.transcript_hk2_10.elective)}),
    (@AcademicResultID, 'HK1_Lop11', ${toSqlNumber(academicData.transcript_hk1_11.math)}, ${toSqlNumber(academicData.transcript_hk1_11.literature)}, ${toSqlNumber(academicData.transcript_hk1_11.elective)}),
    (@AcademicResultID, 'HK2_Lop11', ${toSqlNumber(academicData.transcript_hk2_11.math)}, ${toSqlNumber(academicData.transcript_hk2_11.literature)}, ${toSqlNumber(academicData.transcript_hk2_11.elective)});
`;

    return `
-- =================================================================
-- SQL Script for Student Application Submission
-- Generated on: ${new Date().toISOString()}
-- =================================================================
BEGIN TRANSACTION;

BEGIN TRY
    ${studentSql}
    ${academicSql}
    ${transcriptScoresSql}
    
    -- If all inserts are successful, commit the transaction
    COMMIT TRANSACTION;
    PRINT 'Student data committed successfully.';

END TRY
BEGIN CATCH
    -- If any error occurs, roll back the entire transaction
    ROLLBACK TRANSACTION;
    PRINT 'An error occurred. Transaction rolled back.';
    -- You can also re-throw the error for the application to catch
    -- THROW; 
END CATCH;
`;
};


/**
 * Processes student and academic data, generates a SQL script, and simulates an API call.
 * @param students - An array of student information from the OCR step.
 * @param academicData - The academic results from the form.
 * @returns A promise that resolves with the generated SQL script.
 */
export const saveAllData = async (students: StudentData[], academicData: AcademicData): Promise<string> => {
    // We only process the first student for this submission logic.
    const student = students[0]; 
    
    // Generate the SQL script
    const sqlScript = generateSqlInsertStatements(student, academicData);
    
    console.log("--- Generated SQL Script ---");
    console.log(sqlScript);
    console.log("--------------------------");

    // In a real application, you would send the raw data to the backend,
    // and the backend would securely generate and execute this SQL.
    /*
    const formData = new FormData();
    formData.append('students', JSON.stringify(students));
    // ... append other data and files
    
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Server responded with an error.');
    }
    */

    // Simulate network latency before returning the script.
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Data processing successful (simulated).");
            resolve(sqlScript);
        }, 1500);
    });
};