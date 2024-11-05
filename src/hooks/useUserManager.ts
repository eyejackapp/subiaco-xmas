import { useState } from "preact/hooks";

interface UserData {
  id: string;
  date: string;
  fullName: string;
  postcode: string;
  emailAddress: string;
  phone: string;
  hearSource: string;
  visitedBusinesses: string;
  encouragedExplore: string;
}

const API_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;

function useUserManager() {
  const [userId, setUserId] = useState<string>(() => {
    const existingId = localStorage.getItem("userId");
    if (existingId) {
      return existingId;
    } else {
      const newId = crypto.randomUUID();
      localStorage.setItem("userId", newId);
      return newId;
    }
  });

  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addUser = async (userData: Omit<UserData, "id">) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: 'no-cors',
        body: JSON.stringify({
          action: "addUser",
          id: userId,
          ...userData,
        }),
      });
      await response.text();
      setMessage("Success");
    } catch (err) {
      setError("Failed to add user");
      console.error("Error adding user:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserEmail = async (email: string) => {
    setUpdating(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: 'no-cors',
        body: JSON.stringify({
          action: "updateEmail",
          id: userId,
          emailAddress: email,
        }),
      });
      await response.text();
      setMessage("Updated email");
    } catch (err) {
      setError("Failed to update user email");
      console.error("Error updating user email:", err);
    } finally {
      setUpdating(false);
    }
  };

  const hasHitSubmissionLimit = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      return data.submissionsCount > 1;
    } catch (error) {
      console.error("Error fetching submission limit:", error);
      return;
    } 
  };

  return {
    addUser,
    updateUserEmail,
    message,
    loading,
    error,
    userId,
    updating,
    hasHitSubmissionLimit,
  };
}

export default useUserManager;
