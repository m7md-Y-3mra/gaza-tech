import { ListingCardItem } from "@/modules/listings/queries";
import { useEffect, useRef, useState } from "react";

export const useChat = () => {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<
        { role: 'user' | 'ai'; text: string; listings?: ListingCardItem[] }[]
    >([
        {
            role: 'ai',
            text: 'Hi! I am the AI Assistant. I can help you find products by comparing their specifications, prices, and use-cases. What are you looking for?',
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
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await res.json();

            if (data.error) {
                setMessages((prev) => [
                    ...prev,
                    { role: 'ai', text: `Error: ${data.error}` },
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
                { role: 'ai', text: 'An unexpected error occurred.' },
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
        setInput
    }
}