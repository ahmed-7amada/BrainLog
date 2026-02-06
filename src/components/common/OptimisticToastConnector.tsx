/**
 * OptimisticToastConnector Component
 * Connects the optimistic update manager with the toast system (FR-017)
 */

import { useEffect } from 'react';
import { useToast } from './ToastProvider';
import { setToastCallback } from '../../services/sync/optimisticUpdateManager';

/**
 * This component connects the optimistic update manager's toast callback
 * to the app's toast system. It should be rendered inside the ToastProvider.
 */
export const OptimisticToastConnector: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  useEffect(() => {
    // Connect the toast callback to the optimistic update manager
    setToastCallback(showToast);

    // Cleanup on unmount (though typically the app won't unmount)
    return () => {
      setToastCallback(() => {});
    };
  }, [showToast]);

  return <>{children}</>;
};

export default OptimisticToastConnector;
