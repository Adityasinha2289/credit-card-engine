/**
 * Your picture: upload a photo (stored with your sign-in, via Clerk) or pick
 * one of the illustrated avatars. Saved to your profile either way.
 */
import { useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { Camera, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboardStore } from '../../../features/dashboard/store/dashboardStore';
import { cn } from '../../../lib/utils';

const SEEDS = ['Atharva', 'Aria', 'Kabir', 'Zoe', 'Rohan', 'Elena'];
export const presetAvatar = (seed: string) => `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=e3eed4`;

/** The picture to show for this person, if they have one. */
export function useAvatar(): string | null {
  const profile = useDashboardStore((s) => s.profile);
  return profile?.avatar || null;
}

export function Avatar({ src, name, size = 56, className }: { src: string | null; name: string; size?: number; className?: string }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'R';
  return src ? (
    <img src={src} alt="" width={size} height={size} className={cn('shrink-0 rounded-full bg-rc-pistachio object-cover', className)} style={{ width: size, height: size }} />
  ) : (
    <span aria-hidden className={cn('flex shrink-0 items-center justify-center rounded-full bg-rc-pistachio font-serif font-semibold text-rc-ink', className)} style={{ width: size, height: size, fontSize: size * 0.38 }}>{initials}</span>
  );
}

export function AvatarPicker() {
  const { user } = useUser();
  const profile = useDashboardStore((s) => s.profile);
  const updateProfile = useDashboardStore((s) => s.updateProfile);
  const current = profile?.avatar || null;
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const save = async (avatar: string) => {
    if (!profile) return;
    await updateProfile({ ...profile, avatar });
  };

  const upload = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith('image/')) return void toast.error('That isn’t an image.');
    if (file.size > 10 * 1024 * 1024) return void toast.error('Pick a photo under 10 MB.');
    setBusy(true);
    try {
      const image = await user.setProfileImage({ file });
      await user.reload();
      await save(image.publicUrl ?? user.imageUrl);
      toast.success('Photo updated');
    } catch {
      toast.error('Couldn’t upload that photo. Try another one.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      if (user?.hasImage) await user.setProfileImage({ file: null });
      await save('');
      toast.success('Picture removed');
    } catch {
      toast.error('Couldn’t remove it just now.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-[24px] border border-rc-ink/[0.08] bg-rc-paper p-5">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar src={current} name={profile?.name ?? ''} size={72} />
          {busy && <span className="absolute inset-0 flex items-center justify-center rounded-full bg-rc-night/50"><Loader2 size={22} className="animate-spin text-rc-cream" /></span>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-rc-ink">Your picture</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-rc-ink px-3.5 text-[13px] font-medium text-rc-cream hover:bg-rc-moss disabled:opacity-50">
              <Camera size={14} /> Upload a photo
            </button>
            {current && (
              <button type="button" disabled={busy} onClick={() => void remove()} className="h-9 rounded-full px-3 text-[13px] text-rc-muted hover:text-rc-ink disabled:opacity-50">Remove</button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
        </div>
      </div>

      <p className="mt-5 text-[13px] text-rc-muted">Or pick one</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {SEEDS.map((seed) => {
          const url = presetAvatar(seed);
          const on = current === url;
          return (
            <motion.button
              key={seed}
              type="button"
              whileTap={{ scale: 0.92 }}
              disabled={busy}
              onClick={() => void save(url).then(() => toast.success('Picture updated'))}
              aria-label={`Use avatar ${seed}`}
              aria-pressed={on}
              className={cn('relative rounded-full transition-shadow', on ? 'ring-2 ring-rc-forest ring-offset-2 ring-offset-rc-paper' : 'hover:ring-2 hover:ring-rc-ink/15 hover:ring-offset-2 hover:ring-offset-rc-paper')}
            >
              <img src={url} alt="" width={44} height={44} loading="lazy" className="h-11 w-11 rounded-full bg-rc-pistachio" />
              {on && <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rc-forest text-rc-cream"><Check size={12} strokeWidth={3} /></span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
