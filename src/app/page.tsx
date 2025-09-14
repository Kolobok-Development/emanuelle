'use client';

import { useAppContext } from '@/contexts/AppContext';

export default function Home() {
  
  const { user, session, isLoading, isAuthenticated, authenticateUser } = useAppContext();

  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : isAuthenticated && user ? (
        <div>
          <h1>Welcome{user.username ? `, ${user.username}` : ''}</h1>
          <ul>
            <li>User ID: {user.id}</li>
            <li>
              Telegram ID: {typeof user.telegram_id === 'bigint'
                ? user.telegram_id.toString()
                : String(user.telegram_id)}
            </li>
            {session?.expires_at ? (
              <li>Session expires: {new Date(session.expires_at).toLocaleString()}</li>
            ) : null}
          </ul>
        </div>
      ) : (
        <div>
          <h1>Not authenticated</h1>
          <button onClick={authenticateUser}>Login with Telegram</button>
        </div>
      )}
    </div>
  );
}
