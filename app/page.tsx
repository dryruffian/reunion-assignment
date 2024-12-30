import AnimatedButton from './components/ui/SunriseButton'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-1 w-full">
        <h1 className="text-lg sm:text-6xl font-bold">Task Management App</h1>
        <p className="text-base sm:text-2xl">Reunion Assginment</p>
        <br/>
      <AnimatedButton href="/dashboard" className="px-7 py-4 font-bold text-lg">
        Get started ➡️
      </AnimatedButton>
      </div>
    </div>
  );
}