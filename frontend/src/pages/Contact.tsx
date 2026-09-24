import { useState } from "react";
import { addQuoteRequest } from "@/lib/api";
import { logger } from "@/lib/logger";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "@/components/SocialIcons";
import handshakeBanner from "@/assets/handshake-banner.jpg";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  message: string;
}

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    message: "",
  });

  const sendEmailFallback = async (contactData: ContactFormData) => {
    const emailBody = `
New Contact Form Submission from DesignOPack Website

Name: ${contactData.name}
Email: ${contactData.email}
Phone: ${contactData.phone}
Company: ${contactData.companyName || "Not provided"}

Message:
${contactData.message}

---
Submitted on: ${new Date().toLocaleString()}
From: DesignOPack Website Contact Form
    `.trim();

    // Method 1: Try EmailJS if configured
    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (
        serviceId &&
        templateId &&
        publicKey &&
        serviceId !== "your_service_id"
      ) {
        const { default: emailjs } = await import("@emailjs/browser");
        await emailjs.send(
          serviceId,
          templateId,
          {
            from_name: contactData.name,
            from_email: contactData.email,
            phone: contactData.phone,
            product: "Contact Form",
            message: contactData.message,
            to_name: "DesignOPack Team",
          },
          publicKey,
        );

        logger.log("Contact email sent via EmailJS successfully");
        return true;
      }
    } catch (emailError) {
      logger.warn("EmailJS failed:", emailError);
    }

    const fallbackEmail = import.meta.env.VITE_DESIGNOPACK_EMAIL || "designopackindia@gmail.com";

    // Method 2: Try FormSubmit (no signup required)
    try {
      const response = await fetch(
        `https://formsubmit.co/${fallbackEmail}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: contactData.name,
            email: contactData.email,
            phone: contactData.phone,
            message: contactData.message,
            _subject: `New Contact Form Submission from ${contactData.name}`,
            _template: "table",
          }),
        },
      );

      if (response.ok) {
        logger.log("Contact email sent via FormSubmit successfully");
        return true;
      }
    } catch (formSubmitError) {
      logger.warn("FormSubmit failed:", formSubmitError);
    }

    // Method 3: Create mailto link as ultimate fallback
    const mailtoLink = `mailto:${fallbackEmail}?subject=New Contact Form Submission from ${encodeURIComponent(contactData.name)}&body=${encodeURIComponent(emailBody)}`;

    try {
      window.open(mailtoLink, "_blank");
      logger.log("Opened mailto link as fallback");
      return true;
    } catch (mailtoError) {
      logger.warn("Mailto failed:", mailtoError);
    }

    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.message
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      logger.emoji.loading("🔄 Submitting contact form:", formData);

      // Step 1: Save quote request via REST API
      const quoteResult = await addQuoteRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        message: formData.message,
      });

      if (!quoteResult.success) {
        logger.emoji.error("❌ Save quote request failed:", quoteResult.error);
        throw new Error("Failed to save contact request");
      }

      logger.emoji.loading(
        "✅ Contact saved successfully with ID:",
        quoteResult.id,
      );

      // Step 2: Send email notification
      const emailSent = await sendEmailFallback(formData);

      if (emailSent) {
        logger.emoji.loading("✅ Contact email sent successfully");
        toast({
          title: "Message Sent Successfully! ✅",
          description:
            "Thank you for contacting us! We'll get back to you within 24 hours.",
        });
      } else {
        toast({
          title: "Message Received! ✅",
          description:
            "Your message has been saved. Our team will contact you soon.",
        });
      }

      setFormData({
        name: "",
        email: "",
        phone: "",
        companyName: "",
        message: "",
      });
    } catch (error) {
      logger.emoji.error("❌ Contact form submission error:", error);
      toast({
        title: "Submission Failed",
        description:
          "Unable to send your message. Please try again or call us directly at +91-9868176361",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${handshakeBanner})`,
          }}
        />
        {/* Overlay to align with brand palette */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-secondary/70 to-black/60" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4 animate-fade-in">
            Get in Touch
          </h1>
          <p className="text-xl text-white/90 font-body max-w-2xl mx-auto animate-slide-up">
            Let's discuss how we can elevate your brand with premium packaging
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <MapPin className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg mb-2">
                        Office Address
                      </h3>
                      <p className="font-body text-muted-foreground text-sm">
                        G-173, Dilshad Colony
                        <br />
                        Delhi 110095
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Phone className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg mb-2">
                        Phone
                      </h3>
                      <p className="font-body text-muted-foreground text-sm">
                        +91-9868176361
                        <br />
                        +91-8595555488
                        <br />
                        +91-9910211189
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Mail className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg mb-2">
                        Email
                      </h3>
                      <p className="font-body text-muted-foreground text-sm">
                        designopackindia@gmail.com
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Clock className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg mb-2">
                        Business Hours
                      </h3>
                      <p className="font-body text-muted-foreground text-sm">
                        Monday - Saturday
                        <br />
                        9:00 AM - 6:00 PM
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="hover-lift">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-heading font-bold mb-2">
                    Send us a Message
                  </h2>
                  <p className="text-muted-foreground font-body mb-8">
                    Fill out the form below and our team will reach out to you
                    shortly.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="font-body">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="John Doe"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone" className="font-body">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          placeholder="+91 XXXXX XXXXX"
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="email" className="font-body">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="john@example.com"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="companyName" className="font-body">
                          Company Name
                        </Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="Your company (optional)"
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message" className="font-body">
                        Your Message *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Tell us about your requirements and how we can help you..."
                        className="mt-2 min-h-[150px]"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full md:w-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">
            Find Us Here
          </h2>
          <div className="max-w-5xl mx-auto rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3500.6385583929843!2d77.31657831508!3d28.681965982398586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfb5e2c8f7d91%3A0x7c3e0d5e5e5e5e5e!2sDilshad%20Colony%2C%20Delhi!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="DesignOPack Office Location"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Immediate Assistance & Social Section */}
      <section className="py-16 px-4 border-t border-border bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          {/* Primary WhatsApp CTA Card */}
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
              Need Immediate Assistance?
            </h2>
            <p className="text-muted-foreground font-body text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Our team is just one message away. Connect instantly or explore our latest work on social media.
            </p>
            <a
              href="https://wa.me/918595555488?text=Hi!%20I'm%20interested%20in%20your%20hospitality%20products."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with DesignOPack on WhatsApp"
              title="Chat with DesignOPack on WhatsApp"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-lg bg-[#25D366] hover:bg-[#20BA5A] text-white font-medium text-base md:text-lg shadow-md hover:shadow-xl transition-all duration-300 hover-lift"
            >
              <FaWhatsapp className="text-2xl flex-shrink-0" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* Subtle Divider */}
          <div className="flex items-center justify-center my-10 max-w-xs sm:max-w-md mx-auto">
            <div className="flex-grow border-t border-border"></div>
            <span className="px-4 text-xs font-body font-medium uppercase tracking-widest text-muted-foreground">
              OR
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Follow Our Journey */}
          <div>
            <h3 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
              Follow Our Journey
            </h3>
            <p className="text-muted-foreground font-body text-sm md:text-base mb-8 max-w-2xl mx-auto leading-relaxed">
              Follow our latest hospitality packaging projects, premium product launches and behind-the-scenes updates.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://www.instagram.com/designopack.india?igsh=MWNscXhiMndvYnQ2cQ%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow DesignOPack on Instagram"
                title="Follow DesignOPack on Instagram"
                className="w-full sm:w-auto min-w-[200px] inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-lg bg-card hover:bg-muted border border-border text-foreground font-medium text-sm transition-all duration-300 hover-lift shadow-sm hover:shadow-md"
              >
                <FaInstagram className="text-[#E4405F] text-xl flex-shrink-0" />
                <span>Instagram</span>
              </a>

              <a
                href="https://www.facebook.com/Designopackindia/?rdid=wgD0jKXtlQhboEJG"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow DesignOPack on Facebook"
                title="Follow DesignOPack on Facebook"
                className="w-full sm:w-auto min-w-[200px] inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-lg bg-card hover:bg-muted border border-border text-foreground font-medium text-sm transition-all duration-300 hover-lift shadow-sm hover:shadow-md"
              >
                <FaFacebookF className="text-[#1877F2] text-xl flex-shrink-0" />
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
