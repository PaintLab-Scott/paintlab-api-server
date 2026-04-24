import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ServiceDetail from "@/pages/service-detail";
import SubscriptionPortal from "@/pages/subscription-portal";
import SubscriptionLab from "@/pages/subscription-lab";
import MemberPortal from "@/pages/member-portal";
import About from "@/pages/about";

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#FF6600",
    colorForeground: "#FAFAFA",
    colorMutedForeground: "#A1A1AA",
    colorDanger: "#EF4444",
    colorBackground: "#111111",
    colorInput: "#1C1C1C",
    colorInputForeground: "#FAFAFA",
    colorNeutral: "#3F3F46",
    colorModalBackdrop: "rgba(0,0,0,0.80)",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "0px",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "bg-[#111111] border border-zinc-800 rounded-none w-[440px] max-w-full overflow-hidden shadow-2xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white font-bold tracking-tight",
    headerSubtitle: "text-zinc-400",
    socialButtonsBlockButton: "border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-none",
    socialButtonsBlockButtonText: "text-zinc-200 font-medium",
    formFieldLabel: "text-zinc-300 text-xs uppercase tracking-wider font-bold",
    formFieldInput: "bg-zinc-900 border border-zinc-700 text-white rounded-none placeholder:text-zinc-600 focus:border-[#FF6600]",
    formButtonPrimary: "bg-[#FF6600] hover:bg-[#E55A00] text-black font-bold rounded-none uppercase tracking-wider",
    footerActionLink: "text-[#FF6600] hover:text-[#FF8833] font-semibold",
    footerActionText: "text-zinc-500",
    footerAction: "border-t border-zinc-800",
    dividerText: "text-zinc-500",
    dividerLine: "bg-zinc-700",
    identityPreviewEditButton: "text-[#FF6600]",
    formFieldSuccessText: "text-green-400",
    alertText: "text-zinc-300",
    alert: "bg-zinc-900 border border-zinc-700 rounded-none",
    otpCodeFieldInput: "bg-zinc-900 border border-zinc-700 text-white rounded-none",
    logoBox: "flex justify-center pb-2",
    logoImage: "h-10 w-auto",
    formFieldRow: "",
    main: "",
  },
};

function SignInPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  // To update login providers, app branding, or OAuth settings use the Auth
  // pane in the workspace toolbar. More information can be found in the Replit docs.
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

function ProtectedMemberPortal() {
  return (
    <>
      <Show when="signed-in">
        <MemberPortal />
      </Show>
      <Show when="signed-out">
        <SignInPage />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services/:slug" component={ServiceDetail} />
      <Route path="/subscription-portal" component={SubscriptionPortal} />
      <Route path="/subscription-lab" component={SubscriptionLab} />
      <Route path="/about" component={About} />
      <Route path="/member-portal" component={ProtectedMemberPortal} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey || ""}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      localization={{
        signIn: {
          start: {
            title: "Welcome back.",
            subtitle: "Sign in to access your member portal",
          },
        },
        signUp: {
          start: {
            title: "Create your account.",
            subtitle: "Save configurations and manage your PaintLab subscriptions",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
