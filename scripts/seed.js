import mongoose from 'mongoose';
import Student from '../src/models/Student.ts';
import Attendance from '../src/models/Attendance.ts';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables');
  process.exit(1);
}

const mockStudents = [
  {
    fullName: 'Mohamed Fouad',
    email: 'mohamed.fouad@example.com',
    studentNo: '20210001',
    phone: '01012345678',
    department: 'Computer Science',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Ahmed Ali',
    email: 'ahmed.ali@example.com',
    studentNo: '20210002',
    phone: '01198765432',
    department: 'Information Technology',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Sara Ahmed',
    email: 'sara.ahmed@example.com',
    studentNo: '20210003',
    phone: '01234567890',
    department: 'Software Engineering',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Omar Hassan',
    email: 'omar.hassan@example.com',
    studentNo: '20210004',
    phone: '01555667788',
    department: 'Artificial Intelligence',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Nour Mahmoud',
    email: 'nour.mahmoud@example.com',
    studentNo: '20210005',
    phone: '01099887766',
    department: 'Data Science',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Fatma Ibrahim',
    email: 'fatma.ibrahim@example.com',
    studentNo: '20210006',
    phone: '01223344556',
    department: 'Cyber Security',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Mahmoud Youssef',
    email: 'mahmoud.youssef@example.com',
    studentNo: '20210007',
    phone: '01112233445',
    department: 'Computer Science',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Hala Saad',
    email: 'hala.saad@example.com',
    studentNo: '20210008',
    phone: '01501239876',
    department: 'Information Systems',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Kareem Mostafa',
    email: 'kareem.mostafa@example.com',
    studentNo: '20210009',
    phone: '01033445566',
    department: 'Software Engineering',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Yasmine Tariq',
    email: 'yasmine.tariq@example.com',
    studentNo: '20210010',
    phone: '01255667788',
    department: 'Computer Science',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Amr Khaled',
    email: 'amr.khaled@example.com',
    studentNo: '20210011',
    phone: '01144556677',
    department: 'Artificial Intelligence',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Salma Nabil',
    email: 'salma.nabil@example.com',
    studentNo: '20210012',
    phone: '01588990011',
    department: 'Data Science',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Tarek Zaki',
    email: 'tarek.zaki@example.com',
    studentNo: '20210013',
    phone: '01066778899',
    department: 'Cyber Security',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Moustafa Kamal',
    email: 'moustafa.kamal@example.com',
    studentNo: '20210014',
    phone: '01288776655',
    department: 'Information Technology',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Hoda Samir',
    email: 'hoda.samir@example.com',
    studentNo: '20210015',
    phone: '01122113344',
    department: 'Computer Science',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Youssef Adel',
    email: 'youssef.adel@example.com',
    studentNo: '20210016',
    phone: '01511223344',
    department: 'Software Engineering',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Dina Magdy',
    email: 'dina.magdy@example.com',
    studentNo: '20210017',
    phone: '01099001122',
    department: 'Information Systems',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Ramy Soliman',
    email: 'ramy.soliman@example.com',
    studentNo: '20210018',
    phone: '01210293847',
    department: 'Artificial Intelligence',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Nada Farag',
    email: 'nada.farag@example.com',
    studentNo: '20210019',
    phone: '01156473829',
    department: 'Data Science',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
  {
    fullName: 'Hossam Galal',
    email: 'hossam.galal@example.com',
    studentNo: '20210020',
    phone: '01574839201',
    department: 'Computer Science',
    faceEncoding: Array.from({ length: 128 }, () => Math.random()),
  },
];

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    // Clear existing data
    console.log('Clearing existing data...');
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Data cleared.');

    // Insert students
    console.log('Inserting mock students...');
    const createdStudents = await Student.insertMany(mockStudents);
    console.log(`${createdStudents.length} students inserted.`);

    // Insert mock attendance for today
    console.log('Inserting mock attendance...');
    const attendanceRecords = createdStudents.map((student, index) => ({
      student: student._id,
      status: index % 2 === 0 ? 'Present' : 'Late',
    }));

    await Attendance.insertMany(attendanceRecords);
    console.log(`${attendanceRecords.length} attendance records inserted.`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
