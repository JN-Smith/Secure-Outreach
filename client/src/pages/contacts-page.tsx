import { useState } from "react";
import { Link } from "wouter";
import { useContacts, Contact } from "@/lib/contacts-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MoreHorizontal, UserPlus, Phone, MapPin } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { contacts } = useContacts();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredContacts = contacts.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case "New": return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "Needs Follow-up": return "bg-orange-100 text-orange-700 hover:bg-orange-100";
      case "Actively Discipling": return "bg-purple-100 text-purple-700 hover:bg-purple-100";
      case "Connected to Church": return "bg-green-100 text-green-700 hover:bg-green-100";
      default: return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">Contacts</h2>
          <p className="text-muted-foreground mt-1">Manage and track your outreach connections.</p>
        </div>
        <Link href="/contacts/new">
          <Button className="shadow-lg shadow-primary/20">
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Contact
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[250px]">Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <TableRow key={contact.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="text-base">{contact.fullName}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {contact.phone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`border-0 font-medium ${getStatusColor(contact.status)}`}>
                      {contact.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {contact.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs text-muted-foreground font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedContact(contact); setDialogOpen(true); }}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert(`Log follow-up for ${contact.fullName}`)}>
                          Log Follow-up
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => alert(`Delete ${contact.fullName}`)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No contacts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Contact Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
            <DialogDescription>
              {selectedContact ? (
                <div className="space-y-2 text-left">
                  <div><b>Name:</b> {selectedContact.fullName}</div>
                  <div><b>Phone:</b> {selectedContact.phone}</div>
                  <div><b>Gender:</b> {selectedContact.gender || "-"}</div>
                  <div><b>Age Range:</b> {selectedContact.ageRange || "-"}</div>
                  <div><b>Location:</b> {selectedContact.location}</div>
                  <div><b>Church:</b> {selectedContact.church || "-"}</div>
                  <div><b>Born Again:</b> {selectedContact.bornAgain}</div>
                  <div><b>Baptized:</b> {selectedContact.baptized}</div>
                  <div><b>Discipleship Status:</b> {selectedContact.discipleshipStatus}</div>
                  <div><b>Is Student:</b> {selectedContact.isStudent ? "Yes" : "No"}</div>
                  {selectedContact.isStudent && (
                    <>
                      <div><b>Institution:</b> {selectedContact.institution || "-"}</div>
                      <div><b>Course:</b> {selectedContact.course || "-"}</div>
                      <div><b>Year of Study:</b> {selectedContact.yearOfStudy || "-"}</div>
                    </>
                  )}
                  <div><b>Follow-Up Method:</b> {selectedContact.followUpMethod}</div>
                  <div><b>Best Time:</b> {selectedContact.bestTime || "-"}</div>
                  <div><b>Follow-Up Status:</b> {selectedContact.status || "-"}</div>
                  <div><b>Tags:</b> {selectedContact.tags && selectedContact.tags.length > 0 ? selectedContact.tags.join(", ") : "-"}</div>
                  <div><b>Prayer Requests:</b> {selectedContact.prayerRequests || "-"}</div>
                  <div><b>Notes:</b> {selectedContact.notes || "-"}</div>
                </div>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button variant="outline" className="mt-4 w-full">Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
