import Link from "next/link";
import { Button } from "../ui/button";

const CTA = () => {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-primary text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Ready to Book Your Appointment?
        </h2>
        <p className="text-lg text-blue-100 mb-8">
          Take the first step towards better health today.
        </p>
        <Button
          asChild
          className="bg-white hover:bg-blue-50 text-primary font-semibold py-3 px-8 rounded-[12px]"
        >
          <Link href="/booking">Book Now</Link>
        </Button>
      </div>
    </section>
  );
};

export default CTA;
