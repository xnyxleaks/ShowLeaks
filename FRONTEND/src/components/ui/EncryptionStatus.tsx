import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldX } from 'lucide-react';

interface EncryptionStatusProps {
  className?: string;
}

const EncryptionStatus: React.FC<EncryptionStatusProps> = ({ className = '' }) => {
  const [encryptionSupported, setEncryptionSupported] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEncryptionSupport();
  }, []);

  const checkEncryptionSupport = async () => {
    try {
      // Verificar se o navegador suporta Web Crypto API
      if (!window.crypto || !window.crypto.subtle) {
        setEncryptionSupported(false);
        setLoading(false);
        return;
      }

      // Testar se consegue criar uma chave
      const testKey = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      setEncryptionSupported(!!testKey);
    } catch (error) {
      console.error('Encryption support check failed:', error);
      setEncryptionSupported(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center text-gray-400 ${className}`}>
        <Shield size={16} className="mr-2 animate-pulse" />
        <span className="text-xs">Checking security...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${encryptionSupported ? 'text-green-400' : 'text-red-400'} ${className}`}>
      {encryptionSupported ? (
        <>
          <ShieldCheck size={16} className="mr-2" />
          <span className="text-xs font-medium">Secure Connection</span>
        </>
      ) : (
        <>
          <ShieldX size={16} className="mr-2" />
          <span className="text-xs font-medium">Unsecure Connection</span>
        </>
      )}
    </div>
  );
};

export default EncryptionStatus;