import { Search, Star, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "1. Search",
      desc: "Find clubs near you by name or city.",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "2. Review",
      desc: "Read honest feedback from families and players.",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "3. Choose",
      desc: "Feel confident in your decision.",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-semibold text-center mb-10">
        How It Works
      </h2>

      <div className="grid sm:grid-cols-3 gap-10 text-center">
        {steps.map((step) => (
          <div key={step.title} className="space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full">
              {step.icon}
            </div>
            <h3 className="font-semibold text-lg">{step.title}</h3>
            <p className="text-gray-600 text-sm">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
