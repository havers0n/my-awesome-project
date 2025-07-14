import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router";

interface SignOutButtonProps {
  children: React.ReactNode;
  className?: string;
}

export default function SignOutButton({ children, className = "" }: SignOutButtonProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <button onClick={handleSignOut} className={className}>
      {children}
    </button>
  );
}
