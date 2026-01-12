import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

/* =======================
   VALIDATION SCHEMA
======================= */

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

/* =======================
   COMPONENT
======================= */

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, getRoleBasedRedirect } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  /* =======================
     SUBMIT HANDLER
  ======================= */

  const onSubmit = async (values: LoginForm) => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      // 🔐 Normalize role (backend consistency)
      const normalizeRole = (role: string) =>
        role === "SUBJECTHEAD" ? "SUBJECT_HEAD" : role;

      // ✅ FINAL USER OBJECT
      const userData = {
        id: data.id,
        username: data.username,
        email: data.email,
        role: normalizeRole(data.role),
        token: data.token, // ✅ REAL JWT
      };

      // 🔐 Save in AuthContext + localStorage
      login({
        id: data.id,
        email: data.email,
        role: normalizeRole(data.role),
        token: data.token,
      });

      toast({
        title: "Login Successful",
        description: `Welcome ${userData.role}`,
      });

      // 🚀 Redirect by role
      navigate(getRoleBasedRedirect(userData.role), { replace: true });

    } catch (error) {
      toast({
        title: "Server Error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
    }
  };

  /* =======================
     UI
  ======================= */

  return (
    <div className="min-h-screen flex bg-muted/30">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-indigo-900 text-white p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold">CourseFlow</h1>
          <p className="mt-4 text-indigo-200 max-w-sm">
            Secure course & faculty management platform
          </p>
        </div>
        <p className="text-indigo-300 text-sm">© 2026 CourseFlow</p>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Sign in
            </CardTitle>
            <CardDescription>
              Use your institute credentials
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >

                {/* EMAIL */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* PASSWORD */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* REMEMBER */}
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Remember me
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="justify-center text-sm">
            Don’t have an account?
            <Link to="/signup" className="ml-1 text-primary">
              Sign up
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
