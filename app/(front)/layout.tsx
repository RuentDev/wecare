import Footer from "@/components/footer";
import { Header } from "@/components/header/header";
import React from "react";

const FrontLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default FrontLayout;
