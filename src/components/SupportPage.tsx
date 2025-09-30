import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  Zap,
  CreditCard,
  Settings,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "1",
    question: "How do I start a charging session?",
    answer: "To start a charging session, locate your reserved charging station using the app, plug in your vehicle, and tap 'Start Session' in the app. The session will begin automatically.",
    category: "charging"
  },
  {
    id: "2",
    question: "What if a charging station is not working?",
    answer: "If you encounter a faulty station, please report it immediately through the app or call our 24/7 support line. We'll help you find an alternative station and may provide charging credits for the inconvenience.",
    category: "technical"
  },
  {
    id: "3",
    question: "How are charging fees calculated?",
    answer: "Charging fees are calculated based on the amount of electricity consumed (kWh) and the station's per-kWh rate. Your plan discount is automatically applied. You can view detailed pricing before starting each session.",
    category: "billing"
  },
  {
    id: "4",
    question: "Can I cancel or modify my reservation?",
    answer: "Yes, you can cancel or modify reservations up to 15 minutes before your scheduled time through the app or website. No cancellation fees apply for changes made with sufficient notice.",
    category: "reservations"
  },
  {
    id: "5",
    question: "What types of connectors are available?",
    answer: "Our stations support CCS, CHAdeMO, and Type 2 connectors. The app shows available connector types for each station. Most newer EVs use CCS connectors.",
    category: "technical"
  },
  {
    id: "6",
    question: "How do I update my payment method?",
    answer: "You can update your payment method in the app under Settings > Payment Methods or in your account dashboard. Changes take effect immediately for future sessions.",
    category: "billing"
  }
];

export function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: "",
    category: "",
    priority: "medium",
    message: ""
  });

  const categories = [
    { value: "all", label: "All Topics" },
    { value: "charging", label: "Charging Sessions" },
    { value: "technical", label: "Technical Issues" },
    { value: "billing", label: "Billing & Payment" },
    { value: "reservations", label: "Reservations" }
  ];

  const filteredFAQs = FAQ_ITEMS.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.subject || !contactForm.category || !contactForm.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    // Simulate form submission
    toast.success("Support ticket submitted! We'll get back to you within 24 hours.");
    setContactForm({
      subject: "",
      category: "",
      priority: "medium",
      message: ""
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          How can we <span className="text-green-600">help you?</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get quick answers to common questions or reach out to our support team.
        </p>
      </div>

      {/* Quick Contact Options */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Phone className="w-8 h-8 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Call Us</h3>
            <p className="text-gray-600 mb-4">24/7 Support Available</p>
            <Button variant="outline" className="w-full">
              <Phone className="w-4 h-4 mr-2" />
              1-800-CHARGE-1
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">Average response: 2 minutes</p>
            <Button variant="outline" className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Mail className="w-8 h-8 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">Response within 24 hours</p>
            <Button variant="outline" className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="faq" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 lg:w-96 mx-auto">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact Us</TabsTrigger>
          <TabsTrigger value="status">System Status</TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search for answers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="border rounded-lg">
                    <button
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    >
                      <span className="font-medium pr-4">{faq.question}</span>
                      {expandedFAQ === faq.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-4 pb-4 text-gray-600">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
                {filteredFAQs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No FAQs found matching your search criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Submit a Support Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={contactForm.category}
                      onValueChange={(value) => setContactForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select issue category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="charging">Charging Issues</SelectItem>
                        <SelectItem value="billing">Billing & Payment</SelectItem>
                        <SelectItem value="technical">Technical Problems</SelectItem>
                        <SelectItem value="account">Account Management</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={contactForm.priority}
                      onValueChange={(value) => setContactForm(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Please provide detailed information about your issue..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Submit Ticket
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">24/7 Support Hotline</p>
                      <p className="text-gray-600">1-800-CHARGE-1</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-gray-600">support@chargetech.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Headquarters</p>
                      <p className="text-gray-600">123 Electric Ave, San Francisco, CA 94105</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Support Hours</p>
                      <p className="text-gray-600">24/7 for emergencies<br />Mon-Fri 8AM-8PM PT for general inquiries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contacts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-800">Station Emergency</span>
                    </div>
                    <p className="text-sm text-red-700">
                      If you're stuck at a station or experiencing safety issues, call: 1-800-EMERGENCY
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* System Status Tab */}
        <TabsContent value="status">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">All Systems Operational</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Operational
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Core Services</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-green-600" />
                            <span>Charging Network</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Operational
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-green-600" />
                            <span>Mobile App</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Operational
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-green-600" />
                            <span>Payment System</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Operational
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">Support Services</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-green-600" />
                            <span>Customer Support</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Operational
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-green-600" />
                            <span>Account Management</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Operational
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-green-600" />
                            <span>Web Portal</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Operational
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">System Performance Optimization</p>
                      <p className="text-sm text-gray-600">
                        Improved app loading times and charging session reliability.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Dec 20, 2024 - 2:30 PM</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">New Station Locations Added</p>
                      <p className="text-sm text-gray-600">
                        15 new charging stations now available across the network.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Dec 18, 2024 - 10:00 AM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}