import { KanbanSquare, Zap, BarChart3, Users, BellRing, Trophy } from "lucide-react";

const features = [
  { name: "Visual Pipeline & Kanban", description: "Drag and drop companies across deal stages. Know exactly where every sponsorship stands at a glance.", icon: KanbanSquare },
  { name: "Smart Follow-up System", description: "Never drop the ball. Get automated reminders for overdue follow-ups and a dedicated 'Pending Today' view.", icon: BellRing },
  { name: "Lightning Fast Speed", description: "Built for speed with optimistic UI and Airtable-like quick adds. Update 10 companies in under 2 minutes.", icon: Zap },
  { name: "Real-time Leaderboards", description: "Gamify your sales. Track deals closed and revenue generated per team member in your organization.", icon: Trophy },
  { name: "Advanced Analytics", description: "View total sponsorship value, in-kind tracking, conversion rates, and funnel metrics in a beautiful dashboard.", icon: BarChart3 },
  { name: "Multi-Org & Role Management", description: "Isolate data securely. Create organizations, assign Admin or Member roles, and manage permissions easily.", icon: Users },
];

export default function FeaturesSection() {
  return (
    <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 inline-block px-3 py-1 rounded-full mb-6">Everything you need</h2>
        <p className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Built for speed and scale</p>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          SponsCRM handles the repetitive work so you can focus on building relationships and securing funds.
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
        <dl className="grid max-w-xl grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.name} className="flex flex-col group rounded-3xl border border-slate-200/60 bg-white/60 p-8 backdrop-blur-sm shadow-sm transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1">
              <dt className="flex items-center gap-x-4 text-lg font-semibold text-slate-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 shadow-inner border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 text-indigo-600">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                {feature.name}
              </dt>
              <dd className="mt-6 flex flex-auto flex-col text-base leading-relaxed text-slate-600">
                <p className="flex-auto">{feature.description}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}