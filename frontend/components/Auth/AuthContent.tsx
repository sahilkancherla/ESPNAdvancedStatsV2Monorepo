// src/app/page.tsx (root page, not auth/page.tsx)
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext'; // Import the UserContext

import { Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

const loginSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }),
  password: z.string().min(5, { message: 'Password must be at least 5 characters long' }),
})

const signupSchema = loginSchema.extend({
  username: z.string().min(2, { message: 'Username must be at least 2 characters long' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export function AuthContent() {
  const [activeTab, setActiveTab] = useState('login')
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [signupError, setSignupError] = useState<string | null>(null)
  const router = useRouter()
  const { setUser, setCurrentYear, setCurrentWeek } = useUser() // Get setUser from context

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '', username: '' },
  })

  const handleBackClick = () => {
    router.push('/')
  }

  const fetchAndSetCurrentData = async () => {
    try {
      const adminResponse = await fetch(`${BACKEND_URL}/admin/getCurrentWeekCurrentYear`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        console.log('Admin data:', adminData);
        
        if (adminData.current_year) {
          console.log('Setting current year:', adminData.current_year);
          setCurrentYear(adminData.current_year);
        }
        if (adminData.current_week) {
          setCurrentWeek(adminData.current_week);
        }
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

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
          email: userData.user.email,
        });

        // Fetch and set current year/week
        await fetchAndSetCurrentData();
        
        toast.success('Login successful!')
        // Clean redirect without user data in URL
        router.push('/home');
      } else {
        setLoginError(userData.error)
      }
    } catch (error) {
      console.error('Error logging in:', error)
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

        // Fetch and set current year/week
        await fetchAndSetCurrentData();
        
        toast.success('Account created successfully!')
        // Clean redirect without user data in URL
        router.push('/home');
      } else {
        setSignupError(userData.error)
      }
    } catch (error) {
      console.error('Error signing up:', error)
      setSignupError('Network error. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-blue-200/30 blur-3xl"></div>
      
      {/* Navigation */}
      <nav className="relative w-full border-b border-gray-200 backdrop-blur-md bg-white/80">
        <div className="w-full px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Button 
              onClick={handleBackClick}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </nav>

      {/* Main content centered */}
      <div className="relative flex-1 flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-[500px]">
          {/* Header */}
          <div className="text-center mb-8">
            {/* <div className="inline-flex items-center bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-sm text-gray-700">Join the championship league</span>
            </div> */}
            
            {/* <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Welcome to
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent block">
                StatSphere
              </span>
            </h1> */}
            
            {/* <p className="text-lg text-gray-600 max-w-md mx-auto">
              Your ultimate fantasy football assistant and advanced analytics dashboard.
            </p> */}
          </div>
          
          {/* Auth Card */}
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                {activeTab === 'login' ? 'Sign In' : 'Create Account'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {activeTab === 'login' 
                  ? 'Welcome back!'
                  : 'Join now to access your dashboard'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 border-0">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-medium"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-medium"
                  >
                    Create Account
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="mt-0">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter your email" 
                                disabled={isLoading}
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm h-12"
                              />
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
                            <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                placeholder="Enter your password" 
                                disabled={isLoading}
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 font-medium text-lg"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                            Signing in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                      {loginError && (
                        <div className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
                          {loginError}
                        </div>
                      )}
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="signup" className="mt-0">
                  <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
                      <FormField
                        control={signupForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter your email" 
                                disabled={isLoading}
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm h-12"
                              />
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
                            <FormLabel className="text-gray-700 font-medium">Username</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Choose a username" 
                                disabled={isLoading}
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm h-12"
                              />
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
                            <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                placeholder="Create a strong password" 
                                disabled={isLoading}
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm h-12"
                              />
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
                            <FormLabel className="text-gray-700 font-medium">Confirm Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                {...field} 
                                placeholder="Confirm your password" 
                                disabled={isLoading}
                                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white/50 backdrop-blur-sm h-12"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 font-medium text-lg"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                            Creating account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                      {signupError && (
                        <div className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
                          {signupError}
                        </div>
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