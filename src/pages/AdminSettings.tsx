
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Database, Mail, Shield, Phone, Edit, Save, X, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Contact {
  id: string;
  platform: string;
  label: string;
  value: string;
  icon_type: string;
  is_active: boolean;
  display_order: number;
}

export default function AdminSettings() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      platform: 'phone',
      label: 'Call',
      value: '+17622035587',
      icon_type: 'phone',
      is_active: true,
      display_order: 1
    },
    {
      id: '2',
      platform: 'email',
      label: 'Email',
      value: 'assetrecovery36@gmail.com',
      icon_type: 'email',
      is_active: true,
      display_order: 2
    },
    {
      id: '3',
      platform: 'whatsapp',
      label: 'WhatsApp',
      value: 'https://wa.me/17622035587',
      icon_type: 'whatsapp',
      is_active: true,
      display_order: 3
    },
    {
      id: '4',
      platform: 'telegram',
      label: 'Telegram',
      value: 'https://t.me/Assetrecovery_HQ',
      icon_type: 'telegram',
      is_active: true,
      display_order: 4
    }
  ]);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const platformOptions = [
    { value: 'phone', label: 'Phone' },
    { value: 'email', label: 'Email' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'telegram', label: 'Telegram' },
  ];

  const handleSave = (contactData: Partial<Contact>) => {
    if (editingContact?.id) {
      // Update existing contact
      setContacts(contacts.map(c => 
        c.id === editingContact.id ? { ...c, ...contactData } : c
      ));
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
    } else {
      // Create new contact
      const newContact = {
        ...contactData,
        id: Date.now().toString(),
      } as Contact;
      setContacts([...contacts, newContact]);
      toast({
        title: "Success",
        description: "Contact created successfully",
      });
    }
    setIsDialogOpen(false);
    setEditingContact(null);
  };

  const toggleContactStatus = (id: string) => {
    setContacts(contacts.map(c => 
      c.id === id ? { ...c, is_active: !c.is_active } : c
    ));
    toast({
      title: "Success",
      description: "Contact status updated",
    });
  };

  const ContactForm = ({ contact, onSave, onCancel }: {
    contact?: Contact;
    onSave: (contact: Partial<Contact>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      platform: contact?.platform || '',
      label: contact?.label || '',
      value: contact?.value || '',
      icon_type: contact?.icon_type || '',
      is_active: contact?.is_active ?? true,
      display_order: contact?.display_order || 0,
    });

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="platform">Platform</Label>
          <Select value={formData.platform} onValueChange={(value) => setFormData({...formData, platform: value, icon_type: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {platformOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            value={formData.label}
            onChange={(e) => setFormData({...formData, label: e.target.value})}
            placeholder="e.g., Call, Email"
          />
        </div>

        <div>
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            value={formData.value}
            onChange={(e) => setFormData({...formData, value: e.target.value})}
            placeholder="Phone number, email, or URL"
          />
        </div>

        <div>
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={() => onSave(formData)}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout title="System Settings">
      <div className="space-y-6">
        {/* Contact Management Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingContact(null)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingContact ? 'Edit Contact' : 'Add New Contact'}
                    </DialogTitle>
                  </DialogHeader>
                  <ContactForm
                    contact={editingContact || undefined}
                    onSave={handleSave}
                    onCancel={() => setIsDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Manage contact information displayed throughout the website.</p>
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{contact.label}</span>
                        <Badge variant={contact.is_active ? "default" : "secondary"}>
                          {contact.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          Order: {contact.display_order}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {contact.platform}: {contact.value}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleContactStatus(contact.id)}
                    >
                      {contact.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingContact(contact);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Other Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Database configuration and maintenance settings.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Configure email notifications and templates.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Security policies and access controls.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">General application configuration.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
