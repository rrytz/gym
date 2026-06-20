import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share } from 'lucide-react';

const InstallPrompt = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('titanlog_install_dismissed');
    if (dismissed) return;

    // Detect iOS Safari
    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !/crios|fxios/i.test(navigator.userAgent) && // Exclude Chrome/Firefox on iOS
      !window.navigator.standalone; // Not already installed

    if (ios) {
      setIsIOS(true);
      setShowBanner(true);
      return;
    }

    // Chrome/Android: check if we already captured the event
    if (window.__installPromptEvent) {
      setCanInstall(true);
      setShowBanner(true);
    }

    // Also listen in case React mounted before the event fired
    const onReady = () => {
      if (window.__installPromptEvent) {
        setCanInstall(true);
        setShowBanner(true);
      }
    };
    window.addEventListener('pwa-install-ready', onReady);
    return () => window.removeEventListener('pwa-install-ready', onReady);
  }, []);

  const handleInstall = async () => {
    const prompt = window.__installPromptEvent;
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    window.__installPromptEvent = null;
    setShowBanner(false);
    if (outcome === 'accepted') {
      localStorage.setItem('titanlog_install_dismissed', '1');
    }
  };

  const dismiss = () => {
    setShowBanner(false);
    localStorage.setItem('titanlog_install_dismissed', '1');
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        style={{
          position: 'fixed',
          bottom: '90px',
          left: '12px',
          right: '12px',
          zIndex: 8000,
          background: 'linear-gradient(135deg, #121217ee, #0D0D15ee)',
          border: '1px solid rgba(0, 242, 255, 0.3)',
          borderRadius: '20px',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 8px 40px rgba(0, 242, 255, 0.15), 0 20px 50px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          maxWidth: '500px',
          margin: '0 auto',
        }}
      >
        {/* Icon */}
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(0,242,255,0.15), rgba(0,119,255,0.15))',
          border: '1px solid rgba(0, 242, 255, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Smartphone size={22} color="#00F2FF" />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '800', fontSize: '0.95rem', marginBottom: '3px' }}>
            Install TitanLog
          </div>
          {isIOS ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Tap <Share size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
              <strong style={{ color: '#fff' }}>Share</strong> →{' '}
              <strong style={{ color: '#fff' }}>Add to Home Screen</strong>
            </div>
          ) : (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Add to your home screen — works offline too!
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          {!isIOS && canInstall && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleInstall}
              style={{
                background: 'linear-gradient(135deg, #00F2FF, #0077FF)',
                color: '#000',
                border: 'none',
                padding: '9px 16px',
                borderRadius: '10px',
                fontWeight: '800',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 15px rgba(0,242,255,0.3)',
              }}
            >
              <Download size={14} />
              Install
            </motion.button>
          )}
          <button
            onClick={dismiss}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-muted)',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X size={15} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPrompt;
