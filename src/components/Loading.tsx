import { DESIGN } from '@/constants/design';

export default function Loading() {
  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-[${DESIGN.colors.background}]/80 z-50`}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
