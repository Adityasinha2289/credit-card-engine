import React from 'react';
import { ProfileTab } from '../../features/dashboard/components/ProfileTab';
import { PageContainer } from '../../components/shared/PageContainer';

export default function ProfilePage() {
  return (
    <PageContainer hideHeader>
      <ProfileTab />
    </PageContainer>
  );
}
