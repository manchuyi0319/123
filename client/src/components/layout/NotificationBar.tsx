import { useState, useEffect } from 'react';
import { fetchLatestAnnouncement } from '../../api/announcements';

export function NotificationBar() {
  const [announcement, setAnnouncement] = useState<any>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fetchLatestAnnouncement()
      .then(data => {
        if (data) setAnnouncement(data);
      })
      .catch(() => {});
  }, []);

  if (!announcement || !visible) return null;

  return (
    <div className="bg-indigo-600 text-white px-4 py-2 flex items-center gap-3 text-sm">
      <span className="flex-shrink-0">📢</span>
      <div className="flex-1 overflow-hidden whitespace-nowrap">
        <span className="inline-block animate-marquee">
          {announcement.title}：{announcement.content}
        </span>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="flex-shrink-0 text-indigo-200 hover:text-white transition-colors ml-2"
      >
        ✕
      </button>
    </div>
  );
}
