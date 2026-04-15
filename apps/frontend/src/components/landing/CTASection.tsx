import { Button } from "@/components/ui/button";

export default function CTASection({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="relative isolate mt-0 text-center">
      <div className="px-6 py-24 sm:py-32 lg:px-8 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[800px] bg-indigo-600/30 rounded-full blur-[120px] opacity-70"></div>
        </div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=2800&auto=format&fit=crop')] opacity-5 bg-cover bg-center mix-blend-overlay pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Ready to scale your sponsorship pipeline?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Join high-performing college teams managing thousands of dollars in deals every day.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button 
              size="lg" 
              className="h-14 rounded-full bg-white px-10 text-base font-semibold text-slate-900 hover:bg-slate-100 hover:scale-105 transition-all shadow-xl shadow-white/10"
              onClick={() => navigate("/organization")}
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}