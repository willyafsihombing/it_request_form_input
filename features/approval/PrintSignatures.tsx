'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { approvalApi } from '@/lib/approval-api';
import { position } from 'html2canvas/dist/types/css/property-descriptors/position';

const Ctx = createContext<Record<string, string>>({});

export function SignaturesProvider({ requestId,initial, children }: { requestId: string;initial?: Record<string, string>, children: React.ReactNode }) {
  const [sigs, setSigs] = useState<Record<string, string>>(initial ??{});

  useEffect(() => {
    if (initial) return;
    approvalApi.signatures(requestId)
      .then(r => { setSigs(r.signatures ?? {}); })
      .catch(() => {});
    return () => { };
  }, [requestId, initial]);

  return <Ctx.Provider value={sigs}>{children}</Ctx.Provider>;
}

export function SigCell({ code, name }: { code: string; name?: string }) {
  const sigs = useContext(Ctx);
  const img = sigs[code];
  const date = sigs[`date:${code}`];
  return (
    <div style={{ position: 'relative', minHeight: 22, display: 'flex', alignItems: 'center' }}>
      <span style={{ position: 'relative', zIndex: 1 }}>{name}</span>
      {img && (
        <img
          src={img}
          alt=""
          style={{
            position: 'absolute',
            right: -20,
            top: '50%',
            transform: 'translateY(-62%)',
            height: 40,
            maxWidth: 130,
            objectFit: 'contain',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      )}
      {date && (
        <span
          style={{
            position: 'absolute',
            right: 6,
            bottom: -2,
            fontSize: 8,
            lineHeight: 1,
            color: '#000000',
            zIndex: 3,
          }}
        >
          {date}
        </span>
      )}
    </div>
  );
}