
import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminContent } from "@/components/admin/AdminContent";
import { AdminProvider } from "@/context/AdminContext";

const AdminPage: React.FC = () => {
  return (
    <AdminProvider>
      <AdminLayout>
        <AdminContent />
      </AdminLayout>
    </AdminProvider>
  );
};

export default AdminPage;
