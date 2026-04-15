import { ArrowRight, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center sm:pt-40 lg:pt-48">
      <div className="mb-8 inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-50/50 px-4 py-1.5 text-sm font-medium text-indigo-700 backdrop-blur-md shadow-sm transition-transform hover:scale-105 cursor-default">
        <Sparkles className="mr-2 h-4 w-4 text-indigo-500" />
        The Ultimate CRM for College Teams
      </div>

      <h1 className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tighter text-slate-900 sm:text-7xl lg:text-[5rem] leading-[1.1]">
        Close sponsorships{" "}
        <span className="block mt-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          faster than ever.
        </span>
      </h1>

      <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-600 sm:text-xl leading-relaxed">
        Replace messy Google Sheets and WhatsApp groups. Track deals, manage your sponsors, and never miss a follow-up right in one master dashboard.
      </p>

      <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row w-full sm:w-auto">
        <Button 
          size="lg" 
          className="h-14 gap-2 rounded-full bg-slate-900 px-8 text-base font-semibold text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
          onClick={() => navigate("/organization")}
        >
          <Building2 className="h-5 w-5 opacity-80" />
          Create or Join an Organization
        </Button>
        
        <Button 
          variant="outline" 
          size="lg"
          className="h-14 gap-2 rounded-full border-slate-200 bg-white/80 backdrop-blur-md px-8 text-base font-medium text-slate-700 hover:bg-white hover:text-slate-900 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
          onClick={() => navigate("/register")}
        >
          Create an Account
          <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      <div className="mx-auto mt-24 max-w-6xl px-4 sm:px-6 lg:px-8 w-full group perspective-1000">
        <div className="relative rounded-2xl bg-slate-900/5 p-2 ring-1 ring-inset ring-slate-900/10 lg:rounded-3xl lg:p-3 shadow-2xl shadow-indigo-900/10 transition-transform duration-700 hover:rotate-x-1 hover:scale-[1.02]">
          <div className="overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-200 flex flex-col">
            <div className="h-10 w-full border-b border-slate-100 bg-slate-50 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-rose-400/80"></div>
                <div className="h-3 w-3 rounded-full bg-amber-400/80"></div>
                <div className="h-3 w-3 rounded-full bg-emerald-400/80"></div>
              </div>
              <div className="mx-auto h-5 w-48 rounded bg-white shadow-sm ring-1 ring-slate-900/5"></div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940&auto=format&fit=crop"
              alt="SponsCRM Dashboard"
              className="w-full object-cover aspect-[16/9] sm:aspect-[21/9] lg:aspect-[2.4/1] opacity-95 grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent mix-blend-overlay"></div>
          </div>
        </div>
      </div>
    </div>
  );
}