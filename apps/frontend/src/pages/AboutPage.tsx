import { 
    Users2, 
    Target, 
    Heart, 
    Zap, 
    ExternalLink, // Replaced Linkedin      // Replaced Twitter
    Globe,
    Mail
  } from "lucide-react";
  import hussainImage from "../utils/hussain.jpeg";
  
  
  const values = [
    {
      title: "Efficiency First",
      description: "We believe in removing the friction from sponsorship outreach so you can focus on building relationships, not managing rows.",
      icon: <Zap className="h-6 w-6 text-amber-500" />,
    },
    {
      title: "Student Empowerment",
      description: "Built originally for college fests, we are dedicated to helping the next generation of leaders fund their biggest ideas.",
      icon: <Users2 className="h-6 w-6 text-indigo-500" />,
    },
    {
      title: "Radical Transparency",
      description: "Our weighted pipeline logic ensures teams have a realistic view of their financial health at all times.",
      icon: <Target className="h-6 w-6 text-emerald-500" />,
    },
  ];
  
  const team = [
    {
      name: "Hussain K",
      role: "Builder and Exploring new ideas",
      image: hussainImage,
    },
  ];
  
  export default function AboutPage() {
    return (
      <div className="bg-white min-h-screen">
        {/* Hero Section */}
        <section className="relative py-24 px-6 overflow-hidden border-b border-slate-100">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent -z-10" />
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-4 italic">Our Story</h2>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-8">
              We’re on a mission to fund the <span className="text-indigo-600">world's events.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              SponsCRM was born out of a simple frustration: managing sponsorships in spreadsheets is where good ideas go to die. We built a tool that works as fast as you do.
            </p>
          </div>
        </section>
  
        {/* Stats/Impact Section */}
        <section className="py-20 bg-slate-900">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { label: "Deals Closed", value: "$2M+" },
                { label: "Active Orgs", value: "500+" },
                { label: "Countries", value: "12" },
                { label: "Daily Activities", value: "10k+" },
              ].map((stat) => (
                <div key={stat.label} className="group cursor-default">
                  <p className="text-4xl font-black text-white mb-1 group-hover:text-indigo-400 transition-colors">{stat.value}</p>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Values Section */}
        <section className="py-32 container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <div className="lg:w-1/3">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-6">Our Core Values</h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                These principles guide every feature we build and every decision we make as a company.
              </p>
            </div>
            <div className="lg:w-2/3 grid sm:grid-cols-2 gap-8">
              {values.map((v) => (
                <div key={v.title} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:border-indigo-100 transition-all duration-300 group">
                  <div className="mb-4 transform group-hover:scale-110 transition-transform">{v.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{v.title}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Team Section */}
        <section className="py-32 bg-[#fcfcfd]">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-4">Meet the Team</h2>
              <p className="text-slate-500 font-medium italic">The humans behind the code making your sponsorships happen.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12">
              {team.map((member) => (
                <div key={member.name} className="group text-center">
                  <div className="relative inline-block mb-6">
                    {/* Modern Squircle Background */}
                    <div className="absolute inset-0 bg-indigo-600 rounded-[2.5rem] rotate-6 group-hover:rotate-12 transition-transform duration-500" />
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="relative w-48 h-48 rounded-[2.5rem] object-cover border-4 border-white shadow-xl grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 leading-none">{member.name}</h3>
                  <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mt-2 mb-4">{member.role}</p>
                  
                  {/* Modern Generic Icons */}
                  <div className="flex justify-center gap-4">
                    <button className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                    <button className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                      <Mail className="h-3.5 w-3.5" />
                    </button>
                    <button className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
                      <Globe className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Final CTA */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <Heart className="h-12 w-12 text-white/30 mx-auto mb-6 animate-pulse" />
            <h2 className="text-4xl font-black mb-6 tracking-tight">Join the sponsorship revolution.</h2>
            <p className="text-indigo-100 max-w-xl mx-auto mb-10 font-medium">
              We're always looking for ambitious teams to join our pilot program. Let's build something great together.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
               <button className="bg-white text-indigo-600 px-10 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-xl shadow-indigo-900/20 text-sm">
                 Apply to Join
               </button>
               <button className="bg-indigo-500/30 backdrop-blur-md border border-white/20 px-10 py-4 rounded-2xl font-black hover:bg-indigo-500/50 transition-all text-sm">
                 View Open Positions
               </button>
            </div>
          </div>
        </section>

      </div>
      
    );
  }