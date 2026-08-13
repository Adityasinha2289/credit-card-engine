import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import {
  Moon,
  Bell,
  Sparkles,
  Target,
  Gift,
  Shield,
  Link as LinkIcon,
  User,
  Lock,
  LogOut,
  ChevronRight
} from 'lucide-react';

import { PageContainer } from '../../components/shared/PageContainer';
import { cn } from '../../lib/utils';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';

function SettingsRow({
  icon: Icon,
  title,
  description,
  actionText,
  onClick,
  isDestructive,
  isComingSoon
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  actionText?: React.ReactNode;
  onClick?: () => void;
  isDestructive?: boolean;
  isComingSoon?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isComingSoon}
      className={cn(
        "w-full flex items-center justify-between p-4 group text-left transition-all duration-300",
        "border-b border-white/[0.04] last:border-0",
        "hover:bg-[#07120D]",
        isComingSoon && "opacity-50 cursor-not-allowed hover:bg-transparent"
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300",
          isDestructive ? "bg-red-500/10 text-red-500 group-hover:bg-red-500/20" : "bg-[#07120D] text-[#737C77] group-hover:text-[#237E45] border border-white/[0.04] group-hover:border-[#237E45]/20"
        )}>
          <Icon size={18} strokeWidth={1.5} />
        </div>
        <div>
          <div className={cn(
            "text-base font-semibold transition-colors duration-300 flex items-center gap-2",
            isDestructive ? "text-red-500" : "text-[#F2F4F2] group-hover:text-white"
          )}>
            {title} 
            {isComingSoon && <span className="px-1.5 py-0.5 rounded-sm bg-white/10 text-[9px] uppercase tracking-widest text-white/50">Coming Soon</span>}
          </div>
          <div className="text-sm text-[#737C77] mt-0.5">{description}</div>
        </div>
      </div>
      
      {!isDestructive && (
        <div className="flex items-center gap-3 shrink-0">
          {actionText && (
            <span className="text-sm font-medium text-[#737C77] group-hover:text-white transition-colors duration-300">
              {actionText}
            </span>
          )}
          {!isComingSoon && (
            <ChevronRight size={16} className="text-[#737C77] group-hover:text-[#237E45] group-hover:translate-x-1 transition-all duration-300" />
          )}
        </div>
      )}
    </button>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h3 className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-[#737C77] mb-3 ml-2">
        {title}
      </h3>
      <div className="bg-[#050806] border border-white/[0.04] rounded-[24px] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const profile = useDashboardStore(s => s.profile);

  return (
    <PageContainer
      eyebrow="Settings"
      title="Your RenoCred, your way."
      subtitle="Manage how RenoCred works, communicates and personalizes your experience."
      className="font-body selection:bg-[#237E45]/30 selection:text-white"
    >
      <div className="flex flex-col md:flex-row gap-12">
        {/* Main Settings Content */}
        <div className="flex-1 max-w-[720px]">

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Preferences */}
            <SettingsSection title="Preferences">
              <SettingsRow
                icon={Moon}
                title="Appearance"
                description="Choose how RenoCred looks"
                actionText="Dark"
                isComingSoon
              />
              <SettingsRow
                icon={Bell}
                title="Notifications"
                description="Manage alerts and financial reminders"
                actionText="ON"
                isComingSoon
              />
              <SettingsRow
                icon={Sparkles}
                title="Personalization"
                description="Control how RenoCred adapts to you"
                onClick={() => navigate('/app/profile')}
              />
            </SettingsSection>

            {/* Intelligence */}
            <SettingsSection title="Intelligence">
              <SettingsRow
                icon={Target}
                title="Financial Goals"
                description={`Currently focused on: ${profile?.primaryGoal || 'Optimizing'}`}
                actionText="Edit →"
                onClick={() => navigate('/app/profile')}
              />
              <SettingsRow
                icon={Gift}
                title="Reward Preferences"
                description="Manage reward-related insights"
                isComingSoon
              />
            </SettingsSection>

            {/* Privacy & Data */}
            <SettingsSection title="Privacy & Data">
              <SettingsRow
                icon={Shield}
                title="Data & Personalization"
                description="Manage how your information is used"
                isComingSoon
              />
              <SettingsRow
                icon={LinkIcon}
                title="Connected Services"
                description="Manage connected financial and payment services"
                isComingSoon
              />
            </SettingsSection>

            {/* Account */}
            <SettingsSection title="Account">
              <SettingsRow
                icon={User}
                title="Profile"
                description="Manage your personal and financial information"
                actionText="Open Profile →"
                onClick={() => navigate('/app/profile')}
              />
              <SettingsRow
                icon={Lock}
                title="Security"
                description="Manage account security and authentication"
                isComingSoon
              />
              <SettingsRow
                icon={LogOut}
                title="Sign out"
                description="Sign out of RenoCred on this device"
                isDestructive
                onClick={() => signOut()}
              />
            </SettingsSection>
          </motion.div>
        </div>

        {/* Optional Right-Side Summary */}
        <div className="hidden lg:block w-[320px] shrink-0 pt-[104px]">
          <div className="sticky top-8 bg-[#07120D] border border-white/[0.04] rounded-[24px] p-6 shadow-xl">
            <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#737C77] mb-6">
              Your RenoCred Experience
            </h4>
            
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Personalization</span>
                <span className="text-xs font-semibold text-[#237E45] px-2 py-0.5 rounded-full bg-[#237E45]/10 border border-[#237E45]/20">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Notifications</span>
                <span className="text-xs font-semibold text-[#237E45] px-2 py-0.5 rounded-full bg-[#237E45]/10 border border-[#237E45]/20">ON</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/70">Theme</span>
                <span className="text-xs font-medium text-white/40">Dark</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.04]">
              <p className="text-xs text-[#737C77] leading-relaxed">
                RenoCred is currently optimizing your dashboard for <strong className="text-white/80 font-medium">{profile?.primaryGoal || 'Maximum Value'}</strong>.
              </p>
            </div>
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
