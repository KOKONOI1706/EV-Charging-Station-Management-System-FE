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
import { toast } from "sonner";
import { useLanguage } from "../hooks/useLanguage";

interface FAQItem {
  id: string;
  questionKey: keyof typeof import("../data/translations").translations.en;
  answerKey: keyof typeof import("../data/translations").translations.en;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  { id: "1", questionKey: "faqQ1", answerKey: "faqA1", category: "charging" },
  { id: "2", questionKey: "faqQ2", answerKey: "faqA2", category: "technical" },
  { id: "3", questionKey: "faqQ3", answerKey: "faqA3", category: "billing" },
  { id: "4", questionKey: "faqQ4", answerKey: "faqA4", category: "reservations" },
  { id: "5", questionKey: "faqQ5", answerKey: "faqA5", category: "technical" },
  { id: "6", questionKey: "faqQ6", answerKey: "faqA6", category: "billing" }
];

export function SupportPage() {
  const { t } = useLanguage();
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
    { value: "all", label: t.allTopics },
    { value: "charging", label: t.chargingSessions },
    { value: "technical", label: t.technicalIssues },
    { value: "billing", label: t.billingPayment },
    { value: "reservations", label: t.reservations }
  ];

  const filteredFAQs = FAQ_ITEMS.filter(item => {
    const question = t[item.questionKey] || "";
    const answer = t[item.answerKey] || "";
    const matchesSearch = question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.subject || !contactForm.category || !contactForm.message) {
      toast.error(t.fillAllFields);
      return;
    }
    
    // Simulate form submission
    toast.success(t.ticketSubmitted);
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
          <span className="text-green-600">{t.howCanWeHelp}</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t.howCanWeHelpDesc}
        </p>
      </div>

      {/* Quick Contact Options */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Phone className="w-8 h-8 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">{t.callUs}</h3>
            <p className="text-gray-600 mb-4">{t.supportAvailable}</p>
            <Button variant="outline" className="w-full">
              <Phone className="w-4 h-4 mr-2" />
              1-800-CHARGE-1
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">{t.liveChat}</h3>
            <p className="text-gray-600 mb-4">{t.avgResponse}</p>
            <Button variant="outline" className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              {t.startChat}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Mail className="w-8 h-8 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">{t.emailSupport}</h3>
            <p className="text-gray-600 mb-4">{t.responseTime}</p>
            <Button variant="outline" className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              {t.sendEmail}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="faq" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 lg:w-96 mx-auto">
          <TabsTrigger value="faq">{t.faq}</TabsTrigger>
          <TabsTrigger value="contact">{t.contactUs}</TabsTrigger>
          <TabsTrigger value="status">{t.systemStatus}</TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>{t.frequentlyAskedQuestions}</CardTitle>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder={t.searchForAnswers}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectCategory} />
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
                      <span className="font-medium pr-4">{t[faq.questionKey]}</span>
                      {expandedFAQ === faq.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-4 pb-4 text-gray-600">
                        {t[faq.answerKey]}
                      </div>
                    )}
                  </div>
                ))}
                {filteredFAQs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {t.noFaqsFound}
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
                <CardTitle>{t.submitSupportTicket}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="subject">{t.subject} *</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder={t.subjectPlaceholder}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">{t.category} *</Label>
                    <Select
                      value={contactForm.category}
                      onValueChange={(value: string) => setContactForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectIssueCategory} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="charging">{t.categoryCharging}</SelectItem>
                        <SelectItem value="billing">{t.categoryBilling}</SelectItem>
                        <SelectItem value="technical">{t.categoryTechnical}</SelectItem>
                        <SelectItem value="account">{t.categoryAccount}</SelectItem>
                        <SelectItem value="other">{t.categoryOther}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">{t.priority}</Label>
                    <Select
                      value={contactForm.priority}
                      onValueChange={(value: string) => setContactForm(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t.priorityLow}</SelectItem>
                        <SelectItem value="medium">{t.priorityMedium}</SelectItem>
                        <SelectItem value="high">{t.priorityHigh}</SelectItem>
                        <SelectItem value="urgent">{t.priorityUrgent}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">{t.message} *</Label>
                    <Textarea
                      id="message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder={t.messagePlaceholder}
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    {t.submitTicket}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t.contactInformation}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">{t.supportHotline}</p>
                      <p className="text-gray-600">1-800-CHARGE-1</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{t.emailSupport}</p>
                      <p className="text-gray-600">support@chargetech.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium">{t.headquarters}</p>
                      <p className="text-gray-600">123 Electric Ave, San Francisco, CA 94105</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium">{t.supportHours}</p>
                      <p className="text-gray-600">24/7 for emergencies<br />Mon-Fri 8AM-8PM PT for general inquiries</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.emergencyContacts}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-red-800">{t.stationEmergency}</span>
                    </div>
                    <p className="text-sm text-red-700">
                      {t.emergencyMessage}
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
                  {t.systemStatus}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">{t.allSystemsOperational}</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {t.operationalStatus}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h3 className="font-semibold">{t.coreServices}</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-green-600" />
                            <span>{t.chargingNetwork}</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {t.operationalStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="w-4 h-4 text-green-600" />
                            <span>{t.mobileApp}</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {t.operationalStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-green-600" />
                            <span>{t.paymentSystem}</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {t.operationalStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold">{t.supportServices}</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-green-600" />
                            <span>{t.customerSupport}</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {t.operationalStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-green-600" />
                            <span>{t.accountManagement}</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {t.operationalStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-green-600" />
                            <span>{t.webPortal}</span>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {t.operationalStatus}
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
                <CardTitle>{t.recentUpdates}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">{t.statusUpdate1Title}</p>
                      <p className="text-sm text-gray-600">
                        {t.statusUpdate1Desc}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Dec 20, 2024 - 2:30 PM</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">{t.statusUpdate2Title}</p>
                      <p className="text-sm text-gray-600">
                        {t.statusUpdate2Desc}
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