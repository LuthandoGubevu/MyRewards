
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(email, password);
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center py-8">
      <Card className="w-full max-w-md shadow-xl bg-gradient-to-br from-[#e4002b] to-[#99001a] text-white rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-white">Sign Up</CardTitle>
          <CardDescription className="text-white/80 pt-1">Create your KFC Rewards account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/90">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Colonel Sanders"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/20 border-white/40 placeholder:text-white/70 text-white focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#e4002b]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="colonel@kfc.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/20 border-white/40 placeholder:text-white/70 text-white focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#e4002b]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="•••••••• (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-white/20 border-white/40 placeholder:text-white/70 text-white focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#e4002b]"
              />
            </div>
            <Button 
              className="w-full bg-white text-[#e4002b] hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#e4002b]" 
              type="submit" 
              disabled={loading}
            >
              <UserPlus className="mr-2 h-5 w-5" /> {loading ? 'Signing Up...' : 'Sign Up'}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col items-center space-y-2 pt-4">
          <p className="text-sm text-white/80">
            Already have an account?{' '}
            <Button variant="link" className="p-0 h-auto text-white/90 hover:text-white underline" asChild>
              <Link href="/login">Login here</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
