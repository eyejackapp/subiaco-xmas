import { useState } from 'preact/hooks';
import { ChangeEvent, FormEvent } from 'preact/compat';
import useUserManager from '@/hooks/useUserManager';
import { update } from 'three/examples/jsm/libs/tween.module';

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

interface UserFormProps {
  onSuccess?: (message: string) => void;
  buttonText?: string;
}

export const UserForm = ({ onSuccess, buttonText = 'Add User' }: UserFormProps) => {
  const { addUser, message, loading, error, updateUserEmail, updating } = useUserManager();
  const [formData, setFormData] = useState<UserFormData>({
    date: new Date().toLocaleDateString(),
    fullName: 'beth',
    postcode: '2050',
    emailAddress: 'beth@test.com',
    phone: '04',
    hearSource: 'socials',
    visitedBusinesses: 'yes',
    encouragedExplore: 'yes',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await addUser(formData);
    if (onSuccess && result) onSuccess(result);
  };

  const handleUserEmailUpdate = async () => {
    const result = await updateUserEmail(formData.emailAddress);
    if (onSuccess && result) onSuccess(result);

  }

  return (
    <div className="bg-white p-6 max-w-lg mx-auto rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Add New User</h1>
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
          {loading ? 'Adding...' : buttonText}
        </button>
      </form>

      <button
        disabled={updating}
        onClick={handleUserEmailUpdate}
        className="w-full mt-4 p-2 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 disabled:bg-gray-400"
      >
        {updating ? 'Updating...' : 'Update Email'}
      </button>

      {/* Status Messages */}
      {loading && <p className="mt-4 text-blue-500">Processing...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {message && <p className="mt-4 text-green-500">{message}</p>}
    </div>
  );
}

export default UserForm;
