import { authFetch } from "@/utils/authFetch";
const API = "http://localhost:8080/api/hod/courses";

export const getHodCourses = async () => {
  const res = await authFetch("/api/hod/courses");

  if (!res.ok) {
    throw new Error("Failed to load courses");
  }

  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    console.error("NOT JSON RESPONSE:", text);
    return [];
  }
};


export const createCourse = async (data: any) => {
  const res = await authFetch("/api/hod/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create course");
  return res.json();
};

export const updateCourse = async (id: number, data: any) => {
  const res = await authFetch(`/api/hod/courses/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update course");
  return res.json();
};

export const deleteCourse = async (id: number) => {
  const res = await authFetch(`/api/hod/courses/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete course");
};
