
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
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check if we're in demo mode
    const adminToken = localStorage.getItem("admin_token");
    const isLoggedInAsDemo = adminToken === "demo_token" || adminToken === "master_token";
    setIsDemo(isLoggedInAsDemo);
    
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Check if we're in demo mode
      const adminToken = localStorage.getItem("admin_token");
      const isLoggedInAsDemo = adminToken === "demo_token" || adminToken === "master_token";
      
      if (isLoggedInAsDemo) {
        console.log("Using demo users data");
        
        // Demo users
        const demoUsers: UserData[] = [
          {
            id: "1",
            email: "admin@example.com",
            isActive: true,
            role: "admin",
            createdAt: new Date().toISOString()
          },
          {
            id: "2",
            email: "user@example.com",
            isActive: true,
            role: "user",
            createdAt: new Date().toISOString()
          },
          {
            id: "3",
            email: "inactive@example.com",
            isActive: false,
            role: "user",
            createdAt: new Date().toISOString()
          }
        ];
        
        setUsers(demoUsers);
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase.functions.invoke('admin_users_helpers', {
          body: { action: 'get_users' }
        });

        if (error) {
          console.error("Error fetching users:", error);
          toast.error("Failed to load users.");
          
          // Use demo data as fallback
          const demoUsers: UserData[] = [
            {
              id: "1",
              email: "admin@example.com",
              isActive: true,
              role: "admin",
              createdAt: new Date().toISOString()
            },
            {
              id: "2",
              email: "user@example.com",
              isActive: true,
              role: "user",
              createdAt: new Date().toISOString()
            }
          ];
          
          setUsers(demoUsers);
          setIsDemo(true);
          return;
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
      } catch (error) {
        console.error("Error invoking function:", error);
        toast.error("Failed to load users. Using demo data.");
        
        // Use demo data as fallback
        const demoUsers: UserData[] = [
          {
            id: "1",
            email: "admin@example.com",
            isActive: true,
            role: "admin",
            createdAt: new Date().toISOString()
          },
          {
            id: "2",
            email: "user@example.com",
            isActive: true,
            role: "user",
            createdAt: new Date().toISOString()
          }
        ];
        
        setUsers(demoUsers);
        setIsDemo(true);
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

      // In demo mode, just fake the creation
      if (isDemo) {
        // Add a fake user to the list
        const newId = (users.length + 1).toString();
        const fakeUser: UserData = {
          id: newId,
          email: newUser.email,
          isActive: true,
          role: newUser.role,
          createdAt: new Date().toISOString()
        };
        
        setUsers([...users, fakeUser]);
        toast.success("User created successfully! (Demo Mode)");
        setIsCreateDialogOpen(false);
        setNewUser({ email: "", password: "", role: "user" });
        return;
      }
      
      try {
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
      } catch (error) {
        console.error("Error invoking function:", error);
        toast.error("Failed to create user.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserStatus = async (id: string, isActive: boolean) => {
    setIsLoading(true);
    try {
      // In demo mode, just fake the status toggle
      if (isDemo) {
        const updatedUsers = users.map(user => 
          user.id === id ? { ...user, isActive: !isActive } : user
        );
        setUsers(updatedUsers);
        toast.success("User status updated successfully! (Demo Mode)");
        return;
      }
      
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
      } catch (error) {
        console.error("Error invoking function:", error);
        toast.error("Failed to update user status.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    setIsLoading(true);
    try {
      // In demo mode, just fake the deletion
      if (isDemo) {
        const updatedUsers = users.filter(user => user.id !== id);
        setUsers(updatedUsers);
        toast.success("User deleted successfully! (Demo Mode)");
        return;
      }
      
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
      } catch (error) {
        console.error("Error invoking function:", error);
        toast.error("Failed to delete user.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Utenti</TabsTrigger>
          <TabsTrigger value="settings">Impostazioni</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestione Utenti</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crea Utente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Crea Nuovo Utente</DialogTitle>
                  <DialogDescription>
                    Crea un nuovo account utente.
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
                      Ruolo
                    </Label>
                    <select
                      id="role"
                      name="role"
                      value={newUser.role}
                      onChange={handleInputChange}
                      className="col-span-3 rounded-md border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="user">Utente</option>
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
                        Creazione in corso...
                      </>
                    ) : "Crea Utente"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Caricamento utenti...
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableCaption>Lista di tutti gli utenti {isDemo ? "(Modalità Demo)" : ""}</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Ruolo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Azioni</TableHead>
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
                          ) : user.isActive ? "Disattiva" : "Attiva"}
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
                          ) : "Elimina"}
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
            <h2 className="text-2xl font-bold">Impostazioni</h2>
            <p>Qui puoi gestire le impostazioni globali.</p>
            {isDemo && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-amber-700">Modalità demo attiva. Le modifiche non verranno salvate permanentemente.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagementView;
