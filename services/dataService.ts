import { DropdownData } from '../types';

// Mock data that would typically come from a database
const MAJORS_DATA = ['IT', 'MK', 'QL', 'Quản trị khách sạn'];
const PROVINCES_DATA = ['TPHCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ'];
const HIGH_SCHOOLS_DATA = [
  'THPT Le Quy Đơn',
  'THPT Nguyễn Thương Hiền',
  'THPT Nguyễn Van Trỗi',
  'THPT Hùng Vương',
  'THPT Chuyên Trần Đại Nghĩa',
];

// Simulate an API call to fetch data
const fetchData = <T>(data: T, delay = 500): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

export const fetchDropdownData = async (): Promise<DropdownData> => {
  // Use Promise.all to fetch all data concurrently
  const [majors, provinces, highSchools] = await Promise.all([
    fetchData(MAJORS_DATA),
    fetchData(PROVINCES_DATA, 700), // simulate different response times
    fetchData(HIGH_SCHOOLS_DATA, 900),
  ]);

  return {
    majors,
    provinces,
    highSchools,
  };
};
