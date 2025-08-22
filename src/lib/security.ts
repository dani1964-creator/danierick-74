
import DOMPurify from 'dompurify';

// Input sanitization functions
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove any HTML tags and encode special characters
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [] 
  });
};

export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Allow only safe HTML tags
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: []
  });
};

// Input validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value: string): boolean => {
  return value && value.trim().length > 0;
};

export const validateLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

// Rate limiting helper (simple in-memory implementation)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (identifier: string, maxRequests: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
};

// Form validation schemas
export const contactFormSchema = {
  name: (value: string) => validateRequired(value) && validateLength(value, 100),
  email: (value: string) => validateRequired(value) && validateEmail(value),
  phone: (value: string) => validatePhone(value),
  message: (value: string) => validateLength(value, 2000)
};

export const propertySearchSchema = {
  search: (value: string) => validateLength(value, 200),
  minPrice: (value: string) => !value || !isNaN(Number(value)),
  maxPrice: (value: string) => !value || !isNaN(Number(value))
};
