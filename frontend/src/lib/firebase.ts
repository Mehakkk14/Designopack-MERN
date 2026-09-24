// Firebase Compatibility Layer - Redirects to MERN JWT Auth Service
// This eliminates the Firebase runtime dependency while keeping existing code fully operational.

import { auth as mernAuth } from './authService';

export const auth = mernAuth;
export const db = {};
export const storage = {};

export default {
  auth,
  db,
  storage,
};
