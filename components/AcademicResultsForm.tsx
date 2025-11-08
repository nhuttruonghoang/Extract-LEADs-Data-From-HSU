import React, { useState } from 'react';
import { StudentData, AcademicData, TranscriptScores } from '../types';
import { ELECTIVE_SUBJECTS, COMPETENCY_EXAMS } from '../constants';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { UploadIcon } from './icons/UploadIcon';
import { FileIcon } from './icons/FileIcon';
import { saveAllData } from '../services/apiService';
import { Spinner } from './Spinner';

interface AcademicResultsFormProps {
    onBack: () => void;
    initialData: StudentData[] | null;
    onSubmitSuccess: (sql: string) => void;
    onError: (message: string) => void;
}

const initialAcademicData: AcademicData = {
  transcript_hk2_10: { math: '', literature: '', elective: '' },
  transcript_hk1_11: { math: '', literature: '', elective: '' },
  transcript_hk2_11: { math: '', literature: '', elective: '' },
  transcriptElectiveSubject: ELECTIVE_SUBJECTS[0],
  transcriptFile: null,
  ieltsScore: '',
  ieltsDate: '',
  ieltsFile: null,
  competencyExam: COMPETENCY_EXAMS[0],
  competencyScore: '',
  competencyFile: null,
  highSchoolExam_math: '',
  highSchoolExam_literature: '',
  highSchoolExam_elective: '',
  highSchoolExamElectiveSubject: ELECTIVE_SUBJECTS[0],
  highSchoolExamFile: null,
};

const FormSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <fieldset className="border border-gray-700 p-4 rounded-lg mb-6">
        <legend className="px-2 text-lg font-semibold text-gray-300">{title}</legend>
        <div className="space-y-4">
            {children}
        </div>
    </fieldset>
);

const FileInput: React.FC<{ id: string; file: File | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string; }> = ({ id, file, onChange, label }) => (
    <div className="mt-4">
        {!file ? (
            <>
                <label htmlFor={id} className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer">
                    <UploadIcon className="w-5 h-5" />
                    {label}
                </label>
                <input id={id} type="file" className="hidden" onChange={onChange} />
            </>
        ) : (
             <div className="flex items-center bg-gray-700 p-3 rounded-lg max-w-xs">
                <FileIcon className="w-6 h-6 mr-3 text-gray-400" />
                <span className="text-gray-200 truncate">{file.name}</span>
            </div>
        )}
    </div>
);

