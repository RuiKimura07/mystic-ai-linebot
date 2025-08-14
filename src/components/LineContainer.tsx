'use client';

interface LineContainerProps {
  children: React.ReactNode;
}

export default function LineContainer({ children }: LineContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {children}
      </div>
    </div>
  );
}