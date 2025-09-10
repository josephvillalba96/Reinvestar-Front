import api from "./instance";

export const getMe = async () => {
  const response = await api.get("/api/v1/users/me");
  return response.data;
};
