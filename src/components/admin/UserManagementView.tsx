import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, UserPlus, XCircle, Loader2 } from "lucide-react";
import { md5 } from "js-md5";
import { UserData } from "@/context/AdminContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserForm {
  email: string;
  password?: string;
  role: string;
}

const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<UserForm>({ email: "", password: "", role: "user" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTab, setSelectedTab] = useState("users");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin_users_helpers', {
        body: { action: 'get_users' }
      });

      if (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users.");
      }

      if (data && data.data) {
        const formattedUsers = data.data.map((user: any) => ({
          id: user.id,
          email: user.email,
          isActive: user.is_active,
          role: user.role,
          createdAt: user.created_at
        }));
        setUsers(formattedUsers);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const createUser = async () => {
    setIsSubmitting(true);
    try {
      if (!newUser.email || !newUser.password) {
        toast.error("Email and password are required.");
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin_users_helpers', {
        body: {
          action: 'create_user',
          email: newUser.email,
          password_hash: md5(newUser.password),
          role: newUser.role
        }
      });

      if (error) {
        console.error("Error creating user:", error);
        toast.error("Failed to create user.");
        return;
      }

      toast.success("User created successfully!");
      setIsCreateDialogOpen(false);
      setNewUser({ email: "", password: "", role: "user" });
      fetchUsers();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserStatus = async (id: string, isActive: boolean) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin_users_helpers', {
        body: {
          action: 'toggle_status',
          id: id,
          is_active: !isActive
        }
      });

      if (error) {
        console.error("Error toggling user status:", error);
        toast.error("Failed to update user status.");
        return;
      }

      toast.success("User status updated successfully!");
      fetchUsers();
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin_users_helpers', {
        body: {
          action: 'delete_user',
          id: id
        }
      });

      if (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user.");
        return;
      }

      toast.success("User deleted successfully!");
      fetchUsers();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">User Management</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={newUser.email}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Password
                    </Label>
                    <Input
                      type="password"
                      id="password"
                      name="password"
                      value={newUser.password || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Role
                    </Label>
                    <select
                      id="role"
                      name="role"
                      value={newUser.role}
                      onChange={handleInputChange}
                      className="col-span-3 rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="master">Master</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={createUser} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : "Create User"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Loading users...
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableCaption>A list of all users.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <CheckCircle className="text-green-500 h-5 w-5" />
                        ) : (
                          <XCircle className="text-red-500 h-5 w-5" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                          disabled={isLoading}
                          className="ml-2"
                        >
                          {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : "Delete"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        <TabsContent value="settings">
          <div>
            <h2 className="text-2xl font-bold">Settings</h2>
            <p>Here you can manage global settings.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagementView;
