import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getJWTToken } from '@/components/AppLocalStorage/AppLocalStorage';
import { useMagic } from '@/components/magic/MagicProvider';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, Dispatch } from '../store/index';

// Mock function to check if the user is authenticated
// Replace this with your actual authentication logic
const checkAuth = (): boolean => {
  const token = getJWTToken();
  return Boolean(token);
};

// Higher Order Component (HOC) for authentication
function withAuth<T>(WrappedComponent: React.ComponentType<T>): any {
  const ComponentWithAuth: React.FC<T> = props => {
    const { magic } = useMagic();
    const router = useRouter();
    const isLoggedIn = checkAuth();
    const dispatch = useDispatch<Dispatch>();
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
      if (isLoggedIn) {
        if (!user) {
          dispatch.auth.handleGetUser();
        }
      }
    }, [user]);

    if (isLoggedIn) {
      // @ts-ignore
      return <WrappedComponent {...props} />;
    } else {
      localStorage.clear();
      magic?.user?.logout();
      router.push('/');
      return null;
    }
  };

  return ComponentWithAuth;
}

export default withAuth;
