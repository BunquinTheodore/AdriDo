import { Flame, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { DailyCard } from './components/DailyCard';
import { MonthlyCard } from './components/MonthlyCard';
import { NotesCard } from './components/NotesCard';
import { WeeklyCard } from './components/WeeklyCard';
import { TaskProvider, useTasks } from './context/FirebaseTaskContext';
import { NotesProvider } from './context/NotesContext';

type CardType = 'notes' | 'daily' | 'weekly' | 'monthly' | null;

function DashboardContent() {
  const [expandedCard, setExpandedCard] = useState<CardType>(null);
  const { tasks, loading } = useTasks();

  const handleExpand = (card: CardType) => {
    setExpandedCard(card);
  };

  const handleCollapse = () => {
    setExpandedCard(null);
  };

  // Calculate streak with local date formatting
  const calculateStreak = () => {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      // Use local date formatting to avoid timezone issues
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      const dayTasks = tasks.filter(t => t.date === dateStr);
      
      if (dayTasks.length > 0 && dayTasks.every(t => t.completed)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  const currentStreak = calculateStreak();
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div 
      className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-12"
      style={{ 
        backgroundColor: 'var(--dashboard-background)',
        backgroundImage: 'radial-gradient(ellipse at top, rgba(179, 229, 252, 0.3) 0%, transparent 50%)',
      }}
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <header className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5" style={{ color: 'var(--dashboard-primary-blue)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--dashboard-primary-blue)' }}>
                  {getGreeting()}
                </span>
              </div>
              <h1 
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 tracking-tight"
                style={{ color: 'var(--dashboard-text-primary)' }}
              >
                Welcome back, Adrian!
              </h1>
              <p 
                className="text-sm sm:text-base"
                style={{ color: 'var(--dashboard-text-secondary)' }}
              >
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            {currentStreak > 0 && (
              <div 
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-orange-100 shadow-sm"
                style={{ 
                  background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
                }}
              >
                <div className="relative">
                  <Flame 
                    className="w-6 h-6 animate-pulse" 
                    style={{ color: '#FF6B35' }}
                    fill="#FF6B35"
                  />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#C2410C' }}>
                    {currentStreak} Day Streak!
                  </div>
                  <div className="text-xs" style={{ color: '#EA580C' }}>
                    You're on fire! 🔥
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-[var(--dashboard-primary-blue)] border-t-transparent rounded-full animate-spin"></div>
              <span style={{ color: 'var(--dashboard-text-secondary)' }}>Loading your dashboard...</span>
            </div>
          </div>
        )}

        {/* Dashboard Grid */}
        {!loading && (
          <div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
            style={{
              gridAutoRows: 'minmax(200px, auto)',
            }}
          >
            {/* Notes Card - Featured (larger, spans more) */}
            <div className="lg:col-span-2">
              <NotesCard
                isExpanded={expandedCard === 'notes'}
                onExpand={() => handleExpand('notes')}
                onCollapse={handleCollapse}
              />
            </div>

            {/* Daily Card */}
            <div className="lg:col-span-1">
              <DailyCard
                isExpanded={expandedCard === 'daily'}
                onExpand={() => handleExpand('daily')}
                onCollapse={handleCollapse}
              />
            </div>

            {/* Weekly Card */}
            <div className="lg:col-span-1">
              <WeeklyCard
                isExpanded={expandedCard === 'weekly'}
                onExpand={() => handleExpand('weekly')}
                onCollapse={handleCollapse}
              />
            </div>

            {/* Monthly Card */}
            <div className="lg:col-span-2">
              <MonthlyCard
                isExpanded={expandedCard === 'monthly'}
                onExpand={() => handleExpand('monthly')}
                onCollapse={handleCollapse}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 sm:mt-12 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full text-xs font-medium" 
            style={{ 
              backgroundColor: 'rgba(179, 229, 252, 0.5)',
              color: 'var(--dashboard-text-secondary)' 
            }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            Track Daily → Build Weekly → Achieve Monthly
          </div>
          <p 
            className="text-sm italic max-w-md mx-auto"
            style={{ color: 'var(--dashboard-text-secondary)' }}
          >
            "Success isn't always about greatness. It's about consistency. Consistent hard work leads to success."
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--dashboard-text-secondary)', opacity: 0.7 }}>
            — Dwayne Johnson
          </p>
        </footer>
      </div>

      {/* Global Styles for Focus States */}
      <style>{`
        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible {
          outline: 2px solid var(--dashboard-primary-blue);
          outline-offset: 2px;
        }

        ::placeholder {
          font-style: italic;
          color: var(--dashboard-text-secondary);
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: var(--dashboard-border);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--dashboard-text-secondary);
        }

        /* Ensure minimum touch targets */
        button,
        a,
        input[type="checkbox"] {
          min-width: 44px;
          min-height: 44px;
        }

        input[type="checkbox"] {
          cursor: pointer;
        }

        /* Selection color */
        ::selection {
          background-color: var(--dashboard-accent-cyan);
          color: var(--dashboard-text-primary);
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <NotesProvider>
        <DashboardContent />
      </NotesProvider>
    </TaskProvider>
  );
}