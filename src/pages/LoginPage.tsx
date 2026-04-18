import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Package2, Loader as Loader2 } from 'lucide-react';

export function LoginPage() {
  const { login } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(username, password);
    if (!ok) setError('Identifiants incorrects. Essayez admin / admin');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sidebar via-sidebar-accent to-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg">
            <Package2 className="size-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">GestionPro DZ</h1>
          <p className="text-sidebar-foreground/60 mt-1 text-sm">Système de gestion commerciale</p>
        </div>

        <Card className="shadow-2xl border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Connexion</CardTitle>
            <CardDescription>Entrez vos identifiants pour accéder au système</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">Nom d&apos;utilisateur</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="size-4 animate-spin" /> Connexion...</> : 'Se connecter'}
              </Button>
              <p className="text-center text-xs text-muted-foreground pt-2">
                Compte démo&nbsp;: <span className="font-medium text-foreground">admin</span> / <span className="font-medium text-foreground">admin</span>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
