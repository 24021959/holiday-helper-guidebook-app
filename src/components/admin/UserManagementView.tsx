
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  PlusCircle, 
  Trash2, 
  Check, 
  X, 
  UserCog, 
  LockKeyhole, 
  Shield, 
  Mail
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { UserData } from "@/pages/Admin";

export const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<string>("user");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setUsers(data.map(user => ({
          id: user.id,
          email: user.email,
          isActive: user.is_active,
          role: user.role,
          createdAt: new Date(user.created_at).toLocaleDateString()
        })));
      }
    } catch (error) {
      console.error("Errore nel caricamento degli utenti:", error);
      toast.error("Impossibile caricare gli utenti");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!email || !password) {
      toast.error("Email e password sono obbligatorie");
      return;
    }

    try {
      // Create user in admin_users table
      const { error } = await supabase
        .from('admin_users')
        .insert({
          email: email,
          role: role,
          is_active: true,
          password_hash: password // Note: In a real app, this should be properly hashed
        });

      if (error) throw error;
      
      toast.success("Utente creato con successo");
      setEmail("");
      setPassword("");
      setRole("user");
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Errore nella creazione dell'utente:", error);
      toast.error("Impossibile creare l'utente");
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      ));
      
      toast.success(`Utente ${currentStatus ? 'disattivato' : 'attivato'} con successo`);
    } catch (error) {
      console.error("Errore nella modifica dello stato dell'utente:", error);
      toast.error("Impossibile modificare lo stato dell'utente");
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', userToDelete);

      if (error) throw error;
      
      setUsers(users.filter(user => user.id !== userToDelete));
      toast.success("Utente eliminato con successo");
      setConfirmDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Errore nell'eliminazione dell'utente:", error);
      toast.error("Impossibile eliminare l'utente");
    }
  };

  const confirmDelete = (userId: string) => {
    setUserToDelete(userId);
    setConfirmDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-emerald-600">Gestione Utenti</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Nuovo Utente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crea Nuovo Utente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    className="pl-8"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-8"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">Ruolo</label>
                <div className="relative">
                  <Shield className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="pl-8">
                      <SelectValue placeholder="Seleziona un ruolo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Amministratore</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="user">Utente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annulla</Button>
              <Button onClick={handleCreateUser}>Crea Utente</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-2 text-emerald-600">Caricamento utenti...</p>
        </div>
      ) : (
        <>
          {users.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <UserCog className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Nessun utente</h3>
              <p className="mt-1 text-sm text-gray-500">
                Non ci sono ancora utenti registrati. Crea il tuo primo utente.
              </p>
              <div className="mt-6">
                <Button onClick={() => setIsDialogOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nuovo Utente
                </Button>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[250px]">Email</TableHead>
                    <TableHead>Ruolo</TableHead>
                    <TableHead>Data Creazione</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.isActive 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Attivo" : "Disattivato"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id, user.isActive)}
                          title={user.isActive ? "Disattiva" : "Attiva"}
                        >
                          {user.isActive ? (
                            <X className="h-4 w-4 text-red-500" />
                          ) : (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete(user.id)}
                          title="Elimina"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
      
      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma eliminazione</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Sei sicuro di voler eliminare questo utente? Questa azione non può essere annullata.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Annulla</Button>
            <Button variant="destructive" onClick={handleDeleteUser}>Elimina</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
