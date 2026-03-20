import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { Post, SiteSettings, UserProfile } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const googleProvider = new GoogleAuthProvider();

export const api = {
  // Auth
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user profile exists, if not create one
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || undefined,
          role: 'author' // Default role
        };
        await setDoc(userRef, profile);
      }
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout() {
    await signOut(auth);
  },

  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const path = `users/${uid}`;
    try {
      const userSnap = await getDoc(doc(db, 'users', uid));
      if (!userSnap.exists()) return null;
      return userSnap.data() as UserProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  // Posts
  async getPosts(): Promise<Post[]> {
    const path = 'posts';
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(postDoc => ({ id: postDoc.id, ...(postDoc.data() as any) } as Post));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getPublishedPosts(): Promise<Post[]> {
    const path = 'posts';
    try {
      // Remove orderBy to avoid composite index requirement for now
      const q = query(
        collection(db, 'posts'), 
        where('status', '==', 'published')
      );
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(postDoc => ({ id: postDoc.id, ...(postDoc.data() as any) } as Post));
      
      // Sort client-side: newest first
      return posts.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getPostBySlug(slug: string, includeDrafts = false): Promise<Post | null> {
    const path = 'posts';
    try {
      let q;
      if (includeDrafts) {
        q = query(collection(db, 'posts'), where('slug', '==', slug));
      } else {
        q = query(
          collection(db, 'posts'), 
          where('slug', '==', slug),
          where('status', '==', 'published')
        );
      }
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      const postDoc = querySnapshot.docs[0];
      return { id: postDoc.id, ...(postDoc.data() as any) } as Post;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async createPost(post: Partial<Post>) {
    const path = 'posts';
    try {
      const newPostRef = doc(collection(db, 'posts'));
      const postData = {
        ...post,
        id: newPostRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: post.status === 'published' ? serverTimestamp() : null
      };
      await setDoc(newPostRef, postData);
      return postData;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updatePost(id: string, post: Partial<Post>) {
    const path = `posts/${id}`;
    try {
      const postRef = doc(db, 'posts', id);
      const updateData = {
        ...post,
        updatedAt: serverTimestamp(),
        publishedAt: post.status === 'published' ? serverTimestamp() : null
      };
      await updateDoc(postRef, updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deletePost(id: string) {
    const path = `posts/${id}`;
    try {
      await deleteDoc(doc(db, 'posts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Settings
  async getSettings(): Promise<SiteSettings> {
    const path = 'settings/site';
    try {
      const settingsSnap = await getDoc(doc(db, 'settings', 'site'));
      if (!settingsSnap.exists()) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...settingsSnap.data() } as SiteSettings;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return DEFAULT_SETTINGS;
    }
  },

  async updateSettings(settings: Partial<SiteSettings>) {
    const path = 'settings/site';
    try {
      await setDoc(doc(db, 'settings', 'site'), settings, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Newsletter
  async subscribe(email: string) {
    const path = 'subscribers';
    try {
      const subscriberRef = doc(collection(db, 'subscribers'));
      await setDoc(subscriberRef, {
        email,
        subscribedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },
};
