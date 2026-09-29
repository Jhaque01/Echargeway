import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AuthModal from '@/components/pl/AuthModal';
import { BG } from '@/lib/powerloop';
import { Session } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function SignInPage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/home', { replace: true });
    });
  }, [navigate]);

  return (
    <div style={{ background: BG, minHeight: '100vh' }}>
      <AuthModal
        onClose={() => navigate('/home')}
        onSuccess={(_user: Profile, _session: Session) => navigate('/home', { replace: true })}
      />
    </div>
  );
}
