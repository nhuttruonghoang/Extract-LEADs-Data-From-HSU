import { GoogleGenAI, Type } from "@google/genai";
import { StudentData } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const studentSchema = {
  type: Type.OBJECT,
  properties: {
    ngaySinh: { type: Type.STRING, description: 'Date of birth in DD-MM-YYYY format.' },
    soDienThoai: { type: Type.STRING, description: 'Phone number.' },
    cccd: { type: Type.STRING, description: 'Citizen Identity Card number (CCCD).' },
    email: { type: Type.STRING, description: 'Email address.' },
    diaChi: { type: Type.STRING, description: 'Receiving address.' },
    nganhDangKy: { type: Type.STRING, description: 'The registered major/field of study.' },
    tinhThanhPho: { type: Type.STRING, description: 'The province or city of the high school.' },
    truongThpt: { type: Type.STRING, description: 'The name of the high school in 12th grade.' },
  },
  required: ['ngaySinh', 'soDienThoai', 'cccd', 'email', 'diaChi', 'nganhDangKy', 'tinhThanhPho', 'truongThpt'],
};

const responseSchema = {
  type: Type.ARRAY,
  items: studentSchema,
};

const PROMPT = `You are an expert OCR system specializing in Vietnamese school registration forms. Your task is to analyze the provided image(s) and extract the key information for each student listed.

Instructions:
1.  Carefully scan the entire document.
2.  Identify all distinct student registration entries.
3.  For each entry, extract the following fields:
    *   'Ngày / tháng / năm sinh': The student's date of birth. Format it strictly as DD-MM-YYYY.
    *   'Số điện thoại': The student's phone number.
    *   'CCCD': The student's Citizen Identity Card number.
    *   'Email nhận kết quả': The student's email address.
    *   'Địa chỉ nhận kết quả': The full address for receiving results.
    *   'Ngành đăng ký xét tuyển': The major or field of study the student is applying for.
    *   'Tên Tỉnh/TP trường THPT': The province or city where the high school is located.
    *   'Tên trường THPT lớp 12': The name of the high school the student attended in 12th grade.
4.  Ignore any general headers, footers, page numbers, or text that is not part of a student's data.
5.  If a specific field for a student is not found or is unreadable, use an empty string "" for that field's value.
6.  Return the extracted data as a JSON array, where each object in the array represents one student. Adhere strictly to the provided JSON schema.`;

export const extractStudentDataFromImages = async (
  imageParts: { mimeType: string, data: string }[]
): Promise<Omit<StudentData, 'id'>[]> => {
  if (imageParts.length === 0) {
    throw new Error("No images to process.");
  }

  try {
    // FIX: The Gemini API expects image data to be in a specific format.
    // Each image part must be an object with an `inlineData` key.
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

    const parsedData = JSON.parse(jsonText);
    return parsedData as Omit<StudentData, 'id'>[];
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to extract data from the document. The document might not be a valid registration form or there was an API issue.");
  }
};
