"use client";

import useJobAppStore from "@/store";
import { educationBackgroundSchema, Educations } from "@/validationSchema";
import { useState } from "react";

function EducationBackground() {
  const { nextStep, prevStep, formData, setEducationBackground } =
    useJobAppStore();
  const [error, setError] = useState<string>("");

  const handleEducationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const { name, value } = e.target;

    const updatedEducations = [...formData.educationBackground.educations];

    updatedEducations[idx] = {
      ...updatedEducations[idx],
      [name]: value,
    };

    setEducationBackground({
      educations: updatedEducations,
    });
  };

  const addEducation = () => {
    const newEducation = {
      courseName: "",
      schoolName: "",
      yearOfCompletion: "",
    };

    const updatedEducations = [
      ...formData.educationBackground.educations,
      newEducation,
    ];

    setEducationBackground({
      educations: updatedEducations,
    });
  };

  const removeEducation = (idx: number) => {
    setError("");
    const currentEducations = [...formData.educationBackground.educations];
    const newEducations: Educations = [];

    currentEducations.filter((e) => {
      if (e.courseName != currentEducations[idx].courseName) {
        newEducations.push(e);
      }
    });
    setEducationBackground({
      educations: newEducations,
    });
  };

  const validateAndNext = () => {
    try {
      educationBackgroundSchema.parse(formData.educationBackground);
      setError("");
      nextStep();
    } catch (error: any) {
      setError(
        error.errors[0]?.message ||
          "Please fill in the educations field correctly."
      );
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold">Education Background</h2>
      <div className="mt-5">
        {error && <div className="font-bold text-red-600">*{error}</div>}
        <div>
          {formData.educationBackground.educations?.map((education, idx) => (
            <div
              key={idx}
              className="grid gap-6 mb-6 mt-2 md:grid-cols-2 border-gray-300 rounded-lg"
            >
              <div>
                <label
                  className="text-lg font-medium text-gray-900"
                  htmlFor="courseName"
                >
                  CourseName
                </label>
                <input
                  type="text"
                  name="courseName"
                  placeholder="Course Name"
                  value={education.courseName}
                  onChange={(e) => handleEducationChange(e, idx)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm
              rounded-lg block w-full p-2.5"
                  required
                />
              </div>
              <div>
                <label
                  className="text-lg font-medium text-gray-900"
                  htmlFor="schoolName"
                >
                  School Name
                </label>
                <input
                  type="text"
                  name="schoolName"
                  placeholder="School Name"
                  value={education.schoolName}
                  onChange={(e) => handleEducationChange(e, idx)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm
              rounded-lg block w-full p-2.5"
                  required
                />
              </div>
              <div>
                <label
                  className="text-lg font-medium text-gray-900"
                  htmlFor="yearOfCompletion"
                >
                  Year Of Completion
                </label>
                <input
                  type="text"
                  name="yearOfCompletion"
                  placeholder="YYYY"
                  value={education.yearOfCompletion}
                  onChange={(e) => handleEducationChange(e, idx)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm
              rounded-lg block w-full p-2.5"
                  required
                />
              </div>
              <div className="flex justify-center items-end">
                <button
                  className="text-white bg-blue-500 px-3 py-1 rounded-lg text-lg sm:text-xl"
                  onClick={() => removeEducation(idx)}
                >
                  Remove Education
                </button>
              </div>
            </div>
          ))}

          <button
            className="text-white bg-blue-500 px-3 py-1 rounded-lg text-lg sm:text-xl"
            onClick={addEducation}
          >
            Add More Education
          </button>
        </div>
      </div>
      <div className="flex justify-between mt-5">
        <button
          className="text--blue-500 text-lg sm:text-xl"
          onClick={prevStep}
        >
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

export default EducationBackground;
