import { useState } from "preact/hooks";
import { ChangeEvent, FormEvent } from "preact/compat";
import { FadeTransition } from "./Transitions";
import { Spinner } from "./Spinner";
import { useLocalStorageState } from "ahooks";
import { useMount } from "@/hooks/useMount";
import { useAppState } from "@/hooks/useAppState";
import { useUserForm } from "@/hooks/useUserForm";

interface UserFormData {
  date: string;
  fullName: string;
  postcode: string;
  emailAddress: string;
  phone: string;
  hearSource: string;
  visitedBusinesses: string;
  encouragedExplore: string;
}

export const UserForm = () => {
  const {
    addUser,
    message,
    loading,
    error,
    updateUserEmail,
    hasHitSubmissionLimit,
    savedFormData
  } = useUserForm();
  const [limitReached, setLimitReached] = useState<boolean>(false);
  const [loadingForm, setLoadingForm] = useState(false);

  const { setIsSurveyOpen, setShowThankYouModal } = useAppState();

  const getLocalTime = () => {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat("en-AU", {
      timeZone: "Australia/Perth",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return formatter.format(now);
  };

  const [formData, setFormData] = useState<UserFormData>(() => {
    return savedFormData
      ? savedFormData
      : {
        date: getLocalTime(),
        fullName: "",
        postcode: "",
        emailAddress: "",
        phone: "",
        hearSource: "",
        visitedBusinesses: "",
        encouragedExplore: "",
      };
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (savedFormData) {
      await handleUpdateData()
    } else {
      await addUser(formData);
      setShowThankYouModal(true);
    }
    setIsSurveyOpen(false);
  };

  const handleUpdateData = async () => {
    await updateUserEmail(formData.emailAddress);
  };

  useMount(() => {
    const checkSubmissionLimit = async () => {
      try {
        setLoadingForm(true);
        const isLimitReached = await hasHitSubmissionLimit();
        if (isLimitReached) {
          setLimitReached(isLimitReached);
        }
      } catch (error) {
        console.error("Error loading form", error);
      } finally {
        setLoadingForm(false);
      }
    };

    checkSubmissionLimit();
  });

  if (loadingForm) {
    return (
      <FadeTransition show={loadingForm}>
        <div className="absolute inset-0 z-10 bg-gray-500">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2">
            <Spinner />
          </div>
        </div>
      </FadeTransition>
    );
  }

  return (
    <div className="bg-white p-6 max-w-lg mx-auto rounded-lg shadow-md relative">
      <button onClick={() => setIsSurveyOpen(false)} className="absolute top-4 right-2 text-black">Close</button>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        {limitReached ? "Different Form" : "User Form"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          name="postcode"
          placeholder="Postcode"
          value={formData.postcode}
          onChange={handleChange}
          className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
        />
        <input
          type="email"
          name="emailAddress"
          placeholder="Email Address"
          value={formData.emailAddress}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          name="hearSource"
          placeholder="How did you hear?"
          value={formData.hearSource}
          onChange={handleChange}
          className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          name="visitedBusinesses"
          placeholder="Did you visit any businesses?"
          value={formData.visitedBusinesses}
          onChange={handleChange}
          className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          name="encouragedExplore"
          placeholder="Did the trail encourage you to explore?"
          value={formData.encouragedExplore}
          onChange={handleChange}
          className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Adding..." : savedFormData ? "Update" : "Send"}
        </button>
      </form>
      {/* Status Messages */}
      {loading && <p className="mt-4 text-blue-500">Processing...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {message && <p className="mt-4 text-green-500">{message}</p>}
    </div>
  );
};

export default UserForm;
