
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/contexts/UserContext';

const UserSetup: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const { createUser } = useUser();

  const handleCreateProfile = () => {
    createUser({
      name: name.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined
    });
  };

  const handleAnonymousJoin = () => {
    createUser({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome to ChatApp</CardTitle>
          <CardDescription>Create your profile or join anonymously</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleCreateProfile}
              className="w-full"
              disabled={!name && !phone && !email}
            >
              Create Profile
            </Button>
            <Button 
              onClick={handleAnonymousJoin}
              variant="outline"
              className="w-full"
            >
              Join Anonymously
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSetup;
