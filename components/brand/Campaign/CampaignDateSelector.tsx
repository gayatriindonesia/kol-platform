"use client";

import { useState, useEffect } from "react";
import useCampaignAppStore from "@/storeCampaign";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CampaignDateSelector = () => {
  const { formData, updateFormData } = useCampaignAppStore();
  const [dateError, setDateError] = useState("");

  // Set default dates if not already set
  useEffect(() => {
    if (!formData.startDate) {
      const currentDate = new Date();
      // Default start date to tomorrow
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() + 1);
      
      // Default end date to 7 days after start date
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
      
      updateFormData({
        startDate: startDate,
        endDate: endDate,
      });
    }
  }, [formData.startDate, updateFormData]);

  const handleStartDateChange = (date: Date | undefined) => {
    setDateError("");

    if (!date || !formData.endDate) return;
    
    let newEndDate = formData.endDate;
    
    // If selected start date is after current end date, adjust end date
    if (date > formData.endDate) {
      // New end date is 7 days after new start date
      newEndDate = new Date(date);
      newEndDate.setDate(date.getDate() + 7);
    }
    
    updateFormData({
      startDate: date,
      endDate: newEndDate,
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setDateError("");
    if (!date ||!formData.startDate) return;
    
    if (date < formData.startDate) {
      setDateError("Tanggal selesai tidak boleh lebih awal dari tanggal mulai");
      return;
    }
    
    updateFormData({
      endDate: date,
    });
  };

  // Disable past dates for start date
  const disablePastDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Disable dates before start date for end date
  const disableBeforeStartDate = (date: Date) => {
    return formData.startDate ? date < formData.startDate : true;
  }

  return (
    <div className="space-y-6">

      {dateError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{dateError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Start Date Picker */}
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-sm font-medium">
            Tanggal Mulai
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="startDate"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.startDate ? (
                  format(formData.startDate, "PPP", { locale: id })
                ) : (
                  <span>Pilih tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.startDate}
                onSelect={handleStartDateChange}
                disabled={disablePastDates}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-gray-500">
            Tanggal campaign akan mulai aktif
          </p>
        </div>

        {/* End Date Picker */}
        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-sm font-medium">
            Tanggal Selesai
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="endDate"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.endDate ? (
                  format(formData.endDate, "PPP", { locale: id })
                ) : (
                  <span>Pilih tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.endDate}
                onSelect={handleEndDateChange}
                disabled={formData.startDate ? disableBeforeStartDate : disablePastDates}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-gray-500">
            Tanggal campaign akan berakhir
          </p>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-800">Durasi Campaign</h3>
        {formData.startDate && formData.endDate ? (
          <p className="text-blue-600 mt-1">
            Campaign akan berjalan selama{" "}
            <span className="font-bold">
              {Math.ceil(
                (formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24)
              )}{" "}
              hari
            </span>{" "}
            dari{" "}
            <span className="font-medium">
              {format(formData.startDate, "d MMMM yyyy", { locale: id })}
            </span>{" "}
            sampai{" "}
            <span className="font-medium">
              {format(formData.endDate, "d MMMM yyyy", { locale: id })}
            </span>
          </p>
        ) : (
          <p className="text-blue-600 mt-1">
            Silakan pilih tanggal mulai dan selesai campaign
          </p>
        )}
      </div>
    </div>
  );
};

export default CampaignDateSelector;