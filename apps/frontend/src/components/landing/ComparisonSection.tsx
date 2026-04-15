import { Zap, CheckCircle2 } from "lucide-react";

export default function ComparisonSection() {
  return (
    <div className="relative z-10 bg-white border-y border-slate-100 py-24 sm:py-32 overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
          <div className="grid grid-cols-1 gap-x-12 gap-y-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                 Outperform Google Sheets
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                Stop scrolling through endless rows and columns to find who to email today. 
                Our streamlined UI is designed to reduce friction and eliminate data entry errors.
              </p>
              <dl className="mt-10 max-w-xl space-y-6 text-base leading-7 text-slate-600 lg:max-w-none">
                {[
                  "View assigned companies tailored just for you.",
                  "Quick status updates with a single click.",
                  "Instantly filter by domain (e.g., EdTech, Fintech).",
                  "Export beautifully formatted reports in seconds."
                ].map((benefit) => (
                  <div key={benefit} className="relative pl-10">
                    <dt className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    </dt>
                    <dd className="font-medium text-slate-700">{benefit}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-2xl rounded-full transform scale-90"></div>
              <div className="relative w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-slate-900/5">
                <div className="absolute -top-5 -right-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white shadow-lg shadow-indigo-500/30 transform rotate-12 group-hover:rotate-0 transition-transform">
                   <Zap className="h-6 w-6" />
                </div>
                <div className="space-y-4 mt-2">
                  <div className="h-3 w-1/3 rounded-full bg-slate-200"></div>
                  <div className="flex gap-3 pt-2">
                    <div className="h-12 w-full rounded-xl bg-slate-50 border border-slate-100 shadow-sm"></div>
                    <div className="h-12 w-20 rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm flex items-center justify-center"><div className="h-2 w-8 bg-indigo-200 rounded-full"></div></div>
                  </div>
                  <div className="h-12 w-full rounded-xl bg-slate-50 border border-slate-100 shadow-sm mt-4"></div>
                  <div className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 relative overflow-hidden shadow-sm">
                     <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent w-3/4 animate-pulse"></div>
                     <div className="absolute left-4 top-1/2 -translate-y-1/2 h-2 w-24 bg-indigo-300 rounded-full"></div>
                  </div>
                  <div className="h-12 w-full rounded-xl bg-slate-50 border border-slate-100 shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}