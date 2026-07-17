import React from 'react';

interface AuthBackdropProps {
  /** 登录页全屏静态背景 */
  immersive?: boolean;
}

function LoginBackdrop() {
  return (
    <div className="auth-login-backdrop" aria-hidden>
      <div className="auth-login-backdrop__base" />
      <div className="auth-login-backdrop__beam" />
      <div className="auth-login-backdrop__glow auth-login-backdrop__glow--primary" />
      <div className="auth-login-backdrop__glow auth-login-backdrop__glow--secondary" />
    </div>
  );
}

function DefaultAmbientVisual() {
  return (
    <>
      <div className="auth-bg-mesh auth-bg-mesh--animated" />
      <div className="auth-bg-mesh auth-bg-mesh--animated auth-bg-mesh--reverse" />
      <div className="auth-bg-noise" />
      <div className="auth-bg-grid auth-bg-grid--animated" />
    </>
  );
}

/** 登录/申请页装饰背景 */
export function AuthBackdrop({ immersive = false }: AuthBackdropProps) {
  if (immersive) {
    return <LoginBackdrop />;
  }

  return (
    <div className="auth-page-backdrop" aria-hidden>
      <DefaultAmbientVisual />
    </div>
  );
}
