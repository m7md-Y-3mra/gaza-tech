'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, MessageCircle } from 'lucide-react';
import ListingCard from '@/modules/listings/home/components/listing-card/ListingCard';
import type { ListingCardItem } from '@/modules/listings/queries';
import { useChat } from './hooks/useChat';

const Chat = () => {
  const {
    open,
    input,
    loading,
    scrollRef,
    messages,
    handleOpenChange,
    handleSend,
    setInput,
  } = useChat();

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {/* Floating trigger button */}
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      <SheetContent className="flex h-full w-full flex-col overflow-hidden p-0 sm:max-w-md xl:max-w-lg">
        {/* Header */}
        <SheetHeader className="shrink-0 border-b px-6 py-4">
          <SheetTitle className="flex items-center gap-2.5 text-base">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
              <Bot className="text-primary h-4 w-4" />
            </div>
            AI Assistant
          </SheetTitle>
          <SheetDescription className="text-xs">
            Search marketplace listings using natural language.
          </SheetDescription>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-4 px-6 py-5">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                {msg.role === 'ai' && (
                  <div className="bg-primary/10 mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                    <Bot className="text-primary h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={`flex max-w-[80%] flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Bubble */}
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm'
                        : 'bg-muted rounded-2xl rounded-bl-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Listings */}
                  {msg.listings && msg.listings.length > 0 && (
                    <div className="mt-1 flex w-full flex-col gap-2.5">
                      {msg.listings.map((listing: ListingCardItem) => (
                        <ListingCard
                          key={listing.listing_id}
                          listing={listing}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-end gap-2.5">
                <div className="bg-primary/10 mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                  <Bot className="text-primary h-3.5 w-3.5" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="bg-muted-foreground/50 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
                    <span className="bg-muted-foreground/50 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
                    <span className="bg-muted-foreground/50 h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input bar */}
        <div className="bg-background shrink-0 border-t px-4 py-3">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g. Gaming laptops under 1000 ILS..."
              disabled={loading}
              className="h-10 flex-1 rounded-full px-4 text-sm"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || loading}
              className="h-10 w-10 shrink-0 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Chat;
