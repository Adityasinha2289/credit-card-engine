/** Reni on a page of its own (/app/reni): the same conversation as the panel, given more room. */
import { useState } from 'react';
import { PageContainer } from '../../components/shared/PageContainer';
import { ReniChat, type ReniMessage } from '../../features/taqdeer/components/ReniChat';

export default function TaqdeerPage() {
  const [messages, setMessages] = useState<ReniMessage[]>([]);
  return (
    <PageContainer eyebrow="Reni" title={<>Ask about <span className="italic">your cards.</span></>} band={null}>
      <div className="mx-auto h-[min(720px,calc(100dvh-220px))] w-full max-w-[760px] overflow-hidden rounded-[28px] border border-rc-ink/10 shadow-[0_30px_60px_-40px_rgba(10,31,21,0.5)]">
        <ReniChat messages={messages} setMessages={setMessages} variant="page" />
      </div>
    </PageContainer>
  );
}
