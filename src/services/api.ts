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
  Timestamp,
  getCountFromServer,
  increment,
  limit
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { Post, SiteSettings, UserProfile, Contributor, Comment, NewsletterSubscriber, Like } from '../types';
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
  const rawMessage = error instanceof Error ? error.message : String(error);
  
  // Provide human-friendly guidance for configuration errors
  let displayMessage = rawMessage;
  if (rawMessage.includes('auth/operation-not-allowed')) {
    displayMessage = 'Configuration Error: Email/Password login is not enabled in your Firebase Console. Please enable it under Authentication > Sign-in method.';
  } else if (rawMessage.includes('auth/popup-blocked')) {
    displayMessage = 'Browser Error: Sign-in popup was blocked. Please allow popups for this site and try again.';
  } else if (rawMessage.includes('auth/email-already-in-use')) {
    displayMessage = 'This email is already in use. If you already have an account, please try logging in instead.';
  }

  const errInfo: FirestoreErrorInfo = {
    error: displayMessage,
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
  
  // DON'T throw for GET or LIST operations to prevent app crashes for guests
  if (operationType === OperationType.GET || operationType === OperationType.LIST) {
    return;
  }
  
  throw new Error(JSON.stringify(errInfo));
}

const googleProvider = new GoogleAuthProvider();

let isLoggingIn = false;

