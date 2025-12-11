


import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { ArrowLeft, Clock, Eye, User, Calendar, Tag, Share2 } from 'lucide-react';
import { CommentSection } from '../components/CommentSection';

export const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { articles, incrementArticleView, users } = useNews();
  const navigate = useNavigate();

  const article = articles.find(a => a.id === id);

  // Find the author's user profile to get the picture
  // Prefer matching by ID if available, fallback to name
  const authorUser = users.find(u => 
      (article?.authorId && u.id === article.authorId) || 
      (u.name === article?.author)
  );

  useEffect(() => {
    if (id) {
      incrementArticleView(id);
    }
  }, [id]);

  if (!article) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif font-bold mb-4">Article Not Found</h2>
        <button onClick={() => navigate('/')} className="text-ink underline hover:text-gold">Return Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-ink mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-4">
        <span className="text-gold-dark font-bold uppercase tracking-widest text-xs">{article.category}</span>
      </div>

      <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink mb-6 leading-tight">
        {article.title}
      </h1>

      <div className="flex flex-col md:flex-row md:items-center justify-between border-t border-b border-gray-200 py-4 mb-8 gap-4">
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 font-sans">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-300">
                    {authorUser?.profilePicUrl ? (
                        <img src={authorUser.profilePicUrl} alt={article.author} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <User size={20} />
                        </div>
                    )}
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Written By</span>
                    <span className="font-bold text-ink leading-none">{article.author}</span>
                </div>
             </div>
             <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
             <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gold" />
                <span>{article.date}</span>
             </div>
             <div className="flex items-center gap-2">
                <Eye size={16} className="text-gold" />
                <span>{article.views || 0} Readers</span> 
             </div>
        </div>
        <button className="flex items-center gap-2 text-gray-500 hover:text-ink transition-colors">
            <Share2 size={16} /> <span className="text-xs font-bold uppercase">Share</span>
        </button>
      </div>

      {article.videoUrl ? (
        <div className="mb-8 w-full aspect-video bg-black rounded overflow-hidden shadow-lg">
             <video 
                src={article.videoUrl} 
                controls 
                className="w-full h-full object-contain"
                poster={article.imageUrl}
             />
        </div>
      ) : (
        <div className="mb-8 w-full aspect-[2/1] bg-gray-100 rounded overflow-hidden shadow-lg relative">
            <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full h-full object-cover"
            />
        </div>
      )}

      <div className="font-serif text-gray-800 leading-relaxed">
         <p className="text-xl font-bold mb-8 text-ink border-l-4 border-gold pl-4 italic">
            {article.excerpt}
         </p>
         <div 
            className="prose prose-lg max-w-none font-serif text-gray-800 leading-relaxed [&>p]:mb-4"
            dangerouslySetInnerHTML={{ __html: article.content }} 
        />
      </div>

      {article.tags && article.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
              <h4 className="text-xs font-bold uppercase text-gray-500 mb-4 flex items-center gap-2"><Tag size={14}/> Filed Under</h4>
              <div className="flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase hover:bg-gold hover:text-white transition-colors cursor-pointer">
                        {tag}
                      </span>
                  ))}
              </div>
          </div>
      )}

      {/* --- COMMENTS --- */}
      <CommentSection articleId={article.id} />
    </div>
  );
};