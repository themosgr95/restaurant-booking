"use client";

import { useState } from "react";
import { Button, Card, CardContent, Input, Label, NativeSelect } from "@/components/ui-primitives";
import { Check, Clock, Users, Calendar as CalendarIcon, ArrowLeft } from "lucide-react";

const TIME_SLOTS = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];

export default function BookingPage({ params }: { params: { slug: string } }) {
  const [step, setStep] = useState(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState("2");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // --- Step 1: Preferences ---
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Party Size</Label>
        <NativeSelect value={guests} onChange={(e) => setGuests(e.target.value)}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
          ))}
        </NativeSelect>
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          min={new Date().toISOString().split("T")[0]}
          className="block w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Available Times</Label>
        <div className="grid grid-cols-3 gap-2">
          {TIME_SLOTS.map((slot) => (
            <Button
              key={slot}
              variant={time === slot ? "default" : "outline"}
              className={`w-full ${time === slot ? "border-slate-900 bg-slate-900 text-white" : ""}`}
              onClick={() => setTime(slot)}
            >
              {slot}
            </Button>
          ))}
        </div>
      </div>

      <Button className="w-full mt-4" disabled={!date || !time} onClick={nextStep}>
        Continue
      </Button>
    </div>
  );

  // --- Step 2: Details ---
  const renderStep2 = () => (
    <div className="space-y-4">
      {/* Summary Box */}
      <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm text-slate-600 mb-6 border border-slate-100">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" /> <span>{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" /> <span>{time}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" /> <span>{guests} Guests</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input placeholder="Jane Doe" value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Email Address</Label>
        <Input type="email" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} />
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <Button className="flex-1" disabled={!name || !email} onClick={nextStep}>
          Confirm Booking
        </Button>
      </div>
    </div>
  );

  // --- Step 3: Success ---
  const renderStep3 = () => (
    <div className="text-center py-10 space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Booking Confirmed!</h2>
      <p className="text-slate-600 text-sm">
        We look forward to seeing you, <strong>{name}</strong>.
        <br />A confirmation has been sent to {email}.
      </p>
      <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>
        Make another booking
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <div className="p-6 border-b border-slate-100 text-center relative">
           {step === 2 && (
             <button onClick={prevStep} className="absolute left-6 top-7 text-slate-400 hover:text-slate-600">
               <ArrowLeft className="w-5 h-5" />
             </button>
           )}
          <h1 className="font-bold text-lg uppercase tracking-widest text-slate-900">
            {params.slug.replace("-", " ")}
          </h1>
        </div>
        <CardContent className="p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </CardContent>
      </Card>
    </div>
  );
}