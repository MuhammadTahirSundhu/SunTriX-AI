import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { apiRequest, ENDPOINTS } from "../lib/api";
import { useSEO } from "../hooks/useSEO";
import Layout from "../components/Layout";
import { Clock, Tag, ChevronRight, Search, Rss } from "lucide-react";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  category: string;
  status: "published" | "draft" | "scheduled";
  publishedAt?: string;
  readTime?: number;
  author?: string;
  createdAt: string;
}

const Blog = () => {
  useSEO({
    title: "Blog — SunTriX AI Solutions",
    description: "Insights, tutorials, and case studies on AI, machine learning, agentic systems, and modern software development from the SunTriX team.",
    canonicalUrl: "https://www.suntrix.ai/blog",
  });

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetch_ = async () => {
      setLoading(true);
      const { data } = await apiRequest<{ posts: BlogPost[] }>(ENDPOINTS.BLOG_LIST);
      const published = (data?.posts || []).filter((p) => p.status === "published");
      setPosts(published);
      setLoading(false);
    };
    fetch_();
  }, []);

  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];

  const filtered = posts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const [featured, ...rest] = filtered;

  return (
    <Layout>
      <div className="min-h-screen bg-background pt-32 pb-24 px-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest mb-4 bg-primary/10 px-3 py-1.5 rounded-full">
              <Rss className="h-3 w-3" /> SunTriX Blog
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
              Insights &amp; <span className="gradient-text">Stories</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our thinking on AI, machine learning, agentic systems, and the future of software.
            </p>
          </motion.div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <p className="text-lg font-medium mb-2">No articles found</p>
              <p className="text-sm">Try a different search term or category.</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featured && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                  <Link to={`/blog/${featured.slug}`} className="group block">
                    <div className="grid md:grid-cols-2 gap-8 bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors">
                      {featured.coverImage && (
                        <div className="aspect-video md:aspect-auto overflow-hidden bg-muted">
                          <img src={featured.coverImage} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="p-8 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                          {featured.category && (
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">{featured.category}</span>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {featured.readTime || 5} min read
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{featured.title}</h2>
                        <p className="text-muted-foreground mb-6 line-clamp-3">{featured.excerpt}</p>
                        <div className="flex items-center gap-2 text-primary font-medium text-sm">
                          Read Article <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Post Grid */}
              {rest.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((post, i) => (
                    <motion.div key={post._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link to={`/blog/${post.slug}`} className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 h-full flex flex-col">
                        {post.coverImage && (
                          <div className="aspect-video overflow-hidden bg-muted">
                            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            {post.category && <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{post.category}</span>}
                            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                              <Clock className="h-3 w-3" /> {post.readTime || 5}m
                            </span>
                          </div>
                          <h3 className="font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{post.excerpt}</p>
                          {post.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-4">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Tag className="h-2.5 w-2.5" />{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
