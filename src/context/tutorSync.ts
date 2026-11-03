import { ISLMProfile, DKMNode, ChatSession, UserProfile, PedagogicalEvent } from '../types';

export async function fetchUserStateFromServer(studentId: string, role: string) {
  try {
    const res = await fetch(`/api/user/state?studentId=${encodeURIComponent(studentId)}&role=${encodeURIComponent(role)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Network error loading user state from server:', err);
  }
  return null;
}

export async function syncUserStateToServer(params: {
  studentId: string;
  islm?: ISLMProfile;
  dkmNodes?: DKMNode[];
  sessions?: ChatSession[];
  userProfile?: UserProfile;
}) {
  try {
    await fetch('/api/user/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  } catch (err) {
    console.warn('Failed to sync user state to server store:', err);
  }
}

export async function recordPedagogicalEvent(event: Omit<PedagogicalEvent, 'id' | 'ts'> & { id?: string; ts?: string }) {
  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch (err) {
    console.warn('Failed to record event to server events stream:', err);
  }
}

export async function loginUserOnServer(params: {
  email: string;
  name?: string;
  role?: 'student' | 'teacher';
  degree?: string;
  id?: string;
}) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`Login failed with status ${res.status}`);
  }

  return await res.json();
}
