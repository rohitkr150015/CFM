import { authFetch } from "@/utils/authFetch";

const API = "http://localhost:8080/api/admin/faculty/hod-list";

export const getHodList = async () => {
  const res = await authFetch(API);
  return res.json();
};
