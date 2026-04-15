import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerificationBadge } from '@/components/verification-badge';
import {
  User,
  Twitter,
  Instagram,
  Facebook,
  Calendar,
  Globe,
} from 'lucide-react';
import { format } from 'date-fns';
import { ReportButton } from '@/modules/reports/components';
import type { ProfileHeroProps } from './types';
import { getTranslations } from 'next-intl/server';

const ProfileHero = async ({ user }: ProfileHeroProps) => {
  const t = await getTranslations('Profile.Hero');
  const fullName = `${user.first_name} ${user.last_name}`;

  const socialLinks = [
    { url: user.twitter_link_url, icon: Twitter, label: t('twitter') },
    { url: user.instagram_link_url, icon: Instagram, label: t('instagram') },
    { url: user.facebook_link_url, icon: Facebook, label: t('facebook') },
    { url: user.website_url, icon: Globe, label: t('website') },
  ].filter((link) => link.url);

  const joinedDate = user.created_at
    ? format(new Date(user.created_at), 'MMMM yyyy')
    : '';

  return (
    <div className="from-primary via-primary/90 to-primary/80 relative overflow-hidden bg-gradient-to-br">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-white blur-3xl"></div>
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-white blur-3xl"></div>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <ReportButton
          contentType="user"
          contentId={user.user_id}
          contentOwnerId={user.user_id}
          variant="secondary"
          className="h-10 w-10 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-12">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex w-full flex-col items-start gap-6 lg:w-auto lg:flex-row lg:items-end">
            <div className="relative">
              <Avatar className="size-32 rounded-2xl border-4 border-white shadow-2xl lg:size-40">
                <AvatarImage
                  src={user.avatar_url || undefined}
                  alt={fullName}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-none">
                  <User className="size-16" />
                </AvatarFallback>
              </Avatar>
              {user.user_role === 'verified_seller' && (
                <div className="absolute -right-2 -bottom-2 rounded-full bg-white p-2 shadow-lg">
                  <VerificationBadge isVerified={true} size="sm" />
                </div>
              )}
            </div>

            <div className="text-white">
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-3xl font-bold lg:text-4xl">{fullName}</h1>
              </div>
              <p className="text-primary-foreground/90 mb-4 max-w-2xl text-base">
                {user.bio || t('noBio')}
              </p>

              <div className="mb-4 flex flex-wrap items-center gap-3">
                {joinedDate && (
                  <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                    <Calendar className="size-4 text-white" />
                    <span className="text-sm font-medium">
                      {t('joined', { date: joinedDate })}
                    </span>
                  </div>
                )}
              </div>

              {socialLinks.length > 0 && (
                <div className="flex items-center gap-6">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-white transition-colors duration-200 hover:text-white/80"
                      aria-label={link.label}
                    >
                      <link.icon className="size-5" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHero;
