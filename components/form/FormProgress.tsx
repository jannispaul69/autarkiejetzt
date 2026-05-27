"use client";

interface Props {
  currentStep: number;
  totalSteps: number;
}

export default function FormProgress({ currentStep, totalSteps }: Props) {
  return (
    <div
      className="flex gap-1"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Schritt ${currentStep} von ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={[
            "h-1.5 flex-1 rounded-full transition-colors duration-300",
            i < currentStep ? "bg-brand-primary" : "bg-brand-border",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
