import { Button } from '@/components/ui/button';
import { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Brain, Goal, Heart, Sparkles } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = auth.user !== null;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col">
                <header className="flex items-center justify-between p-6 md:px-12">
                    <Link href="/" className="text-gradient text-2xl font-bold">
                        LifeHub
                    </Link>

                    <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                            <Button className="w-24" asChild>
                                <Link href={route('dashboard')}>Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" className="w-24" asChild>
                                    <Link href={route('login')}>Sign in</Link>
                                </Button>
                                <Button className="w-28" asChild>
                                    <Link href={route('register')}>
                                        <Sparkles />
                                        <span>Sign up</span>
                                    </Link>
                                </Button>
                            </>
                        )}
                    </div>
                </header>

                <main className="flex w-full flex-1 flex-col items-center justify-center">
                    <div className="animate-[fade-in_0.8s_ease-out_forwards] space-y-5 text-center">
                        <h1 className="text-gradient text-4xl leading-relaxed font-bold md:text-6xl">Coming Soon</h1>
                    </div>

                    <div className="mx-auto mt-6 max-w-2xl animate-[fade-in_0.8s_ease-out_0.1s_forwards] space-y-6">
                        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-200">
                            We&apos;re crafting a revolutionary platform that will transform how you manage and enhance your daily life. Get ready for
                            an experience that combines simplicity, elegance, and powerful functionality.
                        </p>

                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Button className="group" asChild>
                                <Link href={route('register')}>
                                    <span>Get Early Access</span>
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                                </Link>
                            </Button>

                            <Button variant="outline" size="lg">
                                Learn More
                            </Button>
                        </div>
                    </div>

                    <div className="mt-16 grid max-w-5xl animate-[fade-in_0.8s_ease-out_0.2s_forwards] grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="rounded-2xl border border-violet-100 bg-white/60 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-violet-800 dark:bg-gray-800/60">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-violet-500 to-purple-500">
                                <Heart className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Wellness Tracking</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Monitor your health and wellness journey with intelligent insights
                            </p>
                        </div>

                        <div className="rounded-2xl border border-cyan-100 bg-white/60 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-cyan-800 dark:bg-gray-800/60">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500">
                                <Brain className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Smart Organization</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Effortlessly organize your life with AI-powered recommendations
                            </p>
                        </div>

                        <div className="rounded-2xl border border-purple-100 bg-white/60 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-purple-800 dark:bg-gray-800/60">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                                <Goal className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Goal Achievement</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Reach your dreams with personalized action plans and progress tracking
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
