
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/types/form';
import { useToast } from '@/hooks/use-toast';

interface ShareFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: Form;
  onSave: (form: Form) => void;
}

export function ShareFormModal({ isOpen, onClose, form, onSave }: ShareFormModalProps) {
  const [settings, setSettings] = useState(form.settings);
  const { toast } = useToast();

  const publicUrl = form.publicId ? `${window.location.origin}/form/${form.publicId}` : '';

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: 'fab fa-facebook-f',
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`
    },
    {
      name: 'Twitter',
      icon: 'fab fa-twitter',
      color: 'bg-blue-400 hover:bg-blue-500',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(publicUrl)}&text=${encodeURIComponent(form.title)}`
    },
    {
      name: 'WhatsApp',
      icon: 'fab fa-whatsapp',
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodeURIComponent(form.title + ' - ' + publicUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: 'fab fa-linkedin-in',
      color: 'bg-blue-700 hover:bg-blue-800',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`
    },
    {
      name: 'Telegram',
      icon: 'fab fa-telegram-plane',
      color: 'bg-blue-500 hover:bg-blue-600',
      url: `https://t.me/share/url?url=${encodeURIComponent(publicUrl)}&text=${encodeURIComponent(form.title)}`
    },
    {
      name: 'Reddit',
      icon: 'fab fa-reddit-alien',
      color: 'bg-orange-600 hover:bg-orange-700',
      url: `https://reddit.com/submit?url=${encodeURIComponent(publicUrl)}&title=${encodeURIComponent(form.title)}`
    },
    {
      name: 'Pinterest',
      icon: 'fab fa-pinterest-p',
      color: 'bg-red-600 hover:bg-red-700',
      url: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(publicUrl)}&description=${encodeURIComponent(form.title)}`
    },
    {
      name: 'Discord',
      icon: 'fab fa-discord',
      color: 'bg-indigo-600 hover:bg-indigo-700',
      url: `https://discord.com/channels/@me`
    },
    {
      name: 'Slack',
      icon: 'fab fa-slack',
      color: 'bg-purple-600 hover:bg-purple-700',
      url: `https://slack.com/intl/en-in/`
    },
    {
      name: 'Email',
      icon: 'fas fa-envelope',
      color: 'bg-gray-600 hover:bg-gray-700',
      url: `mailto:?subject=${encodeURIComponent(form.title)}&body=${encodeURIComponent('Check out this form: ' + publicUrl)}`
    },
    {
      name: 'Copy Link',
      icon: 'fas fa-link',
      color: 'bg-gray-800 hover:bg-gray-900',
      action: 'copy'
    }
  ];

  const handleCopyUrl = async () => {
    if (!publicUrl) return;
    
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast({ title: 'URL copied to clipboard!' });
    } catch (err) {
      toast({ title: 'Failed to copy URL', variant: 'destructive' });
    }
  };

  const handleSocialShare = (platform: any) => {
    if (platform.action === 'copy') {
      handleCopyUrl();
      return;
    }
    
    if (publicUrl && platform.url) {
      window.open(platform.url, '_blank', 'width=600,height=400');
    } else {
      toast({ title: 'Please save and publish your form first', variant: 'destructive' });
    }
  };

  const handleSave = () => {
    onSave({
      ...form,
      settings,
      isPublished: true,
    });
    onClose();
    toast({ title: 'Form settings saved and published!' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <i className="fas fa-share text-white"></i>
            </div>
            <span>Share Your Form</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Share your form via social media platforms, copy the link, or configure form settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Form URL */}
          {publicUrl ? (
            <div className="bg-gray-50 rounded-xl p-4">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Public Form URL</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={publicUrl}
                  readOnly
                  className="flex-1 bg-white text-sm font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyUrl}
                  className="px-4 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                >
                  <i className="fas fa-copy mr-2"></i>
                  Copy
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-amber-700">
                <i className="fas fa-exclamation-triangle"></i>
                <span className="font-medium">Form not published yet</span>
              </div>
              <p className="text-sm text-amber-600 mt-1">Save your form to generate a shareable URL</p>
            </div>
          )}
          
          {/* QR Code Placeholder */}
          <div className="text-center bg-gray-50 rounded-xl p-6">
            <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg mx-auto mb-3 flex items-center justify-center">
              <i className="fas fa-qrcode text-3xl text-gray-400"></i>
            </div>
            <p className="text-sm text-gray-600 font-medium">QR Code</p>
            <p className="text-xs text-gray-500">Scan to access form</p>
          </div>
          
          {/* Social Media Sharing */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-4 block flex items-center">
              <i className="fas fa-share-alt mr-2"></i>
              Share on Social Media
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {socialPlatforms.map((platform, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={() => handleSocialShare(platform)}
                  className={`${platform.color} text-white border-0 flex flex-col items-center justify-center h-16 transition-all hover:scale-105`}
                  disabled={!publicUrl && platform.action !== 'copy'}
                >
                  <i className={`${platform.icon} text-lg mb-1`}></i>
                  <span className="text-xs font-medium">{platform.name}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Form Settings */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <i className="fas fa-cog mr-2"></i>
              Form Settings
            </h4>
            <div className="space-y-4 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="allowAnonymous"
                  checked={settings.allowAnonymous}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, allowAnonymous: !!checked }))
                  }
                />
                <Label htmlFor="allowAnonymous" className="text-sm text-gray-700 flex items-center">
                  <i className="fas fa-user-secret mr-2 text-gray-500"></i>
                  Allow anonymous responses
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="requireAuth"
                  checked={settings.requireAuth}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, requireAuth: !!checked }))
                  }
                />
                <Label htmlFor="requireAuth" className="text-sm text-gray-700 flex items-center">
                  <i className="fas fa-lock mr-2 text-gray-500"></i>
                  Require authentication
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, emailNotifications: !!checked }))
                  }
                />
                <Label htmlFor="emailNotifications" className="text-sm text-gray-700 flex items-center">
                  <i className="fas fa-bell mr-2 text-gray-500"></i>
                  Send email notifications
                </Label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
          <Button onClick={handleSave} className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <i className="fas fa-save mr-2"></i>
            Save & Publish
          </Button>
          <Button variant="outline" onClick={onClose} className="px-8">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
