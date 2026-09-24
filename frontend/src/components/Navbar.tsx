import { useState, useEffect, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/designopack-logo-transparent.png";

const Navbar = memo(() => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
    { name: "Products", path: "/products" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 shadow-lg backdrop-blur-sm" : "bg-white"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            {/* wrapper keeps navbar height the same while allowing the image to be visually larger by scaling
                and cropping any transparent padding inside the PNG. overflow-hidden ensures no navbar height change.
                The image is centered vertically and scales a bit more on md+ screens. */}
            <div className="h-20 md:h-20 flex items-center justify-center overflow-hidden">
              <img
                src={logo}
                alt="DesignOPack - Designing, Printing & Packaging"
                fetchPriority="high"
                decoding="async"
                className="block h-auto max-h-[120%] md:max-h-[140%] w-auto transform transition-transform duration-200 scale-105 md:scale-110"
                style={{ willChange: 'transform' }}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-foreground hover:text-primary font-body transition-colors relative group ${
                  location.pathname === link.path ? "text-primary" : ""
                }`}
              >
                {link.name}
                <span
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform ${
                    location.pathname === link.path
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                ></span>
              </Link>
            ))}
            <Button variant="default" size="sm" asChild>
              <Link to="/contact">Request Quote</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-3 text-foreground hover:text-primary transition-colors ${
                  location.pathname === link.path ? "text-primary font-semibold" : ""
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Button variant="default" size="sm" className="w-full mt-4" asChild>
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                Request Quote
              </Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
});

export default Navbar;
