import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockServices } from "@/lib/mock-data";
import { Clock, DollarSign, Trash2, Edit } from "lucide-react";

export default function ServicesManagement() {
  return (
    <main className="min-h-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {mockServices.map((service) => (
          <Card
            key={service.id}
            className="rounded-[12px] p-6 bg-white border border-neutral-gray hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-neutral-dark flex-1">
                {service.name}
              </h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-neutral-light rounded-lg transition-colors">
                  <Edit className="w-4 h-4 text-neutral-gray" />
                </button>
                <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            <p className="text-sm text-neutral-gray mb-4">
              {service.description}
            </p>

            <div className="flex gap-6 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-secondary" />
                <div>
                  <p className="text-xs text-neutral-gray">Duration</p>
                  <p className="font-semibold text-neutral-dark">
                    {service.duration} min
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs text-neutral-gray">Price</p>
                  <p className="font-semibold text-neutral-dark">
                    ${service.price}
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full rounded-[12px]">
              Edit Service
            </Button>
          </Card>
        ))}
      </div>
    </main>
  );
}
