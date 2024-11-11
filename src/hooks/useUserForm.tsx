import { useContext, useState } from "preact/hooks";
import { createContext } from "preact/compat";
import { useLocalStorageState } from "ahooks";

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

interface UserFormContextType {
  userId: string;
  savedFormData: UserData | null | undefined;
  setSavedFormData: (data: UserData | undefined | null) => void;
  message: string | null;
  loading: boolean;
  error: string | null;
  hasSentData: boolean;
  addUser: (userData: Omit<UserData, "id">) => Promise<void>;
  updateUserEmail: (email: string) => Promise<void>;
  hasHitSubmissionLimit: () => Promise<boolean>;
}

const UserFormContext = createContext<UserFormContextType | null>(null);

export const UserFormProvider = ({ children }: { children: React.ReactNode }) => {
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

  const [savedFormData, setSavedFormData] =
    useLocalStorageState<UserData | null>("formData", { defaultValue: undefined });

  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const hasSentData = !!savedFormData;

  const addUser = async (userData: Omit<UserData, "id">) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          action: "addUser",
          id: userId,
          ...userData,
        }),
      });
      await response.text();
      setMessage("Success");
      setSavedFormData(userData as UserData);
    } catch (err) {
      setError("Failed to add user");
      console.error("Error adding user:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserEmail = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          action: "updateEmail",
          id: userId,
          emailAddress: email,
        }),
      });
      await response.text();
      setMessage("Updated email");
      if (savedFormData) {
        setSavedFormData({ ...savedFormData, emailAddress: email });
      }
    } catch (err) {
      setError("Failed to update user email");
      console.error("Error updating user email:", err);
    } finally {
      setLoading(false);
    }
  };

  const hasHitSubmissionLimit = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      return data.submissionsCount > 300;
    } catch (error) {
      console.error("Error fetching submission limit:", error);
      return false;
    }
  };

  return (
    <UserFormContext.Provider
      value={{
        userId,
        savedFormData,
        setSavedFormData,
        message,
        loading,
        error,
        hasSentData,
        addUser,
        updateUserEmail,
        hasHitSubmissionLimit,
      }}
    >
      {children}
    </UserFormContext.Provider>
  );
};

export const useUserForm = () => {
  const context = useContext(UserFormContext);
  if (!context) {
    throw new Error("useUserForm must be used within a UserFormProvider");
  }
  return context;
};
