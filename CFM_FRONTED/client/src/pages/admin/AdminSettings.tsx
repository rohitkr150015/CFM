
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useRef } from "react";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [logo, setLogo] = useState<string | null>(null);
  const [platformName, setPlatformName] = useState("CourseFlow Admin");
  const [supportEmail, setSupportEmail] = useState("support@courseflow.edu");
  const [isDark, setIsDark] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/public/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.system_logo) setLogo(data.system_logo);
        if (data.platform_name) setPlatformName(data.platform_name);
        if (data.support_email) setSupportEmail(data.support_email);
      }
    } catch (error) {
      console.error("Failed to load settings", error);
    }
  };

  const toggleTheme = (checked: boolean) => {
    setIsDark(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogo(result);
        // We defer saving to the "Save Configuration" button, 
        // OR we can auto-save here? User expects "Save Configuration" usually.
        // But for visual feedback we update state immediately.
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // Import authFetch dynamically or assuming it's available. 
      // Waiting for import... assuming imports exist at top.
      const settings = {
        system_logo: logo || "",
        platform_name: platformName,
        support_email: supportEmail
      };

      // We need authFetch here.
      const auth = JSON.parse(localStorage.getItem('courseflow_auth') || '{}');
      const token = auth.token;

      if (!token) {
        toast({ title: "Error", description: "Not authenticated", variant: "destructive" });
        return;
      }

      const res = await fetch("http://localhost:8080/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        toast({ title: "Settings Saved", description: "System configuration updated successfully." });
        // Dispatch event so Header updates immediately
        window.dispatchEvent(new Event("logo-updated"));
      } else {
        const errorText = await res.text();
        console.error("Save failed:", res.status, errorText);
        toast({ title: "Error", description: `Failed to save: ${errorText}`, variant: "destructive" });
      }
    } catch (error) {
      console.error("Save error", error);
      toast({ title: "Error", description: "Failed to save settings (Network/Client Error)", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">Global configuration and branding.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Branding</CardTitle>
          <CardDescription>Update the logo and platform name.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden">
              {logo ? (
                <img src={logo} alt="System Logo" className="h-full w-full object-cover" />
              ) : (
                <span className="text-white font-bold text-2xl">CP</span>
              )}
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleLogoUpload}
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Upload New Logo
              </Button>
            </div>
          </div>
          <div className="grid gap-2 max-w-md">
            <Label>Platform Name</Label>
            <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
          </div>
          <div className="grid gap-2 max-w-md">
            <Label>Support Email</Label>
            <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance & Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Dark Mode</div>
              <div className="text-sm text-muted-foreground">Enable dark theme for admin panel.</div>
            </div>
            <Switch
              checked={isDark}
              onCheckedChange={toggleTheme}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Email Notifications</div>
              <div className="text-sm text-muted-foreground">Receive digests of system activity.</div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Maintenance Mode</div>
              <div className="text-sm text-muted-foreground">Disable access for non-admin users.</div>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave}>Save Configuration</Button>
      </div>
    </div>
  );
}
