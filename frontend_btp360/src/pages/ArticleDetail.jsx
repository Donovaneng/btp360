import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft, BookOpen, Share2, MessageSquare, Link as LinkIcon, Loader2, CheckCircle2, Send } from 'lucide-react';
import api from '../services/api';
import { useSEO } from '../hooks/useSEO';

const ArticleDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  useSEO(article ? article.title : 'Chargement...', article ? article.excerpt : 'Chargement de l\'article...');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    const savedComments = localStorage.getItem(`btp360_comments_${slug}`);
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, [slug]);

  useEffect(() => {
    if (comments.length > 0) {
      localStorage.setItem(`btp360_comments_${slug}`, JSON.stringify(comments));
    }
  }, [comments, slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      }).catch(console.error);
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    const newComment = {
       id: Date.now(),
       user: "Lecteur BTP 360",
       date: new Date().toISOString(),
       content: comment,
       articleTitle: article.title,
       articleSlug: slug,
       status: 'pending' // For admin moderation
    };
    
    // Save to local article comments
    setComments([newComment, ...comments]);

    // Save to global admin comments list
    const allComments = JSON.parse(localStorage.getItem('btp360_all_comments') || '[]');
    localStorage.setItem('btp360_all_comments', JSON.stringify([newComment, ...allComments]));

    setComment("");
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 5000);
  };

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await api.get(`/articles/${slug}`);
        setArticle(response.data);
      } catch (error) {
        console.error('Erreur article:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-brand-orange" size={48} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-10">
        <h2 className="text-3xl font-black text-brand-dark mb-4 uppercase">Article introuvable</h2>
        <p className="text-slate-500 mb-8 max-w-sm">Désolé, cet article n'existe pas ou a été déplacé.</p>
        <Link to="/academie" className="bg-brand-dark text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2">
          <ArrowLeft size={18} /> Retour à l'Académie
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-24 min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link to="/academie" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand-orange font-bold transition-all mb-10 group uppercase text-[10px] tracking-widest">
          <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> Retour à l'Académie
        </Link>

        <article className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
          {/* Cover */}
          <div className="aspect-[21/9] bg-slate-100 relative overflow-hidden">
            {article.image_url ? (
              <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-brand flex items-center justify-center">
                <BookOpen size={80} className="text-white/20" />
              </div>
            )}
            <div className="absolute top-8 left-8">
               <span className="px-6 py-2 bg-white text-brand-orange rounded-full text-xs font-black uppercase tracking-widest shadow-xl">
                 {article.category_name}
               </span>
            </div>
          </div>

          <div className="p-10 md:p-20">
             {/* Meta */}
             <div className="flex flex-wrap items-center gap-8 mb-10 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                   <User size={16} className="text-brand-orange" /> Par {article.author_name || 'Équipe BTP 360'}
                </div>
                <div className="flex items-center gap-2">
                   <Calendar size={16} className="text-brand-orange" /> Publié le {new Date(article.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
             </div>

             <h1 className="text-4xl md:text-5xl font-black text-brand-dark mb-10 leading-[1.1] tracking-tight">
               {article.title}
             </h1>

             {/* Content */}
             <div className="prose prose-slate max-w-none prose-p:text-lg prose-p:leading-relaxed prose-p:text-slate-600 prose-headings:font-black prose-headings:text-brand-dark prose-headings:uppercase prose-headings:tracking-tight">
                {/* Simulation de contenu enrichi */}
                <p className="font-bold text-xl text-brand-orange italic mb-8 border-l-4 border-brand-orange pl-6 py-2 bg-brand-orange/5 rounded-r-xl">
                  {article.excerpt}
                </p>
                <div className="whitespace-pre-line leading-loose text-lg text-slate-700">
                  {article.content}
                </div>
                
                <div className="mt-16 p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                       <h3 className="text-xl font-black text-brand-dark mb-1">Vous avez aimé cet article ?</h3>
                       <p className="text-slate-400 text-sm font-medium">Partagez-le avec votre réseau professionnel.</p>
                    </div>
                    <div className="flex gap-4">
                        <button 
                          onClick={() => document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' })}
                          className="p-4 bg-white rounded-2xl shadow-sm text-brand-orange hover:scale-110 transition-transform border border-transparent hover:border-brand-orange/20"
                        >
                           <MessageSquare size={24} />
                        </button>
                        <button 
                          onClick={handleCopyLink}
                          className="p-4 bg-white rounded-2xl shadow-sm text-slate-600 hover:scale-110 transition-transform border border-transparent hover:border-slate-200 relative"
                        >
                           {copied ? <CheckCircle2 className="text-green-500" size={24} /> : <LinkIcon size={24} />}
                           {copied && <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-brand-dark text-white text-[10px] px-3 py-1.5 rounded-lg whitespace-nowrap">Lien copié !</span>}
                        </button>
                        <button 
                          onClick={handleShare}
                          className="p-4 bg-white rounded-2xl shadow-sm text-slate-600 hover:scale-110 transition-transform border border-transparent hover:border-slate-200"
                        >
                           <Share2 size={24} />
                        </button>
                    </div>
                 </div>
              </div>
           </div>
        </article>

        {/* Comments Section */}
        <div id="comment-form" className="mt-20 space-y-12">
           <div className="flex items-center gap-4">
              <div className="h-px bg-slate-200 flex-1"></div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Commentaires</h3>
              <div className="h-px bg-slate-200 flex-1"></div>
           </div>

           <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-sm">
              <form onSubmit={handleCommentSubmit} className="space-y-6">
                 <div className="flex items-start gap-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 shrink-0">
                       <User size={24} />
                    </div>
                    <div className="flex-1">
                       <textarea 
                         rows="4"
                         placeholder="Votre avis nous intéresse... (modéré par l'équipe)"
                         className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 focus:ring-4 focus:ring-brand-orange/10 outline-none transition-all font-medium text-slate-600"
                         value={comment}
                         onChange={(e) => setComment(e.target.value)}
                       ></textarea>
                    </div>
                 </div>
                 <div className="flex justify-between items-center">
                    <div className="flex-1">
                       {commentSuccess && (
                          <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase tracking-widest animate-fade-in">
                             <CheckCircle2 size={16} /> Merci ! Votre commentaire est en attente de modération.
                          </div>
                       )}
                    </div>
                    <button 
                      type="submit"
                      className="bg-brand-dark hover:bg-black text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all transform hover:scale-105"
                    >
                       Publier <Send size={16} />
                    </button>
                 </div>
              </form>
           </div>

           <div className="space-y-6 pb-10">
              {comments.length > 0 ? comments.map((c, i) => (
                 <div key={c.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center font-black">
                             {c.user.charAt(0)}
                          </div>
                          <div>
                             <p className="font-black text-brand-dark uppercase text-[10px] tracking-widest">{c.user}</p>
                             <p className="text-[10px] text-slate-400 font-bold">{c.date}</p>
                          </div>
                       </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed font-medium">
                       {c.content}
                    </p>
                 </div>
              )) : (
                 <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-slate-100">
                    <p className="text-slate-400 italic font-medium">Aucun commentaire pour le moment. Soyez le premier à réagir !</p>
                 </div>
              )}
           </div>
        </div>

        {/* Navigation Section */}
        <div className="mt-16 flex justify-between items-center bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
           <div className="text-sm font-black text-brand-dark uppercase tracking-widest">Partager la connaissance</div>
           <button 
            onClick={() => navigate('/academie')} 
            className="text-brand-orange font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 hover:translate-x-2 transition-transform"
           >
             Voir plus d'articles <ArrowLeft className="rotate-180" size={16} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
