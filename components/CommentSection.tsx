
import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { ThumbsUp, ThumbsDown, MessageSquare, Trash2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommentSectionProps {
    articleId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
    const { comments, addComment, voteComment, deleteComment, currentUser } = useNews();
    const [newComment, setNewComment] = useState('');
    const navigate = useNavigate();

    // Filter comments for this article
    const articleComments = comments.filter(c => c.articleId === articleId).sort((a, b) => b.timestamp - a.timestamp);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        addComment(articleId, newComment);
        setNewComment('');
    };

    // Helper: Is counts visible?
    const areCountsVisible = currentUser?.role === 'admin' || currentUser?.role === 'publisher';

    // Helper: Formatting relative time
    const timeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="bg-gray-50 p-6 md:p-8 rounded-xl border border-gray-200 mt-12">
            <h3 className="font-serif font-bold text-2xl text-ink mb-6 flex items-center gap-2">
                <MessageSquare className="text-gold" /> Discussion ({articleComments.length})
            </h3>

            {/* Input Form */}
            {currentUser ? (
                <form onSubmit={handleSubmit} className="mb-10">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                            {currentUser.profilePicUrl ? (
                                <img src={currentUser.profilePicUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={20}/></div>
                            )}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="What are your thoughts?"
                                rows={3}
                                className="w-full border border-gray-300 rounded p-3 text-sm focus:ring-1 focus:ring-gold outline-none resize-none bg-white"
                                required
                            />
                            <div className="flex justify-end mt-2">
                                <button type="submit" className="bg-ink text-white text-xs font-bold uppercase px-6 py-2 rounded hover:bg-gold hover:text-ink transition-colors">
                                    Post Comment
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="bg-white border border-dashed border-gray-300 rounded p-6 text-center mb-10">
                    <p className="text-gray-500 text-sm mb-3">Join the conversation by signing in.</p>
                    <button 
                        onClick={() => navigate('/subscribe')}
                        className="bg-gold text-white text-xs font-bold uppercase px-6 py-2 rounded hover:bg-ink transition-colors"
                    >
                        Login to Comment
                    </button>
                </div>
            )}

            {/* Comment List */}
            <div className="space-y-6">
                {articleComments.length === 0 ? (
                    <p className="text-gray-400 italic text-sm text-center">No comments yet. Be the first to share your opinion!</p>
                ) : (
                    articleComments.map(comment => {
                        const isLiked = currentUser && comment.likedBy.includes(currentUser.id);
                        const isDisliked = currentUser && comment.dislikedBy.includes(currentUser.id);

                        return (
                            <div key={comment.id} className="flex gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                    {comment.userAvatar ? (
                                        <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={20}/></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-white p-4 rounded border border-gray-100 shadow-sm relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-sm text-ink">{comment.userName}</h4>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">{timeAgo(comment.timestamp)}</span>
                                            </div>
                                            {/* Admin Delete Action */}
                                            {(currentUser?.role === 'admin' || currentUser?.id === comment.userId) && (
                                                <button 
                                                    onClick={() => deleteComment(comment.id)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                    title="Delete Comment"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex items-center gap-4 mt-2 pl-2">
                                        <button 
                                            onClick={() => voteComment(comment.id, 'like')}
                                            className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isLiked ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
                                            title="Like"
                                        >
                                            <ThumbsUp size={14} fill={isLiked ? "currentColor" : "none"} />
                                            {areCountsVisible && <span>{comment.likes}</span>}
                                        </button>
                                        
                                        <button 
                                            onClick={() => voteComment(comment.id, 'dislike')}
                                            className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isDisliked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                            title="Dislike"
                                        >
                                            <ThumbsDown size={14} fill={isDisliked ? "currentColor" : "none"} />
                                            {areCountsVisible && <span>{comment.dislikes}</span>}
                                        </button>
                                        
                                        {/* Reply placeholder (visual only for now) */}
                                        <button className="text-xs font-bold text-gray-400 hover:text-ink transition-colors">Reply</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
