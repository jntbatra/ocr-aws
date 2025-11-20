import { Loader2 } from 'lucide-react';

export default function Loader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      <p className="text-gray-600">{text}</p>
    </div>
  );
}
