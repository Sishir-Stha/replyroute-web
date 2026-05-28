import { MessageCircle, Globe, Mail, Hash, AtSign } from 'lucide-react';
import type { Channel } from '@/types';

const config: Record<Channel, { icon: typeof MessageCircle; color: string; bg: string; label: string }> = {
  facebook: { icon: Hash, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Facebook' },
  instagram: { icon: AtSign, color: 'text-pink-600', bg: 'bg-pink-50', label: 'Instagram' },
  whatsapp: { icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'WhatsApp' },
  website: { icon: Globe, color: 'text-teal-600', bg: 'bg-teal-50', label: 'Website' },
  email: { icon: Mail, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Email' },
};

export function ChannelIcon({ channel, showLabel = false, size = 16 }: { channel: Channel; showLabel?: boolean; size?: number }) {
  const c = config[channel];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 ${c.bg} ${c.color} rounded-full px-2 py-0.5 text-xs font-medium`}>
      <Icon size={size} />
      {showLabel && <span>{c.label}</span>}
    </span>
  );
}
