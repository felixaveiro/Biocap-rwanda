export default function EnvironmentPage() {
  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#1a365d] mb-6 text-center">Protecting Our Environment</h1>
        <div className="aspect-video bg-gradient-to-br from-sky-400 to-emerald-400 rounded-3xl mb-10 flex items-center justify-center text-white text-3xl font-bold">
          Sustainable Agriculture
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          <p className="text-gray-600 text-lg leading-relaxed">
            Stronger crops can reduce the need for too many chemicals, and better seeds can 
            grow well even in tough conditions. This supports sustainable agriculture and 
            helps us use our land more wisely.
          </p>
          <div className="bg-[#1a365d] text-white p-8 rounded-2xl">
            <p className="font-medium text-lg italic">"Changing how we grow food and take care of our environment."</p>
            <div className="mt-4 flex gap-2">
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">#BetterCrops</span>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">#StrongerRwanda</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}