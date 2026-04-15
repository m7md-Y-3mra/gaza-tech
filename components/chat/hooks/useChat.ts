import { ListingCardItem } from '@/modules/listings/queries';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';

export const useChat = () => {
  const t = useTranslations('Chat');
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<
    { role: 'user' | 'ai'; text: string; listings?: ListingCardItem[] }[]
  >([
    {
      role: 'ai',
      text: t('welcomeMessage'),
    },
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleSend = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-search', {
        body: { message: userMessage },
      });

      if (error) {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: `${t('errorPrefix')}${error.message}` },
        ]);
      } else if (data?.error) {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: `${t('errorPrefix')}${data.error}` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: data.reply, listings: data.listings },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: t('unexpectedError') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
    open,
    input,
    loading,
    scrollRef,
    messages,
    handleOpenChange,
    handleSend,
    setInput,
  };
};
