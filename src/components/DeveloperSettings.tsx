import React, { useState } from "react";
import { useClipboard } from "@chakra-ui/react";
import { Copy, Check, Terminal, Code as CodeIcon, ChevronDown, ChevronUp, Zap, ExternalLink } from "lucide-react";
import hushhLogo from './images/Hushhogo.png';

interface EndpointCardProps {
  title: string;
  description: string;
  endpoint: string;
  method?: string;
}

const EndpointCard: React.FC<EndpointCardProps> = ({ title, description, endpoint, method = "GET" }) => {
  const { hasCopied, onCopy } = useClipboard(endpoint);

  return (
    <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB] hover:border-[#CBD5E1] hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span 
              className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                method === "POST" 
                  ? "bg-amber-100 text-amber-800" 
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {method}
            </span>
            <span className="text-[15px] font-medium text-[#111827]">{title}</span>
          </div>
          <p className="text-[13px] text-[#6B7280] leading-relaxed">{description}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-3">
        <div className="flex items-center gap-2">
          <code className="flex-1 text-[12px] text-[#0F172A] font-mono break-all whitespace-pre-wrap">
            {endpoint}
          </code>
          <button
            onClick={onCopy}
            className={`shrink-0 p-2 rounded-lg transition-colors ${
              hasCopied 
                ? "bg-green-50 text-green-600" 
                : "hover:bg-slate-100 text-slate-400"
            }`}
            aria-label="Copy endpoint"
          >
            {hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

// Developer Avatar Component - matching chat design
const DeveloperAvatar = ({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24'
  };

  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg border-2 border-indigo-500/20 flex items-center justify-center`}>
        <Terminal className={`${size === 'lg' ? 'w-10 h-10' : 'w-5 h-5'} text-white`} />
      </div>
    </div>
  );
};

interface DeveloperSettingsProps {
  investorSlug?: string;
}

const DeveloperSettings: React.FC<DeveloperSettingsProps> = ({ investorSlug }) => {
  // Get Supabase URL - use the actual deployed URL
  const supabaseUrl = "https://ibsisfnjxeowvdtvgzff.supabase.co";
  
  const endpoints = [
    {
      title: "MCP Discovery Endpoint",
      description: "Get available MCP tools and resources for agent-to-agent communication",
      endpoint: investorSlug
        ? `${supabaseUrl}/functions/v1/investor-agent-mcp/mcp?slug=${investorSlug}`
        : `${supabaseUrl}/functions/v1/investor-agent-mcp/mcp?slug={investor-slug}`,
      method: "GET",
    },
    {
      title: "Chat Endpoint",
      description: "Public chat endpoint for conversing with investor profiles",
      endpoint: investorSlug
        ? `${supabaseUrl}/functions/v1/investor-chat?slug=${investorSlug}`
        : `${supabaseUrl}/functions/v1/investor-chat?slug={investor-slug}`,
      method: "POST",
    },
    {
      title: "AgentCard Endpoint (A2A)",
      description: "Get structured agent card data for agent-to-agent discovery",
      endpoint: investorSlug
        ? `${supabaseUrl}/functions/v1/investor-agent-mcp/a2a/agent-card.json?slug=${investorSlug}`
        : `${supabaseUrl}/functions/v1/investor-agent-mcp/a2a/agent-card.json?slug={investor-slug}`,
      method: "GET",
    },
  ];

  return (
    <div 
      className="flex flex-col w-full h-full bg-white overflow-hidden" 
      style={{ 
        fontFamily: "'Inter', 'Manrope', sans-serif",
        minHeight: 'calc(100vh - 180px)',
      }}
    >
      {/* Header Section */}
      <header className="flex flex-col bg-white pt-2 pb-2 sticky top-0 z-20 border-b border-slate-100">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Developer Tools</h1>
          </div>
          <button 
            onClick={() => window.open('https://docs.hushh.ai', '_blank')}
            className="flex items-center justify-center px-3 py-2 rounded-lg text-[#2B8CEE] hover:bg-blue-50 transition-colors text-sm font-medium gap-1"
          >
            <span>Docs</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
        
        {/* Status Badge */}
        <div className="px-4 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-500/30 bg-purple-500/5 text-purple-600 text-sm font-semibold">
            <Zap className="w-4 h-4" />
            <span>MCP & A2A Ready</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        
        {/* Intro Section - matching chat empty state */}
        <div className="flex flex-col items-center justify-center mb-8 mt-2">
          {/* Avatar with glow effect */}
          <div className="relative mb-6 group cursor-pointer">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative">
              <DeveloperAvatar size="lg" />
            </div>
          </div>
          
          {/* Title - 22px, center, bold */}
          <h2 
            className="font-bold text-center text-slate-900 mb-2 max-w-[280px]"
            style={{ fontSize: '22px', lineHeight: '1.3' }}
          >
            Integrate with Hushh
          </h2>
          
          {/* Subtitle - 14px, center, gray */}
          <p 
            className="text-center text-slate-500 max-w-[300px] leading-relaxed"
            style={{ fontSize: '14px' }}
          >
            Use these endpoints to enable AI agents to discover and interact with investor profiles.
          </p>
        </div>

        {/* About MCP Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CodeIcon className="w-4 h-4 text-blue-700" />
            <span className="text-[14px] font-semibold text-blue-700">About MCP (Model Context Protocol)</span>
          </div>
          <p className="text-[13px] text-blue-800 leading-relaxed">
            These endpoints enable AI agents to discover and interact with investor profiles.
            The MCP standard allows agents to access structured data and tools for agent-to-agent
            communication.
          </p>
        </div>

        {/* Endpoints Section */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">API Endpoints</h3>
          {endpoints.map((endpoint, index) => (
            <EndpointCard key={index} {...endpoint} />
          ))}
        </div>

        {/* Note Section */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-[12px] font-semibold text-amber-800 mb-2">📝 Note:</p>
          <p className="text-[12px] text-amber-800 leading-relaxed">
            All endpoints are public and don't require authentication. The chat endpoint accepts
            POST requests with a JSON body containing: <code className="bg-amber-100 px-1.5 py-0.5 rounded text-[11px]">{"{ message: string }"}</code>
          </p>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-white px-4 py-4 border-t border-slate-200 relative z-20">
        <p className="text-center text-[11px] text-slate-400 font-medium">
          Powered by Hushh MCP Protocol
        </p>
      </footer>
    </div>
  );
};

export default DeveloperSettings;
