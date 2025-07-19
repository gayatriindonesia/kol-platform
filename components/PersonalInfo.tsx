"use client";

import useJobAppStore from "@/store";
import { personalInfoSchema } from "@/validationSchema";
import { useState } from "react";

function PersonalInfo() {
  const { nextStep, formData, setPersonalInfo } = useJobAppStore();
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setPersonalInfo({ [e.target.name]: e.target.value });
  };

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

  return (
    <div>
      <h2 className="text-xl font-semibold">Personal Information</h2>
      <div className="mt-5">
        {error && <div className="font-bold text-red-600">*{error}</div>}
        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label
              className="text-lg font-medium text-gray-900"
              htmlFor="firstName"
            >
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.personalInfo.firstName}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm
              rounded-lg block w-full p-2.5"
              required
            />
          </div>
          <div>
            <label
              className="text-lg font-medium text-gray-900"
              htmlFor="lastName"
            >
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.personalInfo.lastName}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm
              rounded-lg block w-full p-2.5"
              required
            />
          </div>
          <div>
            <label
              className="text-lg font-medium text-gray-900"
              htmlFor="phone"
            >
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              placeholder="1234567890"
              value={formData.personalInfo.phone}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm
              rounded-lg block w-full p-2.5"
              required
            />
          </div>
          <div>
            <label
              className="text-lg font-medium text-gray-900"
              htmlFor="email"
            >
              Email address
            </label>
            <input
              type="email"
              name="email"
              placeholder="mike@example.com"
              value={formData.personalInfo.email}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm
              rounded-lg block w-full p-2.5"
              required
            />
          </div>
        </div>
      </div>
      {/* buttons */}
      <div className="flex justify-end mt-5">
        <button
          className="text-white bg-blue-500 px-3 py-1 rounded-lg text-lg sm:text-xl"
          onClick={validateAndNext}
        >
          Next {"\u2192"}
        </button>
      </div>
    </div>
  );
}

export default PersonalInfo;
