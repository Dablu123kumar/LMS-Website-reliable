'use client';

import { useState, useMemo, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CourseCard from '@/components/CourseCard';
import { api } from '@/lib/api';
import { courses as mockCourses, categories as mockCategories } from '@/lib/data';
import styles from './page.module.css';

/* ── Scroll Reveal Hook ── */
function useReveal(deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('revealed');
        });
      },
      { threshold: 0.05 }
    );
    const nodes = ref.current?.querySelectorAll('.reveal');
    nodes?.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, deps);
  return ref;
}

function CoursesContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [sort, setSort] = useState('popular');
  const [coursesList, setCoursesList] = useState(mockCourses);
  const [categoriesList, setCategoriesList] = useState(mockCategories);
  const pageRef = useReveal([coursesList, categoriesList, selectedCat, difficulty, sort]);

  // Sync state with URL search params when they change
  useEffect(() => {
    const catParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    setSelectedCat(catParam || 'all');
    setSearch(searchParam || '');
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        const cRes = await api.getCourses();
        const catRes = await api.getCategories();
        if (cRes?.data && Array.isArray(cRes.data) && cRes.data.length > 0) {
          console.log('Backend courses list data:', cRes.data);
          setCoursesList(cRes.data);
        }
        if (catRes?.data && Array.isArray(catRes.data) && catRes.data.length > 0) {
          console.log('Backend categories list data:', catRes.data);
          // Adapt DB categories: { id, name, slug } -> { id: slug, name, icon, ... }
          const adaptedCats = catRes.data.map(cat => ({
            id: cat.slug,
            name: cat.name,
            icon: cat.slug === 'web-development' ? '🌐' : 
                  cat.slug === 'data-science' ? '📊' : 
                  cat.slug === 'ai-machine-learning' ? '🤖' :
                  cat.slug === 'mobile-development' ? '📱' :
                  cat.slug === 'ui-ux-design' ? '🎨' : '📢',
            description: cat.description || ''
          }));
          setCategoriesList(adaptedCats);
        }
      } catch (err) {
        console.error('Failed to fetch from API, using mock data:', err);
      }
    }
    loadData();
  }, []);

  const filtered = useMemo(() => {
    let list = [...coursesList];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.shortDescription.toLowerCase().includes(q) ||
          c.instructor.name.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCat !== 'all') {
      list = list.filter((c) => {
        if (typeof c.category === 'string') {
          return c.category === selectedCat;
        }
        if (c.category && typeof c.category === 'object') {
          return c.category.slug === selectedCat || c.category.id === selectedCat;
        }
        if (c.categoryId) {
          return c.categoryId === selectedCat;
        }
        return false;
      });
    }

    // Difficulty
    if (difficulty !== 'all') {
      list = list.filter((c) => c.difficultyLevel === difficulty);
    }

    // Sort
    switch (sort) {
      case 'popular':
        list.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        break;
      case 'newest':
        list.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'price-low':
        list.sort((a, b) => {
          const aP = typeof a.discountPrice === 'number' && a.discountPrice < a.price ? a.price - a.discountPrice : a.price;
          const bP = typeof b.discountPrice === 'number' && b.discountPrice < b.price ? b.price - b.discountPrice : b.price;
          return aP - bP;
        });
        break;
      case 'price-high':
        list.sort((a, b) => {
          const aP = typeof a.discountPrice === 'number' && a.discountPrice < a.price ? a.price - a.discountPrice : a.price;
          const bP = typeof b.discountPrice === 'number' && b.discountPrice < b.price ? b.price - b.discountPrice : b.price;
          return bP - aP;
        });
        break;
      case 'rating':
        list.sort((a, b) => b.ratingAvg - a.ratingAvg);
        break;
      default:
        break;
    }

    return list;
  }, [search, selectedCat, difficulty, sort, coursesList]);

  return (
    <div ref={pageRef}>
      <Navbar />

      {/* Header */}
      <section className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>
            Explore Our <span className="text-gradient">Courses</span>
          </h1>
          <p className={styles.subtitle}>
            Discover {coursesList.length}+ courses designed to take your skills to the next level
          </p>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className={`section ${styles.main}`}>
        <div className="container">
          {/* Filter bar */}
          <div className={styles.filterBar}>
            <div className={styles.categoryPills}>
              <button
                className={`pill ${selectedCat === 'all' ? 'pill-active' : ''}`}
                onClick={() => setSelectedCat('all')}
              >
                All
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  className={`pill ${selectedCat === cat.id ? 'pill-active' : ''}`}
                  onClick={() => setSelectedCat(cat.id)}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            <div className={styles.filterDropdowns}>
              <select
                className="form-input"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              <select
                className="form-input"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <p className={styles.resultCount}>
            Showing <strong>{filtered.length}</strong> course{filtered.length !== 1 ? 's' : ''}
          </p>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className={styles.courseGrid}>
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🔎</div>
              <h3 className="empty-state-title">No courses found</h3>
              <p className="empty-state-text">
                Try adjusting your filters or search query to discover more courses.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
        Loading courses...
      </div>
    }>
      <CoursesContent />
    </Suspense>
  );
}
