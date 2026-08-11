import { useState } from "react";
import { useAuthStore } from "../stores/authstore";
import { useOrg } from "../hooks/useOrg"; 
import { 
  Building2, 
 
  Key, 
 
  
  Plus, 
 
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Org() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { 
   
    createOrg, 
    joinOrg
  } = useOrg();

  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  

  const hasOrg = !!user?.organization;

  useEffect(() => {
    if (hasOrg) {
      navigate("/dashboard", { replace: true} ); //we add replace so that when user hits back,he is back on the org page and infinite loop!!
    }
  }, [hasOrg, navigate]);

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;
    
    createOrg({ name: createName }, {
      onSuccess: () => {
        toast.success("Organization created successfully! You are now the Admin.");
        setCreateName("");
        navigate("/dashboard", { replace: true });
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Failed to create organization");
      }
    });
  };

  const handleJoinOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    joinOrg({ inviteCode: joinCode }, {
      onSuccess: () => {
        toast.success("Successfully joined the organization as a Member!");
        setJoinCode("");
        navigate("/dashboard", { replace: true });
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Failed to join organization");
      }
    });
  };

  
 
  // View : User is NOT in an Organization
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-slate-50 selection:bg-indigo-100">
      
      <div className="text-center mb-10 space-y-3">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mb-2">
          <Building2 className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome to the Workspace
        </h1>
        <p className="text-slate-500 max-w-md mx-auto">
          To get started, you need to be part of an organization. Create a new one for your team, or join an existing one.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Create Org Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between">
          <div className="space-y-4 mb-8">
            <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <Plus className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Create entirely new</h2>
            <p className="text-sm text-slate-500">
              Start fresh with a new organization, become the Admin, and invite your teammates.
            </p>
          </div>
          
          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input 
                id="orgName" 
                placeholder="e.g. Acme Corp Startups" 
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
              Create Organization
            </Button>
          </form>
        </div>

        {/* Join Org Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between">
          <div className="space-y-4 mb-8">
            <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100">
              <Key className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Join via invite code</h2>
            <p className="text-sm text-slate-500">
              Already have a team on SponsCRM? Ask your admin for the 8-character invite code.
            </p>
          </div>
          
          <form onSubmit={handleJoinOrg} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input 
                id="inviteCode" 
                placeholder="e.g. a3f9b2c1" 
                className="font-mono text-center tracking-widest"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300">
              Join Organization
            </Button>
          </form>
        </div>
      </div>

    </div>
  );
}