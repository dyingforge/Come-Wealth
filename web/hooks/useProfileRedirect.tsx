// hooks/useProfileRedirect.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { ContractsProvider } from '@/context/contractsProvider';
import type { DisplayProfile } from '@/type';

export function useProfileRedirect() {
  const router = useRouter();
  const account = useCurrentAccount();
  const { getDisplayProfile } = ContractsProvider();
  const [profile, setProfile] = useState<DisplayProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      setIsLoading(true);
      try {
        if (account) {
          const userProfile = await getDisplayProfile();
          
          if (!userProfile) {
            // 用户没有账户，重定向到注册页面
            router.push('/register');
            return null;
          }
          
          setProfile(userProfile);
          return userProfile;
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        router.push('/register');
        return null;
      } finally {
        setIsLoading(false);
      }
    };
    
    checkProfileAndRedirect();
  }, [account, router, getDisplayProfile]);

  return { account, profile, isLoading };
}