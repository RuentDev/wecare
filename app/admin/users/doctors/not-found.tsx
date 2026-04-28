import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const DoctorNotFound = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
        {/* Left side: Circle with 404 */}
        <div className="flex h-48 w-48 items-center justify-center rounded-full bg-neutral-gray/50 md:h-64 md:w-64">
          <span className="text-6xl font-bold text-primary md:text-8xl">
            404
          </span>
        </div>

        {/* Separator */}
        <Separator
          orientation="vertical"
          className="hidden h-32 w-px bg-neutral-gray md:block"
        />

        {/* Right side: Text and Button */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            This Doctor could not be found
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            You can either stay and chill here, or go{" "}
            <br className="hidden md:block" />
            back to the beginning.
          </p>
          <div className="mt-8">
            <Button
              asChild
              variant="secondary"
              className="px-8 py-6 text-base font-semibold uppercase tracking-wider rounded-full cursor-pointer hover:bg-secondary/90 transition-all"
            >
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorNotFound;
