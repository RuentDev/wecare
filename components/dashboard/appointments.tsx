"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar } from "@/components/admin/calendar";

interface Props {
  date: Date;
}
const Appointments: React.FC<Props> = ({ date }) => {
  const [currentDate, setCurrentDate] = useState(date);

  return (
    <Card className="overflow-hidden lg:col-span-2">
      <CardHeader>
        <CardTitle>Appointment Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar date={currentDate} />
      </CardContent>
    </Card>
  );
};

export default Appointments;
