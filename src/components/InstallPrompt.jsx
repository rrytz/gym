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

        {/* Text — full width for iOS, split for Android */}
        {isIOS ? (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: '800', fontSize: '0.9rem', marginBottom: '8px' }}>
              📲 Add to Home Screen
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: 'rgba(0,242,255,0.15)',
                  color: '#00F2FF',
                  borderRadius: '50%',
                  width: '20px', height: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '0.7rem', flexShrink: 0,
                }}>1</span>
                <span>Tap the <strong style={{ color: '#fff' }}>⬆️ Share</strong> button at the bottom of Safari</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: 'rgba(0,242,255,0.15)',
                  color: '#00F2FF',
                  borderRadius: '50%',
                  width: '20px', height: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '0.7rem', flexShrink: 0,
                }}>2</span>
                <span>Scroll down → tap <strong style={{ color: '#fff' }}>"Add to Home Screen"</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: 'rgba(0,242,255,0.15)',
                  color: '#00F2FF',
                  borderRadius: '50%',
                  width: '20px', height: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '0.7rem', flexShrink: 0,
                }}>3</span>
                <span>Tap <strong style={{ color: '#fff' }}>"Add"</strong> — done! ✅</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: '800', fontSize: '0.95rem', marginBottom: '3px' }}>
              Install TitanLog
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Add to your home screen — works offline too!
            </div>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, alignSelf: 'flex-start' }}>
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
              alignSelf: 'flex-end',
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
