import { Header } from "@/components/header/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockDoctors } from "@/lib/mock-data";
import Link from "next/link";
import { Star, Trash2, Edit } from "lucide-react";

export default function DoctorsManagement() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-neutral-light py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-dark mb-2">
                Manage Doctors
              </h1>
              <p className="text-neutral-gray">
                View and manage healthcare professionals
              </p>
            </div>
            <Button className="bg-primary hover:bg-blue-900 text-white rounded-[12px]">
              Add New Doctor
            </Button>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDoctors.map((doctor) => (
              <Card
                key={doctor.id}
                className="rounded-[12px] p-6 bg-white border border-neutral-gray hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{doctor.avatar}</div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-neutral-light rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-neutral-gray" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-neutral-dark mb-1">
                  {doctor.name}
                </h3>
                <p className="text-sm text-secondary font-medium mb-3">
                  {doctor.specialty}
                </p>

                <p className="text-sm text-neutral-gray mb-3">{doctor.bio}</p>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(doctor.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-neutral-gray"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-neutral-dark">
                    {doctor.rating} ({doctor.reviewCount} reviews)
                  </span>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-[12px]"
                >
                  <Link href={`/admin/doctors/${doctor.id}`}>View Details</Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
