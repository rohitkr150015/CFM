import { useState, useEffect } from "react";
import { authFetch } from "@/utils/authFetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save, AlertCircle, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ===== TYPES ===== */
type HeadingItem = {
  title: string;
  order: number;
};

type TemplateItem = {
  id: number;
  name: string;
  type: "THEORY" | "LAB" | string;
  structure: HeadingItem[];
};

/* ===== COMPONENT ===== */
export default function HodTemplateBuilderPage() {
  const { toast } = useToast();

  const [templateName, setTemplateName] = useState("");
  const [templateType, setTemplateType] =
    useState<"" | "THEORY" | "LAB">("");
  const [newHeading, setNewHeading] = useState("");
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);

  const BASE_URL = "http://localhost:8080/api/templates";

  /* ===== FETCH TEMPLATES ===== */
  const fetchTemplates = async () => {
    try {
      const res = await authFetch(`${BASE_URL}/department`);
      if (!res.ok) throw new Error();

      const data = await res.json();
      if (!Array.isArray(data)) {
        setTemplates([]);
        return;
      }

      const formatted = data.map((t: any) => {
        let parsed = { type: "UNKNOWN", headings: [] };
        try {
          if (t.structure) parsed = JSON.parse(t.structure);
        } catch (e) {
          console.error("Failed to parse template structure", t);
        }

        return {
          id: t.id,
          name: t.name,
          type: parsed.type || "UNKNOWN",
          structure: Array.isArray(parsed.headings) ? parsed.headings : [],
        };
      });

      setTemplates(formatted);
    } catch {
      toast({
        title: "Error",
        description: "Templates load failed. Please login again.",
        variant: "destructive",
      });
      setTemplates([]);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  /* ===== HEADINGS ===== */
  const addHeading = () => {
    if (!newHeading.trim()) return;
    setHeadings(h => [
      ...h,
      { title: newHeading.trim(), order: h.length + 1 },
    ]);
    setNewHeading("");
  };

  const removeHeading = (i: number) =>
    setHeadings(h => h.filter((_, idx) => idx !== i));

  /* ===== SAVE TEMPLATE ===== */
  const saveTemplate = async () => {
    if (!templateName || !templateType || headings.length === 0) {
      toast({
        title: "Validation error",
        description: "Fill all fields",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: templateName,
      description: `${templateType} template`,
      structure: JSON.stringify({
        type: templateType,
        headings,
      }),
      checklist: JSON.stringify([]),
    };

    try {
      const res = await authFetch(BASE_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      toast({
        title: "Success",
        description: "Template saved successfully",
      });

      setTemplateName("");
      setTemplateType("");
      setHeadings([]);
      fetchTemplates();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  /* ===== UI ===== */
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Department Course Template Management
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Builder */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Template name"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
              />

              <select
                className="border rounded p-2"
                value={templateType}
                onChange={e =>
                  setTemplateType(e.target.value as any)
                }
              >
                <option value="">Select type</option>
                <option value="THEORY">Theory</option>
                <option value="LAB">Lab</option>
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Headings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Unit name"
                  value={newHeading}
                  onChange={e => setNewHeading(e.target.value)}
                />
                <Button onClick={addHeading}>
                  <Plus />
                </Button>
              </div>

              {headings.length === 0 ? (
                <div className="text-muted-foreground text-center">
                  <AlertCircle /> No headings added
                </div>
              ) : (
                headings.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 border p-2 rounded"
                  >
                    <Lock size={16} />
                    <span className="flex-1">{h.title}</span>
                    <Badge>Locked</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeHeading(i)}
                    >
                      <X />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Button onClick={saveTemplate} className="w-full">
            <Save className="mr-2" /> Save Template
          </Button>
        </div>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.map(t => (
              <div key={t.id} className="border p-2 rounded">
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.type} • {t.structure?.length || 0} headings
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
