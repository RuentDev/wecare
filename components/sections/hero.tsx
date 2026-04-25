import React from "react";

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-dark leading-tight mb-4">
            Quality Healthcare,{" "}
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="text-lg text-neutral-gray max-w-2xl mx-auto">
            Book appointments with qualified healthcare professionals in just a
            few clicks.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
