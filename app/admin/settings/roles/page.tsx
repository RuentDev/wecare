"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  ShieldCheck, 
  Settings2,
  Save,
  Loader2,
  Info
} from "lucide-react";
import { getRoles, getPermissions, updateRolePermissions } from "@/lib/actions/rbac";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function RolesAndPermissionsPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Local state for the matrix to allow "Save" button approach
  const [matrix, setMatrix] = useState<Record<string, string[]>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [rolesData, permsData] = await Promise.all([getRoles(), getPermissions()]);
      setRoles(rolesData);
      setPermissions(permsData);
      
      // Initialize matrix
      const initialMatrix: Record<string, string[]> = {};
      rolesData.forEach((role: any) => {
        initialMatrix[role.id] = role.role_permissions.map((rp: any) => rp.permission_id);
      });
      setMatrix(initialMatrix);
    } catch (error) {
      toast.error("Failed to load roles and permissions");
    } finally {
      setLoading(false);
    }
  }

  function togglePermission(roleId: string, permId: string) {
    setMatrix(prev => {
      const current = prev[roleId] || [];
      const updated = current.includes(permId)
        ? current.filter(id => id !== permId)
        : [...current, permId];
      return { ...prev, [roleId]: updated };
    });
  }

  async function handleSave(roleId: string) {
    startTransition(async () => {
      try {
        await updateRolePermissions(roleId, matrix[roleId]);
        toast.success("Permissions updated successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to update permissions");
      }
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Configure system-wide access levels and permission mapping.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="glassmorphism border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-white/40 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {role.name} Role
                </CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </div>
              <Button 
                onClick={() => handleSave(role.id)} 
                disabled={isPending}
                size="sm"
                className="gap-2"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Configuration
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions.map((perm) => {
                  const isChecked = matrix[role.id]?.includes(perm.id);
                  return (
                    <div 
                      key={perm.id} 
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        isChecked 
                          ? "bg-primary/5 border-primary/30" 
                          : "bg-white/20 border-white/40 hover:bg-white/40"
                      }`}
                      onClick={() => togglePermission(role.id, perm.id)}
                    >
                      <Checkbox 
                        checked={isChecked}
                        onCheckedChange={() => togglePermission(role.id, perm.id)}
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-medium">{perm.name}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{perm.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary/5 border-dashed border-primary/30">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            RBAC Implementation Note
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Changes to role permissions are applied immediately system-wide. Users currently logged in may need to refresh or re-authenticate depending on session handling. 
            <strong> Administrator</strong> permissions are critical; ensure at least one role has <code>roles:manage</code> access to avoid lockouts.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
