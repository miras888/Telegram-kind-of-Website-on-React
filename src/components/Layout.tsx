import React from 'react';
import { themeClasses } from "../utils/themeClasses"; 

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-bg-secondary text-text-primary">
      {children}
    </div>
  );
};

export default Layout;