interface FormProgressProps {
  currentStep: number
}

export default function FormProgress({ currentStep }: FormProgressProps) {
  const steps = [
    { id: 1, title: "Contact Information" },
    { id: 2, title: "Expectations" },
    { id: 3, title: "Bio, Skills & Documents" },
  ]

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-zinc-100 -z-10" />

        {steps.map((step) => {
          const isActive = currentStep >= step.id
          return (
            <div key={step.id} className="flex items-center gap-2 bg-white px-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 text-zinc-400 border border-zinc-200"
                }`}
              >
                {step.id}
              </span>
              <span
                className={`text-xs font-semibold hidden sm:inline ${
                  isActive ? "text-zinc-900" : "text-zinc-400"
                }`}
              >
                {step.title}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}