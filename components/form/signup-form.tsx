"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signup } from "@/lib/actions/auth";
import { type SignupState } from "@/lib/validations/auth";
import {
  CheckCircle,
  ArrowRight,
  LogIn,
  Home,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { IdentityStep } from "./signup/identity-step";
import { ContactStep } from "./signup/contact-step";
import { SecurityStep } from "./signup/security-step";

const initialState: SignupState = {};

export function SignupForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [state, formAction, isPending] = useActionState(signup, initialState);

  if (state.success) return <SuccessView />;

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  return (
    <form action={formAction} className="space-y-6">
      <ProgressIndicator currentStep={currentStep} />

      {state.error && <ErrorMessage message={state.error} />}

      <div className="min-h-auto">
        <div className={currentStep === 1 ? "block" : "hidden"}>
          <IdentityStep fields={state.fields} />
        </div>
        <div className={currentStep === 2 ? "block" : "hidden"}>
          <ContactStep fields={state.fields} />
        </div>
        <div className={currentStep === 3 ? "block" : "hidden"}>
          <SecurityStep fields={state.fields} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        {currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            className="h-12 rounded-[16px] px-6 font-bold flex items-center gap-2 flex-1 sm:flex-none"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </Button>
        )}

        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={nextStep}
            className="h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-[16px] px-8 flex items-center gap-2 flex-1 shadow-lg shadow-primary/10"
          >
            Next Step <ChevronRight className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isPending}
            className="h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-[16px] px-8 flex items-center gap-2 flex-1 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isPending ? <LoadingSpinner /> : "Complete Registration"}
          </Button>
        )}
      </div>

      <FooterLink />
    </form>
  );
}

function SuccessView() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      router.push("/login");
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirect);
    };
  }, [router]);

  return (
    <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500 py-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-inner border border-green-100">
          <CheckCircle className="w-12 h-12 animate-bounce" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-neutral-dark">
            Account Created!
          </h2>
          <p className="text-neutral-gray font-medium">
            Registration successful. Redirecting to login in {countdown}s...
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          asChild
          className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-[20px] shadow-xl shadow-primary/20 text-lg group"
        >
          <Link href="/login" className="flex items-center justify-center gap-2">
            <LogIn className="w-5 h-5" /> Sign In Now{" "}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full h-14 border-neutral-gray/20 text-neutral-dark font-bold rounded-[20px] text-lg hover:bg-neutral-gray/5"
        >
          <Link href="/" className="flex items-center justify-center gap-2">
            <Home className="w-5 h-5" /> Go to Home Page
          </Link>
        </Button>

        <div className="flex items-center justify-center gap-2 text-neutral-gray text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Automatic redirect in progress</span>
        </div>
      </div>
    </div>
  );
}

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between mb-8 px-2">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              currentStep >= step
                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                : "bg-neutral-gray/10 text-neutral-gray"
            }`}
          >
            {step}
          </div>
          {step < 3 && (
            <div
              className={`h-1 flex-1 mx-2 rounded-full transition-all duration-500 ${currentStep > step ? "bg-primary" : "bg-neutral-gray/10"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-red-50 border border-red-100 text-red-700 px-5 py-3 rounded-[16px] text-sm font-medium animate-in fade-in zoom-in">
    {message}
  </div>
);

const LoadingSpinner = () => (
  <span className="flex items-center gap-2">
    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    Processing...
  </span>
);

const FooterLink = () => (
  <div className="text-center pt-2">
    <p className="text-neutral-gray font-medium text-sm">
      Already have an account?{" "}
      <Link
        href="/login"
        className="text-primary font-bold hover:underline inline-flex items-center gap-1"
      >
        <LogIn className="w-4 h-4" /> Sign In
      </Link>
    </p>
  </div>
);
