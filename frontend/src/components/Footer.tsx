import { memo } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Instagram } from "lucide-react";
import logo from "@/assets/designopack-logo-white-new.png";

const Footer = memo(() => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal-black text-footer-text">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-4">
          {/* Brand */}
          <div>
            <img
              src={logo}
              alt="DesignOPack"
              loading="lazy"
              decoding="async"
              // make logo wider (approx 180px on small, 220px on md+), reduce vertical spacing so it appears closer to text
              className="w-[180px] md:w-[220px] h-auto mb-0 -mt-3 md:-mt-2"
            />
            <p className="text-footer-text font-body text-sm leading-relaxed mt-1">
              Premium customized hospitality & packaging products for luxury hotels and corporate brands.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 font-body text-sm">
              <li>
                <Link to="/" className="text-footer-text hover:text-maroon transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-footer-text hover:text-maroon transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-footer-text hover:text-maroon transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-footer-text hover:text-maroon transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4 text-white">Contact Us</h4>
            <ul className="space-y-3 font-body text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={18} className="text-maroon mt-1 flex-shrink-0" />
                <span className="text-footer-text">
                  G-173, Dilshad Colony, Delhi 110095
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={18} className="text-maroon flex-shrink-0" />
                <span className="text-footer-text">+91-9868176361</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} className="text-maroon flex-shrink-0" />
                <span className="text-footer-text">designopackindia@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Factory Address */}
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4 text-white">Factory</h4>
            <p className="text-footer-text font-body text-sm flex items-start gap-2">
              <MapPin size={18} className="text-maroon mt-1 flex-shrink-0" />
              <span>A-8, Basement, DSIDC Complex, Jhilmil Industrial Area, Delhi 110095</span>
            </p>
          </div>
        </div>

        {/* Divider directly under the paragraph to remove extra gap and align with brand text */}
        <hr className="border-t border-gray-600 mt-4 mb-4" />

        {/* Bottom Bar (removed border-top here so divider above controls the line position) */}
        <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-footer-text font-body text-sm text-center md:text-left">
            © {currentYear} DesignOPack. All rights reserved. Made with ❤️ in India
          </p>
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/Designopackindia/?rdid=wgD0jKXtlQhboEJG"
              target="_blank"
              rel="noopener noreferrer"
              className="text-footer-text hover:text-maroon transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://www.instagram.com/designopack.india?igsh=MWNscXhiMndvYnQ2cQ%3D%3D&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-footer-text hover:text-maroon transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
