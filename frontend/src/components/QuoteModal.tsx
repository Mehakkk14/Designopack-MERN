import { useState, memo } from "react";
import { addQuoteRequest } from "@/lib/api";
import { logger } from "@/lib/logger";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

interface QuoteFormData {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  product: string;
  message: string;
}

const QuoteModal = memo(({ isOpen, onClose, productName = "" }: QuoteModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    product: productName,
    message: "",
  });

  const sendEmailNotification = async (quoteData: QuoteFormData) => {
    logger.emoji.loading("Sending email notification for quote request...");

    try {
      // Get EmailJS configuration from environment variables
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      // Check if EmailJS is properly configured
      if (
        !serviceId ||
        !templateId ||
        !publicKey ||
        serviceId === "your_service_id" ||
        templateId === "your_template_id" ||
        publicKey === "your_public_key"
      ) {
        logger.emoji.error(
          "⚠️ EmailJS configuration missing or using default placeholders",
        );
        return await sendEmailFallback(quoteData);
      }

      const { default: emailjs } = await import("@emailjs/browser");

      // Prepare email template parameters matching client's template variables
      const templateParams = {
        customer_name: quoteData.name,
        customer_email: quoteData.email,
        customer_phone: quoteData.phone,
        customer_company: quoteData.companyName || "Not provided",
        product_name: quoteData.product || "General Inquiry",
        product_category: "N/A",
        quantity: "To be discussed",
        message: quoteData.message,
      };

      logger.log("Sending email via EmailJS with params:", templateParams);

      // Send email using EmailJS
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey,
      );

      if (response.status === 200) {
        logger.emoji.success("Email sent successfully via EmailJS");
        return true;
      } else {
        logger.error("EmailJS returned non-200 status:", response);
        return await sendEmailFallback(quoteData);
      }
    } catch (emailError) {
      logger.error("EmailJS failed:", emailError);
      return await sendEmailFallback(quoteData);
    }
  };

  const sendEmailFallback = async (quoteData: QuoteFormData) => {
    logger.log("Using fallback email methods...");

    // Create comprehensive email content
    const emailSubject = `New Quote Request from ${quoteData.name} - DesignOPack`;
    const emailBody = `
New Quote Request from DesignOPack Website

Customer Details:
Name: ${quoteData.name}
Email: ${quoteData.email}
Phone: ${quoteData.phone}
Company: ${quoteData.companyName || "Not provided"}
Product Interest: ${quoteData.product || "General Inquiry"}

Message:
${quoteData.message}

---
Submitted on: ${new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}
Source: DesignOPack Website Quote Form

Please follow up with the customer within 24 hours.
    `.trim();

    const fallbackEmail = import.meta.env.VITE_DESIGNOPACK_EMAIL || "designopackindia@gmail.com";

    // Method 1: Try FormSubmit (reliable free service)
    try {
      const formSubmitResponse = await fetch(
        `https://formsubmit.co/${fallbackEmail}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: quoteData.name,
            email: quoteData.email,
            phone: quoteData.phone,
            company: quoteData.companyName || "Not provided",
            product: quoteData.product || "General Inquiry",
            message: quoteData.message,
            _subject: emailSubject,
            _template: "table",
            _next: "https://designopack.com/thank-you",
          }),
        },
      );

      if (formSubmitResponse.ok) {
        logger.success("Email sent via FormSubmit successfully");
        return true;
      }
    } catch (formSubmitError) {
      logger.warn("FormSubmit failed:", formSubmitError);
    }

    // Method 3: Create mailto link as ultimate fallback
    const mailtoLink = `mailto:${fallbackEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    try {
      window.open(mailtoLink, "_blank");
      logger.log("Opened email client for user to send");
      return true;
    } catch (mailtoError) {
      logger.warn("Mailto failed:", mailtoError);
    }

    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields (Name, Email, Message).",
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
      logger.emoji.loading("Submitting quote request:", formData);

      // Step 1: Save quote request to backend
      const saveResult = await addQuoteRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        product: formData.product,
        message: formData.message,
      });

      if (!saveResult.success) {
        logger.emoji.error("Quote save failed:", saveResult.error);
        throw new Error("Failed to save quote request");
      }

      logger.emoji.success(
        "Quote saved successfully with ID:",
        saveResult.id,
      );

      // Step 2: Send email notification
      const emailSent = await sendEmailNotification(formData);

      if (emailSent) {
        logger.emoji.success("Email notification sent successfully");
      } else {
        logger.warn("Email notification failed, but quote was saved");
      }

      // Step 3: Show success message
      toast({
        title: "Quote Request Submitted Successfully! ✅",
        description: emailSent
          ? "Thank you! Your request has been received and our team has been notified. We'll contact you within 24 hours."
          : "Thank you! Your request has been saved. We'll contact you within 24 hours via email or phone.",
      });

      // Step 4: Reset form and close modal
      setFormData({
        name: "",
        email: "",
        phone: "",
        companyName: "",
        product: "",
        message: "",
      });
      onClose();
    } catch (error) {
      logger.error("Quote submission error:", error);
      toast({
        title: "Submission Failed",
        description:
          "Unable to submit your request. Please try again or call us directly at +91-9868176361",
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">
            Request a Quote
          </DialogTitle>
          <DialogDescription className="font-body">
            Fill out the form below and we'll get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name" className="font-body">
              Name *
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your full name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email" className="font-body">
              Email *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
              className="mt-1"
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
              className="mt-1"
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
              placeholder="Your company name (optional)"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="product" className="font-body">
              Product of Interest
            </Label>
            <Input
              id="product"
              name="product"
              value={formData.product}
              onChange={handleChange}
              placeholder="e.g., Menu Folders, Tissue Box"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="message" className="font-body">
              Message
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your requirements..."
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export default QuoteModal;
