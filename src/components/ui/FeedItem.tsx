import {
  Globe,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import type { FeedItem as FeedItemType } from '../../services/feedService';
import type { Perspective } from '../Dashboard';

interface FeedItemProps {
  item: FeedItemType;
  isBookmarked: boolean;
  hasRead: boolean;
  perspective: Perspective;
  onBookmark: (id: string) => void;
  onRemoveBookmark: (id: string) => void;
  onRead: (id: string, title: string, url: string, source: string, perspective: Perspective) => void;
}

export function FeedItemCard({
  item,
  isBookmarked,
  hasRead,
  perspective,
  onBookmark,
  onRemoveBookmark,
  onRead
}: FeedItemProps) {
  return (
    <div className={`relative border-b border-slate-800 ${hasRead ? 'opacity-70' : ''}`}>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onRead(item.id, item.title, item.url, item.source, perspective)}
        className="block p-3 sm:p-4 hover:bg-slate-800/80 transition-all group cursor-pointer pr-12 sm:pr-16 active:bg-slate-800/60"
      >
        <div className="flex justify-between items-start mb-1 gap-2">
          <span className="text-[10px] sm:text-xs font-mono text-blue-400 bg-blue-900/10 px-1.5 py-0.5 rounded truncate max-w-[120px] sm:max-w-none">
            {item.topic.toUpperCase()}
          </span>
          <span className="text-[10px] sm:text-xs font-mono text-slate-500 flex-shrink-0">
            {item.time}
          </span>
        </div>
        <h3 className={`text-sm font-medium ${hasRead ? 'text-slate-400' : 'text-slate-200'} group-hover:text-blue-400 transition-colors mb-2 pr-4 sm:pr-6 line-clamp-3 sm:line-clamp-2`}>
          {item.title}
        </h3>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 group-hover:text-slate-300">
              <Globe className="h-3 w-3" />
              <span className="truncate max-w-[100px] sm:max-w-none">{item.source}</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-mono text-slate-600">FRESHNESS:</span>
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${perspective === 'right' ? 'bg-gradient-to-r from-blue-500 to-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                style={{ width: `${item.velocity}%` }}
              ></div>
            </div>
          </div>
        </div>
      </a>

      {/* Bookmark button - larger tap target on mobile */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isBookmarked) {
            onRemoveBookmark(item.id);
          } else {
            onBookmark(item.id);
          }
        }}
        className={`absolute top-3 sm:top-4 right-2 sm:right-4 p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-lg transition-all active:scale-95 ${
          isBookmarked
            ? 'text-yellow-400 bg-yellow-900/20'
            : 'text-slate-500 hover:text-yellow-400 hover:bg-yellow-900/10'
        }`}
        title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        {isBookmarked ? <BookmarkCheck className="h-5 w-5 sm:h-4 sm:w-4" /> : <Bookmark className="h-5 w-5 sm:h-4 sm:w-4" />}
      </button>
    </div>
  );
}
