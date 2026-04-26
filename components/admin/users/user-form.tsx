"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Stethoscope, 
  UserCircle, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Wand2,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { adminCreateUser, adminUpdateUser } from "@/lib/actions/rbac";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;

const userFormSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["admin", "staff", "patient", "doctor", "nurse"]),
  is_active: z.boolean().default(true),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(passwordRegex, "Must contain 1 uppercase, 1 number, and 1 special character")
    .optional()
    .or(z.literal("")),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  initialData?: any;
  mode?: "create" | "edit";
  onSuccess?: () => void;
}

export function UserForm({ initialData, mode = "create", onSuccess }: UserFormProps) {
  const router = useRouter();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData ? {
      first_name: initialData.first_name || "",
      last_name: initialData.last_name || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      role: initialData.role || "patient",
      is_active: initialData.is_active ?? true,
    } : {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "patient",
      is_active: true,
      password: "",
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const isLoading = form.formState.isSubmitting;

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyz";
    const upperCharset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numCharset = "0123456789";
    const specialCharset = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    
    let password = "";
    password += upperCharset.charAt(Math.floor(Math.random() * upperCharset.length));
    password += numCharset.charAt(Math.floor(Math.random() * numCharset.length));
    password += specialCharset.charAt(Math.floor(Math.random() * specialCharset.length));
    
    const allCharset = charset + upperCharset + numCharset + specialCharset;
    for (let i = 0; i < 7; i++) {
      password += allCharset.charAt(Math.floor(Math.random() * allCharset.length));
    }
    
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    form.setValue("password", password, { shouldValidate: true });
    setShowPassword(true);
    toast.success("Random password generated", {
      description: "Password has been filled and shown.",
      action: {
        label: "Copy",
        onClick: () => {
          navigator.clipboard.writeText(password);
          toast.success("Password copied");
        }
      }
    });
  };

  async function onSubmit(data: UserFormValues) {
    try {
      if (mode === "create") {
        await adminCreateUser(data);
        toast.success("User created successfully");
      } else {
        await adminUpdateUser(initialData.id, data);
        toast.success("User updated successfully");
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/users");
      }
      router.refresh();
    } catch (error) {
      toast.error(mode === "create" ? "Failed to create user" : "Failed to update user");
    }
  }

  const roleIcons: Record<string, any> = {
    admin: Shield,
    staff: UserCircle,
    patient: User,
    doctor: Stethoscope,
    nurse: UserCircle,
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 animate-in-fade animate-in-slide-up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-semibold flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-primary" /> First Name
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John" 
                    {...field} 
                    className="h-11 rounded-xl border-neutral-gray/30 focus:ring-primary/20 transition-all bg-white/50 backdrop-blur-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-semibold flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-primary" /> Last Name
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Doe" 
                    {...field} 
                    className="h-11 rounded-xl border-neutral-gray/30 focus:ring-primary/20 transition-all bg-white/50 backdrop-blur-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-sm font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" /> Email Address
              </FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="john.doe@example.com" 
                  {...field} 
                  className="h-11 rounded-xl border-neutral-gray/30 focus:ring-primary/20 transition-all bg-white/50 backdrop-blur-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-semibold flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" /> Phone Number
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="+63 912 345 6789" 
                    {...field} 
                    className="h-11 rounded-xl border-neutral-gray/30 focus:ring-primary/20 transition-all bg-white/50 backdrop-blur-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> System Role
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 rounded-xl border-neutral-gray/30 focus:ring-primary/20 transition-all bg-white/50 backdrop-blur-sm">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-neutral-gray/20 shadow-2xl backdrop-blur-lg">
                    {Object.entries(roleIcons).map(([role, Icon]) => (
                      <SelectItem key={role} value={role} className="flex items-center gap-2 py-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary/70" />
                          <span className="capitalize">{role}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {mode === "create" && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" /> Initial Password
                  </FormLabel>
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    onClick={generatePassword}
                    className="h-8 text-[10px] uppercase tracking-wider font-bold text-primary hover:text-primary hover:bg-primary/10 gap-1.5 rounded-lg"
                  >
                    <Wand2 className="w-3 h-3" /> Generate Random
                  </Button>
                </div>
                <div className="relative group">
                  <FormControl>
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter a secure password" 
                      {...field} 
                      className="h-11 rounded-xl border-neutral-gray/30 focus:ring-primary/20 transition-all bg-white/50 backdrop-blur-sm pr-10"
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <FormDescription className="text-[10px]">
                  Must include 1 uppercase, 1 number, and 1 special character.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-neutral-gray/20 bg-white/30 backdrop-blur-sm p-4 shadow-sm transition-all hover:bg-white/50">
              <div className="space-y-0.5">
                <FormLabel className="text-base font-bold text-neutral-dark">
                  Account Status
                </FormLabel>
                <FormDescription className="text-xs">
                  {field.value ? "This account is currently active and can login." : "This account is inactive and cannot login."}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-success"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="pt-4 flex gap-3">
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              "flex-1 h-12 rounded-xl font-bold transition-all shadow-lg",
              mode === "create" 
                ? "bg-primary hover:bg-primary/90 shadow-primary/20" 
                : "bg-secondary hover:bg-secondary/90 shadow-secondary/20"
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {mode === "create" ? "Creating User..." : "Saving Changes..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {mode === "create" ? <CheckCircle2 className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                {mode === "create" ? "Create User Account" : "Update User Profile"}
              </span>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
