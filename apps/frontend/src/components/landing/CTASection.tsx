import { Button } from "@/components/ui/button";

export default function CTASection({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="relative isolate mt-0 text-center overflow-hidden">
      <div className="px-6 py-24 sm:py-32 lg:px-8 bg-slate-950 relative">
        
        {/* Animated Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-[url('')] opacity-20 bg-cover bg-center mix-blend-lighten pointer-events-none scale-110 animate-pulse duration-[5000ms]"
          style={{ transition: 'transform 10s ease-in-out' }}
        ></div>

        {/* Dynamic Glow Orbs */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] absolute -top-24 -left-24"></div>
          <div className="w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] absolute -bottom-24 -right-24"></div>
        </div>
        
        <div className="relative z-10">
          <h2 className="mx-auto max-w-3xl text-4xl font-black tracking-tight text-white sm:text-6xl">
            Scale your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">sponsorship</span> pipeline
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg font-medium leading-8 text-slate-400">
            Join 500+ high-performing college teams and event organizers managing high-value sponsorship deals with ease.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="h-14 rounded-2xl bg-indigo-600 px-10 text-base font-bold text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-indigo-500/20 border border-indigo-400/20"
              onClick={() => navigate("/organization")}
            >
              Get Started for Free
            </Button>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800 backdrop-blur-md">
                No credit card required
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}