"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { signInWithEmail, getCurrentSession } from '@/lib/supabase/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    async function checkAuthStatus() {
      if (isSupabaseConfigured()) {
        const session = await getCurrentSession();
        if (session) {
          router.replace('/');
          return;
        }
      }
      setCheckingSession(false);
    }
    checkAuthStatus();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage({
        title: 'Campos Obrigatórios',
        message: 'Por favor, informe seu e-mail e sua senha para acessar.'
      });
      return;
    }

    setLoading(true);

    const result = await signInWithEmail(email, password);

    if (result.success) {
      router.replace('/');
    } else {
      setErrorMessage({
        title: result.error?.title || 'Falha na Autenticação',
        message: result.error?.message || 'E-mail ou senha incorretos.'
      });
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #1E3280', borderTopColor: 'transparent', borderRadius: '50%', animation: 'cebsSpin 0.8s linear infinite' }} />
          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Verificando autenticação...</span>
        </div>
        <style jsx global>{`
          @keyframes cebsSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#0F172A', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Left Branding Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', background: 'linear-gradient(135deg, #1E3280 0%, #0F172A 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Background Decorative Pattern */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,119,6,0.15) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
        
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 800, fontSize: '18px', boxShadow: '0 4px 12px rgba(217,119,6,0.4)' }}>
            C
          </div>
          <div>
            <h1 style={{ color: '#FFF', fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>CEBS Financeiro</h1>
            <p style={{ color: '#94A3B8', fontSize: '11px', margin: 0, fontWeight: 500 }}>Centro Educacional Batista Sobrinho</p>
          </div>
        </div>

        {/* Center Presentation */}
        <div style={{ maxWidth: '440px', zIndex: 1, margin: '60px 0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', backgroundColor: 'rgba(217,119,6,0.15)', border: '1px solid rgba(217,119,6,0.3)', color: '#F59E0B', fontSize: '12px', fontWeight: 700, marginBottom: '20px' }}>
            <ShieldCheck size={14} /> Sistema Restrito à Diretoria
          </div>
          <h2 style={{ color: '#F8FAFC', fontSize: '32px', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.03em', marginBottom: '16px' }}>
            Gestão financeira escolar simplificada e segura.
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            Painel de controle financeiro restrito a operadoras e direção autorizada. Faça login com suas credenciais do Supabase.
          </p>
        </div>

        {/* Footer */}
        <div style={{ color: '#64748B', fontSize: '12px', fontWeight: 500, zIndex: 1 }}>
          © 2026 Centro Educacional Batista Sobrinho. Todos os direitos reservados.
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div style={{ width: '500px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '56px 48px' }}>
        <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Acessar Conta
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0, fontWeight: 500 }}>
              Insira o seu e-mail e senha cadastrados para continuar.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div style={{ display: 'flex', gap: '12px', padding: '14px 16px', borderRadius: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', marginBottom: '24px', animation: 'cebsFadeIn 0.2s ease' }}>
              <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#991B1B', margin: '0 0 2px 0' }}>{errorMessage.title}</h4>
                <p style={{ fontSize: '12px', color: '#B91C1C', margin: 0, fontWeight: 500, lineHeight: 1.4 }}>{errorMessage.message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Email Field */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                E-mail Institucional
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cebs.com.br"
                  required
                  style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '14px', color: '#0F172A', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1.5px solid #E2E8F0', fontSize: '14px', color: '#0F172A', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: loading ? '#94A3B8' : '#1E3280',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 700,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(30,50,128,0.25)',
                transition: 'background-color 0.2s',
                marginTop: '8px'
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid #FFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'cebsSpin 0.8s linear infinite' }} />
                  Autenticando...
                </>
              ) : (
                <>
                  Entrar no Sistema <ArrowRight size={16} />
                </>
              )}
            </button>

          </form>

          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0, fontWeight: 500 }}>
              Primeiro acesso? Entre em contato com a Direção Executiva do CEBS para cadastro de usuário.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
