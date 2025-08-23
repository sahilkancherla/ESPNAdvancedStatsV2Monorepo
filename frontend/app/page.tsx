// src/app/page.tsx (root page, not auth/page.tsx)
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext'; // Import the UserContext

import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

const loginSchema = z.object({
  email: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  password: z.string().min(5, { message: 'Password must be at least 5 characters long' }),
})

const signupSchema = loginSchema.extend({
  username: z.string().min(2, { message: 'Username must be at least 2 characters long' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login')
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [signupError, setSignupError] = useState<string | null>(null)
  const router = useRouter()
  const { setUser } = useUser() // Get setUser from context

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', username: '' },
  })

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true)
    setLoginError(null)
    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
  
      const userData = await response.json();
      if (response.ok) {
        // Store JWT token
        localStorage.setItem('authToken', userData.session.access_token)
        
        // Set user in context (no more URL params!)
        setUser({
          id: userData.user.id,
          username: userData.user.username,
          email: userData.user.email
        });
        
        toast.success('Login successful!')
        // Clean redirect without user data in URL
        router.push('/home');
      } else {
        setLoginError(userData.error)
      }
    } catch (error) {
      setLoginError("Network error. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }
  
  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsLoading(true)
    setSignupError(null)
    const data = { email: values.email, password: values.password, username: values.username }
    
    try {
      const response = await fetch(`${BACKEND_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
  
      const userData = await response.json()
      if (response.ok) {
        // Store JWT token
        localStorage.setItem('authToken', userData.token)
        
        // Set user in context (no more URL params!)
        setUser({
          id: userData.user.id,
          username: userData.user.username,
          email: userData.user.email
        });
        
        toast.success('Account created successfully!')
        // Clean redirect without user data in URL
        router.push('/home');
      } else {
        setSignupError(userData.error)
      }
    } catch (error) {
      setSignupError('Network error. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Back button in top left
      <div className="p-6">
        <Link href="/">
          <Button variant="outline" size="sm" className="flex items-center m-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div> */}
      
      {/* Main content centered */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[400px]">
          <div className="flex flex-col space-y-2 text-left mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">ESPN FF Advanced Stats</h1>
            <p className="text-sm text-muted-foreground text-center">Your Ultimate Fantasy Football Assistant</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{activeTab === 'login' ? 'Login' : 'Sign up'}</CardTitle>
              <CardDescription>
                {activeTab === 'login' ? 'Sign in to your account' : 'Create a new account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="mt-0">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter your email" disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} placeholder="••••••••" disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : "Sign In"}
                      </Button>
                      {loginError && (
                        <div className="text-red-500 text-sm text-center">{loginError}</div>
                      )}
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="signup" className="mt-0">
                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                      <FormField
                        control={signupForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Choose an email" disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Choose a username" disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} placeholder="Create a strong password" disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signupForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} placeholder="Confirm your password" disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : "Create Account"}
                      </Button>
                      {signupError && (
                        <div className="text-red-500 text-sm text-center">{signupError}</div>
                      )}
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}