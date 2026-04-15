'use client';

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useSyncExternalStore,
} from 'react';

type PostUpdatePayload = {
  post_id: string;
  like_count?: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  comment_count?: number;
};

type PostDetailContextValue = {
  getPostUpdate: (postId: string) => PostUpdatePayload | undefined;
  updatePost: (payload: PostUpdatePayload) => void;
  subscribe: (listener: () => void) => () => void;
};

const PostDetailContext = createContext<PostDetailContextValue | null>(null);

export function PostDetailProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef(new Map<string, PostUpdatePayload>());
  const listenersRef = useRef(new Set<() => void>());

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  const getPostUpdate = useCallback((postId: string) => {
    return storeRef.current.get(postId);
  }, []);

  const updatePost = useCallback((payload: PostUpdatePayload) => {
    const existing = storeRef.current.get(payload.post_id);
    storeRef.current.set(payload.post_id, { ...existing, ...payload });
    listenersRef.current.forEach((listener) => listener());
  }, []);

  return (
    <PostDetailContext.Provider
      value={{ getPostUpdate, updatePost, subscribe }}
    >
      {children}
    </PostDetailContext.Provider>
  );
}

export function usePostDetailContext() {
  const context = useContext(PostDetailContext);
  if (!context) {
    throw new Error(
      'usePostDetailContext must be used within PostDetailProvider'
    );
  }
  return context;
}

export function usePostUpdate(postId: string) {
  const { getPostUpdate, subscribe } = usePostDetailContext();
  return useSyncExternalStore(
    subscribe,
    () => getPostUpdate(postId),
    () => undefined
  );
}
