import { toast } from "sonner";
import { ShareButtonProps } from "../types";

export const useShareButton = (title: ShareButtonProps['title']) => {
    const handleShare = async () => {
        const shareData = {
            title: title,
            text: `Check out this listing: ${title}`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            // Ignore abort errors (user cancelled share)
            if (error instanceof Error && error.name !== 'AbortError') {
                toast.error('Failed to share listing');
            }
        }
    };
    return { handleShare }
}