import {
  TerminalSquare,
  Link as LinkIcon,
  Users,
  Tags,
  GitPullRequest,
  FileText,
  MessageSquare,
  Ticket,
  UserPlus,
} from 'lucide-react';
import { useEffect, useRef, useState, forwardRef } from 'react';

export default function TerminalToTeam() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeArrowIdx, setActiveArrowIdx] = useState(0);
  const { containerRef, terminalRef, hubRef, destRefs, dims, paths, ready } = useArrowLayout(activeIdx);
  const mobileLayout = useArrowLayoutMobile(activeIdx);
  // Staggered right-shift for longer arrows (px)
  const destOffsets = [48, 72, 96, 84, 60];

  // Intersection Observer for scroll reveal
  const [isVisible, setIsVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Track dark mode to pick marker color variants that match line color
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const update = () => setIsDark(typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
    update();
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  // Scroll reveal - section entrance
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only trigger once
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -100px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Staggered card reveals - trigger after section is visible
  useEffect(() => {
    if (!isVisible) return;

    // Small delay after section appears
    const timer = setTimeout(() => {
      setCardsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [isVisible]);

  // Staggered arrow activation - delay arrow by 150ms after card
  useEffect(() => {
    const timeout = setTimeout(() => setActiveArrowIdx(activeIdx), 150);
    return () => clearTimeout(timeout);
  }, [activeIdx]);

  // Synchronized timing: 2.6s to match arrow dash animation
  useEffect(() => {
    const id = setInterval(() => setActiveIdx((i) => (i + 1) % 5), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <section
      ref={sectionRef}
      className={`py-12 sm:py-16 md:py-24 bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-900 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 dark:text-white">From Terminal to Team</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed dark:text-slate-300">
            Save sessions right from your terminal, get a shareable link, and give your team the full context.
          </p>
        </div>

        {/* Flow diagram */}
        <div className="relative hidden lg:block" ref={containerRef}>
          {/* Arrow overlay */}
          {ready && dims.width > 0 && (
            <svg
              className="absolute inset-0 pointer-events-none"
              width={dims.width}
              height={dims.height}
              viewBox={`0 0 ${dims.width} ${dims.height}`}
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                {/* Light mode markers (exactly match .flow-line colors) */}
                <marker id="arrow-dash-light" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M1,1 L11,6 L1,11" stroke="rgba(100,116,139,0.8)" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                </marker>
                <marker id="arrow-stop-light" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M1,1 L11,6 L1,11" stroke="rgba(100,116,139,0.8)" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                </marker>
                <marker id="arrow-dash-active-light" markerWidth="14" markerHeight="14" refX="13" refY="7" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M1,1 L13,7 L1,13" stroke="rgba(59,130,246,0.98)" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
                </marker>

                {/* Dark mode markers (exactly match :global(html.dark) colors) */}
                <marker id="arrow-dash-dark" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M1,1 L11,6 L1,11" stroke="rgba(148,163,184,0.75)" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
                </marker>
                <marker id="arrow-stop-dark" markerWidth="12" markerHeight="12" refX="11" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M1,1 L11,6 L1,11" stroke="rgba(148,163,184,0.75)" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                </marker>
                <marker id="arrow-dash-active-dark" markerWidth="14" markerHeight="14" refX="13" refY="7" orient="auto" markerUnits="userSpaceOnUse">
                  <path d="M1,1 L13,7 L1,13" stroke="rgba(147,197,253,0.98)" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
                </marker>
              </defs>
              {/* left -> center (subtle highlight) */}
              {paths.leftToCenter && (
                <path d={paths.leftToCenter} className="flow-line flow-line-leading" fill="none" stroke="currentColor" markerEnd={`url(#${isDark ? 'arrow-stop-dark' : 'arrow-stop-light'})`} />
              )}
              {/* center -> destinations */}
              {paths.toDests.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  className={`flow-line ${i === activeArrowIdx ? 'flow-line-active' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  markerEnd={`url(#${i === activeArrowIdx ? (isDark ? 'arrow-dash-active-dark' : 'arrow-dash-active-light') : (isDark ? 'arrow-dash-dark' : 'arrow-dash-light')})`}
                />
              ))}
            </svg>
          )}

          <div className="grid grid-cols-12 gap-6 items-center">
            {/* Terminal on the left */}
            <div className="col-span-3 flex justify-center">
              <div className="text-center">
                <div ref={terminalRef} className="relative inline-flex items-center justify-center rounded-2xl p-6 border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <TerminalSquare className="w-10 h-10 text-slate-800 dark:text-slate-200" />
                </div>
                <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">Terminal</div>
              </div>
            </div>

            {/* SessionBase hub in center */}
            <div className="col-span-3 flex justify-center">
              <div className="relative text-center">
                <div ref={hubRef} className="relative w-28 h-28 rounded-2xl border border-slate-300 bg-white shadow-md overflow-hidden dark:border-slate-700 dark:bg-slate-900 flex items-center justify-center p-2">
                  <img src="/android-chrome-512x512.png" alt="SessionBase" className="w-full h-full object-contain opacity-95" />
                </div>
                <div className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">SessionBase</div>
              </div>
            </div>

            {/* Destinations on the right */}
            <div className="col-span-6 pl-8 ml-40 xl:ml-56 2xl:ml-72">
              <div className="grid grid-cols-1 gap-y-6 place-items-start">
                <Destination active={activeIdx === 0} index={0} visible={cardsVisible} style={{ marginLeft: destOffsets[0] }} ref={(el) => (destRefs.current[0] = el)} label="Pull Requests" Icon={GitPullRequest} />
                <Destination active={activeIdx === 1} index={1} visible={cardsVisible} style={{ marginLeft: destOffsets[1] }} ref={(el) => (destRefs.current[1] = el)} label="Documentation" Icon={FileText} />
                <Destination active={activeIdx === 2} index={2} visible={cardsVisible} style={{ marginLeft: destOffsets[2] }} ref={(el) => (destRefs.current[2] = el)} label="Scrum Tickets" Icon={Ticket} />
                <Destination active={activeIdx === 3} index={3} visible={cardsVisible} style={{ marginLeft: destOffsets[3] }} ref={(el) => (destRefs.current[3] = el)} label="Team Chats" Icon={MessageSquare} />
                <Destination active={activeIdx === 4} index={4} visible={cardsVisible} style={{ marginLeft: destOffsets[4] }} ref={(el) => (destRefs.current[4] = el)} label="Onboarding" Icon={UserPlus} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / small screens: vertical flow with arrows */}
        <div className="relative lg:hidden" ref={mobileLayout.containerRef}>
          {/* Arrow overlay for mobile */}
          {mobileLayout.ready && mobileLayout.dims.width > 0 && (
            <svg
              className="absolute inset-0 pointer-events-none"
              width={mobileLayout.dims.width}
              height={mobileLayout.dims.height}
              viewBox={`0 0 ${mobileLayout.dims.width} ${mobileLayout.dims.height}`}
              preserveAspectRatio="none"
              aria-hidden
            >
              {/* Reuse marker definitions from desktop (they're in the same page) */}
              {/* Terminal -> Hub arrow */}
              {mobileLayout.paths.terminalToHub && (
                <path
                  d={mobileLayout.paths.terminalToHub}
                  className="flow-line flow-line-leading"
                  fill="none"
                  stroke="currentColor"
                  markerEnd={`url(#${isDark ? 'arrow-stop-dark' : 'arrow-stop-light'})`}
                />
              )}
              {/* Hub -> destinations arrows */}
              {mobileLayout.paths.toDests.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  className={`flow-line ${i === activeArrowIdx ? 'flow-line-active' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  markerEnd={`url(#${i === activeArrowIdx ? (isDark ? 'arrow-dash-active-dark' : 'arrow-dash-active-light') : (isDark ? 'arrow-dash-dark' : 'arrow-dash-light')})`}
                />
              ))}
            </svg>
          )}

          <div className="flex flex-col items-center gap-6 px-4">
            {/* Terminal at top */}
            <div className="text-center">
              <div ref={mobileLayout.terminalRef} className="inline-flex items-center justify-center rounded-2xl p-4 border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <TerminalSquare className="w-8 h-8 text-slate-800 dark:text-slate-200" />
              </div>
              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">Terminal</div>
            </div>

            {/* SessionBase hub in middle */}
            <div className="relative text-center">
              <div ref={mobileLayout.hubRef} className="relative w-24 h-24 rounded-2xl border border-slate-300 bg-white shadow-md overflow-hidden dark:border-slate-700 dark:bg-slate-900 flex items-center justify-center p-2">
                <img src="/android-chrome-512x512.png" alt="SessionBase" className="w-full h-full object-contain opacity-95" />
              </div>
              <div className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">SessionBase</div>
            </div>

            {/* Destinations in 2-column grid */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              <Destination active={activeIdx === 0} index={0} visible={cardsVisible} ref={(el) => (mobileLayout.destRefs.current[0] = el)} label="Pull Requests" Icon={GitPullRequest} />
              <Destination active={activeIdx === 1} index={1} visible={cardsVisible} ref={(el) => (mobileLayout.destRefs.current[1] = el)} label="Documentation" Icon={FileText} />
              <Destination active={activeIdx === 2} index={2} visible={cardsVisible} ref={(el) => (mobileLayout.destRefs.current[2] = el)} label="Scrum Tickets" Icon={Ticket} />
              <Destination active={activeIdx === 3} index={3} visible={cardsVisible} ref={(el) => (mobileLayout.destRefs.current[3] = el)} label="Team Chats" Icon={MessageSquare} />
              <div className="col-span-2 flex justify-center">
                <Destination active={activeIdx === 4} index={4} visible={cardsVisible} ref={(el) => (mobileLayout.destRefs.current[4] = el)} label="Onboarding" Icon={UserPlus} className="w-full max-w-[calc(50%-0.375rem)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Key points */}
        <div className="mt-16 grid md:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 mb-2 text-slate-900 dark:text-white">
              <TerminalSquare className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              <span className="font-semibold">Save from your terminal</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">One command or MCP call captures your session instantly.</p>
          </div>
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 mb-2 text-slate-900 dark:text-white">
              <LinkIcon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              <span className="font-semibold">Shareable public link</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Drop it into PRs, docs, sprint boards, and tickets.</p>
          </div>
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 mb-2 text-slate-900 dark:text-white">
              <Tags className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              <span className="font-semibold">Context preserved</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Prompts, responses, tool calls, and MCP details stay intact.</p>
          </div>
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 mb-2 text-slate-900 dark:text-white">
              <Users className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              <span className="font-semibold">Defeat tribal knowledge</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">Show your work and keep context for your whole team.</p>
          </div>
        </div>
      </div>
      <style jsx>{`
        .flow-line { stroke-width: 2; stroke-dasharray: 8 10; opacity: 1; animation: dash 2.6s linear infinite; color: rgba(100,116,139,0.9); }
        .flow-line-leading { opacity: 0.75; }
        .flow-line-active { stroke-width: 3.4; color: rgba(59,130,246,0.98); filter: drop-shadow(0 0 8px rgba(59,130,246,0.35)); will-change: filter, stroke-width; }
        :global(html.dark) .flow-line { color: rgba(148,163,184,0.75); }
        :global(html.dark) .flow-line-active { color: rgba(147,197,253,0.98); filter: drop-shadow(0 0 10px rgba(96,165,250,0.45)); will-change: filter, stroke-width; }
        @keyframes dash { to { stroke-dashoffset: -80; } }
      `}</style>
    </section>
  );
}

const Destination = forwardRef(function Destination({ label, Icon, className = "", style, active = false, index = 0, visible = false }, ref) {
  return (
    <div
      ref={ref}
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm text-slate-700 dark:text-slate-300 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:scale-[1.02] cursor-default
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${active ? 'border-blue-400/60 bg-white/95 dark:bg-slate-900/95 ring-2 ring-blue-400/40 shadow-md' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'} ${className}`}
      style={{ ...style, transitionDelay: visible ? `${index * 100}ms` : '0ms' }}
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
});

// geometry and measurement helpers
function useArrowLayout(watch) {
  const containerRef = useRef(null);
  const terminalRef = useRef(null);
  const hubRef = useRef(null);
  const destRefs = useRef([]);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [paths, setPaths] = useState({ leftToCenter: '', toDests: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const calc = () => {
      const c = containerRef.current;
      const t = terminalRef.current;
      const h = hubRef.current;
      if (!c || !t || !h) return;
      const cr = c.getBoundingClientRect();
      const tr = t.getBoundingClientRect();
      const hr = h.getBoundingClientRect();

      const midY = (r) => r.top - cr.top + r.height / 2;
      const rightMid = (r) => ({ x: r.right - cr.left, y: midY(r) });
      const leftMid = (r) => ({ x: r.left - cr.left, y: midY(r) });

      const s1 = rightMid(tr);
      const e1 = leftMid(hr);
      const delta1 = Math.min(120, Math.max(60, (e1.x - s1.x) / 3));
      const leftToCenter = `M ${s1.x} ${s1.y} C ${s1.x + delta1} ${s1.y}, ${e1.x - delta1} ${e1.y}, ${e1.x} ${e1.y}`;

      const s2 = rightMid(hr);
      const toDests = destRefs.current
        .filter(Boolean)
        .map((d) => {
          const dr = d.getBoundingClientRect();
          const e = leftMid(dr);
          const dx = e.x - s2.x;
          const delta = Math.min(160, Math.max(70, dx / 3));
          return `M ${s2.x} ${s2.y} C ${s2.x + delta} ${s2.y}, ${e.x - delta} ${e.y}, ${e.x} ${e.y}`;
        });

      setDims({ width: cr.width, height: cr.height });
      setPaths({ leftToCenter, toDests });
      setReady(true);
    };

    const onResize = () => {
      requestAnimationFrame(calc);
    };

    calc();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [watch]);

  return { containerRef, terminalRef, hubRef, destRefs, dims, paths, ready };
}

// Mobile/vertical layout geometry calculations
function useArrowLayoutMobile(watch) {
  const containerRef = useRef(null);
  const terminalRef = useRef(null);
  const hubRef = useRef(null);
  const destRefs = useRef([]);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [paths, setPaths] = useState({ terminalToHub: '', toDests: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const calc = () => {
      const c = containerRef.current;
      const t = terminalRef.current;
      const h = hubRef.current;
      if (!c || !t || !h) return;
      const cr = c.getBoundingClientRect();
      const tr = t.getBoundingClientRect();
      const hr = h.getBoundingClientRect();

      // Helper functions for vertical flow
      const midX = (r) => r.left - cr.left + r.width / 2;
      const bottomMid = (r) => ({ x: midX(r), y: r.bottom - cr.top });
      const topMid = (r) => ({ x: midX(r), y: r.top - cr.top });

      // Terminal to Hub (vertical arrow from terminal bottom to hub top)
      const s1 = bottomMid(tr);
      const e1 = topMid(hr);
      const dy1 = e1.y - s1.y;
      const deltaY1 = Math.min(40, Math.max(20, dy1 / 3));
      const terminalToHub = `M ${s1.x} ${s1.y} C ${s1.x} ${s1.y + deltaY1}, ${e1.x} ${e1.y - deltaY1}, ${e1.x} ${e1.y}`;

      // Hub to Destinations (arrows from hub bottom to each destination)
      const s2 = bottomMid(hr);
      const toDests = destRefs.current
        .filter(Boolean)
        .map((d) => {
          const dr = d.getBoundingClientRect();
          const e = topMid(dr);
          const dx = e.x - s2.x;
          const dy = e.y - s2.y;

          // Calculate control points for curved path
          // Vertical distance for curve control
          const deltaY = Math.min(60, Math.max(30, dy / 3));
          // Horizontal offset for curve - destinations on sides get more horizontal curve
          const deltaX = Math.abs(dx) > 50 ? dx * 0.4 : dx * 0.2;

          // Create smooth curve from hub to destination
          return `M ${s2.x} ${s2.y} C ${s2.x + deltaX * 0.5} ${s2.y + deltaY}, ${e.x - deltaX * 0.5} ${e.y - deltaY}, ${e.x} ${e.y}`;
        });

      setDims({ width: cr.width, height: cr.height });
      setPaths({ terminalToHub, toDests });
      setReady(true);
    };

    const onResize = () => {
      requestAnimationFrame(calc);
    };

    calc();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [watch]);

  return { containerRef, terminalRef, hubRef, destRefs, dims, paths, ready };
}
