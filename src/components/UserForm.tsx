import { useState } from "preact/hooks";
import { ChangeEvent, FormEvent } from "preact/compat";
import { useAppState } from "@/hooks/useAppState";
import { useUserForm } from "@/hooks/useUserForm";
import clsx from "clsx";
import { Spinner } from "./Spinner";

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
    loading,
    error,
    updateUserFields,
    savedFormData,
  } = useUserForm();

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

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const validateField = (name: string, value: string) => {
    let error = "";
    if (name === "fullName") {
      if (!value.trim()) {
        error = "Full Name is required.";
      } else if (!/^[A-Za-z\s]+$/.test(value)) {
        error = "Full Name must contain only letters.";
      }
    }
    if (name === "postcode") {
      if (!value.trim()) {
        error = "Postcode is required.";
      } else if (!/^\d+$/.test(value)) {
        error = "Postcode must contain only numbers.";
      }
    }
    if (name === "emailAddress") {
      if (!value.trim()) {
        error = "Email Address is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = "Enter a valid email address.";
      }
    }
    if (name === "phone") {
      if (!value.trim()) {
        error = "Contact Number is required.";
      } else if (!/^\d+$/.test(value)) {
        error = "Contact Number must contain only numbers.";
      }
    }
    return error;
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};
    let valid = true;

    Object.entries(formData).forEach(([key, value]) => {
      const fieldError = validateField(key, value);
      if (fieldError) {
        newErrors[key as keyof UserFormData] = fieldError;
        valid = false;
      }
    });

    setErrors(newErrors);
    setIsFormValid(valid);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    setIsFormValid(
      Object.values({ ...errors, [name]: "" }).every((err) => !err)
    );
  };

  const handleBlur = (e: FocusEvent) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    setIsFormValid(Object.values({ ...errors, [name]: error }).every((err) => !err));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    validateForm();
    if (!isFormValid) return;
    if (savedFormData) {
      await handleUpdateData();
    } else {
      await addUser(formData);
      setShowThankYouModal(true);
    }
    setIsSurveyOpen(false);
  };

  const handleUpdateData = async () => {
    const updates = Object.entries(formData).reduce((acc, [key, value]) => {
      if (savedFormData && value !== savedFormData[key as keyof UserFormData]) {
        acc[key as keyof UserFormData] = value;
      }
      return acc;
    }, {} as Partial<UserFormData>);
    if (Object.keys(updates).length === 0) {
      return;
    }
    try {
      await updateUserFields(updates);
    } catch (err) {
      console.error("Failed to update user data:", err);
    }
  };

  return (
    <div className="px-6 py-12 max-w-[360px] w-full h-full relative bg-[#EA81A4] overflow-y-scroll">
      <button
        onClick={() => setIsSurveyOpen(false)}
        className="absolute top-4 right-2 text-black"
      >
        <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle opacity="0.1" cx="16.5" cy="16.5" r="16.5" fill="white" />
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12.6291 11.3033C12.263 10.9372 11.6694 10.9372 11.3033 11.3033C10.9372 11.6694 10.9372 12.263 11.3033 12.6292L15.2808 16.6066L11.3033 20.5841C10.9372 20.9502 10.9372 21.5438 11.3033 21.9099C11.6694 22.276 12.263 22.276 12.6291 21.9099L16.6066 17.9325L20.5841 21.9099C20.9502 22.276 21.5438 22.276 21.9099 21.9099C22.276 21.5438 22.276 20.9502 21.9099 20.5841L17.9324 16.6066L21.9099 12.6292C22.276 12.263 22.276 11.6694 21.9099 11.3033C21.5438 10.9372 20.9502 10.9372 20.5841 11.3033L16.6066 15.2808L12.6291 11.3033Z" fill="white" />
        </svg>
      </button>
      <h2 className="text-2xl font-secondary-sans mb-4 text-center">
        Enter your details<br />TO CLAIM YOUR PRIZE!
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col items-center text-white text-[13px] leading-[16px]">
        <div className="relative pb-5 w-full">
          <label htmlFor="fullName">Full Name*</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={clsx("w-full p-3 border rounded-[3px] bg-[#EA81A4] focus:outline-none focus:border-gray-300 mt-1", {
              "border-[#FF454A] bg-[#FF454A] bg-opacity-10": errors.fullName,
            })} />
          {errors.fullName && <p className=" text-[#FF454A] text-xs font-bold pt-1">{errors.fullName}</p>}
        </div>
        <div className="relative pb-5 w-full">
          <label htmlFor="postcode">Postcode*</label>
          <input
            type="text"
            name="postcode"
            value={formData.postcode}
            onChange={handleChange}
            onBlur={handleBlur}
            className={clsx("w-full p-3 border rounded-[3px] bg-[#EA81A4] focus:outline-none focus:border-gray-300 mt-1", {
              "border-[#FF454A] bg-[#FF454A] bg-opacity-10": errors.postcode,
            })} required
          />
          {errors.postcode && <p className="text-[#FF454A] text-xs font-bold pt-1">{errors.postcode}</p>}
        </div>
        <div className="relative pb-5 w-full">

          <label htmlFor="emailAddress">Email Address*</label>
          <input
            type="email"
            name="emailAddress"
            value={formData.emailAddress}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={clsx("w-full p-3 border rounded-[3px] bg-[#EA81A4] focus:outline-none focus:border-gray-300 mt-1", {
              "border-[#FF454A] bg-[#FF454A] bg-opacity-10": errors.emailAddress,
            })}
          />
          {errors.emailAddress && <p className="text-[#FF454A] text-xs font-bold pt-1">{errors.emailAddress}</p>}
        </div>
        <div className="relative pb-5 w-full">

          <label htmlFor="phone">Contact Number*</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={clsx("w-full p-3 border rounded-[3px] bg-[#EA81A4] focus:outline-none focus:border-gray-300 mt-1", {
              "border-[#FF454A] bg-[#FF454A] bg-opacity-10": errors.phone,
            })} />
          {errors.phone && <p className="text-[#FF454A] text-xs font-bold pt-1">{errors.phone}</p>}
        </div>

        <div className="relative mb-5">
          <label htmlFor="hearSource">How did you rate the Subiaco Twilight Trail?</label>
          <select
            name="hearSource"
            value={formData.hearSource}
            onChange={handleChange}
            className="w-full p-3 border rounded-[3px] bg-[#EA81A4] focus:outline-none focus:border-gray-300 appearance-none  mt-1"
          >
            {[...Array(10)].map((_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
          <svg className="absolute right-3 bottom-[18px] pointer-events-none" width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.37622 8.40688C5.99629 9.09766 5.00371 9.09766 4.62378 8.40688L0.815055 1.48192C0.448505 0.815465 0.930668 0 1.69127 0L9.30873 0C10.0693 0 10.5515 0.815466 10.1849 1.48192L6.37622 8.40688Z" fill="#FAEFD5" />
          </svg>
        </div>

        <div className="relative mb-5">
          <label htmlFor="visitedBusinesses">
            Did you visit any businesses while you were on the trail?
          </label>
          <select
            name="visitedBusinesses"
            value={formData.visitedBusinesses}
            onChange={handleChange}
            className="w-full p-3 border rounded-[3px] bg-[#EA81A4] focus:outline-none focus:border-gray-300 appearance-none mt-1"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <svg className="absolute right-3 bottom-[18px] pointer-events-none" width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.37622 8.40688C5.99629 9.09766 5.00371 9.09766 4.62378 8.40688L0.815055 1.48192C0.448505 0.815465 0.930668 0 1.69127 0L9.30873 0C10.0693 0 10.5515 0.815466 10.1849 1.48192L6.37622 8.40688Z" fill="#FAEFD5" />
          </svg>
        </div>

        <div className="relative mb-5">
          <label htmlFor="encouragedExplore">
            Did the trail encourage you to explore any new businesses you've not been to before?
          </label>
          <select
            name="encouragedExplore"
            value={formData.encouragedExplore}
            onChange={handleChange}
            className="w-full p-3 border rounded-[3px] bg-[#EA81A4] focus:outline-none focus:border-gray-300 appearance-none mt-1"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <svg className="absolute right-3 bottom-[18px] transform pointer-events-none" width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.37622 8.40688C5.99629 9.09766 5.00371 9.09766 4.62378 8.40688L0.815055 1.48192C0.448505 0.815465 0.930668 0 1.69127 0L9.30873 0C10.0693 0 10.5515 0.815466 10.1849 1.48192L6.37622 8.40688Z" fill="#FAEFD5" />
          </svg>
        </div>
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={clsx("px-4 py-2 border-white border-2 max-w-[220px] xs:max-w-[240px] h-12 xs:h-14 w-full text-white rounded-full font-secondary-sans text-base xs:text-lg", {
            "opacity-50 cursor-not-allowed": !isFormValid || loading,
          })}
        >
          {loading ? <span className="block h-full w-full pt-[2px]"><div className=" absolute left-1/2 -translate-x-1/2"><Spinner size="md" className="" /></div></span> :
            <span className="block pt-[2px]">
              {savedFormData ? "Update" : "Send"}
            </span>
          }

        </button>
      </form>

      {error && <p className="mt-4 text-[#FF454A]">{error}</p>}
    </div>
  );
};

export default UserForm;