export const AcademicResultsForm: React.FC<AcademicResultsFormProps> = ({ onBack, initialData, onSubmitSuccess, onError }) => {
    const [formData, setFormData] = useState<AcademicData>(initialAcademicData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTranscriptChange = (
        semester: keyof Pick<AcademicData, 'transcript_hk2_10' | 'transcript_hk1_11' | 'transcript_hk2_11'>,
        field: keyof TranscriptScores,
        value: string
    ) => {
        setFormData(prev => ({
            ...prev,
            [semester]: {
                ...prev[semester],
                [field]: value
            }
        }));
    };
    
    const handleInputChange = (field: keyof Omit<AcademicData, 'transcript_hk2_10' | 'transcript_hk1_11' | 'transcript_hk2_11'>, value: string | File | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!initialData || initialData.length === 0) {
            onError("No student data available to submit.");
            return;
        }
        
        setIsSubmitting(true);
        onError(""); // Clear previous errors
        
        try {
            const generatedSql = await saveAllData(initialData, formData);
            onSubmitSuccess(generatedSql);
        } catch (error: any) {
            console.error("Submission failed:", error);
            onError(error.message || "An unknown error occurred while saving the data.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderScoreInput = (value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void) => (
        <input type="number" min="0" max="10" step="0.1" value={value} onChange={onChange} className="w-full bg-gray-700 p-1 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-center"/>
    );

    return (
        <form onSubmit={handleSubmit}>
            <FormSection title="1. Điểm học bạ THPT">
                <p className="text-gray-400 text-sm">Lấy điểm tổ hợp 3 môn (Toán + Văn + Môn tự chọn)</p>
                <div className="overflow-x-auto rounded-lg">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-200 uppercase bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3">Tổ hợp 3 môn</th>
                                <th className="px-4 py-3 text-center">HK2 lớp 10</th>
                                <th className="px-4 py-3 text-center">HK1 lớp 11</th>
                                <th className="px-4 py-3 text-center">HK2 lớp 11</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-700">
                                <td className="px-4 py-2 font-medium">Môn Toán</td>
                                <td className="px-4 py-2 w-40">{renderScoreInput(formData.transcript_hk2_10.math, (e) => handleTranscriptChange('transcript_hk2_10', 'math', e.target.value))}</td>
                                <td className="px-4 py-2 w-40">{renderScoreInput(formData.transcript_hk1_11.math, (e) => handleTranscriptChange('transcript_hk1_11', 'math', e.target.value))}</td>
                                <td className="px-4 py-2 w-40">{renderScoreInput(formData.transcript_hk2_11.math, (e) => handleTranscriptChange('transcript_hk2_11', 'math', e.target.value))}</td>
                            </tr>
                            <tr className="border-b border-gray-700">
                                <td className="px-4 py-2 font-medium">Môn Văn</td>
                                <td className="px-4 py-2">{renderScoreInput(formData.transcript_hk2_10.literature, (e) => handleTranscriptChange('transcript_hk2_10', 'literature', e.target.value))}</td>
                                <td className="px-4 py-2">{renderScoreInput(formData.transcript_hk1_11.literature, (e) => handleTranscriptChange('transcript_hk1_11', 'literature', e.target.value))}</td>
                                <td className="px-4 py-2">{renderScoreInput(formData.transcript_hk2_11.literature, (e) => handleTranscriptChange('transcript_hk2_11', 'literature', e.target.value))}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2">
                                     <select value={formData.transcriptElectiveSubject} onChange={(e) => handleInputChange('transcriptElectiveSubject', e.target.value)} className="w-full bg-gray-700 p-1 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 font-medium">
                                        {ELECTIVE_SUBJECTS.map(s => <option key={s} value={s}>Môn {s}</option>)}
                                     </select>
                                </td>
                                <td className="px-4 py-2">{renderScoreInput(formData.transcript_hk2_10.elective, (e) => handleTranscriptChange('transcript_hk2_10', 'elective', e.target.value))}</td>
                                <td className="px-4 py-2">{renderScoreInput(formData.transcript_hk1_11.elective, (e) => handleTranscriptChange('transcript_hk1_11', 'elective', e.target.value))}</td>
                                <td className="px-4 py-2">{renderScoreInput(formData.transcript_hk2_11.elective, (e) => handleTranscriptChange('transcript_hk2_11', 'elective', e.target.value))}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                 <FileInput id="transcript-file" file={formData.transcriptFile} onChange={(e) => handleInputChange('transcriptFile', e.target.files ? e.target.files[0] : null)} label="Tải lên Hình bằng điểm điện tử/ Hình chụp học bạ" />
            </FormSection>

            <FormSection title="2. Chứng chỉ IELTS (nếu có)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Điểm thi IELTS</label>
                        <input type="number" min="0" max="9" step="0.5" value={formData.ieltsScore} onChange={(e) => handleInputChange('ieltsScore', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Ngày thi IELTS</label>
                        <input type="date" value={formData.ieltsDate} onChange={(e) => handleInputChange('ieltsDate', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                </div>
                <FileInput id="ielts-file" file={formData.ieltsFile} onChange={(e) => handleInputChange('ieltsFile', e.target.files ? e.target.files[0] : null)} label="Tải lên Hình chụp chứng chỉ IELTS" />
            </FormSection>

            <FormSection title="3. Điểm thi Đánh giá năng lực ĐHQG 2026">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Kỳ thi</label>
                        <select value={formData.competencyExam} onChange={(e) => handleInputChange('competencyExam', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                            {COMPETENCY_EXAMS.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Điểm thi</label>
                        <input type="number" min="0" max="1200" value={formData.competencyScore} onChange={(e) => handleInputChange('competencyScore', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                </div>
                 <FileInput id="competency-file" file={formData.competencyFile} onChange={(e) => handleInputChange('competencyFile', e.target.files ? e.target.files[0] : null)} label="Tải lên Hình chụp Bảng điểm" />
            </FormSection>

            <FormSection title="4. Điểm thi THPT 2026">
                <p className="text-gray-400 text-sm">Lấy điểm tổ hợp 3 môn (Toán + Văn + Môn tự chọn)</p>
                 <div className="overflow-x-auto rounded-lg">
                     <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-200 uppercase bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3">Tổ hợp 3 môn</th>
                                <th className="px-4 py-3 text-center">Điểm thi THPT</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-700">
                                <td className="px-4 py-2 font-medium">Môn Toán</td>
                                <td className="px-4 py-2 w-48">{renderScoreInput(formData.highSchoolExam_math, (e) => handleInputChange('highSchoolExam_math', e.target.value))}</td>
                            </tr>
                            <tr className="border-b border-gray-700">
                                <td className="px-4 py-2 font-medium">Môn Văn</td>
                                <td className="px-4 py-2">{renderScoreInput(formData.highSchoolExam_literature, (e) => handleInputChange('highSchoolExam_literature', e.target.value))}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2">
                                     <select value={formData.highSchoolExamElectiveSubject} onChange={(e) => handleInputChange('highSchoolExamElectiveSubject', e.target.value)} className="w-full bg-gray-700 p-1 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500 font-medium">
                                        {ELECTIVE_SUBJECTS.map(s => <option key={s} value={s}>Môn {s}</option>)}
                                     </select>
                                </td>
                                <td className="px-4 py-2">{renderScoreInput(formData.highSchoolExam_elective, (e) => handleInputChange('highSchoolExam_elective', e.target.value))}</td>
                            </tr>
                        </tbody>
                    </table>
                 </div>
                 <FileInput id="hs-exam-file" file={formData.highSchoolExamFile} onChange={(e) => handleInputChange('highSchoolExamFile', e.target.files ? e.target.files[0] : null)} label="Tải lên Hình bằng điểm điện tử/ Hình chụp học bạ" />
            </FormSection>

            <div className="mt-8 flex justify-between items-center">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center w-40 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-bold py-2 px-8 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? <Spinner /> : 'Submit Data'}
                </button>
            </div>
        </form>
    );
};