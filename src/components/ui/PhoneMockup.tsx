export default function PhoneMockup() {
  return (
    <div className="relative mx-auto w-64 sm:w-72 md:w-80">
      {/* Phone Frame */}
      <div className="relative bg-brand-dark rounded-[3rem] p-2 shadow-2xl">
        {/* Screen */}
        <div className="bg-linear-to-br from-brand-primary via-brand-accent to-brand-primary rounded-[2.5rem] overflow-hidden aspect-9/19">
          {/* Screen Content */}
          <div className="h-full flex flex-col items-center justify-center p-8 text-white text-center">
            {/* App Icon Placeholder */}
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-2xl font-display font-medium">A</span>
            </div>
            
            {/* App Name */}
            <h3 className="text-xl font-display font-medium mb-2">alutta</h3>
            <p className="text-sm text-white/80 mb-8">Your journey starts here</p>
            
            {/* Placeholder UI Elements */}
            <div className="w-full space-y-3">
              <div className="h-10 bg-white/20 rounded-lg" />
              <div className="h-10 bg-white/20 rounded-lg" />
              <div className="h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-brand-dark font-semibold text-sm">Get Started</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-brand-dark rounded-full" />
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-accent/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl" />
    </div>
  );
}