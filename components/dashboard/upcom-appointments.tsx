import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users } from "lucide-react";

type Appointment = Record<string, unknown>;

interface Props {
  stats?: {
    upcomingAppointments: Appointment[];
  };
}
const UpcommingAppointments = ({ stats }: Props) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Upcoming Appointments</CardTitle>
      </CardHeader>
      <CardContent className="h-[350px] overflow-auto">
        {stats?.upcomingAppointments?.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No upcoming appointments
          </p>
        ) : (
          <div className="space-y-4">
            {stats?.upcomingAppointments?.map?.(
              (apt: Record<string, unknown>) => (
                <div
                  key={apt.id as string}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {apt.patient_first_name as string}{" "}
                      {apt.patient_last_name as string}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {apt.service_name as string}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(
                        apt.appointment_date as string,
                      ).toLocaleDateString()}{" "}
                      at {(apt.start_time as string).slice(0, 5)}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcommingAppointments;
