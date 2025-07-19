"use client";

import useCampaignAppStore from "@/storeCampaign";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

function PersonalInfo() {
  const { formData, setPersonalInfo } = useCampaignAppStore();
  const { data: session } = useSession();
  const [error, setError] = useState<string>("");
  const [ initialized, setInitialized ] = useState(false);

  useEffect(() => {
    if (session?.user && !initialized) {
      setPersonalInfo({
        name: session.user.name || "",
        email: session.user.email || "",
      });
      setInitialized(true);
    }
  }, [session, initialized, setPersonalInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setPersonalInfo({ [e.target.name]: e.target.value });
  };

  {/**
  const validateAndNext = () => {
    try {
      personalInfoSchema.parse(formData.personalInfo);
      setError("");
      nextStep();
    } catch (error: any) {
      setError(
        error.errors[0]?.message || "Please fill all teh fields correctly."
      );
    }
  };
   */}

  return (
    <div>
      <h2 className="text-xl font-semibold">Information Personal</h2>
      <div className="mt-5">
        {error && <div className="font-bold text-red-600">*{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className="text-lg font-medium text-gray-900"
            >
              Fullname
            </label>
            <input
              type="text"
              name="name"
              placeholder="Fullname"
              value={formData.personalInfo.name}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm
              rounded-lg block w-full p-2.5"
              required
            />
          </div>
          <div>
            <label
              className="text-lg font-medium text-gray-900"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="john@example.com"
              value={formData.personalInfo.email}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm
              rounded-lg block w-full p-2.5"
              required
            />
          </div>
          <div>
            <label
              className="text-lg font-medium text-gray-900"
            >
              No. Telp (Opsional)
            </label>
            <input
              type="number"
              name="phone"
              placeholder="+620987654321"
              value={formData.personalInfo.phone}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm
              rounded-lg block w-full p-2.5"
              required
              pattern="[+0-9]{10,15}"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalInfo;
