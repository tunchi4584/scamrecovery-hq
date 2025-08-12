import { useState } from 'react';
import { Mail, MessageCircle, Phone, Headphones, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

export function ContactIcons() {
  const [isExpanded, setIsExpanded] = useState(false);

  const contacts = [
    {
      icon: Phone,
      label: "Call",
      href: "tel:+17622035587",
      className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
    },
    {
      icon: Mail,
      label: "Email",
      href: "mailto:assetrecovery36@gmail.com",
      className: "text-gray-600 hover:text-gray-700 hover:bg-gray-50"
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      href: "https://wa.me/17622035587",
      className: "text-green-600 hover:text-green-700 hover:bg-green-50"
    },
    {
      icon: () => (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      label: "Telegram",
      href: "https://t.me/Assetrecovery_HQ",
      className: "text-blue-500 hover:text-blue-600 hover:bg-blue-50"
    }
  ];

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Floating Contact Button */}
        <div className="relative">
          {/* Expanded Contact Options */}
          {isExpanded && (
            <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4 min-w-[200px] animate-in slide-in-from-bottom-2 fade-in-0">
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Contact Us</h3>
                {contacts.map((contact, index) => {
                  const IconComponent = contact.icon;
                  return (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <a
                          href={contact.href}
                          target={contact.href.startsWith('http') ? '_blank' : undefined}
                          rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${contact.className}`}
                        >
                          <IconComponent className="h-5 w-5" />
                          <span className="text-sm font-medium">{contact.label}</span>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>{contact.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Floating Button */}
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
            size="sm"
          >
            {isExpanded ? (
              <X className="h-6 w-6 text-primary-foreground" />
            ) : (
              <Headphones className="h-6 w-6 text-primary-foreground" />
            )}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}