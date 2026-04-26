"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  MoreHorizontal, 
  Shield, 
  UserCog, 
  UserMinus, 
  UserCheck,
  Loader2
} from "lucide-react";
import { updateUserRoles, toggleUserStatus } from "@/lib/actions/rbac";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface UsersClientProps {
  initialUsers: any[];
  roles: any[];
}

export function UsersClient({ initialUsers, roles }: UsersClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const filteredUsers = initialUsers.filter(
    (u) =>
      u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleOpenRoleModal(user: any) {
    setSelectedUser(user);
    setSelectedRoleIds(user.user_roles.map((ur: any) => ur.role_id));
    setIsRoleModalOpen(true);
  }

  async function handleUpdateRoles() {
    startTransition(async () => {
      try {
        await updateUserRoles(selectedUser.id, selectedRoleIds);
        toast.success("User roles updated successfully");
        setIsRoleModalOpen(false);
      } catch (error) {
        toast.error("Failed to update roles");
      }
    });
  }

  async function handleToggleStatus(userId: string, currentStatus: boolean) {
    try {
      await toggleUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error("Failed to update user status");
    }
  }

  return (
    <div className="space-y-6">
      <Card className="glassmorphism border-none shadow-xl">
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>
            Assign roles and manage account status for all registered users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 border-white/20"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {filteredUsers.length} total users
            </Badge>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No users found matching your search.
            </div>
          ) : (
            <div className="rounded-xl border border-white/20 overflow-hidden bg-white/30 backdrop-blur-md">
              <Table>
                <TableHeader className="bg-white/40">
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>System Role (Legacy)</TableHead>
                    <TableHead>RBAC Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-white/40 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-dark">
                            {user.first_name} {user.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.user_roles.length > 0 ? (
                            user.user_roles.map((ur: any) => (
                              <Badge key={ur.roles.id} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                {ur.roles.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No roles assigned</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.is_active ? (
                          <Badge className="bg-success/20 text-success border-success/30">Active</Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/30">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-white/50">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Management</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleOpenRoleModal(user)}>
                              <Shield className="mr-2 h-4 w-4 text-primary" />
                              Assign Roles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.is_active)}>
                              {user.is_active ? (
                                <>
                                  <UserMinus className="mr-2 h-4 w-4 text-destructive" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4 text-success" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <UserCog className="mr-2 h-4 w-4" />
                              Force Password Reset
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Assignment Modal */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Roles</DialogTitle>
            <DialogDescription>
              Assign one or more roles to {selectedUser?.first_name}. These roles determine the user's permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-neutral-light transition-colors cursor-pointer" onClick={() => {
                const updated = selectedRoleIds.includes(role.id)
                  ? selectedRoleIds.filter(id => id !== role.id)
                  : [...selectedRoleIds, role.id];
                setSelectedRoleIds(updated);
              }}>
                <Checkbox 
                  checked={selectedRoleIds.includes(role.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedRoleIds([...selectedRoleIds, role.id]);
                    } else {
                      setSelectedRoleIds(selectedRoleIds.filter(id => id !== role.id));
                    }
                  }}
                />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold capitalize leading-none">
                    {role.name}
                  </span>
                  <span className="text-xs text-muted-foreground italic">
                    {role.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateRoles} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
