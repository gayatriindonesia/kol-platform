"use client";

import useJobAppStore from "@/store";
import { experienceinfoSchema, Experiences } from "@/validationSchema";
import { useState } from "react";

function ExperienceInfo() {
  const { nextStep, prevStep, formData, setExperienceInfo } = useJobAppStore();
  const [error, setError] = useState<string>("");

  const handleExperienceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const { name, value } = e.target;

    const updatedExperiences = [...formData.experienceInfo.experiences!];

    updatedExperiences[idx] = {
      ...updatedExperiences[idx],
      [name]: value,
    };

    setExperienceInfo({
      experiences: updatedExperiences,
    });
  };

  const addExperience = () => {
    const newExperience = {
      numberOfYears: "",
      companyName: "",
      description: "",
    };

    const updatedExperience = [
      ...formData.experienceInfo.experiences!,
      newExperience,
    ];

    setExperienceInfo({
      experiences: updatedExperience,
    });
  };

  const removeExperience = (idx: number) => {
    setError("");
    const currentExperience = [...formData.experienceInfo.experiences!];
    const newExperience: Experiences = [];

    currentExperience.filter((e) => {
      if (e.companyName != currentExperience[idx].companyName) {
        newExperience.push(e);
      }
    });
    setExperienceInfo({
      experiences: newExperience,
    });
  };

  const validateAndNext = () => {
    try {
      experienceinfoSchema.parse(formData.experienceInfo);
      setError("");
      nextStep();
    } catch (error: any) {
      setError(
        error.errors[0]?.message ||
          "Please fill in the experience field correctly."
      );
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold">Experience Information</h2>
      <div className="mt-5">
        {error && <div className="font-bold text-red-600">*{error}</div>}
        <div>
          <label
            className="text-lg font-medium text-gray-900"
            htmlFor="fresher"
          >
            Are you a fresher?
          </label>
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              name="fresher"
              checked={formData.experienceInfo.fresher}
              onChange={() => {
                const isFresher = !formData.experienceInfo.fresher;
                setError("");
                setExperienceInfo({
                  fresher: isFresher,
                  experiences: [],
                });
              }}
              className="h-4 w-4 text-blue-600 bg-gray-300 ruonded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Yes, I am a fresher
            </span>
          </div>
        </div>
        {!formData.experienceInfo.fresher && (
          <div>
            {formData.experienceInfo.experiences?.map((experience, idx) => (
              <div
                key={idx}
                className="grid gap-6 mb-6 mt-2 md:grid-cols-2 border-gray-300 rounded-lg"
              >
                <div>
                  <label
                    className="text-lg font-medium text-gray-900"
                    htmlFor="numberOfYears"
                  >
                    Number of Years
                  </label>
                  <input
                    type="number"
                    min={1}
                    name="numberOfYears"
                    placeholder="Number Of Years"
                    value={experience.numberOfYears}
                    onChange={(e) => handleExperienceChange(e, idx)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm
              rounded-lg block w-full p-2.5"
                    required
                  />
                </div>
                <div>
                  <label
                    className="text-lg font-medium text-gray-900"
                    htmlFor="companyName"
                  >
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    placeholder="Name of the Company"
                    value={experience.companyName}
                    onChange={(e) => handleExperienceChange(e, idx)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm
              rounded-lg block w-full p-2.5"
                    required
                  />
                </div>
                <div>
                  <label
                    className="text-lg font-medium text-gray-900"
                    htmlFor="description"
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    placeholder="About your experience"
                    value={experience.description}
                    onChange={(e) => handleExperienceChange(e, idx)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm
              rounded-lg block w-full p-2.5"
                    required
                  />
                </div>
                <div className="flex justify-center items-end">
                  <button
                    className="text-white bg-blue-500 px-3 py-1 rounded-lg text-lg sm:text-xl"
                    onClick={() => removeExperience(idx)}
                  >
                    Remove Experience
                  </button>
                </div>
              </div>
            ))}

            <button
              className="text-white bg-blue-500 px-3 py-1 rounded-lg text-lg sm:text-xl"
              onClick={addExperience}
            >
              Add More Experience
            </button>
          </div>
        )}
      </div>
      {/* buttons */}
      <div className="flex justify-between mt-5">
        <button className="text-blue-500 text-lg sm:text-xl" onClick={prevStep}>
          {"\u2190"} Previous
        </button>
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

export default ExperienceInfo;