export const api = {
  // Auth
  async loginWithGoogle() {
    if (isLoggingIn) return;
    isLoggingIn = true;
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        const admins = [
          'mokshit.jain.bba2025@atlasskilltech.university',
          'team.parallelpages@gmail.com'
        ];
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || undefined,
          role: admins.includes(user.email || '') ? 'admin' : 'reader',
          createdAt: serverTimestamp()
        };
        await setDoc(userRef, profile);
        return { user, profile };
      }
      
      return { user, profile: userSnap.data() as UserProfile };
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        return;
      }
      throw error;
    } finally {
      isLoggingIn = false;
    }
  },

  async signupWithEmail(data: { email: string; password: string; name: string; role: 'reader' | 'writer'; bio?: string }) {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    try {
      const result = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(result.user, { displayName: data.name });
      
      const profile: UserProfile = {
        uid: result.user.uid,
        email: data.email,
        displayName: data.name,
        role: data.role,
        bio: data.bio,
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', result.user.uid), profile);

      if (data.role === 'writer') {
        const initialImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=0D0D0D&color=fff&size=512&bold=true`;
        await setDoc(doc(db, 'contributors', result.user.uid), {
          id: result.user.uid,
          name: data.name,
          bio: data.bio || '',
          image: initialImage,
          social: {
            twitter: '',
            linkedin: '',
            github: '',
            website: ''
          }
        });
      }
      
      return { user: result.user, profile };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'users');
      throw error;
    }
  },

  async loginWithEmail(email: string, password: string) {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profile = await this.getUserProfile(result.user.uid);
      return { user: result.user, profile };
    } catch (error) {
      throw error;
    }
  },

  async upgradeToWriter(uid: string, bio: string, name?: string) {
    try {
      await updateDoc(doc(db, 'users', uid), { 
        role: 'writer',
        bio,
        upgradedAt: serverTimestamp() 
      });

      let contributorName = name || '';
      if (!contributorName) {
        const userSnap = await getDoc(doc(db, 'users', uid));
        if (userSnap.exists()) {
          contributorName = userSnap.data()?.displayName || '';
        }
      }

      const initialImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(contributorName || 'Writer')}&background=0D0D0D&color=fff&size=512&bold=true`;
      
      await setDoc(doc(db, 'contributors', uid), {
        id: uid,
        name: contributorName || 'Writer',
        bio: bio,
        image: initialImage,
        social: {
          twitter: '',
          linkedin: '',
          github: '',
          website: ''
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
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

  async updateUserRole(uid: string, role: 'admin' | 'writer' | 'reader') {
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), { role });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async getUsers(): Promise<UserProfile[]> {
    const path = 'users';
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  // Posts
  async getPosts(status?: Post['status']): Promise<Post[]> {
    const path = 'posts';
    try {
      let q;
      if (status) {
        q = query(collection(db, 'posts'), where('status', '==', status));
      } else {
        q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      }
      
      const snap = await getDocs(q);
      const posts = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Post));
      
      // Sort client-side if we applied a status filter (to avoid index requirement)
      if (status) {
        return posts.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
      }
      
      return posts;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    const path = 'posts';
    try {
      const q = query(
        collection(db, 'posts'),
        where('authorId', '==', authorId)
      );
      const snap = await getDocs(q);
      const posts = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Post));
      // Sort client-side
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

  async getPostBySlug(slug: string): Promise<Post | null> {
    const path = 'posts';
    try {
      const q = query(collection(db, 'posts'), where('slug', '==', slug), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return { id: snap.docs[0].id, ...(snap.docs[0].data() as any) } as Post;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async createPost(post: Partial<Post>) {
    const path = 'posts';
    try {
      const newRef = doc(collection(db, 'posts'));
      const data = {
        ...post,
        id: newRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likesCount: 0,
        viewsCount: 0,
        commentsCount: 0,
        status: post.status || 'draft',
        publishedAt: post.status === 'published' ? serverTimestamp() : null
      };
      await setDoc(newRef, data);
      return data;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updatePost(id: string, post: Partial<Post>) {
    const path = `posts/${id}`;
    try {
      const updateData = {
        ...post,
        updatedAt: serverTimestamp()
      };
      // Automatic publishedAt management
      if (post.status === 'published') {
        (updateData as any).publishedAt = serverTimestamp();
      }
      await updateDoc(doc(db, 'posts', id), updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async updatePostStatus(id: string, status: Post['status']) {
    const path = `posts/${id}`;
    try {
      const updateData: any = { status, updatedAt: serverTimestamp() };
      if (status === 'published') {
        updateData.publishedAt = serverTimestamp();
      }
      await updateDoc(doc(db, 'posts', id), updateData);
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
      const snap = await getDocs(collection(db, 'contributors'));
      return snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Contributor));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async createContributor(contributor: Partial<Contributor>) {
    const path = 'contributors';
    try {
      const newRef = contributor.id ? doc(db, 'contributors', contributor.id) : doc(collection(db, 'contributors'));
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
      return { ...DEFAULT_SETTINGS, ...(settingsSnap.data() as any) } as SiteSettings;
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

  // Newsletter & Subscribers
  async subscribe(email: string) {
    const path = 'subscribers';
    try {
      const subscriberRef = doc(collection(db, 'subscribers'));
      await setDoc(subscriberRef, {
        email,
        subscribedAt: serverTimestamp()
      });
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), { isSubscriber: true });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getSubscribersCount(): Promise<number> {
    const path = 'subscribers';
    try {
      const snap = await getCountFromServer(collection(db, 'subscribers'));
      return snap.data().count;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return 0;
    }
  },

  async getSubscribers(): Promise<NewsletterSubscriber[]> {
    const path = 'subscribers';
    try {
      const q = query(collection(db, 'subscribers'), orderBy('subscribedAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as NewsletterSubscriber);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  // Engagement
  async likePost(postId: string, userId: string) {
    const path = `likes/${postId}_${userId}`;
    try {
      await setDoc(doc(db, 'likes', `${postId}_${userId}`), {
        postId, userId, createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'posts', postId), { likesCount: increment(1) });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async unlikePost(postId: string, userId: string) {
    const path = `likes/${postId}_${userId}`;
    try {
      await deleteDoc(doc(db, 'likes', `${postId}_${userId}`));
      await updateDoc(doc(db, 'posts', postId), { likesCount: increment(-1) });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async hasLiked(postId: string, userId: string): Promise<boolean> {
    try {
      const snap = await getDoc(doc(db, 'likes', `${postId}_${userId}`));
      return snap.exists();
    } catch (error) {
      return false;
    }
  },

  async incrementViews(postId: string) {
    try {
      await updateDoc(doc(db, 'posts', postId), { viewsCount: increment(1) });
    } catch (error) {}
  },

  // Comments
  async getComments(postId: string): Promise<Comment[]> {
    const path = 'comments';
    try {
      const q = query(collection(db, 'comments'), where('postId', '==', postId));
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

  async getAllComments(): Promise<Comment[]> {
    const path = 'comments';
    try {
      const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) } as Comment));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async createComment(comment: Partial<Comment>) {
    const path = 'comments';
    try {
      const newRef = doc(collection(db, 'comments'));
      const data = {
        ...comment,
        id: newRef.id,
        createdAt: serverTimestamp(),
        status: 'approved'
      };
      await setDoc(newRef, data);
      if (comment.postId) {
        await updateDoc(doc(db, 'posts', comment.postId), { commentsCount: increment(1) });
      }
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
      const snap = await getDoc(doc(db, 'comments', id));
      if (snap.exists()) {
        const data = snap.data();
        if (data.postId) {
          await updateDoc(doc(db, 'posts', data.postId), { commentsCount: increment(-1) });
        }
      }
      await deleteDoc(doc(db, 'comments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },
};
