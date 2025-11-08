import { StudentData, AcademicData } from '../types';

// This is a placeholder for your actual backend API endpoint.
// You will need to build a backend (e.g., using Node.js, ASP.NET, Python)
// that accepts this POST request and saves the data to your SQL Server database.
const API_ENDPOINT = '/api/submit-student-data';

/**
 * Sends all student and academic data to the backend for saving.
 * @param students - An array of student information from the OCR step.
 * @param academicData - The academic results from the form.
 */
export const saveAllData = async (students: StudentData[], academicData: AcademicData): Promise<void> => {
    const formData = new FormData();

    // The backend can parse this JSON string to get all the text-based data.
    formData.append('students', JSON.stringify(students));
    formData.append('academics', JSON.stringify({
        ...academicData,
        // We nullify file fields in JSON as they are sent separately
        transcriptFile: null,
        ieltsFile: null,
        competencyFile: null,
        highSchoolExamFile: null,
    }));
    
    // Append files if they exist. The backend will need to handle these file uploads.
    if (academicData.transcriptFile) {
        formData.append('transcriptFile', academicData.transcriptFile);
    }
    if (academicData.ieltsFile) {
        formData.append('ieltsFile', academicData.ieltsFile);
    }
    if (academicData.competencyFile) {
        formData.append('competencyFile', academicData.competencyFile);
    }
    if (academicData.highSchoolExamFile) {
        formData.append('highSchoolExamFile', academicData.highSchoolExamFile);
    }

    // Simulate the API call
    console.log("Simulating API call to", API_ENDPOINT);
    console.log("With FormData:", formData);
    
    // In a real application, you would use fetch like this:
    /*
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData, // No 'Content-Type' header needed; the browser sets it for FormData
    });

    if (!response.ok) {
        // Try to get a meaningful error message from the backend
        const errorData = await response.json().catch(() => ({ message: 'An unexpected error occurred.' }));
        throw new Error(errorData.message || `Server responded with status ${response.status}`);
    }
    
    return response.json();
    */

    // For this demo, we'll simulate a successful response after a short delay.
    // To test the error state, you can uncomment the line below.
    // throw new Error("This is a simulated error from the server.");
    
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("API call successful (simulated).");
            resolve();
        }, 1500); // Simulate network latency
    });
};
