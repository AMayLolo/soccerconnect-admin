import { Shield, Star, Users } from "lucide-react";

export default function ValueProps() {
  const items = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Built for Parents",
      desc: "Designed to help families make confident decisions.",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Trusted Reviews",
      desc: "Real experiences from real players and parents.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Safety Focused",
      desc: "Transparency and accountability for every club.",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-4">
      <div className="grid sm:grid-cols-3 gap-10 text-center">
        {items.map((item) => (
          <div key={item.title} className="space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full">
              {item.icon}
            </div>
            <h3 className="font-semibold text-lg">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
