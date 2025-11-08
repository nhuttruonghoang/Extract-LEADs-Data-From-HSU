import { GoogleGenAI, Type } from "@google/genai";
import { StudentData } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const studentDataSchema = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING, description: 'Họ và tên' },
    dateOfBirth: { type: Type.STRING, description: 'Ngày / tháng / năm sinh in DD/MM/YYYY format.' },
    phoneNumber: { type: Type.STRING, description: 'Số điện thoại' },
    idCardNumber: { type: Type.STRING, description: 'CCCD. Use empty string if blank.' },
    email: { type: Type.STRING, description: 'Email nhận kết quả' },
    address: { type: Type.STRING, description: 'Địa chỉ nhận kết quả. Use empty string if blank.' },
    major: { type: Type.STRING, description: 'Ngành đăng ký xét tuyển' },
    highSchoolProvince: { type: Type.STRING, description: 'Tên Tỉnh/TP trường THPT' },
    highSchoolName: { type: Type.STRING, description: 'Tên trường THPT lớp 12' },
  },
  required: ['fullName', 'dateOfBirth', 'phoneNumber', 'email', 'major', 'highSchoolProvince', 'highSchoolName'],
};

const responseSchema = {
    type: Type.ARRAY,
    items: studentDataSchema,
};

const PROMPT = `You are an expert OCR system for Vietnamese student application forms. Analyze the provided image and extract the student's information.

Instructions:
1. Identify the label for each piece of information on the left and its corresponding value on the right.
2. Extract the following fields:
    - 'Họ và tên': Full name of the student.
    - 'Ngày / tháng / năm sinh': Date of birth. Format as DD/MM/YYYY.
    - 'Số điện thoại': Phone number.
    - 'CCCD': Citizen Identity Card number. If blank, use an empty string.
    - 'Email nhận kết quả': The student's email address.
    - 'Địa chỉ nhận kết quả': The address to receive results. If blank, use an empty string.
    - 'Ngành đăng ký xét tuyển': The major the student is applying for.
    - 'Tên Tỉnh/TP trường THPT': The province or city of the high school.
    - 'Tên trường THPT lớp 12': The name of the high school.
3. Return the extracted data as a JSON array containing a single object for the student. Adhere strictly to the provided JSON schema. If a non-required field is not found, use an empty string "".`;

export const extractStudentDataFromImages = async (
  imageParts: { mimeType: string, data: string }[]
): Promise<Omit<StudentData, 'id'>[]> => {
  if (imageParts.length === 0) {
    throw new Error("No images to process.");
  }

  try {
    const formattedImageParts = imageParts.map(part => ({
      inlineData: {
        mimeType: part.mimeType,
        data: part.data,
      },
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [{ text: PROMPT }, ...formattedImageParts],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        return [];
    }
    
    // The API might return a single object instead of an array if only one is found.
    // Standardize to an array.
    let parsedData = JSON.parse(jsonText);
    if (!Array.isArray(parsedData)) {
        parsedData = [parsedData];
    }
    return parsedData as Omit<StudentData, 'id'>[];
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to extract data from the document. Please ensure it's a valid student application form and try again.");
  }
};