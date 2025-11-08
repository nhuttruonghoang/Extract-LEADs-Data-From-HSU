import React from 'react';
import { StudentData } from '../types';
import { CSV_HEADERS, MAJORS, PROVINCES, HIGH_SCHOOLS } from '../constants';

interface ResultsTableProps {
  data: StudentData[];
  setData: (data: StudentData[]) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data, setData }) => {
  const handleInputChange = (id: string, field: keyof Omit<StudentData, 'id'>, value: string) => {
    const updatedData = data.map((row) =>
      row.id === id ? { ...row, [field]: value } : row
    );
    setData(updatedData);
  };

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-200 uppercase bg-gray-700">
          <tr>
            {CSV_HEADERS.map(header => (
              <th key={header} scope="col" className="px-4 py-3 whitespace-nowrap">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
              <td className="px-4 py-2"><input type="text" value={row.ngaySinh} onChange={(e) => handleInputChange(row.id, 'ngaySinh', e.target.value)} className="w-full bg-transparent p-1 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"/></td>
              <td className="px-4 py-2"><input type="text" value={row.soDienThoai} onChange={(e) => handleInputChange(row.id, 'soDienThoai', e.target.value)} className="w-full bg-transparent p-1 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"/></td>
              <td className="px-4 py-2"><input type="text" value={row.cccd} onChange={(e) => handleInputChange(row.id, 'cccd', e.target.value)} className="w-full bg-transparent p-1 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"/></td>
              <td className="px-4 py-2"><input type="email" value={row.email} onChange={(e) => handleInputChange(row.id, 'email', e.target.value)} className="w-full bg-transparent p-1 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"/></td>
              <td className="px-4 py-2"><input type="text" value={row.diaChi} onChange={(e) => handleInputChange(row.id, 'diaChi', e.target.value)} className="w-full bg-transparent p-1 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500"/></td>
              <td className="px-4 py-2">
                  <select value={row.nganhDangKy} onChange={(e) => handleInputChange(row.id, 'nganhDangKy', e.target.value)} className="w-full bg-gray-800 p-1 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                      {!MAJORS.includes(row.nganhDangKy) && <option value={row.nganhDangKy}>{row.nganhDangKy}</option>}
                      {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
              </td>
              <td className="px-4 py-2">
                  <select value={row.tinhThanhPho} onChange={(e) => handleInputChange(row.id, 'tinhThanhPho', e.target.value)} className="w-full bg-gray-800 p-1 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                      {!PROVINCES.includes(row.tinhThanhPho) && <option value={row.tinhThanhPho}>{row.tinhThanhPho}</option>}
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
              </td>
              <td className="px-4 py-2">
                  <select value={row.truongThpt} onChange={(e) => handleInputChange(row.id, 'truongThpt', e.target.value)} className="w-full bg-gray-800 p-1 rounded-md border border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                      {!HIGH_SCHOOLS.includes(row.truongThpt) && <option value={row.truongThpt}>{row.truongThpt}</option>}
                      {HIGH_SCHOOLS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};