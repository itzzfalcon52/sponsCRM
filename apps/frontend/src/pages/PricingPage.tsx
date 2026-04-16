import { useState } from "react";
import { Check, Zap, Shield, Crown, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for individual students or small project teams.",
    features: ["Up to 50 Companies", "Basic Kanban Board", "1 Organization Member", "Email Support"],
    buttonText: "Get Started",
    highlight: false,
    icon: <Zap className="h-5 w-5 text-slate-400" />,
  },
  {
    name: "Pro",
    price: { monthly: 29, yearly: 19 },
    description: "For high-performing teams managing multiple events.",
    features: [
      "Unlimited Companies",
      "Weighted Forecasting",
      "Up to 15 Team Members",
      "Advanced Analytics",
      "Google Sheets Sync",
      "Priority Support"
    ],
    buttonText: "Start Free Trial",
    highlight: true,
    icon: <Crown className="h-5 w-5 text-indigo-500" />,
  },
  {
    name: "Enterprise",
    price: { monthly: 99, yearly: 79 },
    description: "For large university bodies and professional event firms.",
    features: [
      "Unlimited Everything",
      "Custom Probabilities",
      "Dedicated Account Manager",
      "SSO & Security Logs",
      "Custom Reporting",
      "API Access"
    ],
    buttonText: "Contact Sales",
    highlight: false,
    icon: <Shield className="h-5 w-5 text-slate-400" />,
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-24 px-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-4">Pricing</h2>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6">
            Invest in your team's <span className="text-indigo-600">velocity.</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Choose a plan that fits your pipeline. Save up to 30% when you pay annually.
          </p>

          {/* Toggle */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <span className={`text-sm font-bold ${!isYearly ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-7 bg-slate-200 rounded-full p-1 transition-colors duration-300 focus:outline-none"
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isYearly ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-bold ${isYearly ? 'text-slate-900' : 'text-slate-400'}`}>
              Yearly <span className="ml-1 text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-tighter">Save 30%</span>
            </span>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-300 ${
                plan.highlight 
                ? 'bg-white border-indigo-200 shadow-2xl shadow-indigo-100 scale-105 z-10' 
                : 'bg-white/50 border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${plan.highlight ? 'bg-indigo-50' : 'bg-slate-50'}`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">
                    ${isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="text-slate-400 font-bold text-sm">/month</span>
                </div>
                <p className="text-sm text-slate-500 mt-4 font-medium leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <Button 
                onClick={() => navigate('/register')}
                className={`w-full h-12 rounded-xl font-bold transition-all mb-8 ${
                  plan.highlight 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100' 
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {plan.buttonText}
              </Button>

              <div className="space-y-4 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">What's included</p>
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className={`mt-1 shrink-0 h-4 w-4 rounded-full flex items-center justify-center ${plan.highlight ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                      <Check className={`h-2.5 w-2.5 ${plan.highlight ? 'text-indigo-600' : 'text-slate-500'}`} strokeWidth={4} />
                    </div>
                    <span className="text-sm font-medium text-slate-600 leading-tight">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Preview */}
        <div className="mt-32 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 shadow-sm mb-8">
                <HelpCircle className="h-4 w-4 text-indigo-500" /> Have questions?
            </div>
            <p className="text-slate-500 font-medium">
                Our support team is always ready to help. <br className="hidden sm:block" />
                Contact us at <span className="text-indigo-600 font-bold">support@sponscrm.com</span>
            </p>
        </div>
      </div>
    </div>
  );
}