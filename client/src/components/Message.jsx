import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

const iconByType = { error: AlertCircle, success: CheckCircle2, info: Info };

export default function Message({ children, type = 'error' }) {
  const Icon = iconByType[type] || Info;
  return <div className={`message message-${type}`} role={type === 'error' ? 'alert' : 'status'}><Icon size={17} /><span>{children}</span></div>;
}
