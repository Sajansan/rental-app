import { AuthPage } from "@/components/auth/auth-page";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  return <AuthPage mode="login" confirmationError={params.error === "confirmation"} />;
}
