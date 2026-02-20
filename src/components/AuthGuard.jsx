import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * A wrapper for protected routes that redirects to login if the user
 * is not authenticated or if their session is invalid.
 */
export default function AuthGuard({ children }) {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold animate-pulse">Verifying Session...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        // Redirect them to the /login page, but save the current location they 
        // were trying to go to. This allows us to send them back to that 
        // page after they login, which is a nicer user experience.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
