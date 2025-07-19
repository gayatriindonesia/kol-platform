import useJobAppStore from "@/store";

const Circle = ({
  step,
  currentIndex,
}: {
  step: number;
  currentIndex: number;
}) => {
  return (
    <div
      className={`w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center
    rounded-full border-2 sm:border-4 select-none transition-colors duration-300
    ease-in-out delay-300 ${
      step == currentIndex
        ? "text-blue-500 border-blue-500"
        : `${
            step < currentIndex
              ? "bg-white border-gray-300 text-gray-500"
              : "bg-blue-500 border-blue-500 text-white"
          }`
    }
    `}
    >
      {currentIndex}
    </div>
  );
};

function ProgressBar() {
  const { step, getTotalSteps } = useJobAppStore();
  const totalSteps: number = getTotalSteps();
  return (
    <div className="flex mx-auto justify-between mb-6 w-3/4 max-w-2xl">
      {[...Array(totalSteps - 1)].map((_, idx) => (
        <div key={idx} className="flex items-center w-full">
          <Circle step={step} currentIndex={idx + 1} />

          {/* connecting line */}
          <div className="flex-grow h-[2px] sm:h-1 relative">
            <div className="absolute top-0 left-0 h-full w-full bg-gray-300" />

            <div
              className={`absolute top-0 left-0 h-full w-full bg-blue-500
              transition-transform duration-300 ease-in-out origin-left
              transform ${step > idx + 1 ? "scale-x-100" : "scale-x-0"}
              `}
            />
          </div>
        </div>
      ))}
      {/* last circle */}
      <div className="flex items-center w-fit">
        <Circle step={step} currentIndex={totalSteps} />
      </div>
    </div>
  );
}

export default ProgressBar;
