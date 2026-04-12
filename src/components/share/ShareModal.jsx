import React from 'react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {
  Share2, X, Check, Layers, Linkedin, MessageSquare, Mail
} from 'lucide-react';

const ShareModal = ({ isOpen, onClose, news, onConfirm }) => {
  const { t, i18n } = useTranslation();
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !news) return null;

  const hashtags = news.searchKeywords ? news.searchKeywords.map(k => `#${k.replace(/\s+/g, '')}`).join(' ') : '';

  const renderPreview = (text) => {
    return text.split(/(\*[^*\n]+\*)/g).map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <span key={index} className="text-blue-300 font-bold">{part.slice(1, -1)}</span>;
      }
      return part;
    });
  };
  const shareUrl = news.sourceUrl || window.location.href;

  let fullShareText = '';
  if (message.trim()) fullShareText += `${message}\n\n`;

  if (news.isSummaryList) {
    fullShareText += `${news.summary}\n\n✨ [${news.title}]: ${shareUrl}\n\n${hashtags}`;
  } else {
    fullShareText += `📌 [${news.title}]\n\n${news.summary}\n\n👉 Source: ${shareUrl}\n\n${hashtags}`;
  }

  const handleShareClick = () => {
    onConfirm(message);
    setMessage('');
    onClose();
  };

  const handleCopy = async () => {
    try {
      const htmlContent = fullShareText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>")
        .replace(/\*([^*\n]+)\*/g, "<b>$1</b>");

      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([fullShareText], { type: 'text/plain' }),
        'text/html': new Blob([htmlContent], { type: 'text/html' })
      });

      await navigator.clipboard.write([clipboardItem]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
      try {
        await navigator.clipboard.writeText(fullShareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed', fallbackErr);
      }
    }
  };

  const handleSNSShare = (platform) => {
    const encodedFullText = encodeURIComponent(fullShareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(news.title);

    const shareUrls = {
      threads: `https://www.threads.net/intent/post?text=${encodedFullText}`,
      x: `https://twitter.com/intent/tweet?text=${encodedFullText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedFullText}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedFullText}`,
      sms: `sms:?body=${encodedFullText}`,
      reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}&text=${encodedFullText}`,
      linkedin: `https://www.linkedin.com/feed/?shareActive=true&text=${encodedFullText}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedFullText}`
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const snsButtons = [
    { id: 'threads', label: 'Threads', icon: <img src="https://cdn.simpleicons.org/threads/white" alt="Threads" className="w-4 h-4" /> },
    { id: 'x', label: 'X', icon: <img src="https://cdn.simpleicons.org/x/white" alt="X" className="w-4 h-4" /> },
    { id: 'facebook', label: 'Facebook', icon: <img src="https://cdn.simpleicons.org/facebook/white" alt="Facebook" className="w-4 h-4" /> },
    { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="w-4 h-4 text-white" /> },
    { id: 'reddit', label: 'Reddit', icon: <img src="https://cdn.simpleicons.org/reddit/white" alt="Reddit" className="w-4 h-4" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <img src="https://cdn.simpleicons.org/whatsapp/white" alt="WhatsApp" className="w-4 h-4" /> },
    { id: 'sms', label: 'SMS', icon: <MessageSquare className="w-4 h-4 text-white" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4 text-white" /> },
  ];

  return (
    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#0f111a] border border-white/10 rounded-3xl shadow-2xl shadow-blue-900/20 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-4 border-b border-white/5 flex-shrink-0 bg-white/[0.02]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
            <Share2 className="w-4 h-4 text-blue-500" />
            {t('share_modal_title') || 'Share'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              {i18n.language === 'ko' ? '메시지 & 미리보기' : 'Message & Preview'}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={i18n.language === 'ko' ? '추가 메시지를 입력하세요...' : 'Add a custom message...'}
              className="w-full h-16 bg-black/40 text-white text-xs p-3 rounded-xl border border-white/5 focus:border-blue-500/30 outline-none resize-none placeholder:text-white/20 transition-all font-sans"
            />
            <div className="bg-black/40 rounded-xl p-3 border border-white/5">
              <pre className="text-white/60 text-[10px] leading-relaxed whitespace-pre-wrap font-sans max-h-32 overflow-y-auto custom-scrollbar">
                {renderPreview(fullShareText)}
              </pre>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${copied
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-blue-600 hover:bg-blue-500 text-white border border-transparent shadow-blue-600/20 hover:shadow-blue-500/30'
              }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            {copied
              ? (i18n.language === 'ko' ? '복사 완료!' : 'Copied to Clipboard')
              : (i18n.language === 'ko' ? '전체 내용 복사' : 'Copy Full Text')}
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center px-4">
              <div className="w-full h-px bg-white/5"></div>
            </div>
            <span className="relative bg-[#0f111a] px-2 text-[9px] text-white/20 uppercase tracking-widest font-bold">
              {i18n.language === 'ko' ? '또는 SNS로 공유' : 'or share via'}
            </span>
          </div>

          <div>
            <div className="grid grid-cols-4 gap-2">
              {snsButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => handleSNSShare(btn.id)}
                  className="group bg-white/5 hover:bg-white/10 hover:border-blue-500/30 border border-white/5 p-2.5 rounded-2xl transition-all duration-300 flex flex-col items-center gap-1.5"
                >
                  <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300 text-white">
                    {btn.icon}
                  </div>
                  <span className="text-[9px] font-medium text-white/40 group-hover:text-white transition-colors">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
