import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['proctologic-ungardened-stefan.ngrok-free.dev']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd', '@ant-design/icons'],
          'redux-vendor': ['react-redux', '@reduxjs/toolkit'],
          'utils-vendor': ['axios', 'dayjs', 'react-toastify'],
          
          // Feature chunks - Admin
          'admin-chunk': [
            './src/pages/admin/classes',
            './src/pages/admin/subjects',
            './src/pages/admin/teachers',
            './src/pages/admin/credentials',
            './src/pages/admin/reports',
            './src/pages/admin/security',
          ],
          
          // Feature chunks - Student Portal
          'student-chunk': [
            './src/pages/StudentPortal/Dashboard',
            './src/pages/StudentPortal/Roadmap',
            './src/pages/StudentPortal/GradeReport',
            './src/pages/StudentPortal/AttendanceReport',
            './src/pages/StudentPortal/WeeklyTimetable',
            './src/pages/StudentPortal/CourseRegistration',
            './src/pages/StudentPortal/Profile',
          ],
          
          // Feature chunks - Teacher
          'teacher-chunk': [
            './src/pages/teacher/dashboard',
            './src/pages/teacher/schedule',
            './src/pages/teacher/attendance',
            './src/pages/teacher/grading',
            './src/pages/teacher/results',
          ],
          
          // Feature chunks - Public Portal
          'public-chunk': [
            './src/pages/PublicPortal/Home',
            './src/pages/PublicPortal/VerificationPortal',
            './src/pages/PublicPortal/VerificationHistory',
            './src/pages/PublicPortal/VerificationResults',
          ],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
})