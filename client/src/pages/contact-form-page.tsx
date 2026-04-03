import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useCreateContact } from "@/lib/api/contacts";

const contactSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(5, "Phone is required"),
  gender: z.string().optional(),
  ageRange: z.string().optional(),

  // Spiritual
  church: z.string().optional(),
  bornAgain: z.enum(["Yes", "No", "Unsure"]),
  discipleshipStatus: z.enum(["Done", "In Progress", "Not Started"]),
  baptized: z.enum(["Yes", "No", "Unsure"]),

  // Location & Background
  location: z.string().min(2, "Location is required"),
  isStudent: z.boolean().default(false),
  institution: z.string().optional(),
  course: z.string().optional(),
  yearOfStudy: z.string().optional(),

  // Follow Up
  followUpMethod: z.enum(["Call", "WhatsApp", "Visit", "Church Invitation"]),
  bestTimes: z.array(z.string()).min(1, "At least one time is required"),
  followUpStatus: z.enum(["New", "Needs Follow-up", "Actively Discipling", "Connected to Church", "Not Interested"]),
  tags: z.array(z.string()).optional(),
  prayerRequests: z.string().optional(),
  notes: z.string().optional(),
  consent: z.boolean().refine(val => val === true, "Consent is required"),
});

function normalizeYesNo(val: string) {
  return val === "Unsure" ? "Not Sure" : val;
}

export default function ContactFormPage() {
  const [, setLocation] = useLocation();
  const createContact = useCreateContact();

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      bornAgain: "Unsure",
      discipleshipStatus: "Not Started",
      baptized: "Unsure",
      isStudent: false,
      followUpMethod: "Call",
      bestTimes: [""],
      followUpStatus: "New",
      tags: [],
      consent: false,
    },
  });

  const isStudent = form.watch("isStudent");
  const bestTimes = form.watch("bestTimes");

  function onSubmit(values: z.infer<typeof contactSchema>) {
    createContact.mutate(
      {
        full_name: values.fullName,
        phone: values.phone,
        email: undefined,
        gender: values.gender,
        age_range: values.ageRange,
        born_again: normalizeYesNo(values.bornAgain),
        discipleship_status: values.discipleshipStatus,
        baptized: normalizeYesNo(values.baptized),
        location: values.location,
        is_student: values.isStudent,
        institution: values.institution,
        course: values.course,
        follow_up_method: values.followUpMethod,
        prayer_requests: values.prayerRequests,
        notes: values.notes,
        status: values.followUpStatus,
        tags: values.tags ?? [],
      } as any,
      {
        onSuccess: () => {
          toast.success("Contact saved", { description: "Outreach contact recorded." });
          setLocation("/contacts");
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "Unknown error";
          toast.error("Failed to save contact", { description: msg });
        },
      },
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-heading font-bold tracking-tight">New Contact</h2>
        <p className="text-muted-foreground mt-1">Record details of a new person reached.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Section 1: Personal Info */}
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Basic contact details and demographics.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+123..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ageRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age Range</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="under-18">Under 18</SelectItem>
                          <SelectItem value="18-25">18 - 25</SelectItem>
                          <SelectItem value="26-35">26 - 35</SelectItem>
                          <SelectItem value="36-50">36 - 50</SelectItem>
                          <SelectItem value="50+">50+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Spiritual & Church Info */}
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">Spiritual Background</CardTitle>
              <CardDescription>Current spiritual status and history.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 pt-6">
              <FormField
                control={form.control}
                name="church"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Church (if any)</FormLabel>
                    <FormControl>
                      <Input placeholder="Church name..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bornAgain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Born Again?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Unsure">Unsure</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="baptized"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baptized?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Unsure">Unsure</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discipleshipStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discipleship</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Not Started">Not Started</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Location & Background */}
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">Location & Context</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 pt-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Place of Residence (Area/Town)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Westside, Downtown" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isStudent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Is this person a student?
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {isStudent && (
                <div className="grid md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                  <FormField
                    control={form.control}
                    name="institution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution Name</FormLabel>
                        <FormControl>
                          <Input placeholder="University name..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="course"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course of Study</FormLabel>
                        <FormControl>
                          <Input placeholder="Major/Course..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yearOfStudy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year of Study</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 1st, 2nd, 3rd..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

           {/* Section 4: Follow Up */}
           <Card className="border shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-lg">Follow-Up Plan</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 p-6 pt-6">
              <FormField
                control={form.control}
                name="followUpMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Call">Phone Call</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                        <SelectItem value="Visit">Visit</SelectItem>
                        <SelectItem value="Church Invitation">Church Invitation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Best time(s) to contact */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Best Time(s) to Contact</label>
                {bestTimes && bestTimes.map((time, idx) => (
                  <div key={idx} className="flex gap-2 mb-1">
                    <Input
                      type="time"
                      value={time}
                      onChange={e => {
                        const newTimes = [...bestTimes];
                        newTimes[idx] = e.target.value;
                        form.setValue("bestTimes", newTimes);
                      }}
                      className="w-40"
                    />
                    {bestTimes.length > 1 && (
                      <Button type="button" size="sm" variant="ghost" onClick={() => {
                        const newTimes = bestTimes.filter((_, i) => i !== idx);
                        form.setValue("bestTimes", newTimes);
                      }}>Remove</Button>
                    )}
                  </div>
                ))}
                <Button type="button" size="sm" variant="outline" onClick={() => form.setValue("bestTimes", [...bestTimes, ""])}>
                  Add Another Time
                </Button>
              </div>
              {/* Follow-up status */}
              <FormField
                control={form.control}
                name="followUpStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-Up Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Needs Follow-up">Needs Follow-up</SelectItem>
                        <SelectItem value="Actively Discipling">Actively Discipling</SelectItem>
                        <SelectItem value="Connected to Church">Connected to Church</SelectItem>
                        <SelectItem value="Not Interested">Not Interested</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma separated)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Student, New Believer, Campus Outreach"
                        value={field.value?.join(", ") || ""}
                        onChange={e => field.onChange(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Prayer Requests */}
              <FormField
                control={form.control}
                name="prayerRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prayer Requests</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any specific prayer requests..."
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes / Observations</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any specific prayer requests or details..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator />

              <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal">
                        I confirm that the person has given consent for their details to be recorded for follow-up purposes.
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => setLocation("/contacts")}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="lg" 
              className="shadow-lg shadow-primary/25"
              disabled={createContact.isPending}
            >
              {createContact.isPending ? "Saving..." : "Save Contact"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
