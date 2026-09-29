export type AuthState = { error?: string; success?: string };

export function validateCredentials(email: string, password: string) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
  if (!password) return "Password is required.";
}

export function validateRegistration(name: string, email: string, password: string, confirmation: string) {
  if (!name.trim()) return "Full name is required.";
  const error = validateCredentials(email, password);
  if (error) return error;
  if (password.length < 6) return "Password must be at least 6 characters.";
  if (password !== confirmation) return "Passwords do not match.";
}
