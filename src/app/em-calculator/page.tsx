import { EMCalculatorForm } from "@/components/EMCalculatorForm";

export default function EMCalculatorPage() {
  return (
    <div className="bg-bg px-8 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl">E/M Level Calculator</h1>
        <p className="mt-2 mb-8 text-sm text-text-secondary">
          Calculate the correct Evaluation & Management code based on MDM
          elements or total time. Based on 2021+ AMA/CMS E/M guidelines.
        </p>
        <EMCalculatorForm />
      </div>
    </div>
  );
}
