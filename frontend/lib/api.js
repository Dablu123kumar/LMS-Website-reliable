const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export function getGeneralToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('general_token');
  }
  return null;
}

export function setGeneralToken(token) {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('general_token', token);
    } else {
      localStorage.removeItem('general_token');
    }
  }
}

export function getGeneralUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('general_user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

export function setGeneralUser(user) {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem('general_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('general_user');
    }
  }
}

export function getLmsToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('lms_token');
  }
  return null;
}

export function setLmsToken(token) {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('lms_token', token);
    } else {
      localStorage.removeItem('lms_token');
    }
  }
}

export function getLmsUser() {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('lms_user');
    return user ? JSON.parse(user) : null;
  }
  return null;
}

export function setLmsUser(user) {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem('lms_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lms_user');
    }
  }
}

async function request(path, options = {}, isLms = false) {
  const token = isLms ? getLmsToken() : getGeneralToken();
  
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      if (isLms) {
        localStorage.removeItem('lms_token');
        localStorage.removeItem('lms_user');
        window.location.href = '/lms/login';
      } else {
        localStorage.removeItem('general_token');
        localStorage.removeItem('general_user');
        window.location.href = '/admin/login';
      }
    }
  }

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;

}

export function getFullUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads')) {
    const backendBaseUrl = API_URL.replace('/api/v1', '');
    return `${backendBaseUrl}${url}`;
  }
  return url;
}

export function mapDBCourseToMock(dbCourse) {
  if (!dbCourse) return null;
  
  const diff = dbCourse.difficultyLevel 
    ? dbCourse.difficultyLevel.charAt(0).toUpperCase() + dbCourse.difficultyLevel.slice(1).toLowerCase() 
    : 'Beginner';

  let syllabus = [];
  try {
    syllabus = typeof dbCourse.syllabus === 'string' ? JSON.parse(dbCourse.syllabus) : (dbCourse.syllabus || []);
  } catch (e) {
    syllabus = [];
  }
  
  syllabus = syllabus.map((module) => {
    if (module.lessons) return module;
    const topics = module.topics || [];
    return {
      title: module.title || `Module ${module.week || ''}`,
      lessons: topics.map((topic) => ({
        title: topic,
        duration: '15:00',
      }))
    };
  });

  let features = [];
  try {
    features = typeof dbCourse.features === 'string' ? JSON.parse(dbCourse.features) : (dbCourse.features || []);
  } catch (e) {
    features = [];
  }

  const categorySlug = dbCourse.category?.slug || dbCourse.categoryId || 'web-development';

  // Fallbacks for seed images that don't exist locally
  let thumbnailUrl = dbCourse.thumbnailUrl;
  if (thumbnailUrl && (thumbnailUrl.startsWith('/thumbnails') || thumbnailUrl.startsWith('thumbnails'))) {
    thumbnailUrl = categorySlug === 'web-development' 
      ? 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=340&fit=crop'
      : categorySlug === 'data-science'
      ? 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop'
      : categorySlug === 'ai-machine-learning' || categorySlug === 'ai-ml'
      ? 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=340&fit=crop'
      : categorySlug === 'mobile-development'
      ? 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=340&fit=crop'
      : categorySlug === 'ui-ux-design'
      ? 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=340&fit=crop'
      : 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop';
  } else {
    thumbnailUrl = getFullUrl(thumbnailUrl) || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=340&fit=crop';
  }

  let instructorAvatar = dbCourse.instructorAvatar;
  if (instructorAvatar && (instructorAvatar.startsWith('/avatars') || instructorAvatar.startsWith('avatars'))) {
    const seedNum = Math.abs(dbCourse.instructorName ? dbCourse.instructorName.charCodeAt(0) % 99 : 32);
    const gender = ['Priya', 'Nidhi', 'Meera', 'Sneha', 'Aisha', 'Kavita'].some(n => dbCourse.instructorName?.includes(n)) ? 'women' : 'men';
    instructorAvatar = `https://randomuser.me/api/portraits/${gender}/${seedNum}.jpg`;
  } else {
    instructorAvatar = getFullUrl(instructorAvatar) || 'https://randomuser.me/api/portraits/men/32.jpg';
  }

  return {
    id: dbCourse.id,
    slug: dbCourse.slug,
    title: dbCourse.title,
    categoryId: dbCourse.categoryId,
    shortDescription: dbCourse.shortDescription || '',
    description: dbCourse.description || '',
    price: dbCourse.price,
    discountPrice: dbCourse.discountPrice,
    thumbnailUrl,
    instructor: {
      name: dbCourse.instructorName || 'Expert Instructor',
      bio: dbCourse.instructorBio || '',
      avatar: instructorAvatar,
    },
    difficultyLevel: diff,
    durationHours: dbCourse.durationHours || 20,
    enrollmentCount: dbCourse.enrollmentCount || 0,
    ratingAvg: dbCourse.ratingAvg || 4.5,
    category: categorySlug,
    syllabus,
    features,
    isPublished: dbCourse.isPublished,
    status: dbCourse.status || 'APPROVED',
  };
}

