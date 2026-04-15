import { PostDetailProvider } from '@/modules/community/components/post-detail-context';

export default function CommunityLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      <PostDetailProvider>
        <main>{children}</main>
        {modal}
      </PostDetailProvider>
    </>
  );
}
