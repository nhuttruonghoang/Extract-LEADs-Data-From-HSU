import React from 'react';
import { StudentData } from '../types';

interface ResultsTableProps {
  data: StudentData[];
  setData: (data: StudentData[]) => void;
}

const fieldLabels: Record<keyof Omit<StudentData, 'id'>, string> = {
  fullName: 'Họ và tên',
  dateOfBirth: 'Ngày / tháng / năm sinh',
  phoneNumber: 'Số điện thoại',
  idCardNumber: 'CCCD',
  email: 'Email nhận kết quả',
  address: 'Địa chỉ nhận kết quả',
  major: 'Ngành đăng ký xét tuyển',
  highSchoolProvince: 'Tên Tỉnh/TP trường THPT',
  highSchoolName: 'Tên trường THPT lớp 12',
};

export const ResultsTable: React.FC<ResultsTableProps> = ({ data, setData }) => {
  const student = data?.[0];

  const handleInputChange = (field: keyof Omit<StudentData, 'id'>, value: string) => {
    if (!student) return;
    const updatedStudent = { ...student, [field]: value };
    setData([updatedStudent]);
  };

  if (!student) {
    return <p className="text-center text-gray-400">No student data to display.</p>;
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {(Object.keys(fieldLabels) as Array<keyof typeof fieldLabels>).map((field) => (
        <div key={field} className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-center">
          <label htmlFor={field} className="text-sm font-medium text-gray-300 md:text-right">
            {fieldLabels[field]}
          </label>
          <input
            id={field}
            type="text"
            value={student[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="md:col-span-2 w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      ))}
    </div>
  );
};