export const api = {
  // Public & General Auth
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me', { method: 'GET' }),

  // Courses
  getCourses: async () => {
    const res = await request('/courses', { method: 'GET' });
    if (res?.data && Array.isArray(res.data)) {
      res.data = res.data.map(mapDBCourseToMock);
    }
    return res;
  },
  getCoursesRaw: () => request('/courses', { method: 'GET' }),
  getCategories: () => request('/courses/categories', { method: 'GET' }),
  getCourseBySlug: async (slug) => {
    const res = await request(`/courses/${slug}`, { method: 'GET' });
    if (res?.data) {
      res.data = mapDBCourseToMock(res.data);
    }
    return res;
  },

  // Purchase
  createOrder: (courseId) => request('/purchase/create-order', { method: 'POST', body: JSON.stringify({ courseId }) }),
  verifyPayment: (body) => request('/purchase/verify', { method: 'POST', body: JSON.stringify(body) }),
  getPurchaseHistory: () => request('/purchase/history', { method: 'GET' }),

  // LMS Auth & Dashboard
  lmsLogin: (body) => request('/auth/lms/login', { method: 'POST', body: JSON.stringify(body) }),
  getLmsMe: () => request('/auth/lms/me', { method: 'GET' }, true),
  getMyCourses: () => request('/dashboard/my-courses', { method: 'GET' }, true),
  getCourseContent: (id) => request(`/dashboard/course/${id}`, { method: 'GET' }, true),
  getStats: () => request('/dashboard/stats', { method: 'GET' }, true),
  getNotifications: (page = 1) => request(`/dashboard/notifications?page=${page}`, { method: 'GET' }, true),
  markNotificationRead: (id) => request(`/dashboard/notifications/${id}/read`, { method: 'PUT' }, true),
  getProfile: () => request('/dashboard/profile', { method: 'GET' }, true),
  updateProfile: (body) => request('/dashboard/profile', { method: 'PUT', body: JSON.stringify(body) }, true),
  updatePassword: (body) => request('/dashboard/profile/password', { method: 'PUT', body: JSON.stringify(body) }, true),
  deactivateAccount: () => request('/dashboard/profile/deactivate', { method: 'POST' }, true),

  // ─── Admin API ───────────────────────────────────────────────────────
  // Courses
  adminGetCourses: () => request('/admin/courses', { method: 'GET' }),
  adminCreateCourse: (body) => request('/admin/courses', { method: 'POST', body: JSON.stringify(body) }),
  adminUpdateCourse: (id, body) => request(`/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  adminDeleteCourse: (id) => request(`/admin/courses/${id}`, { method: 'DELETE' }),

  // Categories
  adminGetCategories: () => request('/admin/categories', { method: 'GET' }),
  adminCreateCategory: (body) => request('/admin/categories', { method: 'POST', body: JSON.stringify(body) }),
  adminUpdateCategory: (id, body) => request(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  adminDeleteCategory: (id) => request(`/admin/categories/${id}`, { method: 'DELETE' }),

  // Live Classes
  adminGetLiveClasses: () => request('/admin/live-classes', { method: 'GET' }),
  adminScheduleLiveClass: (body) => request('/admin/live-classes', { method: 'POST', body: JSON.stringify(body) }),
  adminStartLiveClass: (id, body) => request(`/admin/live-classes/${id}/start`, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  adminEndLiveClass: (id) => request(`/admin/live-classes/${id}/end`, { method: 'PUT' }),
  adminNotifyLiveClass: (id) => request(`/admin/live-classes/${id}/notify`, { method: 'POST' }),

  // Recordings
  adminGetRecordings: () => request('/admin/recordings', { method: 'GET' }),
  adminAddRecording: (body) => request('/admin/recordings', { method: 'POST', body: JSON.stringify(body) }),

  // Students
  adminGetStudents: (page = 1, limit = 20, search = '') => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('search', search);
    return request(`/admin/students?${params.toString()}`, { method: 'GET' });
  },
  adminUpdateStudent: (id, body) => request(`/admin/students/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  adminDeleteStudent: (id) => request(`/admin/students/${id}`, { method: 'DELETE' }),
  adminUploadFile: (formData) => request('/admin/upload', { method: 'POST', body: formData }),
};
