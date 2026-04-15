import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  Building2, 
  Sparkles, 
  KanbanSquare, 
  Zap, 
  BarChart3, 
  Users, 
  BellRing, 
  Trophy,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    name: "Visual Pipeline & Kanban",
    description: "Drag and drop companies across deal stages. Know exactly where every sponsorship stands at a glance.",
    icon: KanbanSquare,
  },
  {
    name: "Smart Follow-up System",
    description: "Never drop the ball. Get automated reminders for overdue follow-ups and a dedicated 'Pending Today' view.",
    icon: BellRing,
  },
  {
    name: "Lightning Fast Speed",
    description: "Built for speed with optimistic UI and Airtable-like quick adds. Update 10 companies in under 2 minutes.",
    icon: Zap,
  },
  {
    name: "Real-time Leaderboards",
    description: "Gamify your sales. Track deals closed and revenue generated per team member in your organization.",
    icon: Trophy,
  },
  {
    name: "Advanced Analytics",
    description: "View total sponsorship value, in-kind tracking, conversion rates, and funnel metrics in a beautiful dashboard.",
    icon: BarChart3,
  },
  {
    name: "Multi-Org & Role Management",
    description: "Isolate data securely. Create organizations, assign Admin or Member roles, and manage permissions easily.",
    icon: Users,
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background with dots and gradient */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      <div className="absolute top-0 z-0 flex w-full justify-center">
        <div className="h-[500px] w-full max-w-[1000px] bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center sm:pt-40">
        <div className="mb-8 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50/50 px-4 py-1.5 text-sm font-medium text-indigo-800 backdrop-blur-sm">
          <Sparkles className="mr-2 h-4 w-4 text-indigo-600" />
          The Ultimate CRM for College Teams
        </div>

        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
          Close sponsorships{" "}
          <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            faster than ever.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
          Replace messy Google Sheets and WhatsApp groups. Track deals, manage your sponsors, and never miss a follow-up right in one dashboard.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button 
            size="lg" 
            className="h-14 gap-2 rounded-full bg-indigo-600 px-8 text-base shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 w-full sm:w-auto"
            onClick={() => navigate("/organization")}
          >
            <Building2 className="h-5 w-5" />
            Create or Join an Organization
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="h-14 gap-2 rounded-full border-slate-200 bg-white/50 backdrop-blur-sm px-8 text-base text-slate-700 hover:bg-slate-50 w-full sm:w-auto"
            onClick={() => navigate("/register")}
          >
            Create an Account
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Dashboard Image with 3D Shadow Effect */}
        <div className="mx-auto mt-20 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:-m-4 lg:rounded-3xl lg:p-4">
            <div className="overflow-hidden rounded-xl bg-white shadow-2xl shadow-indigo-900/20 ring-1 ring-slate-200 transition-transform duration-500 hover:scale-[1.01]">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop"
                alt="SponsCRM Dashboard"
                className="w-full object-cover aspect-[16/9] sm:aspect-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Details Section */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Built for speed and scale</p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            SponsCRM handles the repetitive work so you can focus on building relationships and securing funds.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10">
                    <feature.icon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Speed Comparison Section */}
      <div className="relative z-10 bg-slate-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                   Outperform Google Sheets
                </h2>
                <p className="mt-6 text-lg leading-8 text-slate-600">
                  Stop scrolling through endless rows and columns to find who to email today. 
                  Our streamlined UI is designed to reduce friction and eliminate data entry errors.
                </p>
                <dl className="mt-8 max-w-xl space-y-6 text-base leading-7 text-slate-600 lg:max-w-none">
                  {[
                    "View assigned companies tailored just for you.",
                    "Quick status updates with a single click.",
                    "Instantly filter by domain (e.g., EdTech, Fintech).",
                    "Export beautifully formatted reports in seconds."
                  ].map((benefit) => (
                    <div key={benefit} className="relative pl-9">
                      <dt className="inline font-semibold text-slate-900">
                        <CheckCircle2 className="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                      </dt>
                      <dd className="inline">{benefit}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
                  <div className="absolute -top-4 -right-4 rounded-full bg-purple-100 p-3 text-purple-600 shadow-sm ring-1 ring-purple-200">
                     <Zap className="h-6 w-6" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-1/3 rounded bg-slate-200"></div>
                    <div className="h-10 w-full rounded-md bg-slate-50 border border-slate-100"></div>
                    <div className="h-10 w-full rounded-md bg-slate-50 border border-slate-100"></div>
                    <div className="h-10 w-full rounded-md bg-indigo-50 border border-indigo-100 relative overflow-hidden">
                       <div className="absolute inset-0 bg-indigo-100 w-2/3"></div>
                    </div>
                    <div className="h-10 w-full rounded-md bg-slate-50 border border-slate-100"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Block */}
      <div className="relative isolate z-10 mt-16 px-6 py-24 text-center sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 opacity-90"></div>
        <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=2800&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        
        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to scale your sponsorship pipeline?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-indigo-100">
          Join high-performing college teams managing thousands of dollars in deals every day.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button 
            size="lg" 
            className="h-14 rounded-full bg-white px-8 text-base text-indigo-600 hover:bg-slate-50 shadow-xl"
            onClick={() => navigate("/organization")}
          >
            Get Started for Free
          </Button>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-10 text-center text-slate-500">
        <p className="text-sm">© {new Date().getFullYear()} SponsCRM. Designed for top-tier college teams.</p>
      </footer>
    </div>
  );
}