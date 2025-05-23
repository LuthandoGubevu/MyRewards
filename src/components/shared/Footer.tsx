
export function Footer() {
  return (
    <footer className="bg-white text-black shadow-md py-6">
      <div className="container mx-auto px-4 text-center md:px-6">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} KFC Rewards Tracker. All rights reserved.
        </p>
        <p className="text-xs mt-1">This is a fictional application for demonstration purposes.</p>
      </div>
    </footer>
  );
}
