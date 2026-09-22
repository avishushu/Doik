export function IconUser({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
    </svg>
  );
}

export function IconPhone({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.28a1 1 0 01.97.757l1.08 4.32a1 1 0 01-.44 1.06l-1.6 1.067a13.05 13.05 0 006.1 6.1l1.067-1.6a1 1 0 011.06-.44l4.32 1.08a1 1 0 01.757.97V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

export function IconMail({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9 6 9-6M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
    </svg>
  );
}

export function IconLock({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-5 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2zM8 11V8a4 4 0 118 0v3" />
    </svg>
  );
}

export function IconSparkle({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3M4 12h3m10 0h3M6.5 6.5l2 2m7-2l-2 2m-7 7l2-2m7 2l-2-2" />
      <circle cx="12" cy="12" r="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconHeart({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20s-7-4.35-9.5-8.5C.8 8.2 2.6 5 6 5c2 0 3.2 1.1 4 2.3C10.8 6.1 12 5 14 5c3.4 0 5.2 3.2 3.5 6.5C19.5 15.65 12 20 12 20z" />
    </svg>
  );
}
