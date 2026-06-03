'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { courses as localCourses } from '@/lib/data';
import styles from './Chatbot.module.css';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! 👋 I am your LearnHub Career & Course Advisor. How can I help you shape your learning journey today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickReplies = [
    { text: 'Which course is best for my career future? 🚀', query: 'career future' },
    { text: 'Tell me about Web Development courses 🌐', query: 'web development' },
    { text: 'How do live classes & payments work? 💳', query: 'payments' },
    { text: 'Help me choose an AI/ML course 🤖', query: 'ai courses' },
  ];

  const handleSend = (textToSend) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay (1.2 seconds)
    setTimeout(() => {
      const response = generateAdvisorResponse(textToSend);
      const botMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        recommendations: response.recommendations || [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200);
  };

  const generateAdvisorResponse = (query) => {
    const q = query.toLowerCase();

    // 1. Career Future Guidance
    if (q.includes('career') || q.includes('future') || q.includes('job') || q.includes('salary') || q.includes('market')) {
      return {
        text: 'All our learning tracks are selected for high-demand careers. Here is a quick breakdown to guide your choice:\n\n' +
              '• **Frontend & Full Stack (React, Next.js)**: Best for landing a developer job quickly. Practically every modern web tech startup relies on full-stack Javascript developers.\n' +
              '• **AI & Machine Learning (LangChain, PyTorch)**: Best for long-term career growth. Generative AI developers are currently the most highly compensated specialists in tech.\n' +
              '• **Cloud & DevOps (Docker, AWS)**: Best if you want to manage server infrastructure. DevOps engineers keep major platforms running and are vital for tech operations.\n\n' +
              'Here are some high-impact courses I highly recommend:',
        recommendations: localCourses.filter(c => 
          c.slug.includes('nextjs') || c.slug.includes('langchain') || c.slug.includes('devops')
        ),
      };
    }

    // 2. Web Development
    if (q.includes('web') || q.includes('react') || q.includes('javascript') || q.includes('js') || q.includes('next.js') || q.includes('nextjs') || q.includes('html') || q.includes('css') || q.includes('node')) {
      return {
        text: 'Our Web Development courses cover modern full-stack engineering. You will learn to build responsive frontends in React and Next.js, along with secure backend server APIs in Node.js.\n\nHere are our top Web Development courses:',
        recommendations: localCourses.filter(c => c.category === 'web-development'),
      };
    }

    // 3. AI & Machine Learning
    if (q.includes('ai') || q.includes('machine') || q.includes('ml') || q.includes('nlp') || q.includes('deep') || q.includes('transformer') || q.includes('langchain') || q.includes('openai') || q.includes('gpt')) {
      return {
        text: 'Artificial Intelligence is shifting the tech landscape! Our courses focus on building neural networks and utilizing Large Language Models (LLMs) with LangChain to build functional AI products.\n\nCheck out our AI & Machine Learning offerings:',
        recommendations: localCourses.filter(c => c.category === 'ai-ml' || c.category === 'ai-machine-learning'),
      };
    }

    // 4. Data Science & SQL
    if (q.includes('data') || q.includes('science') || q.includes('sql') || q.includes('analytics') || q.includes('python') || q.includes('pandas')) {
      return {
        text: 'Data is the lifeblood of modern decisions. In our Data Science path, you will master database queries using SQL and build machine learning pipelines using Python and Pandas.\n\nHere are our Data Science courses:',
        recommendations: localCourses.filter(c => c.category === 'data-science'),
      };
    }

    // 5. Mobile Development
    if (q.includes('mobile') || q.includes('flutter') || q.includes('native') || q.includes('ios') || q.includes('android') || q.includes('app')) {
      return {
        text: 'Cross-platform app development allows you to deploy to both Apple iOS and Android App Store with a single codebase. Learn React Native or Google Flutter.\n\nHere are our Mobile Development courses:',
        recommendations: localCourses.filter(c => c.category === 'mobile-development'),
      };
    }

    // 6. UI/UX Design
    if (q.includes('design') || q.includes('ui') || q.includes('ux') || q.includes('figma') || q.includes('prototype') || q.includes('wireframe')) {
      return {
        text: 'Good products require good experiences. Master wireframing, high-fidelity UI design systems, and user testing inside Figma to build interfaces people love to use.\n\nHere are our design courses:',
        recommendations: localCourses.filter(c => c.category === 'ui-ux-design'),
      };
    }

    // 7. Cloud & DevOps
    if (q.includes('cloud') || q.includes('devops') || q.includes('aws') || q.includes('docker') || q.includes('kubernetes') || q.includes('terraform')) {
      return {
        text: 'DevOps is essential for keeping systems online and deploying code efficiently. Master cloud services in AWS, container orchestration in Kubernetes, and automated CI/CD pipelines.\n\nHere are our Cloud & DevOps courses:',
        recommendations: localCourses.filter(c => c.category === 'cloud-devops'),
      };
    }

    // 8. Platform functionality (Payments, Credentials, Live classes)
    if (q.includes('payment') || q.includes('purchase') || q.includes('buy') || q.includes('fee') || q.includes('price') || q.includes('razorpay') || q.includes('email') || q.includes('credential') || q.includes('login') || q.includes('password')) {
      return {
        text: 'Purchasing a course is simple and secure on our platform:\n\n' +
              '1. **Payment**: Select a course and click **"Buy Now"**. Complete the transaction via Razorpay.\n' +
              '2. **Credentials**: Once verified, our system immediately emails you a unique username and password to access the LMS dashboard.\n' +
              '3. **Access**: Log in to view curriculum lessons, live links, and recorded class videos immediately.',
      };
    }

    if (q.includes('live') || q.includes('class') || q.includes('recording') || q.includes('video') || q.includes('zoom') || q.includes('google meet')) {
      return {
        text: 'All our courses feature **interactive live classes** scheduled on weekends or evenings. \n\nIf you miss a live session, don\'t worry! High-definition **recordings are automatically uploaded** to your LMS dashboard within 24 hours so you can study at your own convenience.',
      };
    }

    // Default Fallback Response
    return {
      text: 'I\'m happy to help you with course selection or answer questions about LearnHub! \n\n' +
            'Try asking me:\n' +
            '• *"Which course is best for jobs?"*\n' +
            '• *"What Web Development courses do you have?"*\n' +
            '• *"How do I buy a course?"*\n' +
            '• *"Tell me about live classes"*',
    };
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <button 
        className={`${styles.floatingBubble} ${isOpen ? styles.bubbleActive : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open advisor chat"
      >
        {isOpen ? (
          <span className={styles.closeIcon}>×</span>
        ) : (
          <div className={styles.bubbleInner}>
            <span className={styles.chatIcon}>💬</span>
            <span className={styles.onlineBadge} />
          </div>
        )}
      </button>

      {/* Chat Window Panel */}
      <div className={`${styles.chatPanel} ${isOpen ? styles.panelOpen : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.advisorAvatar}>🤖</div>
          <div className={styles.advisorInfo}>
            <h4>LearnHub Advisor</h4>
            <span className={styles.status}><span className={styles.greenPulse} /> Online</span>
          </div>
        </div>

        {/* Messages List */}
        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <div key={msg.id} className={`${styles.messageWrapper} ${msg.sender === 'user' ? styles.userWrapper : styles.botWrapper}`}>
              <div className={styles.messageBubble}>
                <p className={styles.messageText}>{msg.text}</p>
                
                {/* Course Recommendations */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className={styles.recommendationsList}>
                    {msg.recommendations.map((rec) => (
                      <div key={rec.id} className={styles.recCard}>
                        <div className={styles.recTitle}>{rec.title}</div>
                        <div className={styles.recMeta}>
                          <span>⏱️ {rec.durationHours} hrs</span>
                          <span>📊 {rec.difficultyLevel}</span>
                        </div>
                        <Link 
                          href={`/courses/${rec.slug}`} 
                          onClick={() => setIsOpen(false)} 
                          className={styles.recLink}
                        >
                          View Details →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className={styles.timestamp}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className={`${styles.messageWrapper} ${styles.botWrapper}`}>
              <div className={styles.typingIndicator}>
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        <div className={styles.quickRepliesContainer}>
          {quickReplies.map((qr, idx) => (
            <button 
              key={idx} 
              onClick={() => handleSend(qr.query)}
              className={styles.quickReplyBtn}
            >
              {qr.text}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }} 
          className={styles.inputForm}
        >
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={styles.inputField}
          />
          <button type="submit" className={styles.sendButton} disabled={!input.trim()}>
            ➔
          </button>
        </form>
      </div>
    </>
  );
}
