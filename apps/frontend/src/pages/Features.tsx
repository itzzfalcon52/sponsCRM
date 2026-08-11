import { 
    BarChart3, 
    
    Zap, 
    Users, 
    LayoutGrid, 
   
    TrendingUp,
    
  } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { useNavigate } from "react-router-dom";
  
  export default function FeaturesPage() {
    const navigate = useNavigate();
  
    return (
      <div className="bg-[#fcfcfd] min-h-screen">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 px-6 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent -z-10" />
          <div className="container mx-auto text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest mb-8 animate-bounce">
              <Zap className="h-3 w-3 fill-indigo-700" /> New: Weighted Forecasting
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-8">
              The CRM built for <span className="text-indigo-600">Sponsorship</span> high-performers.
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10">
              Stop losing potential deals in messy spreadsheets. SponsCRM centralizes your pipeline, 
              automates follow-ups, and gives you bank-grade financial projections.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Button onClick={() => navigate('/register')} size="lg" className="h-14 px-8 rounded-2xl bg-indigo-600 font-bold text-lg shadow-xl shadow-indigo-200 hover:scale-105 transition-all">
                  Start Scaling Now
               </Button>
               <Button variant="ghost" size="lg" className="h-14 px-8 rounded-2xl font-bold text-slate-600">
                  View Live Demo
               </Button>
            </div>
          </div>
        </section>
  
        {/* Feature 1: The Pipeline */}
        <section className="py-24 container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xl border border-slate-100">
                      <LayoutGrid className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                      Visual Pipeline Management. <br />
                      <span className="text-slate-400">Zero Friction.</span>
                  </h2>
                  <p className="text-lg text-slate-600 font-medium">
                      Our high-velocity Kanban board allows you to drag deals across stages in real-time. 
                      Monitor deal health at a glance and never let a hot lead go cold.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                      {[
                          "Instant Drag & Drop",
                          "Stage-based Probabilities",
                          "Unlimited Lead Storage",
                          "Custom Status Mapping"
                      ].map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" /> {item}
                          </div>
                      ))}
                  </div>
              </div>
              <div className="bg-white rounded-3xl p-4 shadow-2xl border border-slate-100 rotate-2">
                  <div className="aspect-video rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center group overflow-hidden relative">
                      <img 
                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
                        className="absolute inset-0 object-cover opacity-20 group-hover:scale-110 transition-transform duration-700" 
                        alt="Pipeline"
                      />
                      <span className="relative z-10 text-xs font-black uppercase tracking-widest text-slate-400">Pipeline Visualization</span>
                  </div>
              </div>
          </div>
        </section>
  
        {/* Bento Grid: More Features */}
        <section className="py-24 bg-slate-900">
          <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-white text-4xl font-black mb-4">Precision Engineering for Sales</h2>
                  <p className="text-slate-400 font-medium">Small features that provide massive competitive advantages.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                      <BarChart3 className="h-10 w-10 text-emerald-400 mb-6" />
                      <h3 className="text-white text-xl font-bold mb-2">Weighted Projections</h3>
                      <p className="text-slate-400 text-sm">Automated financial forecasting based on your unique stage conversion probabilities.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                      <Users className="h-10 w-10 text-indigo-400 mb-6" />
                      <h3 className="text-white text-xl font-bold mb-2">Team Collaboration</h3>
                      <p className="text-slate-400 text-sm">Assign leads, track member activity, and gamify your outreach with leaderboards.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                      <TrendingUp className="h-10 w-10 text-purple-400 mb-6" />
                      <h3 className="text-white text-xl font-bold mb-2">Activity Logging</h3>
                      <p className="text-slate-400 text-sm">Every call and email logged instantly. Keep a permanent trail of your deal history.</p>
                  </div>
              </div>
          </div>
        </section>
  
        {/* CTA Section */}
        <section className="py-32 text-center px-6">
            <div className="max-w-3xl mx-auto bg-indigo-600 rounded-[3rem] p-12 shadow-2xl shadow-indigo-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                <h2 className="text-4xl font-black text-white mb-6">Ready to upgrade your workflow?</h2>
                <Button onClick={() => navigate('/register')} className="bg-white text-indigo-600 h-14 px-10 rounded-2xl font-black text-lg hover:bg-slate-100 shadow-xl">
                    Get Started for Free
                </Button>
            </div>
        </section>
      </div>
    );
  }