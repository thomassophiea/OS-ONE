import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2 } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import extremeNetworksLogo from 'figma:asset/f6780e138108fdbc214f37376d5cea1e3356ac35.png';

interface LoginFormProps {
  onLoginSuccess: () => void;
  theme?: 'light' | 'dark' | 'synthwave' | 'system';
  onThemeToggle?: () => void;
}

const REGIONS = [
  { label: 'Global',     value: 'Global' },
  { label: 'California', value: 'California' },
  { label: 'EU',         value: 'EU' },
  { label: 'APAC',       value: 'APAC' },
];

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion]     = useState('California');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/auth/xiq-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, region }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error || 'Login failed');
        return;
      }

      // controller_token is the Campus Controller OAuth2 token (exchanged from XIQ via RFC 7523)
      // access_token is what the /api/* proxy uses for the controller
      localStorage.setItem('access_token', json.controller_token || json.xiq_access_token);
      localStorage.setItem('xiq_access_token', json.xiq_access_token);
      localStorage.setItem('xiq_region', region);
      localStorage.setItem('user_email', username);

      onLoginSuccess();
    } catch {
      setError('Could not reach the server. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <ImageWithFallback
                src={extremeNetworksLogo}
                alt="Extreme Networks"
                className="h-12 w-12 object-contain"
              />
            </div>
            <CardTitle className="text-2xl">
              <span className="font-bold">API</span> | Integration ONE
            </CardTitle>
            <CardDescription>Sign in with your ExtremeCloud IQ account</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Email</Label>
                <Input
                  id="username"
                  type="email"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select value={region} onValueChange={setRegion} disabled={isLoading}>
                  <SelectTrigger id="region">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !username.trim() || !password.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
