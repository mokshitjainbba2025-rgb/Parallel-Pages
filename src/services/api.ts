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
import { Post, SiteSettings, UserProfile, Contributor, Comment } from '../types';
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
        const adminEmail = 'mokshit.jain.bba2025@atlasskilltech.university';
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || undefined,
          role: user.email === adminEmail ? 'admin' : 'author' // Default role
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
      const profile = userSnap.data() as UserProfile;
      
      // Check if user is a subscriber if not already marked
      if (!profile.isSubscriber) {
        const isSub = await this.isSubscriber(profile.email);
        if (isSub) {
          await updateDoc(doc(db, 'users', uid), { isSubscriber: true });
          profile.isSubscriber = true;
        }
      }
      
      return profile;
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

  // Contributors
  async getContributors(): Promise<Contributor[]> {
    const path = 'contributors';
    try {
      const querySnapshot = await getDocs(collection(db, 'contributors'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Contributor));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async createContributor(contributor: Partial<Contributor>) {
    const path = 'contributors';
    try {
      const newRef = doc(collection(db, 'contributors'));
      const data = { ...contributor, id: newRef.id };
      await setDoc(newRef, data);
      return data;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateContributor(id: string, contributor: Partial<Contributor>) {
    const path = `contributors/${id}`;
    try {
      await updateDoc(doc(db, 'contributors', id), contributor);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteContributor(id: string) {
    const path = `contributors/${id}`;
    try {
      await deleteDoc(doc(db, 'contributors', id));
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
      
      // If user is logged in, update their profile
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { isSubscriber: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async isSubscriber(email: string): Promise<boolean> {
    const path = 'subscribers';
    try {
      const q = query(collection(db, 'subscribers'), where('email', '==', email));
      const snap = await getDocs(q);
      return !snap.empty;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return false;
    }
  },

  // Comments
  async getComments(postId: string): Promise<Comment[]> {
    const path = 'comments';
    try {
      const q = query(
        collection(db, 'comments'),
        where('postId', '==', postId)
      );
      const snap = await getDocs(q);
      const comments = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Comment));
      
      // Sort client-side: oldest first
      return comments.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeA - timeB;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async createComment(comment: Partial<Comment>) {
    const path = 'comments';
    try {
      // Rate limiting check (client-side for now, but rules should handle it too)
      if (auth.currentUser) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        // Query only by authorId to avoid composite index requirement
        const q = query(
          collection(db, 'comments'),
          where('authorId', '==', auth.currentUser.uid)
        );
        const snap = await getDocs(q);
        
        // Filter by date client-side
        const recentComments = snap.docs.filter(doc => {
          const createdAt = doc.data().createdAt as Timestamp;
          return createdAt && createdAt.toDate() >= oneHourAgo;
        });

        if (recentComments.length >= 5) {
          throw new Error('Rate limit exceeded. Max 5 comments per hour.');
        }
      }

      const newRef = doc(collection(db, 'comments'));
      const data = {
        ...comment,
        id: newRef.id,
        createdAt: serverTimestamp(),
        status: 'approved' // Default to approved for now, can change to 'pending' for moderation
      };
      await setDoc(newRef, data);
      return data;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateCommentStatus(id: string, status: 'approved' | 'rejected') {
    const path = `comments/${id}`;
    try {
      await updateDoc(doc(db, 'comments', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteComment(id: string) {
    const path = `comments/${id}`;
    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },
};
