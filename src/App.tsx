import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Inbox from '@/pages/Inbox';
import RoutingRules from '@/pages/RoutingRules';
import Departments from '@/pages/Departments';
import DepartmentDetails from '@/pages/DepartmentDetails';
import Team from '@/pages/Team';
import Analytics from '@/pages/Analytics';
import Integrations from '@/pages/Integrations';
import FormBuilder from '@/pages/FormBuilder';
import Settings from '@/pages/Settings';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import PublicInquiryForm from '@/pages/PublicInquiryForm';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/f/:formSlug" element={<PublicInquiryForm />} />
        <Route path="/forms/:formSlug" element={<PublicInquiryForm />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/routing-rules" element={<RoutingRules />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/departments/:departmentId" element={<DepartmentDetails />} />
            <Route path="/team" element={<Team />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/form-builder" element={<FormBuilder />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
