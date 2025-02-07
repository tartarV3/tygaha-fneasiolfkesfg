import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [gateCode, setGateCode] = useState("");
  const [showFirstTimeInstructions, setShowFirstTimeInstructions] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedBefore");
    if (!hasVisited) {
      setShowFirstTimeInstructions(true);
      localStorage.setItem("hasVisitedBefore", "true");
    }
  }, []);

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    const newCode = gateCode + e.key;
    setGateCode(newCode);

    if (newCode === "1234") {
      setShowLogin(true);
    }

    if (newCode.length >= 4) {
      setGateCode("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-4xl">
        {showFirstTimeInstructions && (
          <Alert className="mb-8">
            <Info className="h-5 w-5" />
            <AlertTitle>Welcome to the Chat App!</AlertTitle>
            <AlertDescription className="mt-2">
              <p>To access the login form:</p>
              <ol className="list-decimal ml-6 mt-2 space-y-1">
                <li>Just start typing "1234" on your keyboard - no need to click anywhere!</li>
                <li>You'll see dots light up as you type each number</li>
                <li>Once you type "1234", the login form will appear</li>
                <li>Then use these credentials to log in:
                  <ul className="list-disc ml-6 mt-1">
                    <li>Username: glooby</li>
                    <li>Password: glooby</li>
                  </ul>
                </li>
              </ol>
              <p className="mt-2 text-sm text-muted-foreground">These instructions will only appear once.</p>
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {!showLogin ? "Type 1234 on your keyboard to continue..." : "Welcome Back"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showLogin ? (
              <LoginForm />
            ) : (
              <div className="text-center p-8">
                <div className="text-3xl mb-4">
                  {Array(4).fill('•').map((dot, i) => (
                    <span key={i} className={i < gateCode.length ? "text-primary" : "text-muted"}>
                      {dot}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Just start typing - no need to click anywhere
                </p>
                <Input 
                  type="text" 
                  className="opacity-0 absolute" 
                  autoFocus 
                  onKeyPress={handleKeyPress}
                  value=""
                  onChange={() => {}}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoginForm() {
  const { loginMutation } = useAuth();
  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Form>
  );
}