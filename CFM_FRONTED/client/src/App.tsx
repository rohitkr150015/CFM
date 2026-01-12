import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";

import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

/* ===================== AUTH PAGES ===================== */
import LoginPage from "@/pages/auth/Login";
import SignupPage from "@/pages/auth/Register";
import ForgotPasswordPage from "@/pages/auth/ForgotPassword";

/* ===================== LAYOUTS ===================== */
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

/* ===================== TEACHER ===================== */
import Dashboard from "@/pages/dashboard/Dashboard";
import CoursesPage from "@/pages/dashboard/Courses";
import FilesPage from "@/pages/dashboard/Files";
import UploadPage from "@/pages/dashboard/Upload";
import ReportsPage from "@/pages/dashboard/Reports";
import SettingsPage from "@/pages/dashboard/Settings";
import CommentsPage from "@/pages/dashboard/Comments";
import TemplateSelectionPage from "@/pages/dashboard/TemplateSelection";
import CourseStructurePage from "@/pages/dashboard/CourseStructure";
import TeacherNotesUploadPage from "@/pages/dashboard/TeacherNotesUpload";
import ApprovalWorkflowPage from "@/pages/dashboard/ApprovalWorkflow";
import ViewCourseFilePage from "@/pages/dashboard/ViewCourseFile";

/* ===================== HOD ===================== */
import HodDashboardPage from "@/pages/hod/HodDashboard";
import AssignCoursesPage from "@/pages/hod/Assign-Course";
import DepartmentFacultyPage from "@/pages/hod/DepartmentFaculty";
import DepartmentManagementPage from "./pages/hod/AddCoursePage";
import HodApprovalsPage from "@/pages/hod/HodApprovals";
import HodTeachersPage from "@/pages/hod/HodTeachers";
import HodTemplateBuilderPage from "@/pages/hod/HodTemplateBuilder";
import CalendarPage from "@/pages/common/Calendar";

/* ===================== ADMIN ===================== */
import AdminLoginPage from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsersPage from "@/pages/admin/AdminUsers";
import AdminFacultyPage from "@/pages/admin/FacultyDashboard";
import AdminRolesPage from "@/pages/admin/AdminRoles";
import AdminInstitutesPage from "@/pages/admin/AdminInstitutes";
import AdminDepartmentsPage from "@/pages/admin/AdminDepartments";
import AdminProgramsPage from "@/pages/admin/AdminPrograms";
import AdminTemplatesPage from "@/pages/admin/AdminTemplates";
import AdminAuditLogsPage from "@/pages/admin/AdminAuditLogs";
import AdminSettingsPage from "@/pages/admin/AdminSettings";

/* ===================== SUBJECT HEAD ===================== */
import SubjectHeadDashboardPage from "@/pages/subjectHead/SubjectHeadDashboard";
import SubjectHeadCourseReviewPage from "@/pages/subjectHead/SubjectHeadCourseReview";

/* ===================== FALLBACK ===================== */
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Routes>
      {/* ================= PUBLIC ================= */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* ================= ADMIN ================= */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="faculty" element={<AdminFacultyPage />} />
        <Route path="roles" element={<AdminRolesPage />} />
        <Route path="institutes" element={<AdminInstitutesPage />} />
        <Route path="departments" element={<AdminDepartmentsPage />} />
        <Route path="programs" element={<AdminProgramsPage />} />
        <Route path="templates" element={<AdminTemplatesPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* ================= HOD ================= */}
      <Route
        path="/hod"
        element={
          <ProtectedRoute allowedRoles={["HOD"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HodDashboardPage />} />
        <Route path="dashboard" element={<HodDashboardPage />} />
        <Route path="overview" element={<HodDashboardPage />} />
        <Route path="approvals" element={<HodApprovalsPage />} />
        <Route path="courses" element={<AssignCoursesPage />} />
        <Route path="department-faculty" element={<DepartmentFacultyPage />} />
        <Route path="department-management" element={<DepartmentManagementPage />} />
        <Route path="teachers" element={<HodTeachersPage />} />
        <Route path="templates" element={<HodTemplateBuilderPage />} />
        <Route path="calendar" element={<CalendarPage />} />
      </Route>

      {/* ================= SUBJECT HEAD ================= */}
      <Route
        path="/subject-head"
        element={
          <ProtectedRoute allowedRoles={["SUBJECT_HEAD"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SubjectHeadDashboardPage />} />
        <Route path="dashboard" element={<SubjectHeadDashboardPage />} />
        <Route path="review/:courseFileId" element={<SubjectHeadCourseReviewPage />} />
        <Route path="courses" element={<SubjectHeadDashboardPage />} />
        <Route path="history" element={<SubjectHeadDashboardPage />} />
        <Route path="reports" element={<SubjectHeadDashboardPage />} />
      </Route>


      {/* ================= TEACHER (HOD ALSO ALLOWED) ================= */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={["TEACHER", "HOD"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="files" element={<FilesPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="comments" element={<CommentsPage />} />
        <Route path="template-selection" element={<TemplateSelectionPage />} />
        <Route path="course-structure/:courseId" element={<CourseStructurePage />} />
        <Route path="teacher-notes" element={<TeacherNotesUploadPage />} />
        <Route path="approvals" element={<ApprovalWorkflowPage />} />
        <Route path="view-course-file" element={<ViewCourseFilePage />} />
      </Route>

      {/* ================= LEGACY REDIRECTS ================= */}
      <Route path="/dashboard" element={<Navigate to="/teacher/dashboard" replace />} />
      <Route path="/courses" element={<Navigate to="/teacher/courses" replace />} />
      <Route path="/teacher-notes" element={<Navigate to="/teacher/teacher-notes" replace />} />

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <ErrorBoundary>
            <Router />
          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
