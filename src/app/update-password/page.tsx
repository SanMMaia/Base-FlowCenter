import UpdatePasswordForm from '@/components/UpdatePasswordForm';
import { DESIGN } from '@/constants/design';

export default function UpdatePasswordPage() {
  return (
    <div className={`max-w-md mx-auto p-[${DESIGN.spacing.md}] bg-[${DESIGN.colors.card}] rounded-[${DESIGN.borderRadius.md}] shadow`}>
      <UpdatePasswordForm />
    </div>
  );
}
